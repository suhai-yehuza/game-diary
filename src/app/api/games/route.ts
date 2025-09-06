import { eq, desc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { API_LIMITS } from '@/lib/constants';
import { db } from '@/lib/db';
import { basketball_games } from '@/lib/db/schema';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { IDatabaseGame, IDatabaseTeam, ITeamData, IStatusData, IArenaData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit') || `${API_LIMITS.GAMES.LARGE}`)
      : API_LIMITS.GAMES.LARGE;
    const bypassCache = searchParams.get('bypass-cache') === 'true';

    // Create clean, namespaced cache key
    let cacheKey = 'games:all';

    // Add season filter to the key (without limit to avoid fragmentation)
    if (season && season !== 'all') {
      cacheKey = `games:season:${season}`;
    } else if (season === 'all') {
      cacheKey = 'games:all-seasons:merged';
    }

    // Cache key generated for season: ${season}

    // Note: We don't include limit in the cache key to avoid fragmentation
    // The same season data can be reused regardless of the requested limit
    // This allows for better cache efficiency and data sharing

    const cacheTTL = 7200; // 2 hours cache for games data (increased from 30 minutes since games don't change frequently)

    // Try to get from cache first (unless bypass is requested)
    if (!bypassCache) {
      const cachedData = await hybridCacheService.get(cacheKey);
      if (cachedData) {
        logger.cache('hit', cacheKey);
        return NextResponse.json(cachedData);
      } else {
        logger.cache('miss', cacheKey);
      }
    }

    logger.database('games', 'fetching', undefined, { season, limit, bypassCache });

    // Games API called with params: season=${season}, limit=${limit}

    // Fetch games from database with team information
    let games: IDatabaseGame[] = [];

    if (season === 'all') {
      // For "all seasons" view, always fetch maximum available games for caching
      // This ensures the merged cache contains all available data regardless of the requested limit
      const maxLimit = Math.max(limit || 20000, 20000); // Always fetch at least 20,000 for caching
      games =
        (await db()?.query.basketball_games.findMany({
          limit: maxLimit,
          orderBy: [desc(basketball_games.date)],
          with: {
            // Note: We'll need to manually fetch teams since relations might not be set up
          },
        })) || [];

      // Fetched ${games.length} games for merged cache (requested: ${limit}, cached: ${maxLimit})
    } else {
      // For specific season, use the existing logic
      games =
        (await db()?.query.basketball_games.findMany({
          where: season && season !== 'all' ? eq(basketball_games.season, season) : undefined,
          limit,
          orderBy: [desc(basketball_games.date)],
          with: {
            // Note: We'll need to manually fetch teams since relations might not be set up
          },
        })) || [];
    }

    // Found ${games?.length || 0} games

    // Debug: Check game statuses and scores
    if (games && games.length > 0) {
      const _statusCounts = games.reduce<Record<string, number>>((acc, game) => {
        const status =
          typeof game.status === 'string'
            ? game.status
            : ((game.status as Record<string, unknown>)?.short as string) ||
              game.game_status ||
              'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const _gamesWithScores = games.filter(game => {
        const scores = game.scores as Record<string, { points: number }> | null;
        return scores?.home?.points !== null && scores?.visitors?.points !== null;
      }).length;
    }

    if (!games || games.length === 0) {
      const emptyResponse = {
        get: 'games/',
        parameters: { season: season || 'all' },
        errors: [],
        results: 0,
        response: [],
      };

      // Cache empty response
      await hybridCacheService.set(cacheKey, emptyResponse, {
        ttl: cacheTTL,
        tags: ['games', 'nba', season || 'all'],
      });

      return NextResponse.json(emptyResponse);
    }

    // Extract team information from games JSONB data
    const teamIds = new Set<string>();
    games.forEach(game => {
      const teamsData = game.teams as Record<string, { id: string | number }> | null;
      if (teamsData?.home?.id) {
        teamIds.add(teamsData.home.id.toString());
      }
      if (teamsData?.visitors?.id) {
        teamIds.add(teamsData.visitors.id.toString());
      }
    });

    const teams =
      (await db()?.query.basketball_teams.findMany({
        where: (teams, { inArray }) => inArray(teams.id, Array.from(teamIds)),
      })) || [];

    const _teamsMap = new Map(teams?.map((team: IDatabaseTeam) => [team.id, team]) || []);

    // Transform games to match the expected API response format
    // First, deduplicate games by ID to prevent React key conflicts
    const uniqueGames = games.filter(
      (game, index, self) => index === self.findIndex(g => g.id === game.id)
    );

    if (uniqueGames.length !== games.length) {
      // Deduplicated games: ${games.length} -> ${uniqueGames.length} (removed ${games.length - uniqueGames.length} duplicates)
    }

    const transformedGames = uniqueGames.map(game => {
      const teamsData = game.teams as Record<string, ITeamData> | null;
      const homeTeam = teamsData?.home || ({} as ITeamData);
      const awayTeam = teamsData?.visitors || ({} as ITeamData);
      const statusData = game.status;
      const periods = game.periods;
      const arena = game.arena;
      const scores = game.scores;
      const officials = game.officials;

      return {
        id: game.id, // Keep as string since it's in format ${season}-${game.id}
        league: 'standard', // Default to standard since league is not in DB schema
        season: game.season || 'unknown', // Add season field for filtering
        date: {
          start: game.date?.toISOString() || new Date().toISOString(),
          end: null,
          duration: null,
        },
        status: {
          clock: (statusData as IStatusData)?.clock ?? null,
          halftime: (statusData as IStatusData)?.halftime ?? false,
          short: (statusData as IStatusData)?.short ?? game.game_status,
          long: (statusData as IStatusData)?.long ?? game.game_status,
        },
        stage: game.stage ?? 1, // Game stage (regular season, playoffs, etc.)
        periods: periods || {
          current: (statusData as IStatusData)?.periods?.current ?? 1,
          total: (statusData as IStatusData)?.periods?.total ?? 4,
          endOfPeriod: (statusData as IStatusData)?.periods?.endOfPeriod ?? false,
        },
        arena: {
          name: (arena as IArenaData)?.name ?? 'Unknown Arena',
          city: (arena as IArenaData)?.city ?? 'Unknown City',
          state: (arena as IArenaData)?.state ?? null,
          country: (arena as IArenaData)?.country ?? 'USA',
        },
        teams: {
          visitors: {
            id: awayTeam?.id || 0,
            name: awayTeam?.name || 'Unknown Team',
            nickname: awayTeam?.nickname || 'Unknown',
            code: awayTeam?.code || 'UNK',
            logo: awayTeam?.logo || null,
          },
          home: {
            id: homeTeam?.id || 0,
            name: homeTeam?.name || 'Unknown Team',
            nickname: homeTeam?.nickname || 'Unknown',
            code: homeTeam?.code || 'UNK',
            logo: homeTeam?.logo || null,
          },
        },
        scores: scores || {
          visitors: {
            win: 0,
            loss: 0,
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [0],
            points: 0,
          },
          home: {
            win: 0,
            loss: 0,
            series: {
              win: 0,
              loss: 0,
            },
            linescore: [0],
            points: 0,
          },
        },
        officials: officials || [],
        timesTied: game.times_tied ?? 0,
        leadChanges: game.lead_changes ?? 0,
        nugget: game.nugget ?? null,
      };
    });

    const response = {
      get: 'games/',
      parameters: { season: season || 'all' },
      errors: [],
      results: transformedGames.length,
      response: transformedGames,
    };

    // Cache the response
    console.log('💾 Attempting to cache response with key:', cacheKey);
    try {
      await hybridCacheService.set(cacheKey, response, {
        ttl: cacheTTL,
        tags: ['games', 'nba', season || 'all'],
      });
      console.log('✅ Successfully cached response for key:', cacheKey);
    } catch (cacheError) {
      console.error('❌ Failed to cache response for key:', cacheKey, 'Error:', cacheError);
    }

    logger.database('games', 'fetched', undefined, {
      count: transformedGames.length,
      season,
      cached: true,
    });

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/games',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
