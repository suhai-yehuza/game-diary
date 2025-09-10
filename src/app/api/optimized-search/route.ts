import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { API_CONFIG } from '@/lib/config/app.config';
import {
  searchUsersQuery,
  searchGameLogsAdvancedQuery,
  searchGamesAdvancedQuery,
  searchTeamsAdvancedQuery,
  searchPlayersAdvancedQuery,
  getSearchStatisticsQuery,
} from '@/lib/db/queries';
import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * Optimized Search API Route
 *
 * This route demonstrates how to use centralized SQL queries
 * instead of inline SQL for better maintainability and performance.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(
      searchParams.get('limit') ?? API_CONFIG.pagination.DEFAULT_PAGE_SIZE.toString()
    );
    const offset = (page - 1) * limit;

    // Input validation
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          users: [],
          gameLogs: [],
          games: [],
          teams: [],
          players: [],
          totalUsers: 0,
          totalGameLogs: 0,
          totalGames: 0,
          totalTeams: 0,
          totalPlayers: 0,
        },
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Use centralized SQL queries instead of inline SQL
    const [users, gameLogs, games, teams, players, statistics] = await Promise.all([
      // Search users using centralized query
      searchUsersQuery(query, limit, offset),

      // Search game logs using centralized query
      searchGameLogsAdvancedQuery(query, {}, limit, offset),

      // Search games using centralized query
      searchGamesAdvancedQuery(query, {}, limit, offset),

      // Search teams using centralized query
      searchTeamsAdvancedQuery(query, {}, limit, offset),

      // Search players using centralized query
      searchPlayersAdvancedQuery(query, {}, limit, offset),

      // Get search statistics using centralized query
      getSearchStatisticsQuery(),
    ]);

    // Calculate total results
    const totalResults =
      users.length + gameLogs.length + games.length + teams.length + players.length;

    return NextResponse.json({
      success: true,
      data: {
        users,
        gameLogs,
        games,
        teams,
        players,
        totalUsers: users.length,
        totalGameLogs: gameLogs.length,
        totalGames: games.length,
        totalTeams: teams.length,
        totalPlayers: players.length,
      },
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: Math.ceil(totalResults / limit),
      },
      statistics,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Search API',
      action: 'Search across entities',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Advanced search with filters
 * Demonstrates how to use centralized queries with complex filtering
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query: string;
      filters?: Record<string, unknown>;
      pagination?: { page: number; limit: number };
    };
    const { query, filters = {}, pagination = { page: 1, limit: 20 } } = body;

    if (!query || typeof query !== 'string' || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query too short',
          message: 'Search query must be at least 2 characters long',
        },
        { status: 400 }
      );
    }

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Use centralized SQL queries with advanced filtering
    const [users, gameLogs, games, teams, players] = await Promise.all([
      // Search users with advanced filters
      searchUsersQuery(query, limit, offset),

      // Search game logs with advanced filters
      searchGameLogsAdvancedQuery(
        query,
        {
          userId: typeof filters.userId === 'string' ? filters.userId : undefined,
          classification:
            typeof filters.classification === 'string' ? filters.classification : undefined,
          rating: typeof filters.rating === 'number' ? filters.rating : undefined,
          dateFrom: typeof filters.dateFrom === 'string' ? filters.dateFrom : undefined,
          dateTo: typeof filters.dateTo === 'string' ? filters.dateTo : undefined,
        },
        limit,
        offset
      ),

      // Search games with advanced filters
      searchGamesAdvancedQuery(
        query,
        {
          status: typeof filters.status === 'string' ? filters.status : undefined,
          dateFrom: typeof filters.dateFrom === 'string' ? filters.dateFrom : undefined,
          dateTo: typeof filters.dateTo === 'string' ? filters.dateTo : undefined,
          teamId: typeof filters.teamId === 'string' ? filters.teamId : undefined,
        },
        limit,
        offset
      ),

      // Search teams with advanced filters
      searchTeamsAdvancedQuery(
        query,
        {
          conference: typeof filters.conference === 'string' ? filters.conference : undefined,
          division: typeof filters.division === 'string' ? filters.division : undefined,
        },
        limit,
        offset
      ),

      // Search players with advanced filters
      searchPlayersAdvancedQuery(
        query,
        {
          position: typeof filters.position === 'string' ? filters.position : undefined,
          teamId: typeof filters.teamId === 'string' ? filters.teamId : undefined,
          college: typeof filters.college === 'string' ? filters.college : undefined,
          country: typeof filters.country === 'string' ? filters.country : undefined,
        },
        limit,
        offset
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        gameLogs,
        games,
        teams,
        players,
      },
      pagination: {
        page,
        limit,
        total: users.length + gameLogs.length + games.length + teams.length + players.length,
      },
      filters,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Search API',
      action: 'Advanced search with filters',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Advanced search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
