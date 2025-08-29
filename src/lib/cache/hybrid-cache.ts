import type { SQL } from 'drizzle-orm';

import { CacheNamespace } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

import { redisService } from './redis-service';

// NBA data tables that should use external API + Redis with DB fallback
export const NBA_API_TABLES = {
  GAMES: 'nba_games',
  TEAMS: 'teams',
  PLAYERS: 'nba_players',
  SEASONS: 'seasons',
} as const;

// Cache configuration for different data sources
export const HYBRID_CACHE_CONFIG = {
  // NBA API data (external API + Redis, DB fallback)
  nba_api: {
    namespace: CacheNamespace.GAME_DATA,
    priority: 'high' as const,
    ttl: 30 * 60, // 30 minutes
    fallbackTTL: 60 * 60, // 1 hour for DB fallback
  },
  // Database data (DB + Redis)
  database: {
    namespace: CacheNamespace.SYSTEM,
    priority: 'medium' as const,
    ttl: 15 * 60, // 15 minutes
  },
} as const;

// Query cache key generator
export function generateHybridCacheKey(
  table: string,
  operation: string,
  params: Record<string, unknown> = {},
  source: 'api' | 'db' = 'api'
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');

  return `${source}:${table}:${operation}:${sortedParams}`;
}

// SQL query cache key generator
export function generateHybridSQLCacheKey(
  sqlQuery: SQL,
  params: unknown[] = [],
  source: 'api' | 'db' = 'api'
): string {
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
  return `${source}:sql:${Buffer.from(queryString + paramsString)
    .toString('base64')
    .substring(0, 50)}`;
}

// Hybrid cache wrapper
export class HybridCache {
  private static instance: HybridCache;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): HybridCache {
    if (!HybridCache.instance) {
      HybridCache.instance = new HybridCache();
    }
    return HybridCache.instance;
  }

  /**
   * Check if a table should use NBA API + Redis with DB fallback
   */
  isNBATable(table: string): boolean {
    return Object.values(NBA_API_TABLES).includes(
      table as (typeof NBA_API_TABLES)[keyof typeof NBA_API_TABLES]
    );
  }

  /**
   * Cache NBA data with external API priority and DB fallback
   */
  async cacheNBAData<T>(
    cacheKey: string,
    apiQueryFn: () => Promise<T>,
    dbQueryFn: () => Promise<T>,
    config: {
      namespace: CacheNamespace;
      priority: keyof typeof HYBRID_CACHE_CONFIG;
      ttl?: number;
    }
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedResult = await redisService.get<T>(cacheKey, config.namespace);
      if (cachedResult !== null) {
        console.log(`[Hybrid Cache] NBA API cache hit for key: ${cacheKey}`);
        return cachedResult;
      }

      // Cache miss, try external API first
      console.log(`[Hybrid Cache] NBA API cache miss for key: ${cacheKey}`);
      try {
        const apiResult = await apiQueryFn();

        // Cache the API result
        const _ttl = config.ttl ?? HYBRID_CACHE_CONFIG[config.priority].ttl;
        await redisService.set(
          cacheKey,
          apiResult,
          config.namespace,
          HYBRID_CACHE_CONFIG[config.priority].priority
        );

        console.log(`[Hybrid Cache] NBA API result cached for key: ${cacheKey}`);
        return apiResult;
      } catch (apiError) {
        console.warn(
          `[Hybrid Cache] NBA API failed for key: ${cacheKey}, falling back to DB:`,
          apiError
        );

        // API failed, try database fallback
        try {
          const dbResult = await dbQueryFn();

          // Cache the DB result with longer TTL
          const _fallbackTTL =
            config.priority === 'nba_api'
              ? HYBRID_CACHE_CONFIG[config.priority].fallbackTTL
              : HYBRID_CACHE_CONFIG[config.priority].ttl;
          await redisService.set(
            cacheKey,
            dbResult,
            config.namespace,
            HYBRID_CACHE_CONFIG[config.priority].priority
          );

          console.log(`[Hybrid Cache] NBA DB fallback result cached for key: ${cacheKey}`);
          return dbResult;
        } catch (dbError) {
          console.error(`[Hybrid Cache] Both NBA API and DB failed for key: ${cacheKey}:`, {
            apiError,
            dbError,
          });
          throw new Error(`Failed to fetch NBA data: API and DB fallback both failed`);
        }
      }
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Hybrid Cache',
        action: 'Cache NBA Data',
      });

      // Final fallback: try DB directly
      return dbQueryFn();
    }
  }

  /**
   * Cache database data (DB + Redis only)
   */
  async cacheDatabaseData<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    config: {
      namespace: CacheNamespace;
      priority: keyof typeof HYBRID_CACHE_CONFIG;
      ttl?: number;
    }
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedResult = await redisService.get<T>(cacheKey, config.namespace);
      if (cachedResult !== null) {
        console.log(`[Hybrid Cache] DB cache hit for key: ${cacheKey}`);
        return cachedResult;
      }

      // Cache miss, execute database query
      console.log(`[Hybrid Cache] DB cache miss for key: ${cacheKey}`);
      const result = await queryFn();

      // Cache the result
      const _ttl = config.ttl ?? HYBRID_CACHE_CONFIG[config.priority].ttl;
      await redisService.set(
        cacheKey,
        result,
        config.namespace,
        HYBRID_CACHE_CONFIG[config.priority].priority
      );

      console.log(`[Hybrid Cache] DB result cached for key: ${cacheKey}`);
      return result;
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Hybrid Cache',
        action: 'Cache Database Data',
      });

      // Fallback to direct query execution
      return queryFn();
    }
  }

  /**
   * Smart cache method that chooses the right strategy based on table
   */
  async cacheQuery<T>(
    table: string,
    operation: string,
    params: Record<string, unknown>,
    apiQueryFn: () => Promise<T>,
    dbQueryFn: () => Promise<T>
  ): Promise<T> {
    const isNBA = this.isNBATable(table);
    const cacheKey = generateHybridCacheKey(table, operation, params, isNBA ? 'api' : 'db');

    if (isNBA) {
      // NBA data: API + Redis with DB fallback
      return this.cacheNBAData(cacheKey, apiQueryFn, dbQueryFn, {
        namespace: CacheNamespace.GAME_DATA,
        priority: 'nba_api',
      });
    } else {
      // Other data: DB + Redis only
      return this.cacheDatabaseData(cacheKey, dbQueryFn, {
        namespace: CacheNamespace.SYSTEM,
        priority: 'database',
      });
    }
  }

  /**
   * Invalidate cache for a specific table
   */
  async invalidateTable(table: string): Promise<void> {
    try {
      const isNBA = this.isNBATable(table);
      const namespace = isNBA ? CacheNamespace.GAME_DATA : CacheNamespace.SYSTEM;
      await redisService.clearNamespace(namespace);
      console.log(`[Hybrid Cache] Invalidated table: ${table} (${isNBA ? 'NBA API' : 'DB'} cache)`);
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Hybrid Cache',
        action: 'Invalidate Table',
      });
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        redisService.clearNamespace(CacheNamespace.GAME_DATA),
        redisService.clearNamespace(CacheNamespace.SYSTEM),
        redisService.clearNamespace(CacheNamespace.USER_SESSIONS),
        redisService.clearNamespace(CacheNamespace.TEAM_DATA),
        redisService.clearNamespace(CacheNamespace.PLAYER_DATA),
        redisService.clearNamespace(CacheNamespace.SEARCH_RESULTS),
        redisService.clearNamespace(CacheNamespace.ANALYTICS),
      ]);
      console.log('[Hybrid Cache] Cleared all cache');
    } catch (error) {
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: 'Hybrid Cache',
        action: 'Clear All',
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    nbaTables: string[];
    databaseTables: string[];
    cacheConfig: typeof HYBRID_CACHE_CONFIG;
  } {
    return {
      nbaTables: Object.values(NBA_API_TABLES),
      databaseTables: [
        'users',
        'game_logs',
        'comments',
        'friendships',
        'reactions',
        'notifications',
      ],
      cacheConfig: HYBRID_CACHE_CONFIG,
    };
  }
}

// Cached query functions for hybrid approach
export class HybridQueries {
  private static readonly hybridCache = HybridCache.getInstance();

  /**
   * Cached NBA games query (API + Redis, DB fallback)
   */
  static async getGames(
    filters: Record<string, unknown>,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('nba_games', 'getMany', filters, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached NBA game query (API + Redis, DB fallback)
   */
  static async getGame(
    gameId: string,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('nba_games', 'getById', { gameId }, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached NBA teams query (API + Redis, DB fallback)
   */
  static async getTeams(
    filters: Record<string, unknown>,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('teams', 'getMany', filters, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached NBA team query (API + Redis, DB fallback)
   */
  static async getTeam(
    teamId: string,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('teams', 'getById', { teamId }, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached NBA players query (API + Redis, DB fallback)
   */
  static async getPlayers(
    filters: Record<string, unknown>,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('nba_players', 'getMany', filters, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached NBA player query (API + Redis, DB fallback)
   */
  static async getPlayer(
    playerId: string,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery(
      'nba_players',
      'getById',
      { playerId },
      apiQueryFn,
      dbQueryFn
    );
  }

  /**
   * Cached seasons query (API + Redis, DB fallback)
   */
  static async getSeasons(
    filters: Record<string, unknown>,
    apiQueryFn: () => Promise<unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    return this.hybridCache.cacheQuery('seasons', 'getMany', filters, apiQueryFn, dbQueryFn);
  }

  /**
   * Cached user query (DB + Redis only)
   */
  static async getUser(userId: string, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('users', 'getById', { userId }, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'database',
    });
  }

  /**
   * Cached users list query (DB + Redis only)
   */
  static async getUsers(filters: Record<string, unknown>, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('users', 'getMany', filters, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'database',
    });
  }

  /**
   * Cached game log query (DB + Redis only)
   */
  static async getGameLog(gameLogId: string, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('game_logs', 'getById', { gameLogId }, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'database',
    });
  }

  /**
   * Cached game logs list query (DB + Redis only)
   */
  static async getGameLogs(filters: Record<string, unknown>, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('game_logs', 'getMany', filters, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.GAME_DATA,
      priority: 'database',
    });
  }

  /**
   * Cached search query (DB + Redis only)
   */
  static async search(
    query: string,
    filters: Record<string, unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    const cacheKey = generateHybridCacheKey('search', 'search', { query, ...filters }, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.SEARCH_RESULTS,
      priority: 'database',
    });
  }

  /**
   * Cached comments query (DB + Redis only)
   */
  static async getComments(filters: Record<string, unknown>, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('comments', 'getMany', filters, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.SYSTEM,
      priority: 'database',
    });
  }

  /**
   * Cached friendships query (DB + Redis only)
   */
  static async getFriendships(
    userId: string,
    filters: Record<string, unknown>,
    dbQueryFn: () => Promise<unknown>
  ) {
    const cacheKey = generateHybridCacheKey(
      'friendships',
      'getByUser',
      { userId, ...filters },
      'db'
    );
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.USER_SESSIONS,
      priority: 'database',
    });
  }

  /**
   * Cached analytics query (DB + Redis only)
   */
  static async getAnalytics(filters: Record<string, unknown>, dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridCacheKey('analytics', 'getMany', filters, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.ANALYTICS,
      priority: 'database',
    });
  }

  /**
   * Cached raw SQL query (DB + Redis only)
   */
  static async rawSQL(sqlQuery: SQL, params: unknown[], dbQueryFn: () => Promise<unknown>) {
    const cacheKey = generateHybridSQLCacheKey(sqlQuery, params, 'db');
    return this.hybridCache.cacheDatabaseData(cacheKey, dbQueryFn, {
      namespace: CacheNamespace.SYSTEM,
      priority: 'database',
    });
  }
}

// Export singleton instance
export const hybridCache = HybridCache.getInstance();
