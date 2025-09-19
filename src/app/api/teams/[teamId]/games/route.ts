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
 * GET /api/teams/[teamId]/games
 * Fetch games for a specific team from external API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2024';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || API_LIMITS.GAMES.DEFAULT.toString());

    logger.info('Team games API request', {
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

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
      const mockGames: IGameResponse[] = [
        {
          id: `${season}-mock-game-1`,
          date: { start: '2024-01-15T20:00:00Z' },
          home_team: 'Test Home Team',
          away_team: 'Test Away Team',
          home_score: 110,
          away_score: 105,
          status: { long: 'Final', short: 'F', clock: '' },
          teams: {
            home: {
              id: '1',
              name: 'Test Home Team',
              nickname: 'Home',
              code: 'THT',
              logo: '',
            },
            visitors: {
              id: '2',
              name: 'Test Away Team',
              nickname: 'Away',
              code: 'TAT',
              logo: '',
            },
          },
          scores: {
            home: { points: 110 },
            visitors: { points: 105 },
          },
          arena: {
            name: 'Test Arena',
            city: 'Test City',
            state: 'TS',
          },
          periods: {
            current: 4,
            total: 4,
          },
          season: season,
          stage: 1,
          nugget: 'Mock game for testing',
        },
      ];

      return NextResponse.json(mockGames);
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

    // Fetch games from external API
    const gamesData = await apiClient.fetch<IGamesApiResponse>('/games', {
      team: teamId,
      season: season,
    });

    if (!gamesData?.response || !Array.isArray(gamesData.response)) {
      return NextResponse.json(
        { success: false, error: 'No games data received from external API' },
        { status: 500 }
      );
    }

    // Transform the external API response to our internal format, filter out games with invalid dates, and deduplicate
    const transformedGames: IGameResponse[] = gamesData.response
      .filter((game: IExternalGame) => {
        // Only include games with valid dates
        const gameDate = typeof game.date === 'string' ? game.date : game.date?.start;
        return gameDate && gameDate.trim() !== '' && !isNaN(new Date(gameDate).getTime());
      })
      .map((game: IExternalGame) => ({
        id: `${season}-${game.id?.toString() || 'missing-game-id'}`,
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
              away: {
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
        season: seasonYear.toString(),
        stage: typeof game.stage === 'string' ? parseInt(game.stage) || 0 : game.stage || 0,
        nugget: game.nugget || '',
      }))
      .filter((game, index, array) => {
        // Deduplicate by ID - keep only the first occurrence
        return array.findIndex(g => g.id === game.id) === index;
      });

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

    logger.info('Team games fetched successfully', {
      teamId,
      season,
      gameCount: transformedGames.length,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching team games', {
      error: String(error),
      teamId: (await params).teamId,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Team Games API',
      action: 'GET /api/teams/[teamId]/games',
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
