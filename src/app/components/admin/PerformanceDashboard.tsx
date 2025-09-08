'use client';

import { useEffect, useState } from 'react';

import { queryPerformanceMonitor } from '@/lib/utils/query-performance-monitor';
import type { IPerformanceReport } from '@/types';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<IPerformanceReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    const report = queryPerformanceMonitor.getPerformanceReport();
    setMetrics(report);
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const clearMetrics = () => {
    queryPerformanceMonitor.clearMetrics();
    refreshMetrics();
  };

  const exportMetrics = () => {
    const data = queryPerformanceMonitor.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graphql-performance-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">GraphQL Performance Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={clearMetrics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Metrics
          </button>
          <button
            onClick={exportMetrics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Queries</h3>
          <p className="text-2xl font-bold text-gray-900">{metrics?.totalQueries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Average Query Time</h3>
          <p className="text-2xl font-bold text-gray-900">
            {metrics?.averageQueryTime ? `${metrics.averageQueryTime.toFixed(2)}ms` : '0ms'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {metrics?.errorRate ? `${(metrics.errorRate * 100).toFixed(2)}%` : '0%'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Slow Queries</h3>
          <p className="text-2xl font-bold text-gray-900">{metrics?.slowQueries?.length || 0}</p>
        </div>
      </div>

      {/* Slow Queries */}
      {metrics?.slowQueries && metrics?.slowQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Slow Queries</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {metrics?.slowQueries?.map((query, _index) => (
                <div
                  key={`slow-query-${query.timestamp}-${query.duration}-${query.query.slice(0, 20)}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{query.query}</p>
                    <p className="text-sm text-gray-500">Duration: {query.duration.toFixed(2)}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(query.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {metrics?.recommendations && metrics?.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Optimization Recommendations</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {metrics?.recommendations?.map((rec: string) => (
                <li
                  key={`recommendation-${rec.slice(0, 30).replace(/\s+/g, '-')}-${rec.length}`}
                  className="flex items-start gap-2"
                >
                  <span className="text-blue-600 mt-1">💡</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Performance Trends */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Last Hour</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  Queries: {queryPerformanceMonitor.getPerformanceTrends().lastHour.count}
                </p>
                <p className="text-sm text-gray-700">
                  Avg Time:{' '}
                  {queryPerformanceMonitor.getPerformanceTrends().lastHour.averageTime.toFixed(2)}ms
                </p>
                <p className="text-sm text-gray-700">
                  Error Rate:{' '}
                  {(
                    queryPerformanceMonitor.getPerformanceTrends().lastHour.errorRate * 100
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Last Day</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  Queries: {queryPerformanceMonitor.getPerformanceTrends().lastDay.count}
                </p>
                <p className="text-sm text-gray-700">
                  Avg Time:{' '}
                  {queryPerformanceMonitor.getPerformanceTrends().lastDay.averageTime.toFixed(2)}ms
                </p>
                <p className="text-sm text-gray-700">
                  Error Rate:{' '}
                  {(queryPerformanceMonitor.getPerformanceTrends().lastDay.errorRate * 100).toFixed(
                    2
                  )}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
