'use client';

import React, { useEffect, useState, useCallback } from 'react';

import formatNumberShort from '@/app/protected/admin/database/components/utils/formatNumberShort';
import { API_CONFIG } from '@/lib/config/app.config';
import type { TableWithSearchProps, ApiResponse, ColumnConfig } from '@/lib/types';
import {
  PaginationInfo,
  ErrorDisplay,
  PaginationControls,
  ErrorBoundary,
  SortableHeader,
  TableSearch,
} from '@src/app/protected/admin/database/components/ui';

// Type guard for ApiResponse
function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return 'success' in o && typeof o.success === 'boolean';
}

export function TableWithSearch<T extends { id: string | number }>({
  endpoint,
  columns,
  itemLabel,
  tableName,
}: TableWithSearchProps & { columns: ColumnConfig<T>[] }) {
  const typedColumns = columns as ColumnConfig<T>[];
  const [rawData, setRawData] = useState<T[]>([]);
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

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');

  // Ref to prevent multiple fetch calls
  const isInitialMount = React.useRef(true);
  const currentValues = React.useRef({
    searchTerm: '',
    searchField: 'all',
    sortKey: null as string | null,
    sortDirection: null as 'asc' | 'desc' | null,
    currentPage: 1,
  });

  // Update ref when state changes
  React.useEffect(() => {
    currentValues.current = {
      searchTerm,
      searchField,
      sortKey,
      sortDirection,
      currentPage,
    };
  }, [searchTerm, searchField, sortKey, sortDirection, currentPage]);

  // Generate search fields based on columns
  const searchFields = [
    { value: 'all', label: 'All Fields' },
    ...typedColumns.map(col => ({
      value: col.key,
      label: col.label.charAt(0).toUpperCase() + col.label.slice(1).replace(/_/g, ' '),
    })),
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        searchTerm: currentSearch,
        searchField: currentField,
        sortKey: currentSortKey,
        sortDirection: currentSortDirection,
        currentPage: currentPageNum,
      } = currentValues.current;

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPageNum.toString(),
        limit: API_CONFIG.pagination.DEFAULT_PAGE_SIZE.toString(),
      });

      // Add search parameters if provided
      if (currentSearch.trim()) {
        params.append('search', currentSearch.trim());
        if (currentField !== 'all') {
          params.append('searchField', currentField);
        }
      }

      // Add sort parameters if provided
      if (currentSortKey && currentSortDirection) {
        params.append('sortBy', currentSortKey);
        params.append('sortDirection', currentSortDirection);
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const jsonRaw: unknown = await res.json();
      if (!isApiResponse<T>(jsonRaw)) {
        throw new Error('Invalid API response');
      }
      const { success, error: apiError, data, pagination } = jsonRaw;
      if (!success) throw new Error(apiError ?? `Failed to fetch ${tableName}`);
      setRawData(Array.isArray(data) ? data : []);
      setTotalCount((pagination as { total?: number })?.total ?? 0);
      setCurrentPage((pagination as { page?: number })?.page ?? 1);
      setPageInfo({
        hasNextPage:
          ((pagination as { page?: number; pages?: number })?.page ?? 1) <
          ((pagination as { pages?: number })?.pages ?? 1),
        hasPreviousPage: ((pagination as { page?: number })?.page ?? 1) > 1,
        startCursor: null,
        endCursor: null,
      });
    } catch (err: unknown) {
      let message = `Failed to fetch ${tableName}`;
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
  }, [endpoint, tableName]);

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    console.log('Sorting:', key, direction); // Debug log
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback((term: string, field: string) => {
    setSearchTerm(term);
    setSearchField(field);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setSearchField('all');
    setCurrentPage(1);
  }, []);

  // No-op sort function for non-sortable columns
  const noopSort: (key: string, direction: 'asc' | 'desc' | null) => void = () => undefined;

  // Initial data fetch
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      void fetchData();
    }
  }, [fetchData]);

  // Fetch data when dependencies change (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      void fetchData();
    }
  }, [searchTerm, searchField, sortKey, sortDirection, currentPage, fetchData]);

  const handleNext = () => {
    if (pageInfo.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (pageInfo.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFirst = () => {
    setCurrentPage(1);
  };

  const handleLast = () => {
    const totalPages = Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE);
    setCurrentPage(totalPages);
  };

  return (
    <ErrorBoundary componentName={tableName + 'Table'}>
      <div className="space-y-4">
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
        <ErrorDisplay error={error} />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemLabel={formatNumberShort(totalCount) + ' total ' + itemLabel}
        />

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full transition-all duration-200 ease-in-out">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider border-b border-border">
                    #
                  </th>
                  {typedColumns.map(col => (
                    <React.Fragment key={col.key}>
                      <SortableHeader
                        sortKey={col.key}
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
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={typedColumns.length + 1} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        <span className="ml-2">Loading {itemLabel}...</span>
                      </div>
                    </td>
                  </tr>
                ) : rawData.length === 0 ? (
                  <tr>
                    <td colSpan={typedColumns.length + 1} className="px-6 py-4 text-center">
                      {searchTerm
                        ? `No ${itemLabel} found matching "${searchTerm}".`
                        : `No ${itemLabel} found.`}
                    </td>
                  </tr>
                ) : (
                  rawData.map((row, index) => (
                    <tr
                      key={row.id}
                      className="transition-colors duration-300 ease-in-out hover:bg-blue-50 dark:hover:bg-gray-400"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      {typedColumns.map(col => (
                        <td key={col.key} className="px-6 py-4 text-sm">
                          {col.render
                            ? col.render(row)
                            : (row[col.key as keyof T] as React.ReactNode)}
                        </td>
                      ))}
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
