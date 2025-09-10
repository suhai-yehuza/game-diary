'use client';

import { Database, Zap, RefreshCw } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { CustomSelect } from '@/app/components/ui/custom-select';
import { formatShort } from '@/lib/utils/format-numbers';
import type { ICacheStatusDashboardProps } from '@/types';

export function CacheStatusDashboard({
  title,
  cacheInfo,
  pagination,
  pageSize,
  onPageSizeChange,
  onForceRefresh,
  forceRefresh,
  pageSizeOptions,
  cacheTTL,
}: ICacheStatusDashboardProps) {
  const getCacheStatusIcon = () => {
    if (!cacheInfo) return <Database className="w-4 h-4 text-gray-400" />;

    // Handle both cacheInfo formats
    const isCached = cacheInfo.cached || cacheInfo.hit;
    if (isCached) {
      return <Database className="w-4 h-4 text-green-500" />;
    }
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 mb-8 border border-green-200/50 dark:border-green-800/50 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Cache Status Info */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-green-200 dark:border-green-700">
              {getCacheStatusIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">{title}</h3>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cacheInfo?.cached || cacheInfo?.hit
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200'
                }`}
              >
                {cacheInfo?.cached || cacheInfo?.hit ? 'Cached' : 'Fresh'}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-green-100 dark:border-green-800/50">
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  Total Items
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {pagination ? formatShort(pagination.totalCount) : '0'}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-green-100 dark:border-green-800/50">
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  Current Page
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {pagination ? formatShort(pagination.page) : '0'}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-green-100 dark:border-green-800/50">
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  Page Size
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatShort(pageSize)}
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-green-100 dark:border-green-800/50">
                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                  Cache TTL
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">
                  {cacheTTL}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 rounded-lg px-4 py-3 border border-green-200 dark:border-green-700">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Page Size:
            </span>
            <CustomSelect
              value={pageSize.toString()}
              onChange={onPageSizeChange}
              options={pageSizeOptions}
              size="sm"
              variant="default"
              className="min-w-[120px]"
            />
          </div>

          {/* Force Refresh Button */}
          <Button
            variant="outline"
            onClick={() => void onForceRefresh()}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-3 h-auto transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${forceRefresh ? 'animate-spin' : ''}`} />
            <span className="font-medium">{forceRefresh ? 'Refreshing...' : 'Force Refresh'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
