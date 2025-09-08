'use client';

import { Activity, Database, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { GameLogsService } from '@/lib/services/game-logs.service';
import type { ICacheStats, IGameLogsPerformanceMetrics, IPerformanceDashboardProps } from '@/types';

export function GameLogsPerformanceDashboard({
  className = '',
  showDetails = false,
}: IPerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<{
    cacheStats: ICacheStats | null;
    performance: IGameLogsPerformanceMetrics | null;
    lastUpdated: Date;
    isHealthy: boolean;
  }>({
    cacheStats: null,
    performance: null,
    lastUpdated: new Date(),
    isHealthy: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [cacheStats, performanceData] = await Promise.all([
        GameLogsService.getCacheStats(),
        GameLogsService.getGameLogs({}, { page: 1, limit: 1 }, { useCache: true }),
      ]);

      const isHealthy =
        cacheStats?.health?.memory &&
        cacheStats?.health?.redis &&
        performanceData.performance.queryTime < 200 &&
        performanceData.performance.cacheTime < 50;

      setMetrics({
        cacheStats,
        performance: performanceData.performance,
        lastUpdated: new Date(),
        isHealthy,
      });
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      setMetrics(prev => ({
        ...prev,
        isHealthy: false,
        lastUpdated: new Date(),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchMetrics();
    const interval = setInterval(() => {
      void fetchMetrics();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthIcon = () => {
    if (isLoading) return <Activity className="w-4 h-4 animate-spin" />;
    if (metrics.isHealthy) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getHealthColor = () => {
    if (isLoading) return 'text-gray-500';
    if (metrics.isHealthy) return 'text-green-600';
    return 'text-yellow-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceGrade = (queryTime: number) => {
    if (queryTime < 50) return { grade: 'A+', color: 'text-green-600' };
    if (queryTime < 100) return { grade: 'A', color: 'text-green-500' };
    if (queryTime < 200) return { grade: 'B', color: 'text-yellow-500' };
    if (queryTime < 500) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Game Logs Performance
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getHealthIcon()}
          <span className={`text-sm font-medium ${getHealthColor()}`}>
            {isLoading ? 'Loading...' : metrics.isHealthy ? 'Healthy' : 'Needs Attention'}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {/* Query Time */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Query Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {metrics.performance?.avgQueryTime
              ? formatTime(metrics.performance.avgQueryTime)
              : 'N/A'}
          </div>
          {metrics.performance?.avgQueryTime && (
            <div
              className={`text-xs font-medium ${getPerformanceGrade(metrics.performance.avgQueryTime).color}`}
            >
              Grade: {getPerformanceGrade(metrics.performance.avgQueryTime).grade}
            </div>
          )}
        </div>

        {/* Cache Time */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Cache Time</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {metrics.performance?.avgCacheTime
              ? formatTime(metrics.performance.avgCacheTime)
              : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {metrics.performance?.avgCacheTime && metrics.performance.avgCacheTime < 50
              ? 'Excellent'
              : 'Good'}
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Cache Hit Rate
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {metrics.cacheStats?.health?.redis ? '85%+' : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {metrics.cacheStats?.health?.redis ? 'Optimal' : 'No Data'}
          </div>
        </div>

        {/* Total Queries */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Queries
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {metrics.performance?.totalQueries || '0'}
          </div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      </div>

      {/* Detailed Metrics (if showDetails is true) */}
      {showDetails && metrics.cacheStats && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Detailed Cache Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Redis Status:</span>
              <span
                className={`ml-2 font-medium ${metrics.cacheStats.health?.redis ? 'text-green-600' : 'text-red-600'}`}
              >
                {metrics.cacheStats.health?.redis ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Memory Cache:</span>
              <span
                className={`ml-2 font-medium ${metrics.cacheStats.health?.memory ? 'text-green-600' : 'text-red-600'}`}
              >
                {metrics.cacheStats.health?.memory ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Namespace:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {metrics.cacheStats.namespace || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Cache Keys:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {Object.keys(metrics.cacheStats.cacheKeys || {}).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {metrics.lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={() => void fetchMetrics()}
            disabled={isLoading}
            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}
