import type { InferInsertModel } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

import type { DatabaseClient } from '@/lib/types/db.types';

import { OptimizedAPIClient } from './utils/api-client';

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
    console.log('\n=== Performance Results ===');
    for (const [operation, duration] of this.results) {
      console.log(`${operation}: ${(duration / 1000).toFixed(2)}s`);
    }
    console.log('===========================\n');
  }
}

// Memory-efficient data processor
export class DataProcessor {
  constructor(
    private db: DatabaseClient,
    private apiClient: OptimizedAPIClient,
    private monitor: PerformanceMonitor
  ) {}

  async processInChunks<T>(
    data: T[],
    processor: (chunk: T[]) => Promise<void>,
    chunkSize: number = 1000,
    operation: string = 'process'
  ): Promise<void> {
    this.monitor.start(operation);

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await processor(chunk);

      // Force garbage collection hint for large datasets
      if (global.gc && i % (chunkSize * 10) === 0) {
        global.gc();
      }

      console.log(
        `Processed ${Math.min(i + chunkSize, data.length)}/${data.length} ${operation} items`
      );
    }

    const duration = this.monitor.end(operation);
    console.log(`${operation} completed in ${(duration / 1000).toFixed(2)}s`);
  }

  async streamInsert<T extends PgTable>(
    table: T,
    dataGenerator: () => AsyncGenerator<InferInsertModel<T>, void, unknown>,
    batchSize: number = 500,
    operation: string = 'insert'
  ): Promise<void> {
    this.monitor.start(operation);

    let batch: InferInsertModel<T>[] = [];
    let count = 0;

    for await (const item of dataGenerator()) {
      batch.push(item);
      count++;

      if (batch.length >= batchSize) {
        await this.insertBatch(table, batch, operation);
        batch = [];
      }
    }

    // Insert remaining items
    if (batch.length > 0) {
      await this.insertBatch(table, batch, operation);
    }

    const duration = this.monitor.end(operation);
    console.log(`Stream inserted ${count} ${operation} items in ${(duration / 1000).toFixed(2)}s`);
  }

  private async insertBatch<T extends PgTable>(
    table: T,
    batch: InferInsertModel<T>[],
    operation: string
  ): Promise<void> {
    try {
      await this.db.insert(table).values(batch as InferInsertModel<T>[]);
    } catch (error) {
      console.error(`Error inserting ${operation} batch:`, error);
      throw error;
    }
  }

  logResults() {
    this.monitor.logResults();
  }
}
