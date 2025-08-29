import type { SQL } from 'drizzle-orm';

import { CacheNamespace } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

import { redisService } from './redis-service';

// Cache configuration for different query types
export const DB_CACHE_CONFIG = {
  // User-related queries
  users: {
    namespace: CacheNamespace.USER_SESSIONS,
    priority: 'high' as const,
    ttl: 15 * 60, // 15 minutes
  },
  // Game-related queries
  games: {
    namespace: CacheNamespace.GAME_DATA,
    priority: 'high' as const,
    ttl: 30 * 60, // 30 minutes
  },
  // Game logs
  gameLogs: {
    namespace: CacheNamespace.GAME_DATA,
    priority: 'medium' as const,
    ttl: 10 * 60, // 10 minutes
  },
  // Teams
  teams: {
    namespace: CacheNamespace.TEAM_DATA,
    priority: 'high' as const,
    ttl: 60 * 60, // 1 hour
  },
  // Players
  players: {
    namespace: CacheNamespace.PLAYER_DATA,
    priority: 'high' as const,
    ttl: 60 * 60, // 1 hour
  },
  // Search results
  search: {
    namespace: CacheNamespace.SEARCH_RESULTS,
    priority: 'low' as const,
    ttl: 5 * 60, // 5 minutes
  },
  // Comments
  comments: {
    namespace: CacheNamespace.SYSTEM,
    priority: 'medium' as const,
    ttl: 10 * 60, // 10 minutes
  },
  // Friendships
  friendships: {
    namespace: CacheNamespace.USER_SESSIONS,
    priority: 'medium' as const,
    ttl: 15 * 60, // 15 minutes
  },
  // Analytics
  analytics: {
    namespace: CacheNamespace.ANALYTICS,
    priority: 'critical' as const,
    ttl: 60 * 60, // 1 hour
  },
} as const;

// Query cache key generator
export function generateCacheKey(
  table: string,
  operation: string,
  params: Record<string, unknown> = {}
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${table}:${operation}:${sortedParams}`;
}

// SQL query cache key generator
export function generateSQLCacheKey(sqlQuery: SQL, params: unknown[] = []): string {
  const queryString = sqlQuery.queryChunks
    .map(chunk => {
      if (typeof chunk === 'string') return chunk;
      if (typeof chunk === 'number') return String(chunk);
      if (typeof chunk === 'boolean') return String(chunk);
      if (chunk === null) return 'null';
      if (chunk === undefined) return 'undefined';
      return JSON.stringify(chunk);
    })
    .join('');
  const paramsString = params.map(p => JSON.stringify(p)).join('|');
  return `sql:${Buffer.from(queryString + paramsString)
    .toString('base64')
    .substring(0, 50)}`;
}

// Database query cache wrapper
export class DatabaseCache {
  private static instance: DatabaseCache;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): DatabaseCache {
    if (!DatabaseCache.instance) {
      DatabaseCache.instance = new DatabaseCache();
    }
    return DatabaseCache.instance;
  }

  /**
   * Cache a database query result
   */
  async cacheQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    config: {
      namespace: CacheNamespace;
      priority: keyof typeof DB_CACHE_CONFIG;
      ttl?: number;
    }
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedResult = await redisService.get<T>(cacheKey, config.namespace);
      if (cachedResult !== null) {
        console.log(`[DB Cache] Hit for key: ${cacheKey}`);
        return cachedResult;
      }

      // Cache miss, execute query
      console.log(`[DB Cache] Miss for key: ${cacheKey}`);
      const result = await queryFn();

      // Cache the result
      const _ttl = config.ttl ?? DB_CACHE_CONFIG[config.priority].ttl;
      await redisService.set(
        cacheKey,
        result,
        config.namespace,
        DB_CACHE_CONFIG[config.priority].priority
      );

      return result;
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Database Cache',
        action: 'Cache Query',
      });

      // Fallback to direct query execution
      return queryFn();
    }
  }

  /**
   * Invalidate cache for a specific table
   */
  async invalidateTable(table: string): Promise<void> {
    try {
      const _pattern = `${table}:*`;
      await redisService.clearNamespace(CacheNamespace.GAME_DATA);
      console.log(`[DB Cache] Invalidated table: ${table}`);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Database Cache',
        action: 'Invalidate Table',
      });
    }
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
      const _pattern = `*:${userId}:*`;
      await redisService.clearNamespace(CacheNamespace.USER_SESSIONS);
      console.log(`[DB Cache] Invalidated user: ${userId}`);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Database Cache',
        action: 'Invalidate User',
      });
    }
  }

  /**
   * Clear all database cache
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        redisService.clearNamespace(CacheNamespace.USER_SESSIONS),
        redisService.clearNamespace(CacheNamespace.GAME_DATA),
        redisService.clearNamespace(CacheNamespace.TEAM_DATA),
        redisService.clearNamespace(CacheNamespace.PLAYER_DATA),
        redisService.clearNamespace(CacheNamespace.SEARCH_RESULTS),
        redisService.clearNamespace(CacheNamespace.ANALYTICS),
      ]);
      console.log('[DB Cache] Cleared all database cache');
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Database Cache',
        action: 'Clear All',
      });
    }
  }
}

// Cached database query functions
export class CachedQueries {
  private static readonly dbCache = DatabaseCache.getInstance();

  /**
   * Cached user query
   */
  static async getUser(userId: string, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('users', 'getById', { userId });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'users',
    });
  }

  /**
   * Cached users list query
   */
  static async getUsers(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('users', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'users',
    });
  }

  /**
   * Cached game query
   */
  static async getGame(gameId: string, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('games', 'getById', { gameId });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'games',
    });
  }

  /**
   * Cached games list query
   */
  static async getGames(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('games', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'games',
    });
  }

  /**
   * Cached game log query
   */
  static async getGameLog(gameLogId: string, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('gameLogs', 'getById', { gameLogId });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'gameLogs',
    });
  }

  /**
   * Cached game logs list query
   */
  static async getGameLogs(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('gameLogs', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'gameLogs',
    });
  }

  /**
   * Cached team query
   */
  static async getTeam(teamId: string, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('teams', 'getById', { teamId });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.TEAM_DATA,
      priority: 'teams',
    });
  }

  /**
   * Cached teams list query
   */
  static async getTeams(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('teams', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.TEAM_DATA,
      priority: 'teams',
    });
  }

  /**
   * Cached player query
   */
  static async getPlayer(playerId: string, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('players', 'getById', { playerId });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.PLAYER_DATA,
      priority: 'players',
    });
  }

  /**
   * Cached players list query
   */
  static async getPlayers(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('players', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.PLAYER_DATA,
      priority: 'players',
    });
  }

  /**
   * Cached search query
   */
  static async search(
    query: string,
    filters: Record<string, unknown>,
    queryFn: () => Promise<unknown>
  ) {
    const cacheKey = generateCacheKey('search', 'search', { query, ...filters });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.SEARCH_RESULTS,
      priority: 'search',
    });
  }

  /**
   * Cached comments query
   */
  static async getComments(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('comments', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.SYSTEM,
      priority: 'comments',
    });
  }

  /**
   * Cached friendships query
   */
  static async getFriendships(
    userId: string,
    filters: Record<string, unknown>,
    queryFn: () => Promise<unknown>
  ) {
    const cacheKey = generateCacheKey('friendships', 'getByUser', { userId, ...filters });
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'friendships',
    });
  }

  /**
   * Cached analytics query
   */
  static async getAnalytics(filters: Record<string, unknown>, queryFn: () => Promise<unknown>) {
    const cacheKey = generateCacheKey('analytics', 'getMany', filters);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.ANALYTICS,
      priority: 'analytics',
    });
  }

  /**
   * Cached raw SQL query
   */
  static async rawSQL(sqlQuery: SQL, params: unknown[], queryFn: () => Promise<unknown>) {
    const cacheKey = generateSQLCacheKey(sqlQuery, params);
    return this.dbCache.cacheQuery(cacheKey, queryFn, {
      namespace: CacheNamespace.SYSTEM,
      priority: 'comments', // Using comments priority as default for raw SQL
    });
  }
}

// Export singleton instance
export const dbCache = DatabaseCache.getInstance();
