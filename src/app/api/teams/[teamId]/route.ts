import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache';
import { db } from '@/lib/db';
import { basketball_teams } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Cache key for individual team
    const cacheKey = `team:${teamId}`;
    const cacheTTL = 24 * 60 * 60 * 1000; // 24 hour cache for team data

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = simpleCacheService.get(cacheKey);
      if (cachedData) {
        logger.info('Team cache hit', { teamId, cacheKey });
        return NextResponse.json(cachedData);
      }
    }

    // Check if we're in test/mock mode
    if (process.env.MOCK_MODE === 'true' || process.env.NODE_ENV === 'test') {
      // Return mock data for test environment
      const mockData = {
        id: parseInt(teamId),
        name: 'Test Team',
        nickname: 'Test',
        code: 'TEST',
        city: 'Test City',
        logo: null,
        allStar: false,
        nbaFranchise: true,
        leagues: {
          standard: {
            conference: 'Test Conference',
            division: null,
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Cache mock data
      simpleCacheService.set(cacheKey, mockData, {
        ttl: cacheTTL,
        tags: ['team', 'nba', `team:${teamId}`],
      });

      return NextResponse.json(mockData);
    }

    const database = db();
    if (!database) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    logger.info('Fetching team from database', { teamId });

    // Fetch team from database
    const team = await database.query.basketball_teams.findFirst({
      where: eq(basketball_teams.id, teamId),
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

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

    // Extract conference and division from team's leagues data
    const teamLeagues = team.leagues as {
      standard?: { conference?: string; division?: string };
    } | null;
    const finalConference = teamLeagues?.standard?.conference ?? conference ?? 'Unknown';
    const division = teamLeagues?.standard?.division ?? 'N/A';

    // Prepare team data in the expected format
    const teamData = {
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
          conference: finalConference,
          division: division,
        },
      },
      created_at: team.created_at,
      updated_at: team.updated_at,
    };

    // Cache the team data
    try {
      simpleCacheService.set(cacheKey, teamData, {
        ttl: cacheTTL,
        tags: ['team', 'nba', `team:${teamId}`],
      });
      logger.info('Team data cached', { teamId, cacheKey });
    } catch (cacheError) {
      logger.warn('Failed to cache team data', { error: cacheError, teamId });
    }

    return NextResponse.json(teamData);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/teams/[teamId]',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
