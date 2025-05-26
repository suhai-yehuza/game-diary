import { sql } from 'drizzle-orm';
import type { Table, InferInsertModel } from 'drizzle-orm';
import type { IndexColumn, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import pLimit from 'p-limit';

import { getRapidApiConfig } from '@/lib/config/api.config';
import { DB_CONFIG } from '@/lib/config/db.config';
import { createRapidAPIClient, validateAPIKey } from '@/lib/external-apis';
import type { DatabaseClient } from '@/lib/types/db.types';
import { sleep } from '@/lib/utils/index.time';

import { createDatabaseClient } from '../config';

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

      console.log(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
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
      console.log(`${operation}: Fetching ${endpoint} with params:`, params);

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

  private isNbaPlayersTable(table: Table): boolean {
    return 'name' in table && table.name === 'nba_players';
  }

  async bulkInsertWithConflictHandling<T extends Table>(
    table: T,
    data: (InferInsertModel<T> & {
      seasons_active?: Array<{ season: number; team_ids: string[] }>;
    })[],
    conflictTarget: IndexColumn,
    batchSize: number = 100,
    operation: string = 'insert'
  ): Promise<void> {
    if (data.length === 0) {
      console.log(`No ${operation} data to insert, skipping...`);
      return;
    }

    console.log(`Bulk inserting ${data.length} ${operation} records in batches of ${batchSize}`);

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      try {
        // Special handling for nba_players table
        if (this.isNbaPlayersTable(table)) {
          // Process each player individually to properly handle seasons_active
          for (const player of batch) {
            await this.db
              .insert(table)
              .values(player)
              .onConflictDoUpdate({
                target: conflictTarget,
                set: {
                  firstname: sql`EXCLUDED.firstname`,
                  lastname: sql`EXCLUDED.lastname`,
                  birth: sql`EXCLUDED.birth`,
                  nba: sql`EXCLUDED.nba`,
                  height: sql`EXCLUDED.height`,
                  weight: sql`EXCLUDED.weight`,
                  college: sql`EXCLUDED.college`,
                  affiliation: sql`EXCLUDED.affiliation`,
                  jersey: sql`EXCLUDED.jersey`,
                  active: sql`EXCLUDED.active`,
                  pos: sql`EXCLUDED.pos`,
                  seasons_active: sql`CASE
                    WHEN nba_players.seasons_active IS NULL THEN EXCLUDED.seasons_active
                    WHEN NOT EXISTS (
                      SELECT 1
                      FROM unnest(nba_players.seasons_active) AS existing_season
                      WHERE existing_season->>'season' = EXCLUDED.seasons_active[1]->>'season'
                    ) THEN nba_players.seasons_active || EXCLUDED.seasons_active
                    ELSE (
                      SELECT jsonb_agg(
                        CASE
                          WHEN season->>'season' = EXCLUDED.seasons_active[1]->>'season' THEN
                            jsonb_build_object(
                              'season', season->>'season',
                              'team_ids', (
                                SELECT jsonb_agg(DISTINCT team_id)
                                FROM (
                                  SELECT jsonb_array_elements_text(season->'team_ids') AS team_id
                                  UNION
                                  SELECT jsonb_array_elements_text(EXCLUDED.seasons_active[1]->'team_ids')
                                ) AS combined_teams
                              )
                            )
                          ELSE season
                        END
                      )
                      FROM jsonb_array_elements(nba_players.seasons_active) AS season
                    )
                  END`,
                  updated_at: sql`EXCLUDED.updated_at`,
                },
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
                  .filter(key => key !== 'id' && key !== 'created_at')
                  .map(key => [key, sql`EXCLUDED.${sql.raw(key)}`])
              ) as PgUpdateSetSource<T>,
            });
        }
      } catch (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
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
    console.log(`Stream processing ${items.length} ${operation} items in batches of ${batchSize}`);

    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(item => this.rateLimiter(() => processor(item)))
      );

      results.push(...batchResults);
      console.log(
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
