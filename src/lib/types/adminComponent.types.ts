/**
 * Admin Component Types
 * Type definitions for admin components
 */

import React from 'react';

// Error boundary types
export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

// Pagination types
export interface IPaginationInfoProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  itemLabel: string;
}

export interface IPaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageInfo: {
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  loading: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}

// Table search types
export interface ITableSearchProps {
  searchTerm: string;
  searchField: string;
  searchFields: { value: string; label: string }[];
  onSearchChange: (term: string, field: string) => void;
  onClear: () => void;
  placeholder?: string;
}

// Table with search types
export interface IColumnConfig<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface ITableWithSearchProps<T extends { id: string | number }> {
  data: T[];
  columns: IColumnConfig<T>[];
  onSearch: (query: string) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  searchPlaceholder?: string;
  className?: string;
  isLoading?: boolean;
}

// Error display types - using IErrorDisplayProps from commonComponent.types.ts

// Game logs table types
export type ClassificationType = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

// Note: IGameLog already exists in gameLog.types.ts
