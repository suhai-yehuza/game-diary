'use client';

import { useEffect, useState } from 'react';

import type { ISearchMetrics, ISearchPerformanceMonitorProps } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

// Interfaces moved to src/lib/types/components.types.ts

export function SearchPerformanceMonitor({
  query,
  resultsCount,
  searchTime,
  onMetricsUpdate,
}: ISearchPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<ISearchMetrics>({
    totalSearches: 0,
    averageSearchTime: 0,
    zeroResultSearches: 0,
    mostPopularQueries: [],
    searchSuccessRate: 0,
  });

  useEffect(() => {
    if (!query) return;

    // Update metrics based on current search
    const updateMetrics = () => {
      const storedMetrics = getStoredMetrics();

      // Update total searches
      const newTotalSearches = storedMetrics.totalSearches + 1;

      // Update average search time
      const newAverageSearchTime =
        (storedMetrics.averageSearchTime * storedMetrics.totalSearches + searchTime) /
        newTotalSearches;

      // Update zero result searches
      const newZeroResultSearches =
        resultsCount === 0
          ? storedMetrics.zeroResultSearches + 1
          : storedMetrics.zeroResultSearches;

      // Update search success rate
      const newSearchSuccessRate =
        ((newTotalSearches - newZeroResultSearches) / newTotalSearches) * 100;

      // Update popular queries
      const queryCount = storedMetrics.mostPopularQueries.find(q => q.query === query);
      const updatedQueries = queryCount
        ? storedMetrics.mostPopularQueries.map(q =>
            q.query === query ? { ...q, count: q.count + 1 } : q
          )
        : [...storedMetrics.mostPopularQueries, { query, count: 1 }];

      // Sort by count and keep top 10
      const sortedQueries = updatedQueries.sort((a, b) => b.count - a.count).slice(0, 10);

      const newMetrics: ISearchMetrics = {
        totalSearches: newTotalSearches,
        averageSearchTime: newAverageSearchTime,
        zeroResultSearches: newZeroResultSearches,
        mostPopularQueries: sortedQueries,
        searchSuccessRate: newSearchSuccessRate,
      };

      setMetrics(newMetrics);
      storeMetrics(newMetrics);

      if (onMetricsUpdate) {
        onMetricsUpdate(newMetrics);
      }
    };

    updateMetrics();
  }, [query, resultsCount, searchTime, onMetricsUpdate]);

  // Only show in development or for admin users
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
        Search Performance Metrics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-neutral-500 dark:text-neutral-400">Total Searches</div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {metrics.totalSearches.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-neutral-500 dark:text-neutral-400">Avg Search Time</div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {metrics.averageSearchTime.toFixed(0)}ms
          </div>
        </div>

        <div>
          <div className="text-neutral-500 dark:text-neutral-400">Success Rate</div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {metrics.searchSuccessRate.toFixed(1)}%
          </div>
        </div>

        <div>
          <div className="text-neutral-500 dark:text-neutral-400">Zero Results</div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {metrics.zeroResultSearches.toLocaleString()}
          </div>
        </div>
      </div>

      {metrics.mostPopularQueries.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Popular Queries</div>
          <div className="space-y-1">
            {metrics.mostPopularQueries.slice(0, 5).map(item => (
              <div key={`query-${item.query}`} className="flex justify-between text-xs">
                <span className="text-neutral-700 dark:text-neutral-300 truncate">
                  {item.query}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-2">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for localStorage
function getStoredMetrics(): ISearchMetrics {
  if (typeof window === 'undefined') {
    return {
      totalSearches: 0,
      averageSearchTime: 0,
      zeroResultSearches: 0,
      mostPopularQueries: [],
      searchSuccessRate: 0,
    };
  }

  try {
    const stored = localStorage.getItem('search_metrics');
    return stored
      ? JSON.parse(stored)
      : {
          totalSearches: 0,
          averageSearchTime: 0,
          zeroResultSearches: 0,
          mostPopularQueries: [],
          searchSuccessRate: 0,
        };
  } catch {
    return {
      totalSearches: 0,
      averageSearchTime: 0,
      zeroResultSearches: 0,
      mostPopularQueries: [],
      searchSuccessRate: 0,
    };
  }
}

function storeMetrics(metrics: ISearchMetrics) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('search_metrics', JSON.stringify(metrics));
  } catch (error) {
    // Use centralized error handling
    errorHandlers.validation(error instanceof Error ? error : new Error(String(error)), {
      component: 'React Component',
      action: 'Store search metrics',
    });
  }
}
