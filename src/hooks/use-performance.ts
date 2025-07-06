import { useEffect, useRef, useCallback } from 'react';

import type { IPerformanceMetrics, IUsePerformanceOptions } from '@/lib/types/hooks.types';

export function usePerformance(options: IUsePerformanceOptions) {
  const {
    componentName,
    enableMemoryTracking = false,
    enableRenderTracking = true,
    onMetrics,
  } = options;
  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(0);

  const trackRender = useCallback(() => {
    if (!enableRenderTracking) return;

    const renderTime = Date.now() - renderStartRef.current;
    const mountTime = Date.now() - mountTimeRef.current;

    const metrics: IPerformanceMetrics = {
      componentName,
      mountTime,
      renderTime,
      timestamp: new Date().toISOString(),
    };

    // Add memory usage if enabled and available
    if (enableMemoryTracking && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memory) {
        metrics.memoryUsage = memory.usedJSHeapSize;
      }
    }

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, metrics);
    }

    // Call custom metrics handler
    onMetrics?.(metrics);
  }, [componentName, enableMemoryTracking, enableRenderTracking, onMetrics]);

  useEffect(() => {
    // Track initial mount
    mountTimeRef.current = Date.now();
    renderStartRef.current = Date.now();

    return () => {
      // Track unmount
      const totalTime = Date.now() - mountTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} unmounted after ${totalTime}ms`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    // Track each render
    renderStartRef.current = Date.now();
    trackRender();
  });

  const measureAsync = useCallback(
    async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();
      try {
        const result = await operation();
        const duration = performance.now() - startTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Performance] ${componentName} - ${operationName}: ${duration.toFixed(2)}ms`
          );
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
          `[Performance] ${componentName} - ${operationName} failed after ${duration.toFixed(2)}ms:`,
          error
        );
        throw error;
      }
    },
    [componentName]
  );

  const measureSync = useCallback(
    <T>(operationName: string, operation: () => T): T => {
      const startTime = performance.now();
      try {
        const result = operation();
        const duration = performance.now() - startTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Performance] ${componentName} - ${operationName}: ${duration.toFixed(2)}ms`
          );
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(
          `[Performance] ${componentName} - ${operationName} failed after ${duration.toFixed(2)}ms:`,
          error
        );
        throw error;
      }
    },
    [componentName]
  );

  return {
    measureAsync,
    measureSync,
    trackRender,
  };
}
