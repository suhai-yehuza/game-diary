// Common utility types that are used across multiple domains

// Re-export types from config.types.ts to maintain backward compatibility
export type { IConferenceType, IDivisionType } from './config.types';

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

// Database Types
export interface IRawDatabaseClient {
  execute: (query: string) => Promise<{ rows: unknown[] }>;
  query?: (query: string) => Promise<unknown>;
}

// Script Options
export interface IScriptOptions {
  env?: string;
  dryRun?: boolean;
  runTests?: boolean;
  verbose?: boolean;
}

// Trigger Setup Options
export interface ITriggerSetupOptions {
  env?: string;
  dropExisting?: boolean;
  skipVerification?: boolean;
}

// Migration Types
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

export interface IDatabaseClientOptions {
  enableLogs?: boolean;
  disablePreparedStatements?: boolean;
  schema?: Record<string, unknown>;
  execute: (query: string) => Promise<{ rows: unknown[] }>;
}
