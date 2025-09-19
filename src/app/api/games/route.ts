import { eq, desc, and, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService, getGamesCacheTTL, generateGamesCacheKey } from '@/lib/cache';
import { db } from '@/lib/db';
import { basketball_games } from '@/lib/db/schema';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IDatabaseGame } from '@/types';

// Ensure environment variables are loaded
loadEnvironmentVariables();

/**
 * GET /api/games
 * Enhanced games API with intelligent paginated caching based on game status
 *
 * Query Parameters:
 * - season: Season year (e.g., "2024") or "all"
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - status: Game status filter ("finished", "live", "scheduled", "all")
 * - bypass-cache: Force refresh cache
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const status = searchParams.get('status') || 'all';
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Check if we're in mock mode
    if (process.env.MOCK_MODE === 'true') {
      logger.info('Games API request - Mock Mode', {
        season,
        page,
        limit,
        status,
        bypassCache,
      });

      // Return mock games data
      const mockGames = {
        success: true,
        data: {
          games: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          cacheInfo: {
            hit: false,
            key: `games:${season}:${page}:${limit}:${status}`,
            status: status,
          },
        },
        timestamp: new Date().toISOString(),
        mock: true,
      };

      return NextResponse.json(mockGames);
    }

    logger.info('Games API request', {
      season,
      page,
      limit,
      status,
      bypassCache,
    });

    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { success: false, error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Generate cache key with pagination and status
    const cacheKey = generateGamesCacheKey({
      season,
      page,
      limit,
      status,
    });

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = simpleCacheService.get(cacheKey);
      if (cachedData) {
        logger.cache('hit', cacheKey);
        return NextResponse.json({
          ...cachedData,
          cacheInfo: {
            hit: true,
            key: cacheKey,
            status: status,
          },
        });
      } else {
        logger.cache('miss', cacheKey);
      }
    }

    logger.database('games', 'fetching-paginated', undefined, {
      season,
      page,
      limit,
      status,
      bypassCache,
    });

    // Build where conditions
    const whereConditions = [];

    // Season filter
    if (season !== 'all') {
      whereConditions.push(eq(basketball_games.season, season));
    }

    // Status filter - query from status JSONB field
    if (status !== 'all') {
      const now = new Date();

      switch (status) {
        case 'finished':
          whereConditions.push(sql`LOWER(${basketball_games.status}->>'long') = 'finished'`);
          break;
        case 'live':
          whereConditions.push(sql`LOWER(${basketball_games.status}->>'long') = 'live'`);
          break;
        case 'scheduled':
          // Only show scheduled games with future dates
          whereConditions.push(sql`LOWER(${basketball_games.status}->>'long') = 'scheduled'`);
          whereConditions.push(sql`${basketball_games.date} > ${now}`);
          break;
        case 'cancelled':
          // Show scheduled games with past dates (cancelled/postponed)
          whereConditions.push(
            sql`LOWER(${basketball_games.status}->>'long') IN ('scheduled', 'cancelled', 'canceled', 'postponed')`
          );
          whereConditions.push(sql`${basketball_games.date} <= ${now}`);
          break;
      }
    }

    // Check database connection
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    // Fetch games with pagination
    const games =
      (await database.query.basketball_games.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        limit,
        offset,
        orderBy: [desc(basketball_games.date)],
      })) || [];

    // Get total count for pagination metadata
    const totalCountResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(basketball_games)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalCount = totalCountResult?.[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Determine cache TTL based on game statuses
    const cacheTTL = getGamesCacheTTL(games);

    // Transform games data, filter out games with invalid dates, and deduplicate by ID
    const transformedGames = games
      .filter((game: IDatabaseGame) => {
        // Only include games with valid dates
        return game.date && !isNaN(new Date(game.date).getTime());
      })
      .map((game: IDatabaseGame) => ({
        id: game.id,
        date: { start: game.date.toISOString() },
        status: game.status,
        teams: game.teams,
        scores: game.scores,
        arena: game.arena,
        periods: game.periods,
        season: game.season,
        stage: game.stage,
        nugget: game.nugget,
        average_rating: (game as { average_rating?: number }).average_rating,
        total_ratings: (game as { total_ratings?: number }).total_ratings,
      }))
      .filter((game, index, array) => {
        // Deduplicate by ID - keep only the first occurrence
        return array.findIndex(g => g.id === game.id) === index;
      });

    const responseData = {
      success: true,
      response: transformedGames, // Maintain backward compatibility
      data: transformedGames, // New format
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        season,
        status,
      },
      cacheInfo: {
        hit: false,
        key: cacheKey,
        ttl: cacheTTL,
        status: status,
      },
    };

    // Cache the response
    try {
      simpleCacheService.set(cacheKey, responseData, {
        ttl: cacheTTL,
        tags: ['games', 'paginated', `season:${season}`, `status:${status}`],
        strategy: 'hybrid',
      });
    } catch (cacheError) {
      logger.warn('Failed to cache games response', {
        error: String(cacheError),
        cacheKey,
      });
      // Continue without caching - don't fail the request
    }

    logger.info('Games fetched and cached', {
      season,
      page,
      limit,
      status,
      count: transformedGames.length,
      totalCount,
      cacheKey,
      ttl: cacheTTL,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error('Error fetching games', { error: String(error) });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Games API',
      action: 'GET /api/games',
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
