import { performance } from 'perf_hooks';

import { Cache } from '@/lib/cache/index';
import { MonitoringMetrics } from '@/lib/types/consolidated.types';

// Performance monitoring
export const monitorPerformance = {
  // Query monitoring
  queries: [] as Array<{
    query: string;
    duration: number;
    timestamp: number;
  }>,

  // Cache monitoring
  cache: [] as Array<{
    key: string;
    hit: boolean;
    timestamp: number;
  }>,

  // API monitoring
  api: [] as Array<{
    endpoint: string;
    duration: number;
    status: number;
    timestamp: number;
  }>,

  // Clear old metrics
  clearOldMetrics: () => {
    const oneDayAgo = Date.now() - 86400000;
    monitorPerformance.queries = monitorPerformance.queries.filter(q => q.timestamp > oneDayAgo);
    monitorPerformance.cache = monitorPerformance.cache.filter(c => c.timestamp > oneDayAgo);
    monitorPerformance.api = monitorPerformance.api.filter(a => a.timestamp > oneDayAgo);
  },
};

class Monitoring {
  private metrics: MonitoringMetrics = {
    queryPerformance: {},
    apiCalls: {},
    cacheMetrics: {
      hits: 0,
      misses: 0,
      size: 0,
    },
    apiMetrics: {},
    errors: {},
  };

  constructor(private cache: Cache) {}

  async query<T>(name: string, queryFn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await queryFn();
      const duration = performance.now() - start;

      // Update metrics
      if (!this.metrics.queryPerformance[name]) {
        this.metrics.queryPerformance[name] = {
          count: 0,
          totalTime: 0,
          avgTime: 0,
        };
      }

      const perf = this.metrics.queryPerformance[name];
      perf.count++;
      perf.totalTime += duration;
      perf.avgTime = perf.totalTime / perf.count;

      return result;
    } catch (error) {
      this.trackError(error as Error);
      throw error;
    }
  }

  trackApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    const key = `${method}:${endpoint}`;
    const metrics = this.metrics.apiMetrics?.[key] || {
      count: 0,
      success: 0,
      failure: 0,
      avgResponseTime: 0,
    };

    metrics.count++;
    if (statusCode >= 400) {
      metrics.failure++;
    } else {
      metrics.success++;
    }
    metrics.avgResponseTime =
      (metrics.avgResponseTime * (metrics.count - 1) + duration) / metrics.count;

    if (!this.metrics.apiMetrics) {
      this.metrics.apiMetrics = {};
    }
    this.metrics.apiMetrics[key] = metrics;
  }

  trackError(error: Error) {
    if (!this.metrics.errors) {
      this.metrics.errors = {};
    }
    const errorType = error.constructor.name;
    this.metrics.errors[errorType] = (this.metrics.errors[errorType] || 0) + 1;
  }

  getMetrics(): MonitoringMetrics {
    return this.metrics;
  }
}

export const monitoring = new Monitoring(new Cache());
