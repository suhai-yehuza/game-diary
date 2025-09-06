import type { IQueryMetrics, IPerformanceReport } from '@/types';

class QueryPerformanceMonitor {
  private metrics: IQueryMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 queries
  private readonly slowQueryThreshold = 2000; // 2 seconds
  private readonly errorThreshold = 0.1; // 10% error rate

  /**
   * Record a query execution
   */
  recordQuery(
    queryName: string,
    duration: number,
    variables: Record<string, unknown>,
    success: boolean,
    errorMessage?: string
  ) {
    const metric: IQueryMetrics = {
      query: queryName, // Use queryName as the query identifier
      queryName,
      duration,
      rows: 0, // Default to 0 rows for GraphQL queries
      timestamp: Date.now(),
      variables,
      success,
      errorMessage,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`, {
        variables,
        errorMessage,
      });
    }

    // Log errors
    if (!success) {
      console.error(`Query error: ${queryName} failed after ${duration}ms`, {
        variables,
        errorMessage,
      });
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): IPerformanceReport {
    if (this.metrics.length === 0) {
      return {
        metrics: [],
        summary: {
          averageDuration: 0,
          totalQueries: 0,
          slowestQuery: 'None',
        },
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: [],
        errorRate: 0,
        recommendations: ['No queries recorded yet'],
      };
    }

    const totalQueries = this.metrics.length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageQueryTime = totalDuration / totalQueries;
    const slowQueries = this.metrics.filter(m => m.duration > this.slowQueryThreshold);
    const errorCount = this.metrics.filter(m => !m.success).length;
    const errorRate = errorCount / totalQueries;

    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (averageQueryTime > 1000) {
      recommendations.push('Average query time is high. Consider implementing caching strategies.');
    }

    if (slowQueries.length > 0) {
      recommendations.push(
        `Found ${slowQueries.length} slow queries. Review and optimize these queries.`
      );
    }

    if (errorRate > this.errorThreshold) {
      recommendations.push(
        `Error rate is ${(errorRate * 100).toFixed(1)}%. Review error handling and query logic.`
      );
    }

    if (this.metrics.length > 100) {
      recommendations.push('Consider implementing query deduplication and batching.');
    }

    return {
      metrics: [], // IPerformanceReport expects IPerformanceMetrics[], not IQueryMetrics[]
      summary: {
        averageDuration: averageQueryTime,
        totalQueries,
        slowestQuery: slowQueries.length > 0 ? slowQueries[0].query : 'None',
      },
      totalQueries,
      averageQueryTime,
      slowQueries,
      errorRate,
      recommendations,
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(): IQueryMetrics[] {
    return this.metrics.filter(m => m.duration > this.slowQueryThreshold);
  }

  /**
   * Get queries by name
   */
  getQueriesByName(queryName: string): IQueryMetrics[] {
    return this.metrics.filter(m => m.queryName === queryName);
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit = 10): IQueryMetrics[] {
    return this.metrics.slice(-limit).reverse();
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Get query performance trends
   */
  getPerformanceTrends() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentMetrics = this.metrics.filter(m => Number(m.timestamp) > oneHourAgo);
    const dailyMetrics = this.metrics.filter(m => Number(m.timestamp) > oneDayAgo);

    return {
      lastHour: {
        count: recentMetrics.length,
        averageTime:
          recentMetrics.length > 0
            ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
            : 0,
        errorRate:
          recentMetrics.length > 0
            ? recentMetrics.filter(m => !m.success).length / recentMetrics.length
            : 0,
      },
      lastDay: {
        count: dailyMetrics.length,
        averageTime:
          dailyMetrics.length > 0
            ? dailyMetrics.reduce((sum, m) => sum + m.duration, 0) / dailyMetrics.length
            : 0,
        errorRate:
          dailyMetrics.length > 0
            ? dailyMetrics.filter(m => !m.success).length / dailyMetrics.length
            : 0,
      },
    };
  }
}

// Create singleton instance
export const queryPerformanceMonitor = new QueryPerformanceMonitor();

// Export the class for testing
export { QueryPerformanceMonitor };

// Utility functions
export function startQueryTimer(queryName: string, variables: Record<string, unknown>) {
  const startTime = Date.now();

  return {
    finish: (success: boolean, errorMessage?: string) => {
      const duration = Date.now() - startTime;
      queryPerformanceMonitor.recordQuery(queryName, duration, variables, success, errorMessage);
      return duration;
    },
  };
}

export function monitorQuery<T>(
  queryName: string,
  variables: Record<string, unknown>,
  queryFn: () => Promise<T>
): Promise<T> {
  const timer = startQueryTimer(queryName, variables);

  return queryFn()
    .then(result => {
      timer.finish(true);
      return result;
    })
    .catch(error => {
      timer.finish(false, error.message);
      throw error;
    });
}

// Performance event listeners
if (typeof window !== 'undefined') {
  // Listen for slow query events
  window.addEventListener('slow-query', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { duration, query, variables } = customEvent.detail;
    queryPerformanceMonitor.recordQuery(query || 'Unknown', duration, variables, true);
  });

  // Listen for slow mutation events
  window.addEventListener('slow-mutation', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { duration, mutation, variables } = customEvent.detail;
    queryPerformanceMonitor.recordQuery(mutation || 'Unknown', duration, variables, true);
  });
}
