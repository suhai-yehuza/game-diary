'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { CacheStatusDashboard } from '@/app/components/sports/cache-status-dashboard';
import { PaginatedGrid } from '@/app/components/sports/paginated-grid';
import { QuickFilters } from '@/app/components/sports/quick-filters';
import { Button } from '@/app/components/ui/button';
import { TAILWIND_CLASSES } from '@/lib/constants/colors';
import { getButtonVariant } from '@/lib/design-tokens/button-variants';
import type { INBAPageLayoutProps } from '@/types';

import { SportsPageLayout } from './SportsPageLayout';

export function NBAPageLayout<T>({
  title,
  description,
  items,
  loading,
  error,
  pagination,
  cacheInfo,
  pageSize,
  onPageSizeChange,
  onForceRefresh,
  forceRefresh,
  onPageChange,
  renderItem,
  renderEmptyState,
  gridClassName,
  showPagination = true,
  cacheTitle,
  cacheTTL,
  pageSizeOptions,
  filtersTitle,
  filtersIcon,
  filters,
  showGamesButton = true,
  showPlayersButton = true,
  showTeamsButton = true,
}: INBAPageLayoutProps<T>) {
  return (
    <SportsPageLayout title={title} description={description} showLiveGamesButton={false}>
      {/* Navigation section with back button and sport buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        {/* Back to NBA Hub */}
        <Link href="/sports/nba">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back to NBA Hub
          </Button>
        </Link>

        {/* Sport buttons on the right */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {showGamesButton && (
            <Link
              href="/sports/nba/games"
              className={`inline-flex items-center px-3 sm:px-4 py-2 ${TAILWIND_CLASSES.sports.nba} text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm`}
            >
              Games
            </Link>
          )}
          {showPlayersButton && (
            <Link href="/sports/nba/players" className={getButtonVariant('primaryInline')}>
              Players
            </Link>
          )}
          {showTeamsButton && (
            <Link href="/sports/nba/teams" className={getButtonVariant('primaryInline')}>
              Teams
            </Link>
          )}
        </div>
      </div>

      {/* Cache Status Dashboard */}
      <CacheStatusDashboard
        title={cacheTitle}
        cacheInfo={cacheInfo}
        pagination={pagination}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        onForceRefresh={onForceRefresh}
        forceRefresh={forceRefresh}
        pageSizeOptions={pageSizeOptions}
        cacheTTL={cacheTTL}
      />

      {/* Quick Filters */}
      <QuickFilters
        title={filtersTitle}
        icon={filtersIcon}
        totalCount={pagination?.totalCount || 0}
        filters={filters}
      />

      {/* Paginated Grid */}
      <PaginatedGrid
        items={items}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={onPageChange}
        renderItem={renderItem}
        renderEmptyState={renderEmptyState}
        gridClassName={gridClassName}
        showPagination={showPagination}
      />
    </SportsPageLayout>
  );
}
