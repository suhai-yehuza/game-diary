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

interface INotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  read: boolean;
  created_at: string;
}

interface INotificationsApiResponse {
  success: boolean;
  data?: INotification[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function NotificationsTableWithSearch() {
  const [rawNotifications, setRawNotifications] = useState<INotification[]>([]);
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

  const notifications = React.useMemo(() => {
    if (!sortKey || !sortDirection || rawNotifications.length === 0) {
      return rawNotifications;
    }
    return [...rawNotifications].sort((a, b) => {
      const aValue = a[sortKey as keyof INotification];
      const bValue = b[sortKey as keyof INotification];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      const aStr = safeToString(aValue);
      const bStr = safeToString(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rawNotifications, sortKey, sortDirection]);

  const fetchNotifications = React.useCallback(
    async (opts: { page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const page = opts.page ?? currentPage;
        const res = await fetch(
          `/api/admin/database/notifications?page=${page}&limit=${API_CONFIG.pagination.DEFAULT_PAGE_SIZE}`
        );
        const json: INotificationsApiResponse = await res.json();
        if (!json.success) throw new Error(json.error ?? 'Failed to fetch notifications');
        setRawNotifications(json.data ?? []);
        setTotalCount(json.pagination?.total ?? 0);
        setCurrentPage(json.pagination?.page ?? 1);
        setPageInfo({
          hasNextPage: (json.pagination?.page ?? 1) < (json.pagination?.pages ?? 1),
          hasPreviousPage: (json.pagination?.page ?? 1) > 1,
          startCursor: null,
          endCursor: null,
        });
      } catch (err: unknown) {
        let message = 'Failed to fetch notifications';
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
    void fetchNotifications();
    // eslint-disable-next-line
  }, []);

  const handleNext = () => {
    if (pageInfo.hasNextPage) {
      void fetchNotifications({ page: currentPage + 1 });
    }
  };

  const handlePrev = () => {
    if (pageInfo.hasPreviousPage) {
      void fetchNotifications({ page: currentPage - 1 });
    }
  };

  const handleFirst = () => {
    void fetchNotifications({ page: 1 });
  };

  const handleLast = () => {
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    void fetchNotifications({ page: totalPages });
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
    <ErrorBoundary componentName="NotificationsTable">
      <div className="space-y-4">
        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel={formatNumberShort(totalCount) + ' total notifications'}
        />

        {/* Notifications Table */}
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
                    sortKey="type"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    type
                  </SortableHeader>
                  <SortableHeader
                    sortKey="title"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    title
                  </SortableHeader>
                  <SortableHeader
                    sortKey="read"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    read
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
                        <span className="ml-2">Loading notifications...</span>
                      </div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification, index) => (
                    <tr
                      key={notification.id}
                      className="hover:bg-muted/50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {(currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {notification.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {notification.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {notification.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {notification.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {notification.read ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(notification.created_at)}
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
