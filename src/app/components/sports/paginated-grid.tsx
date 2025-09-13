'use client';

import type { ReactNode } from 'react';

import { Pagination as _Pagination } from '@/app/components/sports/pagination';

export interface IPaginatedGridProps<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  } | null;
  onPageChange: (page: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
  renderEmptyState?: () => ReactNode;
  gridClassName?: string;
  showPagination?: boolean;
}

export function PaginatedGrid<T>({
  items,
  loading,
  error,
  pagination,
  onPageChange,
  renderItem,
  renderEmptyState,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6',
  showPagination = true,
}: IPaginatedGridProps<T>) {
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-semantic-error/10 border border-semantic-error/30 rounded-lg p-3 sm:p-4 mb-6 mt-8">
        <p className="text-semantic-error text-sm sm:text-base">Error loading data: {error}</p>
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    if (renderEmptyState) {
      return renderEmptyState();
    }

    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-theme-muted text-base sm:text-lg">No items available.</p>
      </div>
    );
  }

  // Calculate showing range
  const getShowingRange = () => {
    if (!pagination?.totalCount || !pagination?.limit) return null;

    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(pagination.page * pagination.limit, pagination.totalCount);

    return { startItem, endItem };
  };

  const showingRange = getShowingRange();

  return (
    <>
      {/* Results info and page info at top */}
      {showingRange && pagination && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Showing {showingRange.startItem} - {showingRange.endItem} of {pagination.totalCount}{' '}
            results
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-4 mt-8">
        <div className={gridClassName}>{items.map((item, index) => renderItem(item, index))}</div>
      </div>

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <_Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
