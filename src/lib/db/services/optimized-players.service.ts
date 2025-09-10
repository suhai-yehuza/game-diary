import { and, desc, eq, ilike, or, sql, isNull, asc } from 'drizzle-orm';

import { API_LIMITS } from '@/lib/constants';
import { db } from '@/lib/db';
import { basketball_players } from '@/lib/db/schema/game-schemas';
import { errorHandlers } from '@/lib/utils/error-handler';
import { performanceMonitor } from '@/lib/utils/performance-monitor';
import type { IPlayerResponse, IPlayerFilters } from '@/types';

/**
 * Optimized player service with performance improvements
 */

// Cache for frequently accessed data
const playerCache = new Map<string, { data: IPlayerResponse[]; timestamp: number; ttl: number }>();

/**
 * Convert database player record to API format (optimized)
 */
function convertDbPlayerToApiFormatOptimized(dbPlayer: Record<string, unknown>): IPlayerResponse {
  try {
    // Parse JSON fields safely with fallbacks
    const birth = dbPlayer.birth ? JSON.parse(dbPlayer.birth as string) : null;
    const nba = dbPlayer.nba ? JSON.parse(dbPlayer.nba as string) : null;
    const height = dbPlayer.height ? JSON.parse(dbPlayer.height as string) : null;
    const weight = dbPlayer.weight ? JSON.parse(dbPlayer.weight as string) : null;
    const _teams = dbPlayer.teams ? JSON.parse(dbPlayer.teams as string) : null;
    const leagues = dbPlayer.leagues ? JSON.parse(dbPlayer.leagues as string) : null;

    return {
      id: String(dbPlayer.id),
      firstname: (dbPlayer.first_name as string) || (dbPlayer.firstName as string) || '',
      lastname: (dbPlayer.last_name as string) || (dbPlayer.lastName as string) || '',
      name: `${(dbPlayer.first_name as string) || ''} ${(dbPlayer.last_name as string) || ''}`.trim(),
      position: 'Guard', // Default position
      team: {},
      birth,
      nba,
      height,
      weight,
      college: dbPlayer.college as string | null,
      affiliation: dbPlayer.affiliation as string | null,
      leagues,
    };
  } catch (error) {
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Database Service',
      action: 'Convert DB player to API format',
    });

    // Return minimal format on error
    return {
      id: String(dbPlayer.id),
      firstname: (dbPlayer.first_name as string) || 'Unknown',
      lastname: (dbPlayer.last_name as string) || 'Player',
      name: 'Unknown Player',
      position: 'Guard',
      team: {},
      birth: null,
      nba: null,
      height: null,
      weight: null,
      college: null,
      affiliation: null,
      leagues: null,
    };
  }
}

/**
 * Get players with optimized queries and caching
 */
export async function getPlayersOptimized(filters: IPlayerFilters = {}): Promise<{
  players: IPlayerResponse[];
  total: number;
}> {
  const endTimer = performanceMonitor.startTimer('getPlayersOptimized');

  try {
    const {
      searchTerm,
      positionFilter,
      yearFilter,
      collegeFilter,
      countryFilter,
      sortBy = 'name',
      sortDirection = 'asc',
      limit = API_LIMITS.PLAYERS.LARGE,
      offset = 0,
    } = filters;

    // Create cache key
    const cacheKey = `players:${JSON.stringify(filters)}`;
    const now = Date.now();

    // Check cache first
    const cached = playerCache.get(cacheKey);
    if (cached && now - cached.timestamp < cached.ttl) {
      performanceMonitor.recordMetric('getPlayersOptimized', 'cacheHitRate', 1);
      return {
        players: cached.data.slice(offset, offset + limit),
        total: cached.data.length,
      };
    }

    performanceMonitor.recordMetric('getPlayersOptimized', 'cacheHitRate', 0);

    // Build optimized WHERE conditions
    const conditions = [isNull(basketball_players.deleted_at)];

    // Search term - optimized with proper indexing
    if (searchTerm?.trim()) {
      const term = `%${searchTerm.trim()}%`;
      const searchCondition = or(
        ilike(basketball_players.first_name, term),
        ilike(basketball_players.last_name, term),
        ilike(basketball_players.college, term)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // College filter - direct equality check
    if (collegeFilter && collegeFilter !== 'all') {
      conditions.push(eq(basketball_players.college, collegeFilter));
    }

    // Position filter - optimized JSON search
    if (positionFilter && positionFilter !== 'all') {
      conditions.push(ilike(basketball_players.leagues, `%${positionFilter}%`));
    }

    // Year filter - determine rookie vs veteran based on NBA start year
    if (yearFilter && yearFilter !== 'all') {
      if (yearFilter === 'rookie') {
        // Rookies: NBA start year is current year or last year
        const currentYear = new Date().getFullYear();
        conditions.push(sql`JSON_EXTRACT(nba, '$.start') >= ${currentYear - 1}`);
      } else if (yearFilter === 'veteran') {
        // Veterans: NBA start year is before last year
        const currentYear = new Date().getFullYear();
        conditions.push(sql`JSON_EXTRACT(nba, '$.start') < ${currentYear - 1}`);
      }
    }

    // Country filter - optimized JSON search
    if (countryFilter && countryFilter !== 'all') {
      conditions.push(ilike(basketball_players.birth, `%${countryFilter}%`));
    }

    // Build optimized ORDER BY clause
    let orderBy;
    switch (sortBy) {
      case 'name':
        orderBy =
          sortDirection === 'asc'
            ? [asc(basketball_players.last_name), asc(basketball_players.first_name)]
            : [desc(basketball_players.last_name), desc(basketball_players.first_name)];
        break;
      case 'college':
        orderBy =
          sortDirection === 'asc'
            ? [asc(basketball_players.college), asc(basketball_players.last_name)]
            : [desc(basketball_players.college), desc(basketball_players.last_name)];
        break;
      case 'position':
        orderBy =
          sortDirection === 'asc'
            ? [asc(basketball_players.leagues), asc(basketball_players.last_name)]
            : [desc(basketball_players.leagues), desc(basketball_players.last_name)];
        break;
      default:
        orderBy = [asc(basketball_players.last_name), asc(basketball_players.first_name)];
    }

    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }

    // Optimized query with proper indexing
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count efficiently
    const countQuery = sql`
      SELECT COUNT(*) as count
      FROM basketball_players
      WHERE ${whereClause}
    `;
    const countResult = await database.execute(countQuery);
    const total = parseInt((countResult.rows[0]?.count as string) ?? '0');

    // Get paginated results with optimized query
    const dbPlayers = await database
      .select({
        id: basketball_players.id,
        first_name: basketball_players.first_name,
        last_name: basketball_players.last_name,
        college: basketball_players.college,
        affiliation: basketball_players.affiliation,
        birth: basketball_players.birth,
        nba: basketball_players.nba,
        height: basketball_players.height,
        weight: basketball_players.weight,
        teams: basketball_players.teams,
        leagues: basketball_players.leagues,
      })
      .from(basketball_players)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    // Convert to API format
    const players = dbPlayers.map(convertDbPlayerToApiFormatOptimized);

    // Cache the results for 5 minutes
    playerCache.set(cacheKey, {
      data: players,
      timestamp: now,
      ttl: 5 * 60 * 1000, // 5 minutes
    });

    // Record performance metrics
    performanceMonitor.recordMetric(
      'getPlayersOptimized',
      'dataSize',
      JSON.stringify(players).length
    );
    performanceMonitor.recordMetric('getPlayersOptimized', 'queryComplexity', conditions.length);

    const _duration = endTimer();
    performanceMonitor.logPerformance('getPlayersOptimized');

    return {
      players,
      total,
    };
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Database Service',
      action: 'Fetch players',
    });

    const _duration = endTimer();
    return {
      players: [],
      total: 0,
    };
  }
}

/**
 * Get players by team with optimized query
 */
export async function getPlayersByTeamOptimized(teamId: string): Promise<IPlayerResponse[]> {
  const endTimer = performanceMonitor.startTimer('getPlayersByTeamOptimized');

  try {
    const database = db();
    if (!database) {
      throw new Error('Database not available');
    }

    const dbPlayers = await database
      .select({
        id: basketball_players.id,
        first_name: basketball_players.first_name,
        last_name: basketball_players.last_name,
        college: basketball_players.college,
        affiliation: basketball_players.affiliation,
        birth: basketball_players.birth,
        nba: basketball_players.nba,
        height: basketball_players.height,
        weight: basketball_players.weight,
        teams: basketball_players.teams,
        leagues: basketball_players.leagues,
      })
      .from(basketball_players)
      .where(
        and(ilike(basketball_players.teams, `%${teamId}%`), isNull(basketball_players.deleted_at))
      )
      .orderBy(asc(basketball_players.last_name), asc(basketball_players.first_name));

    const players = dbPlayers.map(convertDbPlayerToApiFormatOptimized);

    const _duration = endTimer();
    performanceMonitor.logPerformance('getPlayersByTeamOptimized');

    return players;
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Optimized Database Service',
      action: 'Fetch players by team',
    });

    const _duration = endTimer();
    return [];
  }
}

/**
 * Clear player cache
 */
export function clearPlayerCache(): void {
  playerCache.clear();
}

/**
 * Get cache statistics
 */
export function getPlayerCacheStats(): { size: number; keys: string[] } {
  return {
    size: playerCache.size,
    keys: Array.from(playerCache.keys()),
  };
}
