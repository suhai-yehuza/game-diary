import { sql, type Table, type InferInsertModel } from 'drizzle-orm';
import type { IndexColumn, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import pLimit from 'p-limit';

import { getRapidApiConfig, validateAPIKey } from '@/lib/config/api.config';
import { DB_CONFIG } from '@/lib/config/db.config';
import { createRapidAPIClient } from '@/lib/external-apis';
import type { DatabaseClient } from '@/lib/types/database.types';
import { sleep } from '@/lib/utils/index.time';

import { createDatabaseClient } from '../config';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
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

    logger.info(`Bulk inserting ${data.length} ${operation} records in batches of ${batchSize}`);

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
              await this.db
                .insert(table)
                .values(player)
                .onConflictDoUpdate({
                  target: conflictTarget,
                  set: {
                    firstName: sql`EXCLUDED."firstName"`,
                    lastName: sql`EXCLUDED."lastName"`,
                    birth: sql`EXCLUDED.birth`,
                    nba: sql`EXCLUDED.nba`,
                    height: sql`EXCLUDED.height`,
                    weight: sql`EXCLUDED.weight`,
                    college: sql`EXCLUDED.college`,
                    affiliation: sql`EXCLUDED.affiliation`,
                    jersey: sql`EXCLUDED.jersey`,
                    active: sql`EXCLUDED.active`,
                    pos: sql`EXCLUDED.pos`,
                    seasonsActive: sql`CASE
                      WHEN nba_players."seasonsActive" IS NULL THEN EXCLUDED."seasonsActive"
                      WHEN NOT EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(nba_players."seasonsActive") AS existing_season
                        WHERE existing_season->>'season' = EXCLUDED."seasonsActive"[1]->>'season'
                      ) THEN nba_players."seasonsActive" || EXCLUDED."seasonsActive"
                      ELSE (
                        SELECT jsonb_agg(
                          CASE
                            WHEN season->>'season' = EXCLUDED."seasonsActive"[1]->>'season' THEN
                              jsonb_build_object(
                                'season', season->>'season',
                                'teamIds', (
                                  SELECT jsonb_agg(DISTINCT teamId)
                                  FROM (
                                    SELECT jsonb_array_elements_text(season->'teamIds') AS teamId
                                    UNION
                                    SELECT jsonb_array_elements_text(EXCLUDED."seasonsActive"[1]->'teamIds')
                                  ) AS combined_teams
                                )
                              )
                            ELSE season
                          END
                        )
                        FROM jsonb_array_elements(nba_players."seasonsActive") AS season
                      )
                    END`,
                    updatedAt: sql`EXCLUDED."updatedAt"`,
                  },
                });
            }
          } else {
            // For other camelCase tables, use standard upsert with quoted column names
            await this.db
              .insert(table)
              .values(batch)
              .onConflictDoUpdate({
                target: conflictTarget,
                set: Object.fromEntries(
                  Object.keys(batch[0])
                    .filter(key => key !== 'id' && key !== 'createdAt')
                    .map(key => [key, sql`EXCLUDED.${sql.raw(`"${key}"`)}`])
                ) as PgUpdateSetSource<T>,
              });
          }
        } else {
          // For other tables, use standard upsert
          await this.db
            .insert(table)
            .values(batch)
            .onConflictDoUpdate({
              target: conflictTarget,
              set: Object.fromEntries(
                Object.keys(batch[0])
                  .filter(key => key !== 'id' && key !== 'createdAt')
                  .map(key => [key, sql`EXCLUDED.${sql.raw('"' + key + '"')}`])
              ) as PgUpdateSetSource<T>,
            });
        }
      } catch (error) {
        logger.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
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
}
