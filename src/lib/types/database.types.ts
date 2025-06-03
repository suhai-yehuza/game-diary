import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { Pool } from 'pg';

import type * as schema from '@/lib/db/schema';

export type BaseDatabaseClient = NeonHttpDatabase<typeof schema>;

export type DatabaseRow = Record<string, unknown>;

export interface DatabaseConfig {
  env?: string;
  connectionString?: string;
  dbPool?: Pool;
}

export type DatabaseClient = BaseDatabaseClient;

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
