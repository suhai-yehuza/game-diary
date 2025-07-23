'use client';

import React, { useEffect, useState } from 'react';

import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { API_CONFIG } from '@/lib/config/app.config';
import {
  PaginationInfo,
  ErrorDisplay,
  PaginationControls,
  ErrorBoundary,
  SortableHeader,
} from '@src/app/protected/admin/database/components/ui';

interface IReaction {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: string;
}

interface IReactionsApiResponse {
  success: boolean;
  data?: IReaction[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function ReactionsTableWithSearch() {
  const [rawReactions, setRawReactions] = useState<IReaction[]>([]);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = React.useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  const safeToString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return '[Object]';
  };

  const reactions = React.useMemo(() => {
    if (!sortKey || !sortDirection || rawReactions.length === 0) {
      return rawReactions;
    }
    return [...rawReactions].sort((a, b) => {
      const aValue = a[sortKey as keyof IReaction];
      const bValue = b[sortKey as keyof IReaction];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      const aStr = safeToString(aValue);
      const bStr = safeToString(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rawReactions, sortKey, sortDirection]);

  const fetchReactions = React.useCallback(
    async (opts: { page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const page = opts.page ?? currentPage;
        const res = await fetch(
          `/api/admin/database/reactions?page=${page}&limit=${API_CONFIG.pagination.DEFAULT_PAGE_SIZE}`
        );
        const json: IReactionsApiResponse = await res.json();
        if (!json.success) throw new Error(json.error ?? 'Failed to fetch reactions');
        setRawReactions(json.data ?? []);
        setTotalCount(json.pagination?.total ?? 0);
        setCurrentPage(json.pagination?.page ?? 1);
        setPageInfo({
          hasNextPage: (json.pagination?.page ?? 1) < (json.pagination?.pages ?? 1),
          hasPreviousPage: (json.pagination?.page ?? 1) > 1,
          startCursor: null,
          endCursor: null,
        });
      } catch (err: unknown) {
        let message = 'Failed to fetch reactions';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    void fetchReactions();
    // eslint-disable-next-line
  }, []);

  const handleNext = () => {
    if (pageInfo.hasNextPage) {
      void fetchReactions({ page: currentPage + 1 });
    }
  };

  const handlePrev = () => {
    if (pageInfo.hasPreviousPage) {
      void fetchReactions({ page: currentPage - 1 });
    }
  };

  const handleFirst = () => {
    void fetchReactions({ page: 1 });
  };

  const handleLast = () => {
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    void fetchReactions({ page: totalPages });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <ErrorBoundary componentName="ReactionsTable">
      <div className="space-y-4">
        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel={formatNumberShort(totalCount) + ' total reactions'}
        />

        {/* Reactions Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full transition-all duration-200 ease-in-out">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider border-b border-border">
                    #
                  </th>
                  <SortableHeader
                    sortKey="id"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    id
                  </SortableHeader>
                  <SortableHeader
                    sortKey="user_id"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    user_id
                  </SortableHeader>
                  <SortableHeader
                    sortKey="target_type"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    target_type
                  </SortableHeader>
                  <SortableHeader
                    sortKey="target_id"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    target_id
                  </SortableHeader>
                  <SortableHeader
                    sortKey="emoji"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    emoji
                  </SortableHeader>
                  <SortableHeader
                    sortKey="created_at"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    created_at
                  </SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="ml-2">Loading reactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : reactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No reactions found
                    </td>
                  </tr>
                ) : (
                  reactions.map((reaction, index) => (
                    <tr
                      key={reaction.id}
                      className="hover:bg-muted/50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {(currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {reaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {reaction.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {reaction.target_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {reaction.target_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {reaction.emoji}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(reaction.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls - Bottom */}
        <PaginationControls
          totalCount={totalCount}
          currentPage={currentPage}
          pageInfo={pageInfo}
          loading={loading}
          onFirst={handleFirst}
          onPrev={handlePrev}
          onNext={handleNext}
          onLast={handleLast}
        />
      </div>
    </ErrorBoundary>
  );
}
