import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRapidApiConfig } from '@/lib/config/app.config';
import { API_LIMITS } from '@/lib/constants';
import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IGamesApiResponse, IGameResponse, IExternalGame } from '@/types';

// Ensure environment variables are loaded
loadEnvironmentVariables();

/**
 * GET /api/teams/[teamId]/head-to-head
 * Fetch head-to-head games for a specific team against all other teams
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const startDate = searchParams.get('date'); // Single date filter
    const endDate = searchParams.get('endDate'); // End date for range
    const opponentId = searchParams.get('opponent'); // Specific opponent team ID
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || API_LIMITS.GAMES.DEFAULT.toString());

    logger.info('Team head-to-head API request', {
      teamId,
      season: season || 'all-time',
    });

    // Validate teamId
    if (!teamId || teamId.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Team ID is required' }, { status: 400 });
    }

    // Validate season if provided
    if (season) {
      const currentYear = new Date().getFullYear();
      const seasonYear = parseInt(season);
      if (isNaN(seasonYear) || seasonYear < 2000 || seasonYear > currentYear + 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid season. Must be between 2000 and current year + 1' },
          { status: 400 }
        );
      }
    }

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
      const mockGames: IGameResponse[] = [
        {
          id: `${season}-mock-h2h-game-1`,
          date: { start: '2024-01-15T20:00:00Z' },
          home_team: 'Atlanta Hawks',
          away_team: 'Boston Celtics',
          home_score: 110,
          away_score: 105,
          status: { long: 'Final', short: 'F', clock: '' },
          teams: {
            home: {
              id: teamId,
              name: 'Atlanta Hawks',
              nickname: 'Hawks',
              code: 'ATL',
              logo: '',
            },
            visitors: {
              id: '2',
              name: 'Boston Celtics',
              nickname: 'Celtics',
              code: 'BOS',
              logo: '',
            },
          },
          scores: {
            home: { points: 110 },
            visitors: { points: 105 },
          },
          arena: {
            name: 'State Farm Arena',
            city: 'Atlanta',
            state: 'GA',
          },
          periods: {
            current: 4,
            total: 4,
          },
          season: season || undefined,
          stage: 1,
          nugget: 'Mock head-to-head game for testing',
        },
        {
          id: `${season}-mock-h2h-game-2`,
          date: { start: '2024-02-15T20:00:00Z' },
          home_team: 'Boston Celtics',
          away_team: 'Atlanta Hawks',
          home_score: 98,
          away_score: 102,
          status: { long: 'Final', short: 'F', clock: '' },
          teams: {
            home: {
              id: '2',
              name: 'Boston Celtics',
              nickname: 'Celtics',
              code: 'BOS',
              logo: '',
            },
            visitors: {
              id: teamId,
              name: 'Atlanta Hawks',
              nickname: 'Hawks',
              code: 'ATL',
              logo: '',
            },
          },
          scores: {
            home: { points: 98 },
            visitors: { points: 102 },
          },
          arena: {
            name: 'TD Garden',
            city: 'Boston',
            state: 'MA',
          },
          periods: {
            current: 4,
            total: 4,
          },
          season: season || undefined,
          stage: 1,
          nugget: 'Mock head-to-head game for testing',
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockGames,
        pagination: {
          page: 1,
          limit: mockGames.length,
          totalCount: mockGames.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        meta: {
          teamId,
          season,
          totalGames: mockGames.length,
          teamName: 'Atlanta Hawks',
          apiSource: 'mock',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check if team exists in database
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

    // Get external API configuration
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Fetch head-to-head games from external API
    const apiParams: Record<string, string> = {};

    // Use h2h parameter if specific opponent is provided, otherwise use team parameter
    if (opponentId && opponentId !== 'all') {
      // Get head-to-head games between two specific teams
      apiParams.h2h = `${teamId}-${opponentId}`;
    } else {
      // Get all games for the team
      apiParams.team = teamId;
    }

    // Only add season parameter if it's provided (for all-time, we don't specify season)
    if (season) {
      apiParams.season = season;
    }

    // Add date filters if provided
    if (startDate) {
      apiParams.date = startDate;
    }
    if (endDate) {
      apiParams.endDate = endDate;
    }

    logger.info('Fetching games from external API', { apiParams });
    const gamesData = await apiClient.fetch<IGamesApiResponse>('/games', apiParams);
    logger.info('External API response', {
      hasResponse: !!gamesData?.response,
      responseLength: gamesData?.response?.length || 0,
      results: gamesData?.results || 0,
    });

    if (!gamesData?.response || !Array.isArray(gamesData.response)) {
      return NextResponse.json(
        { success: false, error: 'No head-to-head games data received from external API' },
        { status: 500 }
      );
    }

    // Filter games to only include those involving the current team
    const teamGames = gamesData.response.filter((game: IExternalGame) => {
      const homeTeamId = game.teams?.home?.id?.toString();
      const awayTeamId = game.teams?.visitors?.id?.toString();
      const isTeamGame = homeTeamId === teamId || awayTeamId === teamId;
      return isTeamGame;
    });

    logger.info('Filtered team games', {
      originalCount: gamesData.response.length,
      filteredCount: teamGames.length,
      teamId,
      sampleGame: teamGames[0]
        ? {
            id: teamGames[0].id,
            homeTeam: teamGames[0].teams?.home?.name,
            awayTeam: teamGames[0].teams?.visitors?.name,
          }
        : null,
    });

    // Transform the external API response to our internal format
    const transformedGames: IGameResponse[] = teamGames.map((game: IExternalGame) => ({
      id: `${season || 'all-time'}-${game.id?.toString() || 'missing-game-id'}`,
      date: game.date
        ? typeof game.date === 'string'
          ? { start: game.date, end: '' }
          : {
              start: game.date.start || '',
              end: game.date.end || '',
            }
        : { start: '', end: '' },
      home_team: game.teams?.home?.name || '',
      away_team: game.teams?.visitors?.name || '',
      home_score: game.scores?.home?.points || 0,
      away_score: game.scores?.visitors?.points || 0,
      status: game.status
        ? typeof game.status === 'string'
          ? { long: game.status, short: game.status, clock: '', period: 0 }
          : {
              long: game.status.long || '',
              short: game.status.short || '',
              clock: game.status.clock || '',
              period: game.status.period || 0,
            }
        : { long: '', short: '', clock: '', period: 0 },
      teams: game.teams
        ? {
            home: {
              id: game.teams.home?.id?.toString() || '',
              name: game.teams.home?.name || '',
              nickname: game.teams.home?.nickname || '',
              code: game.teams.home?.code || '',
              logo: game.teams.home?.logo || '',
            },
            visitors: {
              id: game.teams.visitors?.id?.toString() || '',
              name: game.teams.visitors?.name || '',
              nickname: game.teams.visitors?.nickname || '',
              code: game.teams.visitors?.code || '',
              logo: game.teams.visitors?.logo || '',
            },
          }
        : undefined,
      scores: game.scores
        ? {
            home: {
              points: game.scores.home?.points || 0,
            },
            visitors: {
              points: game.scores.visitors?.points || 0,
            },
          }
        : undefined,
      arena: game.arena
        ? {
            name: game.arena.name || '',
            city: game.arena.city || '',
            state: game.arena.state || '',
            country: game.arena.country || '',
          }
        : undefined,
      periods: game.periods
        ? {
            current: game.periods.current || 0,
            total: game.periods.total || 0,
            endOfPeriod: game.periods.endOfPeriod || false,
          }
        : undefined,
      season: season || 'all-time',
      stage: typeof game.stage === 'string' ? parseInt(game.stage) || 0 : game.stage || 0,
      nugget: game.nugget || '',
    }));

    // Calculate pagination metadata
    const totalGames = transformedGames.length;
    const totalPages = Math.ceil(totalGames / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = transformedGames.slice(startIndex, endIndex);

    const responseData = {
      success: true,
      data: paginatedGames,
      pagination: {
        page,
        limit,
        totalCount: totalGames,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      meta: {
        teamId,
        season,
        totalGames,
        teamName: team.name,
        apiSource: 'external',
        timestamp: new Date().toISOString(),
      },
    };

    logger.info('Team head-to-head games fetched successfully', {
      teamId,
      season,
      gameCount: transformedGames.length,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching team head-to-head games', {
      error: String(error),
      teamId: (await params).teamId,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Team Head-to-Head API',
      action: 'GET /api/teams/[teamId]/head-to-head',
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
