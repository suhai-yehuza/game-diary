import { apolloClient } from '@/lib/apollo-client';
import { GameLogCacheUtils } from '@/lib/cache';
import { GET_GAME_LOGS } from '@/lib/graphql/queries';
import { logger } from '@/lib/utils/logger';
import type { IPaginationParams, IGameLog } from '@/types';

// Optimized game logs service with caching integration
export class GameLogsService {
  private static readonly SERVICE_NAME = 'GameLogsService';
  private static readonly BATCH_SIZE = 50;
  private static readonly MAX_CONCURRENT_REQUESTS = 5;

  /**
   * Get game logs with intelligent caching and fallback strategies
   */
  static async getGameLogs(
    filters: Record<string, unknown> = {},
    pagination: IPaginationParams = { page: 1, limit: 20 },
    options: {
      useCache?: boolean;
      forceRefresh?: boolean;
      batchSize?: number;
    } = {}
  ): Promise<{
    gameLogs: IGameLog[];
    totalCount: number;
    hasNextPage: boolean;
    cacheHit: boolean;
    performance: {
      cacheTime: number;
      queryTime: number;
      totalTime: number;
    };
  }> {
    const startTime = Date.now();
    const { useCache = true, forceRefresh = false, batchSize = this.BATCH_SIZE } = options;

    try {
      // Try cache first if enabled and not forcing refresh
      if (useCache && !forceRefresh) {
        const cachedResult = await GameLogCacheUtils.getCachedGameLogList(filters, pagination);

        if (cachedResult) {
          const cacheTime = Date.now() - startTime;
          logger.info(`${this.SERVICE_NAME}: Cache hit for filters`, { filters, pagination });

          return {
            gameLogs: cachedResult as unknown as IGameLog[],
            totalCount: cachedResult.length,
            hasNextPage: cachedResult.length >= pagination.limit,
            cacheHit: true,
            performance: {
              cacheTime,
              queryTime: 0,
              totalTime: cacheTime,
            },
          };
        }
      }

      // Cache miss - fetch from source
      const queryStartTime = Date.now();
      const result = await this.fetchGameLogsFromSource(filters, pagination, batchSize);
      const queryTime = Date.now() - queryStartTime;

      // Cache the result for future use with longer TTL for better hit rate
      if (useCache && result.gameLogs.length > 0) {
        await GameLogCacheUtils.cacheGameLogList(filters, pagination, result.gameLogs, {
          ttl: 900, // 15 minutes - increased for better cache hit rate
          tags: ['gameLogList', 'gameLogs'],
          strategy: 'hybrid',
        });
      }

      const totalTime = Date.now() - startTime;

      logger.info(`${this.SERVICE_NAME}: Fetched ${result.gameLogs.length} game logs`, {
        filters,
        pagination,
        cacheHit: false,
        performance: { cacheTime: 0, queryTime, totalTime },
      });

      return {
        ...result,
        cacheHit: false,
        performance: {
          cacheTime: 0,
          queryTime,
          totalTime,
        },
      };
    } catch (error) {
      logger.error(`${this.SERVICE_NAME}: Error fetching game logs`, {
        error: error instanceof Error ? error.message : String(error),
        filters,
        pagination,
      });
      throw error;
    }
  }

  /**
   * Batch fetch game logs for better performance
   */
  static async batchGetGameLogs(
    filterSets: Array<{ filters: Record<string, unknown>; pagination: IPaginationParams }>,
    options: {
      useCache?: boolean;
      maxConcurrent?: number;
    } = {}
  ): Promise<
    Array<{
      filters: Record<string, unknown>;
      pagination: IPaginationParams;
      result: Record<string, unknown> | null;
      error?: Error;
    }>
  > {
    const { useCache = true, maxConcurrent = this.MAX_CONCURRENT_REQUESTS } = options;

    const results: Array<{
      filters: Record<string, unknown>;
      pagination: IPaginationParams;
      result: Record<string, unknown> | null;
      error?: Error;
    }> = [];

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < filterSets.length; i += maxConcurrent) {
      const batch = filterSets.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async ({ filters, pagination }) => {
        try {
          const result = await this.getGameLogs(filters, pagination, { useCache });
          return { filters, pagination, result, error: undefined };
        } catch (error) {
          return {
            filters,
            pagination,
            result: null,
            error: error instanceof Error ? error : new Error(String(error)),
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(promiseResult => {
        if (promiseResult.status === 'fulfilled') {
          results.push(promiseResult.value);
        } else {
          logger.error(`${this.SERVICE_NAME}: Batch request failed`, {
            error: promiseResult.reason,
          });
        }
      });
    }

    return results;
  }

  /**
   * Get game logs by user with optimized caching
   */
  static async getUserGameLogs(
    userId: string,
    pagination: IPaginationParams = { page: 1, limit: 20 },
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ) {
    return this.getGameLogs(
      { userId },
      pagination,
      { ...options, batchSize: 100 } // Larger batch size for user logs
    );
  }

  /**
   * Get public game logs with enhanced caching
   */
  static async getPublicGameLogs(
    pagination: IPaginationParams = { page: 1, limit: 20 },
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ) {
    return this.getGameLogs(
      { classification: 'PUBLIC' },
      pagination,
      { ...options, batchSize: 100 } // Larger batch size for public logs
    );
  }

  /**
   * Get friends game logs with smart caching
   */
  static async getFriendsGameLogs(
    userId: string,
    pagination: IPaginationParams = { page: 1, limit: 20 },
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ) {
    return this.getGameLogs(
      {
        classification: 'FRIENDS_ONLY',
        userId, // For user-specific friend logs
      },
      pagination,
      { ...options, batchSize: 50 }
    );
  }

  /**
   * Search game logs with intelligent caching
   */
  static async searchGameLogs(
    searchTerm: string,
    searchField = 'all',
    filters: Record<string, unknown> = {},
    pagination: IPaginationParams = { page: 1, limit: 20 },
    options: { useCache?: boolean; forceRefresh?: boolean } = {}
  ) {
    const searchFilters = {
      ...filters,
      search: searchTerm,
      searchField,
    };

    return this.getGameLogs(
      searchFilters,
      pagination,
      { ...options, batchSize: 30 } // Smaller batch size for search results
    );
  }

  /**
   * Warm up cache for common queries
   */
  static async warmUpCache() {
    logger.info(`${this.SERVICE_NAME}: Starting cache warm-up`);

    const commonQueries = [
      { filters: { classification: 'PUBLIC' }, pagination: { page: 1, limit: 20 } },
      { filters: { classification: 'PUBLIC' }, pagination: { page: 1, limit: 50 } },
      { filters: {}, pagination: { page: 1, limit: 20 } },
    ];

    try {
      await this.batchGetGameLogs(commonQueries, { useCache: true, maxConcurrent: 3 });
      logger.info(`${this.SERVICE_NAME}: Cache warm-up completed successfully`);
    } catch (error) {
      logger.error(`${this.SERVICE_NAME}: Cache warm-up failed`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Get cache statistics and health
   */
  static async getCacheStats() {
    return GameLogCacheUtils.getCacheStats();
  }

  /**
   * Invalidate cache for specific game log or user
   */
  static async invalidateCache(gameLogId?: string, userId?: string, gameId?: string) {
    await GameLogCacheUtils.invalidateGameLogCaches(gameLogId, userId, gameId);

    logger.info(`${this.SERVICE_NAME}: Cache invalidated`, {
      gameLogId,
      userId,
      gameId,
    });
  }

  /**
   * Fetch game logs from the actual data source using GraphQL
   */
  private static async fetchGameLogsFromSource(
    filters: Record<string, unknown>,
    pagination: IPaginationParams,
    batchSize: number
  ): Promise<{
    gameLogs: IGameLog[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    try {
      logger.info(`${this.SERVICE_NAME}: Fetching from GraphQL source`, {
        filters,
        pagination,
        batchSize,
      });

      // Convert pagination to GraphQL format
      const graphqlPagination = {
        first: pagination.limit,
        after:
          pagination.page > 1
            ? btoa(`arrayconnection:${(pagination.page - 1) * pagination.limit}`)
            : null,
      };

      // Execute GraphQL query
      const { data } = await apolloClient.query({
        query: GET_GAME_LOGS,
        variables: {
          filters: filters || {},
          pagination: graphqlPagination,
        },
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      if (!data?.gameLogs) {
        logger.warn(`${this.SERVICE_NAME}: No game logs data returned from GraphQL`);
        return {
          gameLogs: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      // Extract data from GraphQL response
      const gameLogs =
        data.gameLogs.edges?.map((edge: Record<string, unknown>) => edge.node as IGameLog) || [];
      const totalCount = data.gameLogs.totalCount || 0;
      const hasNextPage = data.gameLogs.pageInfo?.hasNextPage || false;

      logger.info(`${this.SERVICE_NAME}: Successfully fetched ${gameLogs.length} game logs`, {
        totalCount,
        hasNextPage,
        filters,
        pagination,
      });

      return {
        gameLogs,
        totalCount,
        hasNextPage,
      };
    } catch (error) {
      logger.error(`${this.SERVICE_NAME}: GraphQL query failed`, {
        error: error instanceof Error ? error.message : String(error),
        filters,
        pagination,
      });

      // Return empty result on error
      return {
        gameLogs: [],
        totalCount: 0,
        hasNextPage: false,
      };
    }
  }
}
