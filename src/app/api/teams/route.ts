import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Cache key based on league parameter
    const cacheKey = `basketball_teams:${league || 'all'}`;
    const cacheTTL = 3600; // 1 hour cache for basketball_teams data

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = await hybridCacheService.get(cacheKey);
      if (cachedData) {
        logger.info('Teams cache hit', { key: cacheKey, league });
        return NextResponse.json(cachedData);
      }
    }

    // Invalidate old cache keys to prevent stale data
    try {
      await hybridCacheService.invalidate({ tags: ['basketball_teams'] });
      console.log('🗑️ Invalidated old basketball_teams cache to prevent stale data');
    } catch (error) {
      console.warn('⚠️ Failed to invalidate old basketball_teams cache:', error);
    }

    logger.info('Fetching basketball_teams from database', { league, bypassCache });

    // Fetch all basketball_teams from database
    const allTeams = await db()?.query.basketball_teams.findMany({
      orderBy: basketball_teams.name,
    });

    if (!allTeams) {
      const emptyResponse = { response: [] };
      await hybridCacheService.set(cacheKey, emptyResponse, {
        ttl: cacheTTL,
        tags: ['basketball_teams', 'nba'],
      });
      return NextResponse.json(emptyResponse);
    }

    // Transform basketball_teams to match the expected API response format
    const transformedTeams = allTeams.map(team => {
      // Parse conference data if it's JSON
      let conference = team.conference;
      if (conference && typeof conference === 'string' && conference.startsWith('[')) {
        try {
          const parsed = JSON.parse(conference) as unknown;
          conference = Array.isArray(parsed) ? (parsed[0] as string) : conference;
        } catch {
          // Keep original value if parsing fails
        }
      }

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
            division: null, // We don't have division in the current schema
          },
        },
        created_at: team.created_at,
        updated_at: team.updated_at,
      };
    });

    // Filter by league if specified
    let filteredTeams = transformedTeams;
    if (league === 'standard') {
      // Filter for NBA basketball_teams only
      filteredTeams = transformedTeams.filter(team => team.nbaFranchise && !team.allStar);
    }

    const response = {
      get: 'teams/',
      parameters: { league: league || 'all' },
      errors: [],
      results: filteredTeams.length,
      response: filteredTeams,
    };

    // Cache the response
    await hybridCacheService.set(cacheKey, response, {
      ttl: cacheTTL,
      tags: ['basketball_teams', 'nba', league || 'all'],
    });

    logger.info('Teams fetched from database', {
      count: filteredTeams.length,
      league,
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
