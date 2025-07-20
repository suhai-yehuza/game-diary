import React, { useState, useCallback, useMemo } from 'react';

import { ErrorBoundary } from '@/app/protected/admin/database/components/ui/error-boundary';
import { PaginationControls } from '@/app/protected/admin/database/components/ui/pagination-controls';
import { TableSearch } from '@/app/protected/admin/database/components/ui/table-search';
import type { IDataTableProps } from '@/lib/types';

export function DataTable<T extends Record<string, unknown>>({
  data,
  loading,
  error,
  pagination,
  columns,
  onPageChange,
  onSearchChange,
  onSearchClear,
  searchTerm = '',
  searchField = 'all',
  searchFields,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  className = '',
}: IDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc' | null) => {
    setSortKey(direction ? key : null);
    setSortDirection(direction);
  }, []);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection || data.length === 0) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle object values safely
      let aStr: string;
      let bStr: string;

      if (typeof aValue === 'object' && aValue !== null) {
        aStr = JSON.stringify(aValue);
      } else if (typeof aValue === 'string') {
        aStr = aValue;
      } else if (typeof aValue === 'number') {
        aStr = aValue.toString();
      } else if (typeof aValue === 'boolean') {
        aStr = aValue ? 'true' : 'false';
      } else if (typeof aValue === 'symbol') {
        aStr = aValue.toString();
      } else if (typeof aValue === 'function') {
        aStr = '[Function]';
      } else if (typeof aValue === 'bigint') {
        aStr = aValue.toString();
      } else {
        aStr = '[Unknown]';
      }

      if (typeof bValue === 'object' && bValue !== null) {
        bStr = JSON.stringify(bValue);
      } else if (typeof bValue === 'string') {
        bStr = bValue;
      } else if (typeof bValue === 'number') {
        bStr = bValue.toString();
      } else if (typeof bValue === 'boolean') {
        bStr = bValue ? 'true' : 'false';
      } else if (typeof bValue === 'symbol') {
        bStr = bValue.toString();
      } else if (typeof bValue === 'function') {
        bStr = '[Function]';
      } else if (typeof bValue === 'bigint') {
        bStr = bValue.toString();
      } else {
        bStr = '[Unknown]';
      }

      const comparison = aStr.localeCompare(bStr);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const SortableHeader = ({
    children,
    columnKey,
    sortable = true,
  }: {
    children: React.ReactNode;
    columnKey: string;
    sortable?: boolean;
  }) => {
    if (!sortable) {
      return <th className="px-4 py-2 text-left font-medium">{children}</th>;
    }

    const isActive = sortKey === columnKey;
    const isAsc = isActive && sortDirection === 'asc';

    const handleClick = () => {
      if (!isActive) {
        handleSort(columnKey, 'asc');
      } else if (isAsc) {
        handleSort(columnKey, 'desc');
      } else {
        handleSort(columnKey, null);
      }
    };

    return (
      <th
        className="px-4 py-2 text-left font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={handleClick}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive && <span className="text-gray-500">{isAsc ? '↑' : '↓'}</span>}
        </div>
      </th>
    );
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object' && value !== null) {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    // Handle other types explicitly to avoid String() on objects
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'bigint') return value.toString();
    return '[Unknown]';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={className}>
        {onSearchChange && searchFields && (
          <div className="mb-4">
            <TableSearch
              searchTerm={searchTerm}
              searchField={searchField}
              searchFields={searchFields}
              onSearchChange={onSearchChange}
              onClear={
                onSearchClear ??
                (() => {
                  // Clear search functionality
                })
              }
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map(column => (
                  <SortableHeader
                    key={column.key}
                    columnKey={column.key}
                    sortable={column.sortable}
                  >
                    {column.label}
                  </SortableHeader>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => {
                  // Create a stable key using row data if available, otherwise use index
                  const rowId = row.id;
                  const rowKey = row.key;
                  const stableKey =
                    (typeof rowId === 'string' && rowId) ||
                    (typeof rowKey === 'string' && rowKey) ||
                    `row-${index}`;
                  return (
                    <tr
                      key={stableKey}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {columns.map(column => (
                        <td key={column.key} className="px-4 py-2">
                          {column.render
                            ? column.render(row[column.key], row)
                            : formatValue(row[column.key])}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="mt-4">
            <PaginationControls
              totalCount={pagination.total}
              currentPage={pagination.page}
              pageInfo={{
                hasPreviousPage: pagination.page > 1,
                hasNextPage: pagination.page < pagination.pages,
              }}
              loading={loading}
              onFirst={() => onPageChange(1)}
              onPrev={() => onPageChange(pagination.page - 1)}
              onNext={() => onPageChange(pagination.page + 1)}
              onLast={() => onPageChange(pagination.pages)}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
