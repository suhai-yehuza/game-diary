import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IRawTeamStatsApiResponse, IRawTeamStatsResponse } from '@/types';

// Ensure environment variables are loaded
loadEnvironmentVariables();

// Interfaces moved to types/custom/001-base.types.ts

/**
 * GET /api/teams/[teamId]/stats
 * Fetch team statistics for a specific season
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || new Date().getFullYear().toString();
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Cache key for team stats
    const cacheKey = `team-stats:${teamId}:${season}`;
    const cacheTTL = 24 * 60 * 60 * 1000; // 24 hour cache for team stats

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = simpleCacheService.get(cacheKey);
      if (cachedData) {
        logger.info('Team stats cache hit', { teamId, season, cacheKey });
        return NextResponse.json(cachedData);
      }
    }

    logger.info('Team stats API request', {
      teamId,
      season,
    });

    // Validate teamId
    if (!teamId || teamId.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    // Validate season
    const currentYear = new Date().getFullYear();
    const seasonYear = parseInt(season);
    if (isNaN(seasonYear) || seasonYear < 2000 || seasonYear > currentYear + 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid season. Must be between 2000 and current year + 1' },
        { status: 400 }
      );
    }

    // Check if team exists in database first
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    const team = await database.query.basketball_teams.findFirst({
      where: eq(basketball_teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    // Check if we're in test/mock mode OR if external API is not available
    if (
      process.env.MOCK_MODE === 'true' ||
      process.env.NODE_ENV === 'test' ||
      !process.env.NEXT_PUBLIC_RAPID_API_KEY
    ) {
      // Extract conference and division from team's leagues data for mock
      const teamLeagues = team.leagues as {
        standard?: { conference?: string; division?: string };
      } | null;
      const _mockConference = teamLeagues?.standard?.conference ?? team.conference ?? 'East';
      const _mockDivision = teamLeagues?.standard?.division ?? 'Southeast';

      // Return mock data for test environment or when external API is not available
      const mockStats: IRawTeamStatsResponse = {
        teamId,
        teamName: team.name || 'Atlanta Hawks',
        teamCode: team.code || 'ATL',
        teamLogo: team.logo || 'https://upload.wikimedia.org/wikipedia/fr/e/ee/Hawks_2016.png',
        season,
        games: 72,
        points: 113.7,
        assists: 24.1,
        steals: 7.8,
        blocks: 4.9,
        turnovers: 13.2,
        fastBreakPoints: 12.5,
        pointsInPaint: 45.2,
        biggestLead: 25,
        secondChancePoints: 13.8,
        pointsOffTurnovers: 18.3,
        longestRun: 15,
        fgm: 42.1,
        fga: 89.8,
        fgp: '46.8',
        ftm: 18.2,
        fta: 22.4,
        ftp: '81.2',
        tpm: 12.8,
        tpa: 35.4,
        tpp: '36.1',
        offReb: 10.2,
        defReb: 35.0,
        totReb: 45.2,
        pFouls: 19.8,
        plusMinus: 2.1,
      };

      const mockResponse = {
        success: true,
        data: mockStats,
        meta: {
          teamId,
          season,
          teamName: team.name,
          apiSource: 'mock',
          timestamp: new Date().toISOString(),
        },
      };

      // Cache mock data
      try {
        simpleCacheService.set(cacheKey, mockResponse, {
          ttl: cacheTTL,
          tags: ['team-stats', 'nba', `team:${teamId}`, `season:${season}`],
        });
        logger.info('Team stats mock data cached', { teamId, season, cacheKey });
      } catch (cacheError) {
        logger.warn('Failed to cache team stats mock data', { error: cacheError, teamId, season });
      }

      return NextResponse.json(mockResponse);
    }

    // Get external API configuration
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Fetch team statistics from external API
    const apiParams = {
      id: teamId,
      season: season,
    };

    logger.info('Fetching team stats from external API', { apiParams });

    let statsData: IRawTeamStatsApiResponse;
    try {
      statsData = await apiClient.fetch<IRawTeamStatsApiResponse>('/teams/statistics', apiParams);
    } catch (apiError) {
      logger.error('External API call failed', {
        error: String(apiError),
        teamId,
        season,
        apiParams,
      });

      // Extract conference and division from team's leagues data for fallback
      const teamLeagues = team.leagues as {
        standard?: { conference?: string; division?: string };
      } | null;
      const _fallbackConference = teamLeagues?.standard?.conference ?? team.conference ?? 'Unknown';
      const _fallbackDivision = teamLeagues?.standard?.division ?? 'N/A';

      // Return mock data if external API fails
      const mockStats: IRawTeamStatsResponse = {
        teamId,
        teamName: team.name || 'Unknown Team',
        teamCode: team.code || 'UNK',
        teamLogo: team.logo || '',
        season,
        games: 0,
        points: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fastBreakPoints: 0,
        pointsInPaint: 0,
        biggestLead: 0,
        secondChancePoints: 0,
        pointsOffTurnovers: 0,
        longestRun: 0,
        fgm: 0,
        fga: 0,
        fgp: '0.0',
        ftm: 0,
        fta: 0,
        ftp: '0.0',
        tpm: 0,
        tpa: 0,
        tpp: '0.0',
        offReb: 0,
        defReb: 0,
        totReb: 0,
        pFouls: 0,
        plusMinus: 0,
      };

      const fallbackResponse = {
        success: true,
        data: mockStats,
        meta: {
          teamId,
          season,
          teamName: team.name,
          apiSource: 'fallback-mock',
          timestamp: new Date().toISOString(),
        },
      };

      // Cache fallback data
      try {
        simpleCacheService.set(cacheKey, fallbackResponse, {
          ttl: cacheTTL,
          tags: ['team-stats', 'nba', `team:${teamId}`, `season:${season}`],
        });
        logger.info('Team stats fallback data cached', { teamId, season, cacheKey });
      } catch (cacheError) {
        logger.warn('Failed to cache team stats fallback data', {
          error: cacheError,
          teamId,
          season,
        });
      }

      return NextResponse.json(fallbackResponse);
    }

    logger.info('Team stats API response structure', {
      hasResponse: !!statsData?.response,
      responseType: Array.isArray(statsData?.response) ? 'array' : typeof statsData?.response,
      responseLength: Array.isArray(statsData?.response) ? statsData.response.length : 'N/A',
      responseKeys: statsData ? Object.keys(statsData) : 'undefined',
      firstResponseItem: statsData?.response?.[0]
        ? Object.keys(statsData.response[0])
        : 'undefined',
    });

    if (
      !statsData?.response ||
      !Array.isArray(statsData.response) ||
      statsData.response.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'No team statistics data received from external API' },
        { status: 500 }
      );
    }

    // Transform the external API response to our internal format
    const teamStats = statsData.response[0];

    // Add safety checks for the response structure
    if (!teamStats) {
      logger.error('Invalid team stats response structure', {
        teamStats: teamStats ? Object.keys(teamStats) : 'undefined',
        responseLength: statsData.response.length,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid team statistics data structure from external API' },
        { status: 500 }
      );
    }

    // Calculate derived statistics
    const gamesPlayed = teamStats.games;
    const pointsPerGame = gamesPlayed > 0 ? teamStats.points / gamesPlayed : 0;
    const _reboundsPerGame = gamesPlayed > 0 ? teamStats.totReb / gamesPlayed : 0;
    const assistsPerGame = gamesPlayed > 0 ? teamStats.assists / gamesPlayed : 0;
    const stealsPerGame = gamesPlayed > 0 ? teamStats.steals / gamesPlayed : 0;
    const blocksPerGame = gamesPlayed > 0 ? teamStats.blocks / gamesPlayed : 0;
    const turnoversPerGame = gamesPlayed > 0 ? teamStats.turnovers / gamesPlayed : 0;

    // Extract conference and division from team's leagues data
    const teamLeagues = team.leagues as {
      standard?: { conference?: string; division?: string };
    } | null;
    const _conference = teamLeagues?.standard?.conference ?? team.conference ?? 'Unknown';
    const _division = teamLeagues?.standard?.division ?? 'N/A';

    const transformedStats: IRawTeamStatsResponse = {
      teamId,
      teamName: team.name || 'Unknown Team',
      teamCode: team.code || 'UNK',
      teamLogo: team.logo || '',
      season,
      games: gamesPlayed,
      points: pointsPerGame,
      assists: assistsPerGame,
      steals: stealsPerGame,
      blocks: blocksPerGame,
      turnovers: turnoversPerGame,
      fastBreakPoints: teamStats.fastBreakPoints || 0,
      pointsInPaint: teamStats.pointsInPaint || 0,
      biggestLead: teamStats.biggestLead || 0,
      secondChancePoints: teamStats.secondChancePoints || 0,
      pointsOffTurnovers: teamStats.pointsOffTurnovers || 0,
      longestRun: teamStats.longestRun || 0,
      fgm: teamStats.fgm,
      fga: teamStats.fga,
      fgp: teamStats.fgp,
      ftm: teamStats.ftm,
      fta: teamStats.fta,
      ftp: teamStats.ftp,
      tpm: teamStats.tpm,
      tpa: teamStats.tpa,
      tpp: teamStats.tpp,
      offReb: teamStats.offReb,
      defReb: teamStats.defReb,
      totReb: teamStats.totReb,
      pFouls: teamStats.pFouls,
      plusMinus:
        typeof teamStats.plusMinus === 'string'
          ? parseFloat(teamStats.plusMinus) || 0
          : teamStats.plusMinus || 0,
    };

    const responseData = {
      success: true,
      data: transformedStats,
      meta: {
        teamId,
        season,
        teamName: team.name,
        apiSource: 'external',
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the external API response
    try {
      simpleCacheService.set(cacheKey, responseData, {
        ttl: cacheTTL,
        tags: ['team-stats', 'nba', `team:${teamId}`, `season:${season}`],
      });
      logger.info('Team statistics cached', { teamId, season, teamName: team.name, cacheKey });
    } catch (cacheError) {
      logger.warn('Failed to cache team statistics', { error: cacheError, teamId, season });
    }

    logger.info('Team statistics fetched successfully', {
      teamId,
      season,
      teamName: team.name,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching team statistics', {
      error: String(error),
      teamId: (await params).teamId,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Team Stats API',
      action: 'GET /api/teams/[teamId]/stats',
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
