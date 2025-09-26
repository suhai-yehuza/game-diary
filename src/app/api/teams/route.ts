import { and, eq, sql, desc, asc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache';
import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';
import { loadEnvironmentVariables } from '@/lib/utils/env-loader';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    // Load environment variables
    loadEnvironmentVariables();

    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30')));
    const offset = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get('search') || '';
    const conference = searchParams.get('conference') || 'all';
    const division = searchParams.get('division') || 'all';

    // Sort parameters
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortDirection = searchParams.get('sortDirection') || 'asc';

    // Check if we're in mock mode
    if (process.env.MOCK_MODE === 'true') {
      logger.info('Teams API request - Mock Mode', {
        page,
        limit,
        search,
        conference,
        division,
        sortBy,
        sortDirection,
        league,
        bypassCache,
      });

      // Return mock teams data
      const mockTeams = {
        success: true,
        data: {
          teams: [],
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
            key: `teams:${page}:${limit}:${search}:${conference}:${division}:${sortBy}:${sortDirection}:${league || 'all'}`,
            status: 'mock',
          },
        },
        timestamp: new Date().toISOString(),
        mock: true,
      };

      return NextResponse.json(mockTeams);
    }

    logger.info('Teams API request', {
      page,
      limit,
      search,
      conference,
      division,
      sortBy,
      sortDirection,
      league,
      bypassCache,
    });

    // Check database connection
    const database = db();
    if (!database) {
      throw new Error('Database connection not available');
    }

    // Special handling for "all teams" requests (no filters, high limit)
    const isAllTeamsRequest =
      !search &&
      conference === 'all' &&
      division === 'all' &&
      sortBy === 'name' &&
      sortDirection === 'asc' &&
      limit >= 100 &&
      page === 1;

    // Cache key based on request type
    let cacheKey: string;
    let cacheTTL: number;

    if (isAllTeamsRequest) {
      // Use a dedicated cache key for all teams
      cacheKey = 'teams:all';
      cacheTTL = 24 * 60 * 60 * 1000; // 24 hour cache for all teams
    } else {
      // Use specific cache key for filtered/paginated requests
      cacheKey = `teams:${page}:${limit}:${search}:${conference}:${division}:${sortBy}:${sortDirection}:${league || 'all'}`;
      cacheTTL = 24 * 60 * 60 * 1000; // 24 hour cache for teams data
    }

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = await hybridCacheService.get(cacheKey);
      if (cachedData) {
        logger.info('Teams cache hit', { key: cacheKey, isAllTeamsRequest });
        return NextResponse.json(cachedData);
      }
    }

    logger.info('Fetching teams from database', { page, limit, search, conference, division });

    // Build where conditions
    const whereConditions = [];

    // Search filter
    if (search) {
      whereConditions.push(
        sql`(
          ${basketball_teams.name} ILIKE ${`%${search}%`} OR
          ${basketball_teams.nickname} ILIKE ${`%${search}%`} OR
          ${basketball_teams.city} ILIKE ${`%${search}%`} OR
          ${basketball_teams.code} ILIKE ${`%${search}%`}
        )`
      );
    }

    // Conference filter - query from leagues JSONB field
    if (conference !== 'all') {
      whereConditions.push(
        sql`${basketball_teams.leagues}->'standard'->>'conference' = ${conference}`
      );
    }

    // Division filter - query from leagues JSONB field
    if (division !== 'all') {
      whereConditions.push(sql`${basketball_teams.leagues}->'standard'->>'division' = ${division}`);
    }

    // League filter
    if (league === 'standard') {
      whereConditions.push(
        and(eq(basketball_teams.nba_franchise, true), eq(basketball_teams.all_star, false))
      );
    }

    // Build order by clause
    let orderBy;
    switch (sortBy) {
      case 'name':
        orderBy =
          sortDirection === 'desc' ? desc(basketball_teams.name) : asc(basketball_teams.name);
        break;
      case 'city':
        orderBy =
          sortDirection === 'desc' ? desc(basketball_teams.city) : asc(basketball_teams.city);
        break;
      case 'conference':
        orderBy =
          sortDirection === 'desc'
            ? desc(basketball_teams.conference)
            : asc(basketball_teams.conference);
        break;
      default:
        orderBy = asc(basketball_teams.name);
    }

    // Get total count
    const totalCountResult = await database
      .select({ count: sql<number>`count(*)` })
      .from(basketball_teams)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;

    // Fetch paginated teams
    const teams = await database
      .select()
      .from(basketball_teams)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    if (!teams) {
      const emptyResponse = {
        teams: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        },
        cacheInfo: {
          cached: false,
          source: 'database',
        },
      };
      await hybridCacheService.set(cacheKey, emptyResponse, {
        ttl: cacheTTL,
        tags: ['teams', 'nba'],
      });
      return NextResponse.json(emptyResponse);
    }

    // Transform basketball_teams to match the expected API response format
    const transformedTeams = teams.map(team => {
      // Extract conference and division from leagues JSONB field
      const leagues = team.leagues as {
        standard?: { conference?: string; division?: string };
      } | null;
      const conference = leagues?.standard?.conference || null;
      const division = leagues?.standard?.division || null;

      return {
        id: parseInt(team.id),
        name: team.name,
        nickname: team.nickname,
        code: team.code,
        city: team.city,
        logo: team.logo,
        allStar: team.all_star,
        nbaFranchise: team.nba_franchise,
        leagues: {
          standard: {
            conference: conference,
            division: division,
          },
        },
        created_at: team.created_at,
        updated_at: team.updated_at,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      teams: transformedTeams,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      cacheInfo: {
        cached: false,
        source: 'database',
        cacheKey,
        isAllTeamsRequest,
      },
    };

    // Cache the response
    try {
      await hybridCacheService.set(cacheKey, response, {
        ttl: cacheTTL,
        tags: ['teams', 'nba'],
      });
    } catch (cacheError) {
      logger.warn('Failed to cache teams response', { error: cacheError });
    }

    logger.info('Teams fetched from database', {
      count: transformedTeams.length,
      totalCount,
      page,
      limit,
      cached: true,
    });

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/teams',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
