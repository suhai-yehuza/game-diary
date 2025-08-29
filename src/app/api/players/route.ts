import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cache } from '@/lib/cache';
import {
  getPlayers,
  getUniqueColleges,
  getUniqueCountries,
  getUniquePositions,
} from '@/lib/db/services/players.service';
import { CacheNamespace } from '@/lib/types';
import type { IPlayersApiResponse, IPlayerFilters } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * GET /api/players
 * Fetch NBA players from database with optional filtering and Redis caching
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

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
    const limit = (limitParam && parseInt(limitParam)) || 50;
    const offset = (page - 1) * limit;

    // Special endpoint for filter options
    const getOptions = searchParams.get('options');
    if (getOptions === 'true') {
      // Cache filter options for 1 hour since they don't change frequently
      const optionsCacheKey = 'players:filter-options';
      const cachedOptions = await cache.get(optionsCacheKey, CacheNamespace.PLAYER_DATA);

      if (cachedOptions !== null) {
        console.log('[Players API] Cache hit for filter options');
        return NextResponse.json(cachedOptions);
      }

      console.log('[Players API] Cache miss for filter options, fetching from database...');

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

      // Cache for 1 hour
      await cache.set(optionsCacheKey, options, 60 * 60 * 1000, CacheNamespace.PLAYER_DATA);
      console.log('[Players API] Cached filter options');

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

    // Generate cache key based on filters and pagination
    const cacheKey = `players:${JSON.stringify(filters)}:${page}:${limit}`;

    // Try to get from cache first
    const cachedResult = await cache.get(cacheKey, CacheNamespace.PLAYER_DATA);
    if (cachedResult !== null) {
      console.log(`[Players API] Cache hit for filters: ${JSON.stringify(filters)}`);
      return NextResponse.json(cachedResult);
    }

    console.log(
      `[Players API] Cache miss for filters: ${JSON.stringify(filters)}, fetching from database...`
    );

    // Fetch players from database
    const { players, total } = await getPlayers(filters);

    // Format response to match external API structure
    const response: IPlayersApiResponse = {
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
    };

    // Cache the result for 15 minutes (player data doesn't change frequently)
    await cache.set(cacheKey, response, 15 * 60 * 1000, CacheNamespace.PLAYER_DATA);
    console.log(`[Players API] Cached result for filters: ${JSON.stringify(filters)}`);

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
