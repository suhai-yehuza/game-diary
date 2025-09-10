import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService, CACHE_CONFIG } from '@/lib/cache';
import { getGameLogs, getFriendsGameLogs } from '@/lib/db/services/game-logs.service';
import { logger } from '@/lib/utils/logger';
import type { GameLogFilters } from '@/types';

/**
 * GET /api/game-logs
 * Fetch game logs with pagination, filtering, and caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    logger.info('Game logs API request', {
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries()),
    });

    // Get filter parameters
    const searchTerm = searchParams.get('search') || undefined;
    const classification = searchParams.get('classification') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const tab = searchParams.get('tab') || 'my-logs'; // my-logs, friends-logs, public-logs
    const sortByParam = searchParams.get('sortBy');
    const sortBy: GameLogFilters['sortBy'] =
      (sortByParam as GameLogFilters['sortBy']) || 'created_at';
    const sortDirectionParam = searchParams.get('sortDirection');
    const sortDirection: GameLogFilters['sortDirection'] =
      (sortDirectionParam as GameLogFilters['sortDirection']) || 'desc';

    // New filter parameters
    const teamName = searchParams.get('teamName') || undefined;
    const username = searchParams.get('username') || undefined;
    const tags = searchParams.get('tags') || undefined;
    const watchedDateFrom = searchParams.get('watchedDateFrom') || undefined;
    const watchedDateTo = searchParams.get('watchedDateTo') || undefined;
    const gameDateFrom = searchParams.get('gameDateFrom') || undefined;
    const gameDateTo = searchParams.get('gameDateTo') || undefined;
    const rating = searchParams.get('rating') || undefined;
    const watchedSetting = searchParams.get('watchedSetting') || undefined;
    const watchedScope = searchParams.get('watchedScope') || undefined;

    // Pagination parameters
    const pageParam = searchParams.get('page');
    const page = (pageParam && parseInt(pageParam)) || 1;
    const limitParam = searchParams.get('limit');
    const limit = (limitParam && parseInt(limitParam)) || 20;

    // Build cache key
    const cacheKey = `game-logs:${tab}:${page}:${limit}:${searchTerm || 'no-search'}:${classification || 'all'}:${userId || 'no-user'}:${sortBy}:${sortDirection}:${teamName || 'no-team'}:${username || 'no-username'}:${tags || 'no-tags'}:${watchedDateFrom || 'no-watched-from'}:${watchedDateTo || 'no-watched-to'}:${gameDateFrom || 'no-game-from'}:${gameDateTo || 'no-game-to'}:${rating || 'no-rating'}:${watchedSetting || 'no-setting'}:${watchedScope || 'no-scope'}`;

    // Check cache first
    if (!bypassCache) {
      const cached = simpleCacheService.get(cacheKey);
      if (cached) {
        logger.info('Game logs cache hit', { cacheKey, tab, page, limit });
        return NextResponse.json(cached);
      }
    }

    // Fetch data based on tab
    let result;
    const commonFilters = {
      page,
      limit,
      search: searchTerm,
      classification,
      sortBy,
      sortDirection,
      teamName,
      username,
      tags,
      watchedDateFrom,
      watchedDateTo,
      gameDateFrom,
      gameDateTo,
      rating,
      watchedSetting,
      watchedScope,
    };

    if (tab === 'friends-logs') {
      result = await getFriendsGameLogs(userId || undefined, commonFilters);
    } else if (tab === 'public-logs') {
      result = await getGameLogs({
        ...commonFilters,
        classification: 'PUBLIC',
      });
    } else {
      // my-logs
      result = await getGameLogs({
        ...commonFilters,
        userId,
      });
    }

    // Build response
    const response = {
      success: true,
      gameLogs: result.gameLogs,
      pagination: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
      cacheInfo: {
        cached: false,
        source: 'database',
        key: cacheKey,
        ttl: CACHE_CONFIG.TTL.GAME_LOG || 300,
      },
    };

    // Cache the result
    simpleCacheService.set(cacheKey, response, { ttl: 300 }); // 5 minutes cache

    logger.info('Game logs fetched successfully', {
      tab,
      page,
      limit,
      totalCount: result.totalCount,
      cacheKey,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching game logs:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      searchParams: Object.fromEntries(new URL(request.url).searchParams.entries()),
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch game logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
