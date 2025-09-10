/**
 * Performance monitoring utilities for NBA tables
 */

import type { IPerformanceMetrics } from '@/types';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private readonly metrics: Map<string, IPerformanceMetrics[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => number {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(label, 'apiResponseTime', duration);
      return duration;
    };
  }

  recordMetric(component: string, metric: keyof IPerformanceMetrics, value: number): void {
    if (!this.metrics.has(component)) {
      this.metrics.set(component, []);
    }

    const componentMetrics = this.metrics.get(component);
    if (!componentMetrics) return;
    const latestMetric = componentMetrics[componentMetrics.length - 1] || this.createEmptyMetric();
    (latestMetric as unknown as Record<string, number>)[metric] = value;

    if (
      componentMetrics.length === 0 ||
      componentMetrics[componentMetrics.length - 1] !== latestMetric
    ) {
      componentMetrics.push(latestMetric);
    }
  }

  private createEmptyMetric(): IPerformanceMetrics {
    return {
      apiResponseTime: 0,
      renderTime: 0,
      cacheHitRate: 0,
      dataSize: 0,
      queryComplexity: 0,
    };
  }

  getMetrics(component: string): IPerformanceMetrics[] {
    return this.metrics.get(component) || [];
  }

  getAverageMetrics(component: string): IPerformanceMetrics | null {
    const metrics = this.getMetrics(component);
    if (metrics.length === 0) return null;

    const totals = metrics.reduce(
      (acc, metric) => ({
        apiResponseTime: (acc.apiResponseTime || 0) + (metric.apiResponseTime || 0),
        renderTime: (acc.renderTime || 0) + (metric.renderTime || 0),
        cacheHitRate: (acc.cacheHitRate || 0) + (metric.cacheHitRate || 0),
        dataSize: (acc.dataSize || 0) + (metric.dataSize || 0),
        queryComplexity: (acc.queryComplexity || 0) + (metric.queryComplexity || 0),
      }),
      this.createEmptyMetric()
    );

    return {
      apiResponseTime: (totals.apiResponseTime || 0) / metrics.length,
      renderTime: (totals.renderTime || 0) / metrics.length,
      cacheHitRate: (totals.cacheHitRate || 0) / metrics.length,
      dataSize: (totals.dataSize || 0) / metrics.length,
      queryComplexity: (totals.queryComplexity || 0) / metrics.length,
    };
  }

  logPerformance(component: string): void {
    const avgMetrics = this.getAverageMetrics(component);
    if (avgMetrics) {
      console.log(`🚀 Performance Metrics for ${component}:`, {
        'API Response Time': `${(avgMetrics.apiResponseTime || 0).toFixed(2)}ms`,
        'Render Time': `${(avgMetrics.renderTime || 0).toFixed(2)}ms`,
        'Cache Hit Rate': `${((avgMetrics.cacheHitRate || 0) * 100).toFixed(1)}%`,
        'Data Size': `${((avgMetrics.dataSize || 0) / 1024).toFixed(2)}KB`,
        'Query Complexity': (avgMetrics.queryComplexity || 0).toFixed(2),
      });
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
