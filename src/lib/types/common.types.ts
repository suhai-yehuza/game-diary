// Common utility types that are used across multiple domains

// Re-export types from config.types.ts to maintain backward compatibility
export type { ConferenceType, DivisionType } from './config.types';

// Common Types
export type SortDirection = 'asc' | 'desc';

// Pagination Types
export interface PaginationInput {
  page: number;
  limit: number;
}

export interface ConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  sortBy: string;
  sortDirection: SortDirection;
}

export interface FilterParams {
  search?: string;
  [key: string]: unknown;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// Database Types
export interface RawDatabaseClient {
  execute: (query: string) => Promise<{ rows: unknown[] }>;
  query?: (query: string) => Promise<unknown>;
}

// Script Options
export interface ScriptOptions {
  env?: string;
  dryRun?: boolean;
  runTests?: boolean;
  verbose?: boolean;
}

// Trigger Setup Options
export interface TriggerSetupOptions {
  env?: string;
  dropExisting?: boolean;
  skipVerification?: boolean;
}

// Migration Types
export interface Migration {
  name: string;
  path: string;
  content: string;
  checksum: string;
}

export interface MigrationVerification {
  tables?: string[];
  functions?: string[];
  triggers?: string[];
  indexes?: string[];
}

export interface MigrationVersion {
  name: string;
  checksum: string;
  executed_at: string;
  execution_time_ms: number;
  status: string;
  error_message?: string;
  rollback_executed: boolean;
}

export interface BaseError {
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

export interface DatabaseClientOptions {
  enableLogs?: boolean;
  disablePreparedStatements?: boolean;
  schema?: Record<string, unknown>;
  execute: (query: string) => Promise<{ rows: unknown[] }>;
}
