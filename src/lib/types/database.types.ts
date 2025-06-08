import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { Pool } from 'pg';

import type * as schema from '@src/lib/db/schema';

export type BaseDatabaseClient = NeonHttpDatabase<typeof schema>;

export type DatabaseRow = Record<string, unknown>;

export interface DatabaseConfig {
  env?: string;
  connectionString?: string;
  dbPool?: Pool;
}

export interface DatabaseClient extends NeonHttpDatabase<typeof schema> {
  raw?: unknown;
}

export interface DatabaseSeedingConfig {
  CONCURRENT_OPERATIONS: number;
  BATCH_SIZE: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
  USER_COUNT: number;
  DEFAULT_SAMPLE_COUNT: number;
}

export interface QueryOptions {
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

export interface BatchProcessor<T, R> {
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

export type UuidGenerationOptions = {
  namespace?: string;
  logProgress?: boolean;
  useV7?: boolean;
  maxRetries?: number;
  batchSize?: number;
};

// Database Seeder Types
export interface ApplicationSeederOptions {
  db?: DatabaseClient;
  apiClient: Record<string, unknown>;
  processor: Record<string, unknown>;
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
}

// Database Monitoring Types
export interface MonitoringMetrics {
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
