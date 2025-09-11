import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import { logger } from '@/lib/utils/logger';
import type { IQueryOptimizationOptions, IQueryMetrics } from '@/types';

class QueryOptimizer {
  private readonly queryCache = new Map<
    string,
    { result: Record<string, unknown>; timestamp: number; ttl: number }
  >();
  private slowQueries: IQueryMetrics[] = [];
  private readonly options: IQueryOptimizationOptions;

  constructor(options: IQueryOptimizationOptions = {}) {
    this.options = {
      enableExplain: process.env.NODE_ENV === 'development',
      logSlowQueries: true,
      slowQueryThreshold: 1000, // 1 second
      enableQueryCache: true,
      maxCacheSize: 100,
      ...options,
    };
  }

  /**
   * Optimize a query with performance monitoring
   */
  async optimizeQuery<T>(
    queryFn: () => Promise<T>,
    queryName: string,
    cacheKey?: string,
    cacheTTL = 300000 // 5 minutes
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Check cache first
      if (this.options.enableQueryCache && cacheKey) {
        const cached = this.queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
          logger.performance('query_cache_hit', 0, { queryName, cacheKey });
          return cached.result as T;
        }
      }

      // Execute query with monitoring
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Log slow queries
      if (
        this.options.logSlowQueries &&
        this.options.slowQueryThreshold &&
        executionTime > this.options.slowQueryThreshold
      ) {
        this.slowQueries.push({
          query: queryName,
          queryName,
          duration: executionTime,
          executionTime,
          rows: Array.isArray(result) ? result.length : 1,
          timestamp: Date.now(),
          cacheHit: false,
          resultCount: Array.isArray(result) ? result.length : 1,
          errorCount: 0,
        });

        logger.warn('Slow query detected', {
          queryName,
          executionTime,
          threshold: this.options.slowQueryThreshold,
        });
      }

      // Cache result
      if (this.options.enableQueryCache && cacheKey) {
        this.setCache(cacheKey, result as Record<string, unknown>, cacheTTL);
      }

      logger.performance('query_executed', executionTime, {
        queryName,
        executionTime,
        cached: false,
      });

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('Query execution failed', {
        queryName,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Build optimized WHERE clause for common patterns
   */
  buildOptimizedWhereClause(conditions: {
    userId?: string;
    gameId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    classification?: string;
    deletedAt?: boolean;
  }): SQL[] {
    const whereClauses: SQL[] = [];

    if (conditions.userId) {
      whereClauses.push(sql`user_id = ${conditions.userId}`);
    }

    if (conditions.gameId) {
      whereClauses.push(sql`game_id = ${conditions.gameId}`);
    }

    if (conditions.dateFrom) {
      whereClauses.push(sql`created_at >= ${conditions.dateFrom}`);
    }

    if (conditions.dateTo) {
      whereClauses.push(sql`created_at <= ${conditions.dateTo}`);
    }

    if (conditions.status) {
      whereClauses.push(sql`status = ${conditions.status}`);
    }

    if (conditions.classification) {
      whereClauses.push(sql`classification = ${conditions.classification}`);
    }

    if (conditions.deletedAt === false) {
      whereClauses.push(sql`deleted_at IS NULL`);
    }

    return whereClauses;
  }

  /**
   * Build optimized ORDER BY clause
   */
  buildOptimizedOrderBy(
    sortBy: string,
    sortDirection: 'asc' | 'desc' = 'desc',
    fallbackSort = 'created_at'
  ): SQL {
    // Validate sort fields to prevent SQL injection
    const allowedSortFields = [
      'created_at',
      'updated_at',
      'watched_date',
      'date',
      'rating_for_game',
      'total_ratings',
      'average_rating',
      'username',
      'first_name',
      'last_name',
    ];

    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : fallbackSort;
    const safeDirection = sortDirection.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    return sql.raw(`${safeSortBy} ${safeDirection}`);
  }

  /**
   * Build optimized LIMIT/OFFSET clause
   */
  buildOptimizedPagination(
    page: number,
    limit: number,
    maxLimit = 100
  ): {
    limit: number;
    offset: number;
  } {
    const safeLimit = Math.min(Math.max(limit, 1), maxLimit);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    return { limit: safeLimit, offset };
  }

  /**
   * Set cache entry with size management
   */
  private setCache(key: string, result: Record<string, unknown>, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.options.maxCacheSize && this.queryCache.size >= this.options.maxCacheSize) {
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) {
        this.queryCache.delete(oldestKey);
      }
    }

    this.queryCache.set(key, {
      result,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get query performance statistics
   */
  getPerformanceStats(): {
    cacheSize: number;
    slowQueries: IQueryMetrics[];
    averageExecutionTime: number;
  } {
    const totalExecutionTime = this.slowQueries.reduce(
      (sum, query) => sum + query.executionTime,
      0
    );

    return {
      cacheSize: this.queryCache.size,
      slowQueries: [...this.slowQueries],
      averageExecutionTime:
        this.slowQueries.length > 0 ? totalExecutionTime / this.slowQueries.length : 0,
    };
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    this.queryCache.clear();
    logger.info('Query cache cleared');
  }

  /**
   * Clear slow query logs
   */
  clearSlowQueries(): void {
    this.slowQueries = [];
    logger.info('Slow query logs cleared');
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer();

// Export utility functions
export const optimizeQuery = queryOptimizer.optimizeQuery.bind(queryOptimizer);
export const buildOptimizedWhereClause =
  queryOptimizer.buildOptimizedWhereClause.bind(queryOptimizer);
export const buildOptimizedOrderBy = queryOptimizer.buildOptimizedOrderBy.bind(queryOptimizer);
export const buildOptimizedPagination =
  queryOptimizer.buildOptimizedPagination.bind(queryOptimizer);
export const getQueryPerformanceStats = queryOptimizer.getPerformanceStats.bind(queryOptimizer);
export const clearQueryCache = queryOptimizer.clearCache.bind(queryOptimizer);
