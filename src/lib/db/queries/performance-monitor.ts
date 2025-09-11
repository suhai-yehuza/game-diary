/**
 * Performance Monitor for Centralized SQL Queries
 *
 * This module provides performance monitoring and metrics collection
 * for centralized SQL queries to track improvements and identify bottlenecks.
 */

import type { QueryMetrics, PerformanceStats } from '@/types';

class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 queries
  private readonly slowQueryThreshold = 100; // 100ms threshold for slow queries

  /**
   * Record a query execution
   */
  recordQuery(
    queryName: string,
    executionTime: number,
    resultCount: number,
    success = true,
    error?: string
  ): void {
    const metric: QueryMetrics = {
      queryName,
      executionTime,
      resultCount,
      timestamp: new Date(),
      success,
      error,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (executionTime > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${queryName} took ${executionTime}ms`);
    }

    // Log successful queries for debugging
    if (success && executionTime < this.slowQueryThreshold) {
      console.log(`✅ Query ${queryName} completed in ${executionTime}ms (${resultCount} results)`);
    }
  }

  /**
   * Get performance statistics for a specific query
   */
  getQueryStats(queryName: string): PerformanceStats | null {
    const queryMetrics = this.metrics.filter(m => m.queryName === queryName);

    if (queryMetrics.length === 0) {
      return null;
    }

    const executionTimes = queryMetrics.map(m => m.executionTime);
    const successfulQueries = queryMetrics.filter(m => m.success);
    const totalResultCount = queryMetrics.reduce((sum, m) => sum + m.resultCount, 0);

    return {
      totalQueries: queryMetrics.length,
      averageExecutionTime:
        executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
      minExecutionTime: Math.min(...executionTimes),
      maxExecutionTime: Math.max(...executionTimes),
      successRate: (successfulQueries.length / queryMetrics.length) * 100,
      totalResultCount,
    };
  }

  /**
   * Get overall performance statistics
   */
  getOverallStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        minExecutionTime: 0,
        maxExecutionTime: 0,
        successRate: 0,
        totalResultCount: 0,
      };
    }

    const executionTimes = this.metrics.map(m => m.executionTime);
    const successfulQueries = this.metrics.filter(m => m.success);
    const totalResultCount = this.metrics.reduce((sum, m) => sum + m.resultCount, 0);

    return {
      totalQueries: this.metrics.length,
      averageExecutionTime:
        executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length,
      minExecutionTime: Math.min(...executionTimes),
      maxExecutionTime: Math.max(...executionTimes),
      successRate: (successfulQueries.length / this.metrics.length) * 100,
      totalResultCount,
    };
  }

  /**
   * Get slow queries (above threshold)
   */
  getSlowQueries(): QueryMetrics[] {
    return this.metrics.filter(m => m.executionTime > this.slowQueryThreshold);
  }

  /**
   * Get failed queries
   */
  getFailedQueries(): QueryMetrics[] {
    return this.metrics.filter(m => !m.success);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get query performance summary
   */
  getPerformanceSummary(): string {
    const stats = this.getOverallStats();
    const slowQueries = this.getSlowQueries();
    const failedQueries = this.getFailedQueries();

    return `
📊 Query Performance Summary:
  Total Queries: ${stats.totalQueries}
  Average Execution Time: ${stats.averageExecutionTime.toFixed(2)}ms
  Min Execution Time: ${stats.minExecutionTime}ms
  Max Execution Time: ${stats.maxExecutionTime}ms
  Success Rate: ${stats.successRate.toFixed(2)}%
  Total Results: ${stats.totalResultCount}
  Slow Queries: ${slowQueries.length}
  Failed Queries: ${failedQueries.length}
    `.trim();
  }
}

// Singleton instance
export const queryPerformanceMonitor = new QueryPerformanceMonitor();

/**
 * Higher-order function to wrap queries with performance monitoring
 */
export function withPerformanceMonitoring<T extends unknown[], R>(
  queryName: string,
  queryFunction: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let resultCount = 0;
    let success = true;
    let error: string | undefined;

    try {
      const result = await queryFunction(...args);

      // Try to determine result count
      if (Array.isArray(result)) {
        resultCount = result.length;
      } else if (result && typeof result === 'object' && 'length' in result) {
        resultCount = (result as { length: number }).length;
      } else if (result && typeof result === 'object' && 'totalCount' in result) {
        resultCount = (result as { totalCount: number }).totalCount;
      } else if (result && typeof result === 'object' && 'count' in result) {
        resultCount = (result as { count: number }).count;
      }

      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      queryPerformanceMonitor.recordQuery(queryName, executionTime, resultCount, success, error);
    }
  };
}

/**
 * Utility function to log performance summary
 */
export function logPerformanceSummary(): void {
  console.log(queryPerformanceMonitor.getPerformanceSummary());
}

/**
 * Utility function to get query-specific performance stats
 */
export function getQueryPerformanceStats(queryName: string): PerformanceStats | null {
  return queryPerformanceMonitor.getQueryStats(queryName);
}

/**
 * Utility function to get overall performance stats
 */
export function getOverallPerformanceStats(): PerformanceStats {
  return queryPerformanceMonitor.getOverallStats();
}
