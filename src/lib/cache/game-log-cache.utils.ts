import type { ICacheOptions, GameLogFilters, IPaginationParams } from '@/types';

import { hybridCacheService } from './hybrid-cache-service';

// Enhanced game log caching with performance optimization
export class EnhancedGameLogCacheUtils {
  private static readonly NAMESPACE = 'gameLogs';
  private static readonly DEFAULT_TTL = 900; // 15 minutes
  private static readonly LIST_TTL = 600; // 10 minutes for lists
  private static readonly BATCH_SIZE = 50; // Batch size for bulk operations

  // Cache keys for different types of data
  private static readonly CACHE_KEYS = {
    GAME_LOG: 'gameLog',
    GAME_LOG_LIST: 'gameLogList',
    GAME_LOG_COUNT: 'gameLogCount',
    GAME_LOG_STATS: 'gameLogStats',
    USER_GAME_LOGS: 'userGameLogs',
    PUBLIC_GAME_LOGS: 'publicGameLogs',
    FRIENDS_GAME_LOGS: 'friendsGameLogs',
    GAME_LOG_SEARCH: 'gameLogSearch',
  } as const;

  /**
   * Enhanced game log caching with smart TTL and tagging
   */
  static async cacheGameLog(
    gameLogId: string,
    gameLogData: Record<string, unknown>,
    options: ICacheOptions = {}
  ) {
    const cacheKey = `${this.CACHE_KEYS.GAME_LOG}:${gameLogId}`;
    const tags = [
      'gameLog',
      `gameLog:${gameLogId}`,
      `user:${String((gameLogData.user_id as string) || 'unknown')}`,
      `game:${String((gameLogData.game_id as string) || 'unknown')}`,
      'gameLogs',
    ];

    await hybridCacheService.set(cacheKey, gameLogData, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.DEFAULT_TTL,
      tags,
      strategy: 'hybrid',
      ...options,
    });

    // Also cache in user-specific cache for quick access
    if (gameLogData.user_id) {
      await this.cacheUserGameLog(gameLogData.user_id as string, gameLogId, gameLogData);
    }
  }

  /**
   * Cache game log list with enhanced pagination and filtering
   */
  static async cacheGameLogList(
    filters: Record<string, unknown>,
    pagination: IPaginationParams,
    gameLogList: Record<string, unknown>[],
    options: ICacheOptions = {}
  ) {
    const filterHash = this.generateFilterHash(filters);
    const paginationHash = this.generatePaginationHash(pagination);
    const cacheKey = `${this.CACHE_KEYS.GAME_LOG_LIST}:${filterHash}:${paginationHash}`;

    const tags = [
      'gameLogList',
      'gameLogs',
      ...this.extractFilterTags(filters),
      `first:${String((pagination.first as number) || 20)}`,
      `after:${String((pagination.after as string) || '')}`,
    ];

    await hybridCacheService.set(cacheKey, gameLogList, {
      namespace: this.NAMESPACE,
      ttl: options.ttl || this.LIST_TTL,
      tags,
      strategy: 'hybrid',
      ...options,
    });

    // Cache metadata for quick access
    await this.cacheGameLogListMetadata(filters, pagination, gameLogList.length);
  }

  /**
   * Get cached game log list with fallback strategies
   */
  static async getCachedGameLogList(
    filters: Record<string, unknown>,
    pagination: IPaginationParams
  ): Promise<Record<string, unknown>[] | null> {
    const filterHash = this.generateFilterHash(filters);
    const paginationHash = this.generatePaginationHash(pagination);
    const cacheKey = `${this.CACHE_KEYS.GAME_LOG_LIST}:${filterHash}:${paginationHash}`;

    // Try exact match first
    let result = await hybridCacheService.get(cacheKey, {
      namespace: this.NAMESPACE,
      strategy: 'hybrid',
    });

    if (result && Array.isArray(result)) {
      return result;
    }

    // Try to find similar cached results with different pagination
    result = await this.findSimilarCachedResults(filters, pagination);

    if (result && Array.isArray(result)) {
      // Cache the result with current pagination for future use
      await this.cacheGameLogList(filters, pagination, result);
      return result;
    }

    return [];
  }

  /**
   * Batch cache multiple game logs for performance
   */
  static async batchCacheGameLogs(
    gameLogs: Record<string, unknown>[],
    options: ICacheOptions = {}
  ) {
    const batchPromises = gameLogs.map(gameLog =>
      this.cacheGameLog(gameLog.id as string, gameLog, options)
    );

    await Promise.allSettled(batchPromises);
  }

  /**
   * Smart cache invalidation based on data changes
   */
  static async invalidateGameLogCaches(gameLogId?: string, userId?: string, gameId?: string) {
    const invalidationOptions: Record<string, unknown> = {};

    if (gameLogId) {
      invalidationOptions.tags = [`gameLog:${gameLogId}`];
    } else if (userId) {
      invalidationOptions.tags = [`user:${userId}`];
    } else if (gameId) {
      invalidationOptions.tags = [`game:${gameId}`];
    } else {
      invalidationOptions.namespace = this.NAMESPACE;
    }

    await hybridCacheService.invalidate(invalidationOptions);
  }

  /**
   * Cache user-specific game logs for quick access
   */
  private static async cacheUserGameLog(
    userId: string,
    gameLogId: string,
    gameLogData: Record<string, unknown>
  ) {
    const cacheKey = `${this.CACHE_KEYS.USER_GAME_LOGS}:${userId}:${gameLogId}`;
    await hybridCacheService.set(cacheKey, gameLogData, {
      namespace: this.NAMESPACE,
      ttl: this.DEFAULT_TTL,
      tags: [`user:${userId}`, 'gameLogs'],
      strategy: 'hybrid',
    });
  }

  /**
   * Cache game log list metadata for performance insights
   */
  private static async cacheGameLogListMetadata(
    filters: Record<string, unknown>,
    pagination: Record<string, unknown>,
    count: number
  ) {
    const filterHash = this.generateFilterHash(filters);
    const metadataKey = `${this.CACHE_KEYS.GAME_LOG_STATS}:${filterHash}`;

    const metadata = {
      lastUpdated: Date.now(),
      totalCount: count,
      pageSize: pagination.limit || 20,
      filters,
      cacheHits: 0,
    };

    await hybridCacheService.set(metadataKey, metadata, {
      namespace: this.NAMESPACE,
      ttl: this.LIST_TTL * 2, // Longer TTL for metadata
      tags: ['gameLogStats', ...this.extractFilterTags(filters)],
      strategy: 'hybrid',
    });
  }

  /**
   * Find similar cached results to improve cache hit rate
   */
  private static async findSimilarCachedResults(
    filters: Record<string, unknown>,
    _pagination: Record<string, unknown>
  ): Promise<Record<string, unknown>[] | null> {
    // This is a simplified version - in production, you might want more sophisticated matching
    const filterHash = this.generateFilterHash(filters);
    const baseKey = `${this.CACHE_KEYS.GAME_LOG_LIST}:${filterHash}`;

    // Try to find any cached results with the same filters
    const cachedKeys = await hybridCacheService.getKeysByPattern(`${baseKey}:*`);

    if (cachedKeys.length > 0) {
      // Get the first available cached result
      const firstKey = cachedKeys[0];
      const result = await hybridCacheService.get(firstKey, {
        namespace: this.NAMESPACE,
        strategy: 'hybrid',
      });

      return Array.isArray(result) ? result : [];
    }

    return null;
  }

  /**
   * Generate consistent hash for filters
   */
  private static generateFilterHash(filters: GameLogFilters): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = filters[key as keyof GameLogFilters];
        return acc;
      }, {});

    return JSON.stringify(sortedFilters);
  }

  /**
   * Generate consistent hash for pagination
   */
  private static generatePaginationHash(pagination: IPaginationParams): string {
    const { page = 1, limit = 20 } = pagination;
    return `${page}:${limit}`;
  }

  /**
   * Extract tags from filters for better cache organization
   */
  private static extractFilterTags(filters: GameLogFilters): string[] {
    const tags: string[] = [];

    if (filters.userId) tags.push(`user:${filters.userId}`);
    if (filters.gameId) tags.push(`game:${filters.gameId}`);
    if (filters.classification) tags.push(`classification:${filters.classification}`);
    if (filters.search) tags.push('search');
    if (filters.tags) tags.push('tagged');

    return tags;
  }

  /**
   * Get cache statistics for monitoring
   */
  static async getCacheStats() {
    const stats = hybridCacheService.getStats();
    const health = await hybridCacheService.healthCheck();

    // Add status property to health object
    const healthWithStatus = {
      ...health,
      status:
        health.memory && health.redis && health.database
          ? ('healthy' as const)
          : ('degraded' as const),
    };

    return {
      ...stats,
      health: healthWithStatus,
      namespace: this.NAMESPACE,
      cacheKeys: this.CACHE_KEYS,
    };
  }

  /**
   * Warm up cache for common queries
   */
  static warmUpCache() {
    // Warm up common filter combinations
    const commonFilters = [
      { classification: 'PUBLIC' },
      { classification: 'PRIVATE' },
      { classification: 'PROTECTED' }, // Use PROTECTED instead of FRIENDS_ONLY
    ];

    for (const filters of commonFilters) {
      // This would typically call your data service to pre-populate cache
      console.log(`Warming up cache for filters:`, filters);
    }
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredEntries() {
    // This would typically be handled by the underlying cache service
    // but we can add custom logic here if needed
    console.log('Clearing expired game log cache entries...');
  }
}

// Export the enhanced version as the main export
export const GameLogCacheUtils = EnhancedGameLogCacheUtils;
