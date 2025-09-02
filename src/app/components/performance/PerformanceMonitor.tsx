'use client';

import { useEffect, useState } from 'react';

import { useLiveGames } from '@/hooks/use-live-games';
import type { IClientPerformanceMetrics } from '@/lib/types';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<IClientPerformanceMetrics>({
    queryCount: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    totalLoadTime: 0,
  });

  // Get live games polling information
  const { hasLiveGames, currentPollingInterval, timeSinceLastLiveGames } = useLiveGames();

  useEffect(() => {
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

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Left Performance Monitor */}
      <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-[9999] max-w-xs border border-white/20 shadow-2xl">
        <div className="font-bold mb-2 text-white">Performance Monitor (Left)</div>
        <div className="space-y-1 text-white">
          <div>Queries: {metrics.queryCount}</div>
          <div>Avg Time: {metrics.averageQueryTime.toFixed(0)}ms</div>
          <div>Slow Queries: {metrics.slowQueries}</div>
          <div>Load Time: {metrics.totalLoadTime.toFixed(0)}ms</div>
        </div>
        <div className="mt-2 text-xs text-gray-300">
          {metrics.slowQueries > 0 ? (
            <div className="text-yellow-400">⚠️ {metrics.slowQueries} slow queries detected</div>
          ) : null}
          {metrics.averageQueryTime > 1000 ? (
            <div className="text-red-400">🚨 High average query time</div>
          ) : null}
        </div>
      </div>

      {/* Right Performance Monitor */}
      <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white p-4 rounded-lg text-xs font-mono z-[9999] max-w-xs border border-gray-600 shadow-2xl">
        <div className="font-bold mb-2 text-white">Live Games Polling (Right)</div>
        <div className="space-y-1 text-white">
          <div>Status: {hasLiveGames ? '🟢 LIVE' : '⚪ NO GAMES'}</div>
          <div>Polling: {currentPollingInterval / 1000}s</div>
          {timeSinceLastLiveGames ? <div>Last Live: {timeSinceLastLiveGames}</div> : null}
          <div className="mt-2 text-xs text-gray-300">
            {hasLiveGames ? (
              <div className="text-green-400">Frequent polling (30s)</div>
            ) : (
              <div className="text-blue-400">Reduced polling (5m)</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
