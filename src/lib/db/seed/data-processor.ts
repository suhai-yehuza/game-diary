import type { InferInsertModel } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import type { IDatabaseClient } from '@src/lib/types/database.types';
import type { IGlobalWithGC } from '@src/lib/types/global';

import type { OptimizedAPIClient } from './utils/api-client';
// Enhanced sleep function with jitter
const sleep = (ms: number, jitter = true) => {
  const delay = jitter ? ms + Math.random() * 1000 : ms;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Performance monitoring
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private results: Map<string, number> = new Map();

  start(operation: string) {
    this.timers.set(operation, Date.now());
  }

  end(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      throw new Error(`Timer for operation "${operation}" not found`);
    }

    const duration = Date.now() - startTime;
    this.results.set(operation, duration);
    this.timers.delete(operation);
    return duration;
  }

  getResults() {
    return Object.fromEntries(this.results);
  }

  logResults() {
    seedLogger.info('\n=== Performance Results ===');
    for (const [operation, duration] of Array.from(this.results.entries())) {
      seedLogger.info(`${operation}: ${(duration / 1000).toFixed(2)}s`);
    }
    seedLogger.info('===========================\n');
  }
}

// Memory-efficient data processor
export class DataProcessor {
  constructor(
    private db: IDatabaseClient,
    private apiClient: OptimizedAPIClient,
    private monitor: PerformanceMonitor
  ) {}

  async processInChunks<T>(
    data: T[],
    processor: (chunk: T[]) => Promise<void>,
    chunkSize: number = API_CONFIG.pagination.DEFAULT_PAGE_SIZE,
    operation: string = 'process'
  ): Promise<void> {
    this.monitor.start(operation);

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await processor(chunk);

      // Force garbage collection hint for large datasets
      if ((globalThis as IGlobalWithGC).gc && i % (chunkSize * 10) === 0) {
        const gc = (globalThis as IGlobalWithGC).gc;
        if (gc) {
          gc();
        }
      }

      seedLogger.info(
        `Processed ${Math.min(i + chunkSize, data.length)}/${data.length} ${operation} items`
      );
    }

    const duration = this.monitor.end(operation);
    seedLogger.info(`${operation} completed in ${(duration / 1000).toFixed(2)}s`);
  }

  async streamInsert<T extends PgTable>(
    table: T,
    dataGenerator: () => AsyncGenerator<InferInsertModel<T>, void, unknown>,
    batchSize: number = API_CONFIG.pagination.DEFAULT_PAGE_SIZE, // Reduced default batch size for better stability
    operation: string = 'insert'
  ): Promise<void> {
    this.monitor.start(operation);

    let batch: InferInsertModel<T>[] = [];
    let count = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    try {
      for await (const item of dataGenerator()) {
        batch.push(item);
        count++;

        if (batch.length >= batchSize) {
          try {
            await this.insertBatchWithRetry(table, batch, operation);
            batch = [];
            consecutiveErrors = 0; // Reset error counter on success

            // Add a small delay between batches to prevent overwhelming the connection
            if (count % (batchSize * 5) === 0) {
              await sleep(100, false); // Small pause every 5 batches
            }
          } catch (error) {
            consecutiveErrors++;
            seedLogger.error(
              `Error in batch insertion, consecutive errors: ${consecutiveErrors}/${maxConsecutiveErrors}`
            );

            if (consecutiveErrors >= maxConsecutiveErrors) {
              seedLogger.error(
                `Too many consecutive errors (${consecutiveErrors}), stopping stream insertion`
              );
              throw error;
            }

            // On error, wait longer and try with a smaller batch
            await sleep(2000);
            const smallerBatchSize = Math.max(10, Math.floor(batch.length / 2));
            seedLogger.info(`Retrying with smaller batch size: ${smallerBatchSize}`);

            // Split the failed batch into smaller chunks
            for (let i = 0; i < batch.length; i += smallerBatchSize) {
              const smallerBatch = batch.slice(i, i + smallerBatchSize);
              await this.insertBatchWithRetry(table, smallerBatch, operation);
              await sleep(500); // Pause between smaller batches
            }

            batch = [];
          }
        }
      }

      // Insert remaining items
      if (batch.length > 0) {
        await this.insertBatchWithRetry(table, batch, operation);
      }

      const duration = this.monitor.end(operation);
      seedLogger.info(
        `Stream inserted ${count} ${operation} items in ${(duration / 1000).toFixed(2)}s`
      );
    } catch (error) {
      seedLogger.error(`Stream insertion failed for ${operation} after ${count} items:`, error);
      throw error;
    }
  }

  private async insertBatchWithRetry<T extends PgTable>(
    table: T,
    batch: InferInsertModel<T>[],
    operation: string,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.insertBatch(table, batch, operation);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        seedLogger.error(`Batch insertion attempt ${attempt}/${maxRetries} failed:`, error);

        // Check if it's a network-related error
        const isNetworkError = this.isNetworkError(error);

        if (attempt === maxRetries || !isNetworkError) {
          // If it's the last attempt or not a network error, throw immediately
          throw error;
        }

        // Wait with exponential backoff before retrying
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        seedLogger.info(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
      }
    }

    throw lastError;
  }

  private async insertBatch<T extends PgTable>(
    table: T,
    batch: InferInsertModel<T>[],
    operation: string
  ): Promise<void> {
    try {
      await this.db.insert(table).values(batch as InferInsertModel<T>[]);
    } catch (error) {
      seedLogger.error(`Error inserting ${operation} batch:`, error);
      throw error;
    }
  }

  private isNetworkError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
    const errorCode = (error as { code?: string })?.code;

    // Check for common network error indicators
    const networkErrorIndicators = [
      'fetch failed',
      'socket',
      'network',
      'connection',
      'timeout',
      'econnreset',
      'enotfound',
      'econnrefused',
      'other side closed',
    ];

    return (
      networkErrorIndicators.some(indicator => errorMessage.includes(indicator)) ||
      errorCode === 'UND_ERR_SOCKET'
    );
  }

  logResults() {
    this.monitor.logResults();
  }
}
