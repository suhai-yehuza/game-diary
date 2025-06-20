import type { Table, InferInsertModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import type { IndexColumn } from 'drizzle-orm/pg-core';
import pLimit from 'p-limit';

import { seedLogger as logger } from '@lib/core/logger';
import { getRapidApiConfig, validateAPIKey } from '@src/lib/config/api.config';
import { DB_CONFIG } from '@src/lib/config/db.config';
import { createRapidAPIClient } from '@src/lib/external-apis';
import type { IMonitoringMetrics } from '@src/lib/types/consolidated.types';
import type { DatabaseClient, IBatchInsertOptions } from '@src/lib/types/seeding.types';
import { sleep } from '@src/lib/utils/time';

import { createDatabaseClient } from '../config';
import { getCacheManager, API_CONFIG } from '../optimization-config';

// Circuit breaker pattern implementation
class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.nextAttempt <= Date.now()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState() {
    return this.state;
  }
}

// Enhanced retry mechanism with exponential backoff and jitter
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = DB_CONFIG.seeding.external.RETRY.MAX_ATTEMPTS,
  baseDelay: number = DB_CONFIG.seeding.external.RETRY.BASE_DELAY,
  circuitBreaker?: CircuitBreaker
): Promise<T> {
  const executeOperation = circuitBreaker ? () => circuitBreaker.execute(operation) : operation;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeOperation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      // Exponential backoff with jitter
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) + jitter, 30000);

      logger.info(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

// Optimized API client with connection pooling and rate limiting
export class OptimizedAPIClient {
  private client: ReturnType<typeof createRapidAPIClient>;
  private db: DatabaseClient;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: ReturnType<typeof pLimit>;
  private requestQueue: (() => Promise<unknown>)[] = [];
  private metrics: IMonitoringMetrics = {
    timestamp: new Date(),
    queryPerformance: {},
    apiMetrics: {},
    errors: {},
    cpuUsage: 0,
  };

  constructor(concurrency: number = DB_CONFIG.seeding.external.CONCURRENT_OPERATIONS) {
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    this.client = createRapidAPIClient(apiKey);
    this.db = createDatabaseClient();
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = pLimit(concurrency);
  }

  async fetchWithRetry<T>(
    endpoint: string,
    params: Record<string, string> = {},
    operation: string = 'fetch'
  ): Promise<T> {
    return this.rateLimiter(async () => {
      logger.info(`${operation}: Fetching ${endpoint} with params:`, params);

      return withRetry(
        async () => {
          const response = await this.client.get<{ response: T }>(endpoint, { params });

          if (!response?.response) {
            throw new Error(`Invalid response structure from API: ${endpoint}`);
          }

          return response.response;
        },
        undefined,
        undefined,
        this.circuitBreaker
      );
    });
  }

  private isCamelCaseTable(table: Table): boolean {
    const drizzleNameSymbol = Symbol.for('drizzle:Name');
    const tableName =
      (table as { [drizzleNameSymbol]?: string })[drizzleNameSymbol] ||
      Object.getOwnPropertySymbols(table)
        .find(sym => String(sym).includes('drizzle:Name'))
        ?.valueOf();

    // Tables that use camelCase column names
    const camelCaseTables = ['nba_players', 'nba_games'];
    return typeof tableName === 'string' && camelCaseTables.includes(tableName);
  }

  async bulkInsertWithConflictHandling<T extends Table>(
    table: T,
    data: (InferInsertModel<T> & {
      seasonsActive?: Array<{ season: number; teamIds: string[] }>;
    })[],
    conflictTarget: IndexColumn,
    batchSize: number = 100,
    operation: string = 'insert'
  ): Promise<void> {
    if (data.length === 0) {
      logger.info(`No ${operation} data to insert, skipping...`);
      return;
    }

    logger.info(
      `Bulk inserting ${data.length} ${operation} records in batches of ${batchSize} with conflict handling`
    );

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        // Special handling for camelCase tables
        if (this.isCamelCaseTable(table)) {
          const drizzleNameSymbol = Symbol.for('drizzle:Name');
          const tableName =
            (table as { [drizzleNameSymbol]?: string })[drizzleNameSymbol] ||
            Object.getOwnPropertySymbols(table)
              .find(sym => String(sym).includes('drizzle:Name'))
              ?.valueOf();

          if (typeof tableName === 'string' && tableName === 'nba_players') {
            // Process each player individually to properly handle seasonsActive
            for (const player of batch) {
              try {
                const playerRecord = player as InferInsertModel<T> & Record<string, unknown>;
                await this.db
                  .insert(table)
                  .values(player)
                  .onConflictDoUpdate({
                    target: conflictTarget,
                    set: {
                      updatedAt: new Date(),
                      // Only update non-critical fields on conflict
                      active: playerRecord.active,
                      jersey: playerRecord.jersey,
                      seasonsActive: playerRecord.seasonsActive,
                    } as Partial<InferInsertModel<T>>,
                  });
              } catch (playerError) {
                const playerRecord = player as InferInsertModel<T> & Record<string, unknown>;
                logger.warn(
                  `Failed to insert/update player ${playerRecord.id || 'unknown'}, trying insert with ignore:`,
                  playerError
                );
                try {
                  await this.db
                    .insert(table)
                    .values(player)
                    .onConflictDoNothing({ target: conflictTarget });
                } catch (ignoreError) {
                  logger.error(
                    `Failed to insert player ${playerRecord.id || 'unknown'} even with ignore:`,
                    ignoreError
                  );
                }
              }
            }
          } else {
            // For other camelCase tables, use insert with conflict ignore
            await this.db
              .insert(table)
              .values(batch)
              .onConflictDoNothing({ target: conflictTarget });
          }
        } else {
          // For regular tables, use insert with conflict ignore
          await this.db.insert(table).values(batch).onConflictDoNothing({ target: conflictTarget });
        }

        logger.info(
          `Successfully processed batch ${Math.floor(i / batchSize) + 1} for ${operation}`
        );
      } catch (error) {
        logger.error(
          `Error inserting batch ${Math.floor(i / batchSize) + 1} for ${operation}:`,
          error
        );

        // Fallback: try individual inserts with conflict handling
        logger.info(`Attempting individual inserts for batch ${Math.floor(i / batchSize) + 1}...`);
        for (const item of batch) {
          try {
            await this.db
              .insert(table)
              .values([item])
              .onConflictDoNothing({ target: conflictTarget });
          } catch (individualError) {
            const itemRecord = item as InferInsertModel<T> & Record<string, unknown>;
            logger.warn(`Failed to insert individual item in ${operation}:`, {
              item: itemRecord.id || 'unknown',
              error: individualError,
            });
          }
        }
      }
    }
  }

  async streamProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 50,
    operation: string = 'process'
  ): Promise<R[]> {
    logger.info(`Stream processing ${items.length} ${operation} items in batches of ${batchSize}`);

    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(item => this.rateLimiter(() => processor(item)))
      );

      results.push(...batchResults);
      logger.info(
        `Processed ${operation} batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`
      );
    }

    return results;
  }

  getCircuitBreakerState() {
    return this.circuitBreaker.getState();
  }

  getDatabase() {
    return this.db;
  }

  async request<T>(url: string, options?: RequestInit): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const task = async () => {
        try {
          const startTime = Date.now();
          const response = await fetch(url, {
            ...options,
            headers: {
              'X-RapidAPI-Key': API_CONFIG.rapidApi.key,
              'X-RapidAPI-Host': API_CONFIG.rapidApi.host,
              ...options?.headers,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          const duration = Date.now() - startTime;

          // Update metrics
          this.updateMetrics(url, duration, 'success');

          resolve(result as T);
        } catch (error) {
          this.updateMetrics(url, 0, 'error');
          reject(error);
        }
      };

      this.requestQueue.push(task);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    const tasks = this.requestQueue.splice(0, this.rateLimiter.concurrency);
    await Promise.allSettled(tasks.map(task => task()));

    if (this.requestQueue.length > 0) {
      await this.processQueue();
    }
  }

  private updateMetrics(url: string, duration: number, status: 'success' | 'error'): void {
    const endpoint = new URL(url).pathname;

    if (!this.metrics.apiMetrics[endpoint]) {
      this.metrics.apiMetrics[endpoint] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        errors: 0,
        failure: 0,
        success: 0,
        avgResponseTime: 0,
      };
    }

    const metric = this.metrics.apiMetrics[endpoint];
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;

    if (status === 'success') {
      metric.success++;
    } else {
      metric.errors++;
      metric.failure++;
    }

    metric.avgResponseTime = metric.avgTime;
  }

  async batchInsert({
    table,
    data,
    batchSize = 100,
    tableName,
  }: IBatchInsertOptions): Promise<void> {
    const cache = getCacheManager();
    const cacheKey = `batch_insert_${tableName}_${data.length}`;

    // Check cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info(`Using cached batch insert for ${tableName}`);
      return;
    }

    logger.info(`Batch inserting ${data.length} records into ${tableName || 'table'}`);

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        // Remove the problematic casting - let TypeScript infer the types
        if (table && batch.length > 0) {
          await this.db.insert(table).values(batch);
        }

        logger.info(
          `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)} for ${tableName || 'table'}`
        );
      } catch (error) {
        logger.error(`Error in batch insert for ${tableName}:`, error);

        // Try individual inserts on batch failure
        for (const item of batch) {
          try {
            await this.db.insert(table).values([item]);
          } catch (individualError) {
            logger.error(`Failed to insert individual item in ${tableName}:`, individualError);
          }
        }
      }
    }

    // Cache the result
    await cache.set(cacheKey, true, 300); // Cache for 5 minutes
  }

  async executeQuery<T>(query: string, _params?: unknown[]): Promise<T[]> {
    try {
      const result = await this.db.execute(sql.raw(query));
      return result.rows as T[];
    } catch (error) {
      logger.error('Query execution failed:', error);
      throw error;
    }
  }

  getMetrics(): IMonitoringMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      timestamp: new Date(),
      queryPerformance: {},
      apiMetrics: {},
      errors: {},
      cpuUsage: 0,
    };
  }
}
