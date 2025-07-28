/**
 * Core Types
 * Common utility types, pagination, search, and database-related types
 */

import type { ISortDirection } from './ui.types';

// ========================================
// COMMON UTILITY TYPES
// ========================================

// Common Types

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

// ========================================
// VALIDATION TYPES
// ========================================

import { z } from 'zod';

// Environment validation schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DATABASE_CONNECTION_TIMEOUT: z.string().optional(),
  DATABASE_POOL_SIZE: z.string().optional(),
  DATABASE_RETRY_ATTEMPTS: z.string().optional(),
  ANALYZE: z.string().optional(),
  DEBUG: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_HOST: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().optional(),
  DATA_ENCRYPTION_KEY: z.string().optional(),
});

export type IEnv = z.infer<typeof envSchema>;

// ========================================
// SPORTS TYPES
// ========================================

export const SPORTS_CONFIG = {
  nba: {
    name: 'NBA',
    fullName: 'National Basketball Association',
    description: 'National Basketball Association - Live scores, stats, and more',
    color: 'bg-orange-600 hover:bg-orange-700',
    href: '/sports/nba',
    icon: '🏀',
  },
  nfl: {
    name: 'NFL',
    fullName: 'National Football League',
    description: 'National Football League - Live scores, stats, and more',
    color: 'bg-blue-600 hover:bg-blue-700',
    href: '/sports/nfl',
    icon: '🏈',
  },
  mlb: {
    name: 'MLB',
    fullName: 'Major League Baseball',
    description: 'Major League Baseball - Live scores, stats, and more',
    color: 'bg-red-600 hover:bg-red-700',
    href: '/sports/mlb',
    icon: '⚾',
  },
  nhl: {
    name: 'NHL',
    fullName: 'National Hockey League',
    description: 'National Hockey League - Live scores, stats, and more',
    color: 'bg-gray-800 hover:bg-gray-900',
    href: '/sports/nhl',
    icon: '🏒',
  },
  mls: {
    name: 'MLS',
    fullName: 'Major League Soccer',
    description: 'Major League Soccer - Live scores, stats, and more',
    color: 'bg-green-600 hover:bg-green-700',
    href: '/sports/mls',
    icon: '⚽',
  },
} as const;

export type SportKey = keyof typeof SPORTS_CONFIG;

// ========================================
// GRAPHQL TYPES
// ========================================

// User resolver types
export interface IUserParent {
  id: string;
  email_address?: string | null;
  phone_number?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}

export interface IUserArgs {
  id?: string;
}
