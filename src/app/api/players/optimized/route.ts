import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache';
import { API_LIMITS } from '@/lib/constants';
import { getPlayersOptimized } from '@/lib/db/services/optimized-players.service';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import type { IPlayersApiResponse, IPlayerFilters } from '@/types';

/**
 * GET /api/players/optimized
 * Optimized NBA players API with enhanced performance
 */
export async function GET(request: NextRequest) {
  const endTimer = performanceMonitor.startTimer('players-optimized-api');

  try {
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Get filter parameters
    const searchTerm = searchParams.get('search') || undefined;
    const positionFilter = searchParams.get('position') || undefined;
    const yearFilter = searchParams.get('year') || undefined;
    const collegeFilter = searchParams.get('college') || undefined;
    const countryFilter = searchParams.get('country') || undefined;
    const sortByParam = searchParams.get('sortBy');
    const sortBy: IPlayerFilters['sortBy'] = (sortByParam as IPlayerFilters['sortBy']) || 'name';
    const sortDirectionParam = searchParams.get('sortDirection');
    const sortDirection: IPlayerFilters['sortDirection'] =
      (sortDirectionParam as IPlayerFilters['sortDirection']) || 'asc';

    // Pagination parameters
    const pageParam = searchParams.get('page');
    const page = (pageParam && parseInt(pageParam)) || 1;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(
      100,
      Math.max(1, (limitParam && parseInt(limitParam)) || API_LIMITS.PLAYERS.DEFAULT)
    );
    const offset = (page - 1) * limit;

    // Special endpoint for filter options
    const getOptions = searchParams.get('options');
    if (getOptions === 'true') {
      // Return cached filter options
      const optionsCacheKey = 'players:filter-options:optimized';
      const optionsCacheTTL = 60 * 60 * 1000; // 1 hour

      if (!bypassCache) {
        const cachedOptions = simpleCacheService.get(optionsCacheKey);
        if (cachedOptions) {
          logger.cache('hit', optionsCacheKey);
          return NextResponse.json(cachedOptions);
        }
      }

      // Return static filter options for better performance
      const options = {
        positions: ['PG', 'SG', 'SF', 'PF', 'C'],
        years: ['rookie', 'veteran'],
        colleges: ['Duke', 'Kentucky', 'North Carolina', 'Kansas', 'UCLA'],
        countries: ['USA', 'Canada', 'France', 'Australia', 'Spain'],
      };

      simpleCacheService.set(optionsCacheKey, options, {
        ttl: optionsCacheTTL,
        tags: ['players', 'nba', 'filter-options', 'optimized'],
      });

      return NextResponse.json(options);
    }

    // Build filters
    const filters: IPlayerFilters = {
      searchTerm,
      positionFilter,
      yearFilter,
      collegeFilter,
      countryFilter,
      sortBy,
      sortDirection,
      limit,
      offset,
    };

    // Create optimized cache key
    const cacheKey = `players:optimized:${page}:${limit}:${JSON.stringify({
      search: searchTerm || 'all',
      position: positionFilter || 'all',
      year: yearFilter || 'all',
      college: collegeFilter || 'all',
      country: countryFilter || 'all',
      sortBy,
      sortDirection,
    })}`;

    const cacheTTL = 60 * 60 * 1000; // 1 hour

    // Check cache first
    if (!bypassCache) {
      const cachedData = simpleCacheService.get(cacheKey);
      if (cachedData) {
        logger.cache('hit', cacheKey);
        performanceMonitor.recordMetric('players-optimized-api', 'cacheHitRate', 1);
        return NextResponse.json(cachedData);
      }
    }

    performanceMonitor.recordMetric('players-optimized-api', 'cacheHitRate', 0);

    logger.database('players', 'fetching-optimized', undefined, {
      filters: JSON.stringify(filters),
      bypassCache,
    });

    // Fetch players using optimized service
    const { players, total } = await getPlayersOptimized(filters);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlayers = players.slice(startIndex, endIndex);

    // Format response with optimized structure
    const response: IPlayersApiResponse = {
      success: true,
      get: 'players',
      parameters: {
        league: 'standard',
        season: '2024',
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter && { position: positionFilter }),
        ...(yearFilter && { year: yearFilter }),
        ...(collegeFilter && { college: collegeFilter }),
      },
      errors: [],
      results: total,
      response: paginatedPlayers,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      players: paginatedPlayers,
      total: total,
      page: page,
      limit: limit,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      cacheInfo: {
        hit: false,
        key: cacheKey,
        ttl: cacheTTL,
      },
    };

    // Cache the response with optimized TTL
    try {
      simpleCacheService.set(cacheKey, response, {
        ttl: cacheTTL,
        tags: ['players', 'nba', 'optimized', `page:${page}`, `limit:${limit}`],
        strategy: 'hybrid',
      });
    } catch (cacheError) {
      logger.warn('Failed to cache optimized players response', {
        error: String(cacheError),
        cacheKey,
      });
    }

    // Record performance metrics
    performanceMonitor.recordMetric(
      'players-optimized-api',
      'dataSize',
      JSON.stringify(response).length
    );
    performanceMonitor.recordMetric(
      'players-optimized-api',
      'queryComplexity',
      Object.keys(filters).length
    );

    const duration = endTimer();
    performanceMonitor.logPerformance('players-optimized-api');

    logger.database('players', 'fetched-optimized', undefined, {
      count: paginatedPlayers.length,
      total,
      page,
      limit,
      cached: true,
      duration: `${duration.toFixed(2)}ms`,
    });

    return NextResponse.json(response);
  } catch (error) {
    const duration = endTimer();

    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Players API',
      action: 'GET /api/players/optimized',
      metadata: {
        duration: `${duration.toFixed(2)}ms`,
      },
    });

    return NextResponse.json(
      {
        success: false,
        get: 'players',
        parameters: {},
        errors: ['Internal server error'],
        results: 0,
        response: [],
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
