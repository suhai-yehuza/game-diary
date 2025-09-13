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
    if (!cacheInfo) return <Database className="w-4 h-4 text-theme-muted" />;

    // Handle both cacheInfo formats
    const isCached = cacheInfo.cached || cacheInfo.hit;
    if (isCached) {
      return <Database className="w-4 h-4 text-semantic-success" />;
    }
    return <Zap className="w-4 h-4 text-semantic-info" />;
  };

  return (
    <div className="bg-gradient-to-r from-semantic-success/10 to-semantic-success/20 rounded-xl p-6 mb-8 border border-semantic-success/30 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Cache Status Info */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center shadow-sm border border-semantic-success/30">
              {getCacheStatusIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-theme-primary">{title}</h3>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cacheInfo?.cached || cacheInfo?.hit
                    ? 'bg-semantic-success/10 text-semantic-success'
                    : 'bg-semantic-info/10 text-semantic-info'
                }`}
              >
                {cacheInfo?.cached || cacheInfo?.hit ? 'Cached' : 'Fresh'}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-card/60 rounded-lg p-3 border border-semantic-success/20">
                <div className="text-xs font-medium text-semantic-success mb-1">Total Items</div>
                <div className="text-lg font-bold text-theme-primary">
                  {pagination ? formatShort(pagination.totalCount) : '0'}
                </div>
              </div>
              <div className="bg-surface-card/60 rounded-lg p-3 border border-semantic-success/20">
                <div className="text-xs font-medium text-semantic-success mb-1">Current Page</div>
                <div className="text-lg font-bold text-theme-primary">
                  {pagination ? formatShort(pagination.page) : '0'}
                </div>
              </div>
              <div className="bg-surface-card/60 rounded-lg p-3 border border-semantic-success/20">
                <div className="text-xs font-medium text-semantic-success mb-1">Page Size</div>
                <div className="text-lg font-bold text-theme-primary">{formatShort(pageSize)}</div>
              </div>
              <div className="bg-surface-card/60 rounded-lg p-3 border border-semantic-success/20">
                <div className="text-xs font-medium text-semantic-success mb-1">Cache TTL</div>
                <div className="text-lg font-bold text-theme-primary">{cacheTTL}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          {/* Page Size Selector */}
          <div className="flex items-center gap-3 bg-surface-card/80 rounded-lg px-4 py-3 border border-semantic-success/30">
            <span className="text-sm font-medium text-semantic-success">Page Size:</span>
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
            className="flex items-center gap-2 bg-surface-card/80 border-semantic-success/30 hover:bg-semantic-success/10 text-semantic-success px-4 py-3 h-auto transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${forceRefresh ? 'animate-spin' : ''}`} />
            <span className="font-medium">{forceRefresh ? 'Refreshing...' : 'Force Refresh'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
