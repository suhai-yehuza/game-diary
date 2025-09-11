'use client';

import { Activity, Database, Zap, Clock, TrendingUp } from 'lucide-react';
import React, { memo, useEffect, useState, useCallback } from 'react';

import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import type { IPerformanceMetrics, IPerformanceMonitorProps } from '@/types';

// Memoized performance monitor component
export const PerformanceMonitor = memo<IPerformanceMonitorProps>(
  ({ enabled = process.env.NODE_ENV === 'development', showDetails = false, className = '' }) => {
    const [metrics, setMetrics] = useState<IPerformanceMetrics>({
      loadTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      reRenderCount: 0,
      timestamp: new Date().toISOString(),
    });

    const [isVisible, setIsVisible] = useState(false);

    // Measure page load time
    const measurePageLoadTime = useCallback(() => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = window.performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          return navigation.loadEventEnd - navigation.fetchStart;
        }
      }
      return 0;
    }, []);

    // Measure memory usage (if available)
    const measureMemoryUsage = useCallback(() => {
      if (
        typeof window !== 'undefined' &&
        (window as { performance?: { memory?: { usedJSHeapSize: number } } }).performance?.memory
      ) {
        const memory = (
          window as unknown as { performance: { memory: { usedJSHeapSize: number } } }
        ).performance.memory;
        return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      }
      return 0;
    }, []);

    // Update metrics
    const updateMetrics = useCallback(() => {
      setMetrics(prev => ({
        ...prev,
        loadTime: measurePageLoadTime(),
        memoryUsage: measureMemoryUsage(),
        reRenderCount: (prev.reRenderCount || 0) + 1,
        timestamp: new Date().toISOString(),
      }));
    }, [measurePageLoadTime, measureMemoryUsage]);

    // Initial measurement
    useEffect(() => {
      if (enabled) {
        updateMetrics();
      }
    }, [enabled, updateMetrics]);

    // Periodic updates
    useEffect(() => {
      if (!enabled) return;

      const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }, [enabled, updateMetrics]);

    // Keyboard shortcut to toggle visibility
    useEffect(() => {
      if (!enabled) return;

      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
          event.preventDefault();
          setIsVisible(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [enabled]);

    if (!enabled || !isVisible) {
      return null;
    }

    const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
      if (value <= thresholds.good) return 'text-green-600';
      if (value <= thresholds.warning) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getPerformanceBadge = (value: number, thresholds: { good: number; warning: number }) => {
      if (value <= thresholds.good) return 'default';
      if (value <= thresholds.warning) return 'secondary';
      return 'destructive';
    };

    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-lg border-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4" />
              <span>Performance Monitor</span>
              <Badge variant="outline" className="text-xs">
                Dev Mode
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Page Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="text-xs">Load Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-mono ${getPerformanceColor(metrics.loadTime || 0, { good: 1000, warning: 3000 })}`}
                >
                  {(metrics.loadTime || 0).toFixed(0)}ms
                </span>
                <Badge
                  variant={getPerformanceBadge(metrics.loadTime || 0, {
                    good: 1000,
                    warning: 3000,
                  })}
                  className="text-xs px-1 py-0"
                >
                  {(metrics.loadTime || 0) <= 1000
                    ? 'Fast'
                    : (metrics.loadTime || 0) <= 3000
                      ? 'OK'
                      : 'Slow'}
                </Badge>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-3 w-3 text-green-500" />
                <span className="text-xs">Memory</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-mono ${getPerformanceColor(metrics.memoryUsage || 0, { good: 50, warning: 100 })}`}
                >
                  {metrics.memoryUsage || 0}MB
                </span>
                <Badge
                  variant={getPerformanceBadge(metrics.memoryUsage || 0, {
                    good: 50,
                    warning: 100,
                  })}
                  className="text-xs px-1 py-0"
                >
                  {(metrics.memoryUsage || 0) <= 50
                    ? 'Low'
                    : (metrics.memoryUsage || 0) <= 100
                      ? 'Med'
                      : 'High'}
                </Badge>
              </div>
            </div>

            {/* Render Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span className="text-xs">Renders</span>
              </div>
              <span className="text-xs font-mono text-gray-600">{metrics.reRenderCount || 0}</span>
            </div>

            {/* Cache Hit Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3 text-purple-500" />
                <span className="text-xs">Cache Rate</span>
              </div>
              <span className="text-xs font-mono text-gray-600">
                {(metrics.cacheHitRate || 0).toFixed(1)}%
              </span>
            </div>

            {showDetails && (
              <div className="pt-2 border-t text-xs text-gray-500">
                Last updated: {new Date(metrics.timestamp || '').toLocaleTimeString()}
                <br />
                Press Ctrl+Shift+P to toggle
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

PerformanceMonitor.displayName = 'PerformanceMonitor';
