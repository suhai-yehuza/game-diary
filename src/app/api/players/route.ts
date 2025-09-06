import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { API_LIMITS } from '@/lib/constants';
import {
  getPlayers,
  getUniqueColleges,
  getUniqueCountries,
  getUniquePositions,
} from '@/lib/db/services/players.service';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IPlayersApiResponse, IPlayerFilters } from '@/types';

/**
 * GET /api/players
 * Fetch NBA players from database with optional filtering and Redis caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Get filter parameters
    const searchTerm = searchParams.get('search') || undefined;
    const positionFilter = searchParams.get('position') || undefined;
    const teamFilter = searchParams.get('team') || undefined;
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
    const limit = (limitParam && parseInt(limitParam)) || API_LIMITS.PLAYERS.LARGE;
    const offset = (page - 1) * limit;

    // Special endpoint for filter options
    const getOptions = searchParams.get('options');
    if (getOptions === 'true') {
      // Cache filter options with longer TTL since they change less frequently
      const optionsCacheKey = 'players:filter-options';
      const optionsCacheTTL = 7200; // 2 hours for filter options

      if (!bypassCache) {
        const cachedOptions = await hybridCacheService.get(optionsCacheKey);
        if (cachedOptions) {
          logger.cache('hit', optionsCacheKey);
          return NextResponse.json(cachedOptions);
        }
      }

      logger.database('players', 'fetching-filter-options', undefined, { bypassCache });

      // DISABLED: Database caching - fetch filter options directly
      console.log('[Players API] Fetching filter options from database (no caching)...');

      const [colleges, countries, positions] = await Promise.all([
        getUniqueColleges(),
        getUniqueCountries(),
        getUniquePositions(),
      ]);

      const options = {
        colleges,
        countries,
        positions,
      };

      // Cache the filter options
      await hybridCacheService.set(optionsCacheKey, options, {
        ttl: optionsCacheTTL,
        tags: ['players', 'nba', 'filter-options'],
      });

      return NextResponse.json(options);
    }

    // Build filters
    const filters: IPlayerFilters = {
      searchTerm,
      positionFilter,
      teamFilter,
      collegeFilter,
      countryFilter,
      sortBy,
      sortDirection,
      limit,
      offset,
    };

    // Create clean, namespaced cache key (without pagination to avoid fragmentation)
    let cacheKey = 'players:all';

    // Add specific filters to the key if they exist
    if (searchTerm) {
      cacheKey = `players:search:${searchTerm}`;
    } else if (positionFilter && positionFilter !== 'all') {
      cacheKey = `players:position:${positionFilter}`;
    } else if (teamFilter && teamFilter !== 'all') {
      cacheKey = `players:team:${teamFilter}`;
    } else if (collegeFilter && collegeFilter !== 'all') {
      cacheKey = `players:college:${collegeFilter}`;
    } else if (countryFilter && countryFilter !== 'all') {
      cacheKey = `players:country:${countryFilter}`;
    }

    // Add sorting info to the key (but not pagination)
    if (sortBy !== 'name' || sortDirection !== 'asc') {
      cacheKey += `:sort:${sortBy}:${sortDirection}`;
    }

    console.log('🔑 Generated cache key:', cacheKey, 'for request params:', {
      searchTerm,
      positionFilter,
      teamFilter,
      collegeFilter,
      countryFilter,
      sortBy,
      sortDirection,
      limit,
      offset,
      bypassCache,
    });

    // Note: We don't include limit/offset in cache keys since we cache all data
    // and reconstruct pages on the client side for better cache efficiency

    const cacheTTL = 3600; // 1 hour cache for player data

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      console.log('🔍 Checking cache for key:', cacheKey);

      // Test cache service availability
      try {
        const cachedData = await hybridCacheService.get(cacheKey);
        console.log('🔍 Cache lookup result:', {
          key: cacheKey,
          found: cachedData !== null,
          dataType: cachedData ? typeof cachedData : 'null',
          dataLength:
            cachedData && typeof cachedData === 'object' ? Object.keys(cachedData).length : 'N/A',
        });
        if (cachedData) {
          console.log('✅ Cache HIT for key:', cacheKey);
          logger.cache('hit', cacheKey);
          return NextResponse.json(cachedData);
        } else {
          console.log('❌ Cache MISS for key:', cacheKey);
        }
      } catch (cacheError) {
        console.error('❌ Cache lookup failed:', cacheError);
        console.log('🔍 Continuing with database fetch due to cache error...');
      }
    } else {
      console.log('🚫 Cache bypassed due to bypass-cache parameter');
    }

    logger.database('players', 'fetching', undefined, {
      filters: JSON.stringify(filters),
      bypassCache,
    });

    // Cache logic removed - fetch directly from database
    // Fetch players from database
    const { players, total } = await getPlayers(filters);

    // Format response to match external API structure
    const response: IPlayersApiResponse = {
      success: true,
      get: 'players',
      parameters: {
        league: 'standard',
        season: '2024',
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter && { position: positionFilter }),
        ...(teamFilter && { team: teamFilter }),
        ...(collegeFilter && { college: collegeFilter }),
      },
      errors: [],
      results: total,
      response: players,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      players: players,
      total: total,
      page: 1,
      limit: API_LIMITS.PLAYERS.DEFAULT,
    };

    // Cache the response
    await hybridCacheService.set(cacheKey, response, {
      ttl: cacheTTL,
      tags: ['players', 'nba', 'filtered'],
    });

    logger.database('players', 'fetched', undefined, {
      count: players.length,
      total,
      cached: true,
    });

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Players API',
      action: 'GET /api/players',
      requestId: request.headers.get('x-request-id') || undefined,
    });

    return NextResponse.json(
      {
        get: 'players',
        parameters: {},
        errors: ['Internal server error'],
        results: 0,
        response: [],
      },
      { status: 500 }
    );
  }
}
