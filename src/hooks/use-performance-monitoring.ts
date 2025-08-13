import { useCallback, useEffect, useRef } from 'react';

import { performanceMonitoring } from '@/lib/utils/performance-monitoring';

export function usePerformanceMonitoring() {
  const renderStartTime = useRef<number>(0);

  // Track component render time
  const trackComponentRender = useCallback(
    (componentName: string, _props?: Record<string, unknown>) => {
      const renderTime = performance.now() - renderStartTime.current;
      performanceMonitoring.trackComponentRender(componentName, renderTime);
    },
    []
  );

  // Track API response time
  const trackApiResponse = useCallback(
    (endpoint: string, responseTime: number, status: number, _method?: string) => {
      performanceMonitoring.trackApiResponse(endpoint, responseTime, status);
    },
    []
  );

  // Track user interaction
  const trackInteraction = useCallback(
    (interactionType: string, duration: number, _target?: string) => {
      performanceMonitoring.trackInteractionTime(interactionType, duration);
    },
    []
  );

  // Track bundle size
  const trackBundleSize = useCallback((bundleName: string, size: number) => {
    performanceMonitoring.trackBundleSize(size, bundleName);
  }, []);

  // Track resource load
  const trackResourceLoad = useCallback((resourceType: string, loadTime: number, url: string) => {
    performanceMonitoring.trackResourceLoad(resourceType, loadTime, url);
  }, []);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    performanceMonitoring.trackMemoryUsage();
  }, []);

  // Track network conditions
  const trackNetworkConditions = useCallback(() => {
    performanceMonitoring.trackNetworkConditions();
  }, []);

  // Track page load
  const trackPageLoad = useCallback((page: string) => {
    performanceMonitoring.trackPageLoad(page);
  }, []);

  // Track Core Web Vitals
  const trackCoreWebVitals = useCallback(() => {
    performanceMonitoring.trackCoreWebVitals();
  }, []);

  // Initialize performance monitoring for a component
  const initializeComponentMonitoring = useCallback(
    (componentName: string) => {
      renderStartTime.current = performance.now();

      return () => {
        trackComponentRender(componentName);
      };
    },
    [trackComponentRender]
  );

  // Monitor specific performance metrics
  const monitorMetric = useCallback((_metric: string, _value: number) => {
    // Note: performanceAlerts was removed to reduce analytics costs
    // This function is kept for API compatibility but does nothing
  }, []);

  return {
    // Tracking functions
    trackComponentRender,
    trackApiResponse,
    trackInteraction,
    trackBundleSize,
    trackResourceLoad,
    trackMemoryUsage,
    trackNetworkConditions,
    trackPageLoad,
    trackCoreWebVitals,

    // Utility functions
    initializeComponentMonitoring,
    monitorMetric,

    // Direct access to utilities
    performanceMonitoring,
  };
}

// Hook for measuring component render time
export function useComponentRenderTime(componentName: string, props?: Record<string, unknown>) {
  const { trackComponentRender } = usePerformanceMonitoring();
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const _renderTime = performance.now() - renderStartTime.current;
    trackComponentRender(componentName, props);
  }, [componentName, trackComponentRender, props]);
}

// Hook for measuring API response times
export function useApiPerformanceMonitoring() {
  const { trackApiResponse } = usePerformanceMonitoring();

  const measureApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>, endpoint: string, method = 'GET'): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const responseTime = performance.now() - startTime;
        trackApiResponse(endpoint, responseTime, 200, method);
        return result;
      } catch (error) {
        const responseTime = performance.now() - startTime;
        const status = (error as { status?: number })?.status || 500;
        trackApiResponse(endpoint, responseTime, status, method);
        throw error;
      }
    },
    [trackApiResponse]
  );

  return { measureApiCall };
}

// Hook for measuring user interactions
export function useInteractionPerformanceMonitoring() {
  const { trackInteraction } = usePerformanceMonitoring();

  const measureInteraction = useCallback(
    (interactionType: string, target?: string) => {
      const startTime = performance.now();

      return () => {
        const duration = performance.now() - startTime;
        trackInteraction(interactionType, duration, target);
      };
    },
    [trackInteraction]
  );

  return { measureInteraction };
}
