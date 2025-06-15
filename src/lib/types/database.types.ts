import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { Pool } from 'pg';

import type * as schema from '@src/lib/db/schema';
import type { OptimizedAPIClient } from '@src/lib/db/seed/utils/api-client';

export type IBaseDatabaseClient = NeonHttpDatabase<typeof schema>;

export type IDatabaseRow = Record<string, unknown>;

export interface IDatabaseConfig {
  env?: string;
  connectionString?: string;
  dbPool?: Pool;
}

export interface IDatabaseClient extends NeonHttpDatabase<typeof schema> {
  raw?: unknown;
}

export interface IDatabaseSeedingConfig {
  CONCURRENT_OPERATIONS: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  USER_COUNT: number;
  DEFAULT_SAMPLE_COUNT: number;
}

export interface IQueryOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  retries?: number; // Alias for retryAttempts for backward compatibility
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    direction: 'asc' | 'desc';
  };
  where?: Record<string, unknown>;
}

export interface IBatchProcessor<T, R> {
  processFn: (batch: T[], context?: Record<string, unknown>) => Promise<R>;
  context?: Record<string, unknown>;
}

export class UuidGenerationError extends Error {
  code: string;
  details?: string;

  constructor(message: string, code: string = 'UUID_GENERATION_ERROR', details?: string) {
    super(message);
    this.name = 'UuidGenerationError';
    this.code = code;
    this.details = details;
  }
}

export interface IUuidGenerationOptions {
  namespace?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

// Database Seeder Types
export interface IApplicationSeederOptions {
  db?: IDatabaseClient;
  apiClient: OptimizedAPIClient;
  processor: import('@src/lib/db/seed/data-processor').DataProcessor;
  tables?: string[];
  appendingData?: boolean;
  env?: string;
  shouldResetDb?: boolean;
  shouldTruncateTables?: boolean;
  seasons?: number[];
  skipExternalDb?: boolean;
  skipApplicationDb?: boolean;
  concurrency?: number;
  batchSize?: number;
  enableMonitoring?: boolean;
  skipUsers?: boolean;
  startDate?: string;
}

// Database Monitoring Types
export interface IMonitoringMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  queryPerformance: {
    [key: string]: {
      count: number;
      totalTime: number;
      avgTime: number;
    };
  };
  apiCalls: {
    [key: string]: number;
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    size: number;
  };
  apiMetrics: {
    [key: string]: {
      count: number;
      success: number;
      failure: number;
      avgResponseTime: number;
    };
  };
  errors: {
    [key: string]: number;
  };
}
