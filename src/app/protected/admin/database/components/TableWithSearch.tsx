'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';

import { ErrorBoundary } from '@/app/protected/admin/database/components/ui/error-boundary';
import { ErrorDisplay } from '@/app/protected/admin/database/components/ui/error-display';
import { PaginationControls } from '@/app/protected/admin/database/components/ui/pagination-controls';
import { PaginationInfo } from '@/app/protected/admin/database/components/ui/pagination-info';
import { SortableHeader } from '@/app/protected/admin/database/components/ui/sortable-header';
import { TableSearch } from '@/app/protected/admin/database/components/ui/table-search';
import { API_CONFIG } from '@/lib/config/app.config';
import type { ITableWithSearchProps } from '@/lib/types';

export default function TableWithSearch<T extends { id: string | number }>({
  tableName,
  columns,
  itemLabel,
}: ITableWithSearchProps<T>) {
  const typedColumns = columns;
  const [rawData, setRawData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<string>('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const isInitialMount = useRef(true);
  const currentValues = useRef({
    page: 1,
    limit: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
    searchTerm: '',
    searchField: '',
    sortBy: '',
    sortDirection: 'asc' as 'asc' | 'desc',
  });

  // Client-side sorting function
  const sortData = useCallback((data: T[], key: string, direction: 'asc' | 'desc'): T[] => {
    if (!key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[key as keyof T];
      const bValue = b[key as keyof T];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, []);

  // Computed sorted data
  const sortedData = useMemo(() => {
    return sortData(rawData, sortKey, sortDirection);
  }, [rawData, sortKey, sortDirection, sortData]);

  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null as string | null,
    endCursor: null as string | null,
  });

  // Update ref when state changes
  useEffect(() => {
    currentValues.current = {
      page: currentPage,
      limit: API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
      searchTerm,
      searchField,
      sortBy: sortKey,
      sortDirection,
    };
  }, [currentPage, searchTerm, searchField, sortKey, sortDirection]);

  // Generate search fields based on columns
  const searchFields = [
    { value: 'all', label: 'All Fields' },
    ...typedColumns.map(col => ({
      value: String(col.key),
      label: col.label.charAt(0).toUpperCase() + col.label.slice(1).replace(/_/g, ' '),
    })),
  ];

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sort clicked:', key, direction);
    if (direction === null) {
      // Clear sorting
      setSortKey('');
      setSortDirection('asc');
    } else {
      // Set new sort
      setSortKey(key);
      setSortDirection(direction);
    }
  }, []);

  const noopSort = useCallback((_key: string, _direction: 'asc' | 'desc' | null) => {
    // No-op for non-sortable columns
  }, []);

  const handleSearchChange = useCallback(
    (term: string, field: string) => {
      setSearchTerm(term);
      setSearchField(field);
      setCurrentPage(1);
      setFetchTrigger(prev => prev + 1);
    },
    [setSearchTerm, setSearchField, setCurrentPage, setFetchTrigger]
  );

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setSearchField('');
    setCurrentPage(1);
    setFetchTrigger(prev => prev + 1);
  }, [setSearchTerm, setSearchField, setCurrentPage, setFetchTrigger]);

  const handleNext = useCallback(() => {
    setCurrentPage(prev => prev + 1);
    setFetchTrigger(prev => prev + 1);
  }, [setCurrentPage, setFetchTrigger]);

  const handlePrev = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
    setFetchTrigger(prev => prev + 1);
  }, [setCurrentPage, setFetchTrigger]);

  const handleFirst = useCallback(() => {
    setCurrentPage(1);
    setFetchTrigger(prev => prev + 1);
  }, [setCurrentPage, setFetchTrigger]);

  const handleLast = useCallback(() => {
    setCurrentPage(Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE));
    setFetchTrigger(prev => prev + 1);
  }, [totalCount, setCurrentPage, setFetchTrigger]);

  const fetchData = useCallback(async () => {
    const values = currentValues.current;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: values.page.toString(),
        limit: values.limit.toString(),
      });

      if (values.searchTerm) {
        params.append('searchTerm', values.searchTerm);
        params.append('searchField', values.searchField);
      }

      const response = await fetch(`/api/admin/database/${tableName}?${params}`);
      const result = (await response.json()) as {
        success: boolean;
        data: T[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to fetch data');
      }

      if (!result.success) {
        throw new Error(result.error ?? 'API returned success: false');
      }

      setRawData(Array.isArray(result.data) ? result.data : []);
      setTotalCount(result.pagination.total ?? 0);
      setPageInfo({
        hasNextPage: (result.pagination.page ?? 1) < (result.pagination.pages ?? 1),
        hasPreviousPage: (result.pagination.page ?? 1) > 1,
        startCursor: null,
        endCursor: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, [tableName]);

  // Memoized table row component to prevent unnecessary re-renders
  const TableRow = React.memo(({ row, index }: { row: T; index: number }) => (
    <tr
      key={row.id}
      className="transition-all duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 last:border-r-0"
    >
      <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
        {index + 1}
      </td>
      {typedColumns.map(col => (
        <td
          key={String(col.key)}
          className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-r-0"
        >
          <div className="max-w-20 sm:max-w-32 truncate" title={String(row[col.key])}>
            {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
          </div>
        </td>
      ))}
    </tr>
  ));

  // Single useEffect to handle all data fetching
  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrigger]); // Depend on fetchTrigger

  return (
    <ErrorBoundary componentName={tableName + 'Table'}>
      <div className="space-y-3 sm:space-y-4">
        {/* Search Component */}
        <TableSearch
          searchTerm={searchTerm}
          searchField={searchField}
          searchFields={searchFields}
          onSearchChange={handleSearchChange}
          onClear={handleSearchClear}
          placeholder={`Search ${itemLabel}...`}
        />

        {/* Error Display */}
        <ErrorDisplay error={error ?? ''} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel={itemLabel}
        />

        {/* Table */}
        <div
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden relative shadow-sm mx-2 sm:mx-0"
          data-table-container="true"
        >
          {/* Loading overlay - only show when loading and not on initial load */}
          {loading && !isInitialMount.current && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            </div>
          )}

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table
                  key={`${tableName}-table`}
                  className="w-full transition-all duration-200 ease-in-out min-w-full"
                >
                  <thead className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 border-b-2 border-emerald-500 dark:border-emerald-600">
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30 dark:border-emerald-400/30 last:border-r-0 whitespace-nowrap">
                        #
                      </th>
                      {typedColumns.map(col => (
                        <React.Fragment key={String(col.key)}>
                          <SortableHeader
                            sortKey={String(col.key)}
                            currentSortKey={sortKey}
                            currentSortDirection={sortDirection}
                            onSort={col.sortable !== false ? handleSort : noopSort}
                          >
                            {col.label}
                          </SortableHeader>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {loading && isInitialMount.current ? (
                      <tr>
                        <td
                          colSpan={typedColumns.length + 1}
                          className="px-2 sm:px-6 py-2 sm:py-4 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary" />
                            <span className="ml-2 text-xs sm:text-sm">Loading {itemLabel}...</span>
                          </div>
                        </td>
                      </tr>
                    ) : sortedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={typedColumns.length + 1}
                          className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm"
                        >
                          {searchTerm
                            ? `No ${itemLabel} found matching "${searchTerm}".`
                            : `No ${itemLabel} found.`}
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((row, index) => (
                        <TableRow key={row.id} row={row} index={index} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
