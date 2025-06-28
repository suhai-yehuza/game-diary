/**
 * Core Types
 * Common utility types, pagination, search, and database-related types
 */

// ========================================
// COMMON UTILITY TYPES
// ========================================

// Common Types
export type ISortDirection = 'asc' | 'desc';

// Pagination Types
export interface IPaginationInput {
  page: number;
  limit: number;
}

export interface IConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

export interface IEdge<T> {
  cursor: string;
  node: T;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
}

export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface ISortParams {
  sortBy: string;
  sortDirection: ISortDirection;
}

export interface IFilterParams {
  search?: string;
  [key: string]: unknown;
}

export interface IQueryParams extends IPaginationParams, ISortParams, IFilterParams {}

// Apollo Client Pagination (simplified)
export interface IPaginationHookOptions<T> {
  pageSize: number;
  fetchMore: (options: unknown) => Promise<unknown>;
  data?: {
    edges?: Array<{
      node: T;
    }>;
  };
  hasNextPage?: boolean;
  filters?: Record<string, unknown>;
}

export interface IPaginationFetchResult {
  games?: {
    edges?: Array<{
      node: unknown;
    }>;
    pageInfo?: {
      endCursor?: string;
    };
  };
  gameLogs?: {
    edges?: Array<{
      node: unknown;
    }>;
    pageInfo?: {
      endCursor?: string;
    };
  };
}

// ========================================
// SEARCH TYPES
// ========================================

export interface IFilterConfig {
  defaultValue: string | number | boolean;
  type?: 'string' | 'number' | 'boolean';
  label?: string;
  options?: Array<{
    value: string | number | boolean;
    label: string;
  }>;
}

export interface IUseSearchFiltersOptions {
  filterConfig: Record<string, IFilterConfig>;
  additionalFilters?: Record<string, string | number | boolean>;
}

// ========================================
// DATABASE TYPES
// ========================================

export interface IRawDatabaseClient {
  execute: (query: string) => Promise<{ rows: unknown[] }>;
  query?: (query: string) => Promise<unknown>;
}

export interface IDatabaseClientOptions {
  enableLogs?: boolean;
  disablePreparedStatements?: boolean;
  schema?: Record<string, unknown>;
  execute: (query: string) => Promise<{ rows: unknown[] }>;
}

// ========================================
// SCRIPT & MIGRATION TYPES
// ========================================

export interface IScriptOptions {
  env?: string;
  environment?: string; // Legacy support
  dryRun?: boolean;
  runTests?: boolean;
  verbose?: boolean;
  mode?: string; // For scripts that support different modes (e.g., 'complete', 'triggers-only', 'basic', 'full')
  test?: boolean; // Alternative to runTests for consistency
}

export interface ITriggerSetupOptions {
  env?: string;
  dropExisting?: boolean;
  skipVerification?: boolean;
}

export interface IMigration {
  name: string;
  path: string;
  content: string;
  checksum: string;
}

export interface IMigrationVerification {
  version: string;
  isValid: boolean;
  tables?: string[];
  functions?: string[];
  triggers?: string[];
  indexes?: string[];
  added?: {
    tables?: string[];
    functions?: string[];
    triggers?: string[];
    indexes?: string[];
  };
  removed?: {
    tables?: string[];
    functions?: string[];
    triggers?: string[];
    indexes?: string[];
  };
}

export interface IMigrationVersion {
  name: string;
  checksum: string;
  executed_at: string;
  execution_time_ms: number;
  status: string;
  error_message?: string;
  rollback_executed: boolean;
}

// ========================================
// ERROR TYPES
// ========================================

export interface IBaseError {
  error: Error;
  component: string;
  errorInfo: {
    componentStack: string;
  };
  timestamp: Date;
  userId?: string;
  stack?: string;
  errorBoundary?: string;
  [key: string]: unknown;
}

// ========================================
// PERFORMANCE TYPES
// ========================================

export interface IPerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: {
    total: number;
    pages: Record<string, number>;
    chunks: Record<string, number>;
  };
  typecheck: {
    time: number;
    errors: number;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
  timestamp?: string;
  [key: string]: unknown;
}

export interface IPerformanceTrend {
  trend: 'up' | 'down' | 'stable' | 'improving' | 'degrading';
  change: number;
  period: string;
  metric?: string;
  current?: number;
  previous?: number;
  changePercent?: number;
}

// ========================================
// DEPENDENCY MANAGEMENT TYPES
// ========================================

export interface IOutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  type: 'dependencies' | 'devDependencies';
}

// ========================================
// LOGGING TYPES
// ========================================

// Log level constants
const LOG_LEVEL_VALUES = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export enum LogLevel {
  DEBUG = LOG_LEVEL_VALUES.DEBUG,
  INFO = LOG_LEVEL_VALUES.INFO,
  WARN = LOG_LEVEL_VALUES.WARN,
  ERROR = LOG_LEVEL_VALUES.ERROR,
}

export interface ILoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  enableFileInfo: boolean;
  prefix?: string;
}
