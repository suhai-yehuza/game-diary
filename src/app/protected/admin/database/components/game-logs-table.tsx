'use client';

import React, { useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/config/app.config';
import {
  Badge,
  PaginationInfo,
  ErrorDisplay,
  PaginationControls,
  TableSearch,
  ErrorBoundary,
  SortableHeader,
} from '@src/app/protected/admin/database/components/ui';
import { SEARCH_GAME_LOGS_ADMIN } from '@src/lib/graphql/queries';
import type {
  IGameLogSummary,
  IPageInfo,
  ISearchGameLogsResponse,
  GameLogSearchField,
} from '@src/lib/types';

export function GameLogsTableWithSearch() {
  const [rawGameLogs, setRawGameLogs] = useState<IGameLogSummary[]>([]);
  const [pageInfo, setPageInfo] = useState<IPageInfo>({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchField, setSearchField] = useState<GameLogSearchField>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Handle sort without causing re-renders
  const handleSort = React.useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  // Helper function to safely convert values to strings
  const safeToString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value instanceof Date) return value.toISOString();
    return '[Object]';
  };

  // Direct sorting without useMemo dependencies
  const gameLogs = React.useMemo(() => {
    if (!sortKey || !sortDirection || rawGameLogs.length === 0) {
      return rawGameLogs;
    }

    return [...rawGameLogs].sort((a, b) => {
      const aValue = a[sortKey as keyof IGameLogSummary];
      const bValue = b[sortKey as keyof IGameLogSummary];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const aStr = safeToString(aValue);
      const bStr = safeToString(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [rawGameLogs, sortKey, sortDirection]);

  const fetchGameLogs = React.useCallback(
    async (opts: { after?: string | null; searchTerm?: string; page?: number } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: SEARCH_GAME_LOGS_ADMIN.loc?.source.body,
            variables: {
              first: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
              after: opts.after ?? null,
              searchTerm: opts.searchTerm ?? searchTerm,
              searchField: searchField,
            },
          }),
        });
        const json = (await res.json()) as unknown as ISearchGameLogsResponse;
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
        const data = json.data?.searchGameLogs;
        const fetchedGameLogs = Array.isArray(data?.edges)
          ? data.edges.map(e => e.node ?? ({} as IGameLogSummary))
          : [];

        // Store raw data - sorting is handled by useMemo
        setRawGameLogs(fetchedGameLogs);
        setPageInfo(
          data?.pageInfo ?? {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          }
        );
        if (data?.totalCount) {
          setTotalCount(data.totalCount);
        }
      } catch (err: unknown) {
        let message = 'Failed to fetch game logs';
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
    [searchTerm, searchField]
  );

  useEffect(() => {
    if (after === null) void fetchGameLogs();
    // eslint-disable-next-line
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setAfter(null);
        setCurrentPage(1);
        void fetchGameLogs({ searchTerm: searchTerm.trim() });
      } else if (searchTerm === '') {
        setAfter(null);
        setCurrentPage(1);
        void fetchGameLogs({ searchTerm: '' });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchField, fetchGameLogs]);

  const handleNext = () => {
    setAfter(pageInfo.endCursor);
    setCurrentPage(prev => prev + 1);
    void fetchGameLogs({ after: pageInfo.endCursor });
  };

  const handlePrev = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchGameLogs({ after: null });
  };

  const handleFirst = () => {
    setAfter(null);
    setCurrentPage(1);
    void fetchGameLogs({ after: null });
  };

  const handleLast = () => {
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    setCurrentPage(totalPages);

    setLoading(true);
    setError(null);

    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_GAME_LOGS_ADMIN.loc?.source.body,
        variables: {
          first: totalCount,
          after: null,
          searchTerm: searchTerm,
          searchField: searchField,
        },
      }),
    })
      .then(res => res.json())
      .then((json: ISearchGameLogsResponse) => {
        if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
        const data = json.data?.searchGameLogs;
        const allGameLogs = Array.isArray(data?.edges)
          ? data.edges.map(e => e.node ?? ({} as IGameLogSummary))
          : [];

        const lastPageStart = (totalPages - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE;
        const lastPageGameLogs = allGameLogs.slice(lastPageStart);

        setRawGameLogs(lastPageGameLogs);
        setPageInfo({
          hasNextPage: false,
          hasPreviousPage: totalPages > 1,
          startCursor: lastPageGameLogs[0]?.id ?? null,
          endCursor: lastPageGameLogs[lastPageGameLogs.length - 1]?.id ?? null,
        });
      })
      .catch((err: unknown) => {
        let message = 'Failed to fetch last page';
        if (
          err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof (err as { message?: unknown }).message === 'string'
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
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

  const getRatingStars = (rating: number) => {
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    return stars;
  };

  return (
    <ErrorBoundary componentName="GameLogsTable">
      <div className="space-y-4">
        {/* Search Section */}
        <TableSearch
          searchTerm={searchTerm}
          searchField={searchField}
          searchFields={[
            { value: 'all', label: 'All Fields' },
            { value: 'user_id', label: 'User ID' },
            { value: 'game_id', label: 'Game ID' },
            { value: 'classification', label: 'Classification' },
            { value: 'rating_for_game', label: 'Rating' },
            { value: 'watched_setting', label: 'Watched Setting' },
            { value: 'watched_location', label: 'Watched Location' },
          ]}
          onSearchChange={(term, field) => {
            setSearchTerm(term);
            setSearchField(field as GameLogSearchField);
          }}
          onClear={() => setSearchTerm('')}
          placeholder="Search game logs..."
        />

        {/* Error Display */}
        <ErrorDisplay error={error} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel="game logs"
        />

        {/* Game Logs Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full transition-all duration-200 ease-in-out">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider border-b border-border">
                    #
                  </th>
                  <SortableHeader
                    sortKey="username"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    username
                  </SortableHeader>
                  <SortableHeader
                    sortKey="game_id"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    game_id
                  </SortableHeader>
                  <SortableHeader
                    sortKey="rating_for_game"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    rating_for_game
                  </SortableHeader>
                  <SortableHeader
                    sortKey="classification"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    classification
                  </SortableHeader>
                  <SortableHeader
                    sortKey="watched_setting"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    watched_setting
                  </SortableHeader>
                  <SortableHeader
                    sortKey="watched_date"
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    watched_date
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
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="ml-2">Loading game logs...</span>
                      </div>
                    </td>
                  </tr>
                ) : gameLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-muted-foreground">
                      No game logs found
                    </td>
                  </tr>
                ) : (
                  gameLogs.map((gameLog, index) => (
                    <tr
                      key={gameLog.id}
                      className="hover:bg-muted/50 transition-colors duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {(currentPage - 1) * API_CONFIG.pagination.DEFAULT_PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {gameLog.user?.username ?? 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {gameLog.user?.first_name} {gameLog.user?.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {gameLog.game_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{gameLog.rating_for_game}/5</div>
                        <div className="text-yellow-500 text-xs">
                          {getRatingStars(gameLog.rating_for_game)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{gameLog.classification}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {gameLog.watched_setting ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(gameLog.watched_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(gameLog.created_at)}
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
