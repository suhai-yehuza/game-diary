'use client';

import { useEffect, useState } from 'react';

import type { IClientPerformanceMetrics } from '@/lib/types';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<IClientPerformanceMetrics>({
    queryCount: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    totalLoadTime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show in development or when explicitly enabled
    const shouldShow =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_SHOW_PERFORMANCE_MONITOR === 'true';
    console.log('Performance Monitor - NODE_ENV:', process.env.NODE_ENV);
    console.log('Performance Monitor - shouldShow:', shouldShow);

    if (shouldShow) {
      setIsVisible(true);
    }

    // Listen for performance events
    const handleSlowQuery = (event: CustomEvent) => {
      setMetrics(prev => ({
        ...prev,
        queryCount: prev.queryCount + 1,
        slowQueries: prev.slowQueries + 1,
        averageQueryTime:
          (prev.averageQueryTime * prev.queryCount + event.detail.duration) / (prev.queryCount + 1),
      }));
    };

    const handleQueryComplete = (event: CustomEvent) => {
      setMetrics(prev => ({
        ...prev,
        queryCount: prev.queryCount + 1,
        averageQueryTime:
          (prev.averageQueryTime * prev.queryCount + event.detail.duration) / (prev.queryCount + 1),
      }));
    };

    // Track page load time
    const trackPageLoad = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        // Ensure load time is positive
        const validLoadTime =
          loadTime > 0 ? loadTime : navigation.domContentLoadedEventEnd - navigation.fetchStart;
        setMetrics(prev => ({
          ...prev,
          totalLoadTime: validLoadTime > 0 ? validLoadTime : 0,
        }));
      }
    };

    // Add event listeners
    window.addEventListener('slow-query', handleSlowQuery as EventListener);
    window.addEventListener('query-complete', handleQueryComplete as EventListener);

    // Track initial page load
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
    }

    return () => {
      window.removeEventListener('slow-query', handleSlowQuery as EventListener);
      window.removeEventListener('query-complete', handleQueryComplete as EventListener);
      window.removeEventListener('load', trackPageLoad);
    };
  }, []);

  // For debugging - always show if not visible but in development
  if (!isVisible && process.env.NODE_ENV === 'development') {
    console.log('Performance Monitor - forcing visibility for debugging');
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
        <div className="font-bold mb-2">Performance Monitor (Debug)</div>
        <div>NODE_ENV: {process.env.NODE_ENV}</div>
        <div>isVisible: {isVisible.toString()}</div>
        <div>Component loaded but not visible</div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-[9999] max-w-xs border border-white/20 shadow-2xl">
      <div className="font-bold mb-2 text-white">Performance Monitor</div>
      <div className="space-y-1 text-white">
        <div>Queries: {metrics.queryCount}</div>
        <div>Avg Time: {metrics.averageQueryTime.toFixed(0)}ms</div>
        <div>Slow Queries: {metrics.slowQueries}</div>
        <div>Load Time: {metrics.totalLoadTime.toFixed(0)}ms</div>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        {metrics.slowQueries > 0 && (
          <div className="text-yellow-400">⚠️ {metrics.slowQueries} slow queries detected</div>
        )}
        {metrics.averageQueryTime > 1000 && (
          <div className="text-red-400">🚨 High average query time</div>
        )}
      </div>
    </div>
  );
}
