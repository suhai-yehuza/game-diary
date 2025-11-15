import { eq, desc, and, sql, or } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService, getGamesCacheTTL, generateGamesCacheKey } from '@/lib/cache';
import { db } from '@/lib/db';
import { basketball_games } from '@/lib/db/schema';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IDatabaseGameResult } from '@/types';

// Ensure environment variables are loaded
loadEnvironmentVariables();

/**
 * GET /api/games/search
 * Search games with server-side filtering for better performance
 *
 * Query Parameters:
 * - q: Search query (required)
 * - season: Season year (e.g., "2024") or "all" (default: "all")
 * - limit: Maximum results to return (default: 100, max: 500)
 * - bypass-cache: Force refresh cache
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const season = searchParams.get('season') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Validate required parameters
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    logger.info('Games search API request', {
      query,
      season,
      limit,
      bypassCache,
    });

    // Generate cache key for search results
    const cacheKey = generateGamesCacheKey({
      type: 'search',
      query: query.trim().toLowerCase(),
      season,
      limit,
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
            query,
            season,
          },
        });
      } else {
        logger.cache('miss', cacheKey);
      }
    }

    logger.database('games', 'searching', undefined, { query, season, limit, bypassCache });

    // Check database connection
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    // Build search conditions - simplified approach
    const searchTerm = `%${query.trim()}%`;
    const searchConditions = [
      // Search in team names (home and away) - using JSONB fields
      sql`LOWER(${basketball_games.teams}->'home'->>'name') LIKE LOWER(${searchTerm})`,
      sql`LOWER(${basketball_games.teams}->'visitors'->>'name') LIKE LOWER(${searchTerm})`,
      // Search in arena name - using JSONB field
      sql`LOWER(${basketball_games.arena}->>'name') LIKE LOWER(${searchTerm})`,
      // Search in city - using JSONB field
      sql`LOWER(${basketball_games.arena}->>'city') LIKE LOWER(${searchTerm})`,
    ];

    // Build where conditions
    const whereConditions = [
      // Only show finished games for game log creation
      sql`LOWER(${basketball_games.status}->>'long') = 'finished'`,
      // Main search condition (any of the above)
      or(...searchConditions),
    ];

    // Season filter
    if (season !== 'all') {
      whereConditions.push(eq(basketball_games.season, season));
    }

    // Fetch games with search
    const games =
      (await database.query.basketball_games.findMany({
        where: and(...whereConditions),
        limit,
        orderBy: [desc(basketball_games.date)],
      })) || [];

    // Get total count for search results
    const totalCountResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(basketball_games)
      .where(and(...whereConditions));

    const totalCount = totalCountResult?.[0]?.count || 0;

    // Transform games data (keep JSONB fields as-is like the main games API)
    const transformedGames = games.map((game: IDatabaseGameResult) => ({
      id: game.id,
      date: game.date,
      status: game.status,
      teams: game.teams,
      scores: game.scores,
      arena: game.arena,
      periods: game.periods,
      season: game.season,
      stage: game.stage,
      nugget: game.nugget,
      average_rating: game.average_rating,
      total_ratings: game.total_ratings,
    }));

    const responseData = {
      success: true,
      data: transformedGames,
      pagination: {
        total: totalCount,
        limit,
        hasMore: totalCount > limit,
      },
      search: {
        query,
        season,
        resultsCount: transformedGames.length,
        totalMatches: totalCount,
      },
    };

    // Cache the results
    const cacheTTL = getGamesCacheTTL('search');
    simpleCacheService.set(cacheKey, responseData, { ttl: cacheTTL });

    logger.info('Games search completed', {
      query,
      season,
      resultsCount: transformedGames.length,
      totalMatches: totalCount,
      cacheKey,
    });

    return NextResponse.json({
      ...responseData,
      cacheInfo: {
        hit: false,
        key: cacheKey,
        query,
        season,
      },
    });
  } catch (error) {
    logger.error('Games search API error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      message: 'Failed to search games',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search games',
        message: 'An unexpected error occurred while searching for games',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
