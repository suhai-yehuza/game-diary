'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';

import { BulkActionsBar } from '@/app/protected/admin/database/components/ui/bulk-actions-bar';
import { BulkDeleteDialog } from '@/app/protected/admin/database/components/ui/bulk-delete-dialog';
import { ErrorBoundary } from '@/app/protected/admin/database/components/ui/error-boundary';
import { ErrorDisplay } from '@/app/protected/admin/database/components/ui/error-display';
import { PaginationControls } from '@/app/protected/admin/database/components/ui/pagination-controls';
import { PaginationInfo } from '@/app/protected/admin/database/components/ui/pagination-info';
import { SortableHeader } from '@/app/protected/admin/database/components/ui/sortable-header';
import { TableSearch } from '@/app/protected/admin/database/components/ui/table-search';
import { API_CONFIG } from '@/lib/config/app.config';
import { errorHandlers } from '@/lib/utils/error-handler';
import type { ITableWithSearchProps } from '@/types';
import { ErrorCategory, ErrorSeverity } from '@/types';

export default function TableWithSearch<
  T extends Record<string, unknown> & { id: string | number },
>({ tableName, columns, itemLabel, additionalParams }: ITableWithSearchProps<T>) {
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

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

      if ((aValue as unknown) instanceof Date && (bValue as unknown) instanceof Date) {
        return direction === 'asc'
          ? (aValue as unknown as Date).getTime() - (bValue as unknown as Date).getTime()
          : (bValue as unknown as Date).getTime() - (aValue as unknown as Date).getTime();
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
    { key: 'all', label: 'All Fields', value: 'all' },
    ...typedColumns.map(col => ({
      key: String(col.key),
      label: col.label.charAt(0).toUpperCase() + col.label.slice(1).replace(/_/g, ' '),
      value: String(col.key),
    })),
  ];

  const handleSort = useCallback((key: string, direction?: 'asc' | 'desc' | null) => {
    console.log('Sort clicked:', key, direction);
    if (direction === null) {
      // Clear sorting
      setSortKey('');
      setSortDirection('asc');
    } else {
      // Set new sort
      setSortKey(key);
      setSortDirection(direction || 'asc');
    }
  }, []);

  const noopSort = useCallback((_key: string, _direction?: 'asc' | 'desc' | null) => {
    // No-op for non-sortable columns
  }, []);

  const handleSearchChange = useCallback(
    (term: string, field?: string) => {
      setSearchTerm(term);
      setSearchField(field || '');
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

  // Bulk selection handlers
  const handleSelectAll = useCallback(() => {
    const allIds = new Set(sortedData.map(item => item.id));
    setSelectedIds(allIds);

    // Show selection feedback
    if (allIds.size > 0) {
      toast.info(`Selected all ${allIds.size} ${itemLabel}`, {
        duration: 2000,
      });
    }
  }, [sortedData, itemLabel]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());

    // Show deselection feedback
    toast.info(`Deselected all ${itemLabel}`, {
      duration: 2000,
    });
  }, [itemLabel]);

  const handleSelectItem = useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    setShowDeleteDialog(true);

    // Show confirmation feedback
    toast.info(`Preparing to delete ${selectedIds.size} ${itemLabel}`, {
      description: 'Please confirm the deletion in the dialog.',
      duration: 3000,
    });
  }, [selectedIds.size, itemLabel]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);

    // Show loading toast
    const loadingToast = toast.loading(`Deleting ${selectedIds.size} ${itemLabel}...`, {
      description: 'Please wait while the items are being removed.',
    });

    try {
      const response = await fetch(`/api/admin/database/${tableName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds).map(id => String(id)),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete items');
      }

      const result = await response.json();
      console.log('Bulk delete result:', result);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      const deletedCount = result.data?.deletedCount || selectedIds.size;
      toast.success(`Successfully deleted ${deletedCount} ${itemLabel}`, {
        description: `${deletedCount} ${itemLabel} have been permanently removed from the database.`,
        duration: 5000,
      });

      // Clear selection and refresh data
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      setFetchTrigger(prev => prev + 1);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Failed to delete items');
      errorHandlers.api(errorObj, {
        component: 'TableWithSearch',
        action: 'Bulk delete items',
        category: ErrorCategory.API,
        severity: ErrorSeverity.HIGH,
        timestamp: new Date().toISOString(),
      });
      setError(errorObj.message);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error(`Failed to delete ${itemLabel}`, {
        description: errorObj.message,
        duration: 7000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, tableName, setFetchTrigger, itemLabel]);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

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

      // Add additional parameters if provided
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      const response = await fetch(`/api/admin/database/${tableName}?${params}`);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error ?? errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

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
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      errorHandlers.api(error, {
        component: 'TableWithSearch',
        action: 'Fetch table data',
        category: ErrorCategory.API,
        severity: ErrorSeverity.MEDIUM,
        timestamp: new Date().toISOString(),
      });
      setError(error.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, [tableName, additionalParams]);

  // Memoized table row component to prevent unnecessary re-renders
  const TableRow = React.memo(({ row, index }: { row: T; index: number }) => {
    const isSelected = selectedIds.has(row.id);

    return (
      <tr
        key={row.id}
        className={`transition-all duration-200 ease-in-out hover:bg-bg-theme-secondary border-r border-theme-primary last:border-r-0 ${
          isSelected ? 'bg-semantic-info/10' : ''
        }`}
      >
        <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectItem(row.id)}
            className="w-4 h-4 text-brand-primary bg-bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
          />
        </td>
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
    );
  });

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

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.size}
          totalCount={sortedData.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkDelete={handleBulkDelete}
          isDeleting={isDeleting}
          itemLabel={itemLabel}
        />

        {/* Pagination Info - Top */}
        <PaginationInfo
          totalCount={totalCount}
          totalItems={totalCount}
          totalPages={Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE)}
          currentPage={currentPage}
          pageSize={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
          itemsPerPage={API_CONFIG.pagination.DEFAULT_PAGE_SIZE}
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
                      <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold text-white tracking-wide border-r border-emerald-500/30 dark:border-emerald-400/30 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === sortedData.length && sortedData.length > 0}
                          onChange={
                            selectedIds.size === sortedData.length
                              ? handleDeselectAll
                              : handleSelectAll
                          }
                          className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </th>
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
                          colSpan={typedColumns.length + 2}
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
                          colSpan={typedColumns.length + 2}
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
          totalPages={Math.ceil(totalCount / API_CONFIG.pagination.DEFAULT_PAGE_SIZE)}
          currentPage={currentPage}
          pageInfo={pageInfo}
          loading={loading}
          onPageChange={(page: number) => setCurrentPage(page)}
          onFirst={handleFirst}
          onPrev={handlePrev}
          onNext={handleNext}
          onLast={handleLast}
        />

        {/* Bulk Delete Dialog */}
        <BulkDeleteDialog
          isOpen={showDeleteDialog}
          onClose={handleCloseDeleteDialog}
          onConfirm={() => void handleConfirmDelete()}
          selectedCount={selectedIds.size}
          itemLabel={itemLabel}
          isDeleting={isDeleting}
        />
      </div>
    </ErrorBoundary>
  );
}
