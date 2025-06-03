import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { getCache } from '@/lib/cache';
import { schema as dbSchema } from '@/lib/db/schema';
import type { Schema } from '@/lib/db/schema/types';
import { env as appEnv } from '@/lib/env';
import { CACHE_TTL } from '@/lib/types/cache.types';
import { type QueryOptions } from '@/lib/types/database.types';
import { dbEnvSchema } from '@/lib/validations/env';

// Initialize cache
const cache = getCache();

// Validate database-specific environment variables only
const _dbEnv = dbEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_CONNECTION_TIMEOUT: process.env.DATABASE_CONNECTION_TIMEOUT,
  DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE,
  DATABASE_RETRY_ATTEMPTS: process.env.DATABASE_RETRY_ATTEMPTS,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REDIS_URL: process.env.REDIS_URL,
});

// Configure neon for better stability
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
// Add connection timeout and retry settings
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    // Add connection timeout
    signal: AbortSignal.timeout(30000), // 30 second timeout
    // Add keep-alive for connection reuse
    keepalive: true,
  });
};

// Create database connection with error handling
let sql;
try {
  sql = neon(appEnv.DATABASE_URL);
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to establish database connection:', error);
  throw new Error(
    'Database connection failed. Please check your network connection and database URL.'
  );
}

// Initialize database with schema
export const db = drizzle(sql, {
  schema: dbSchema,
}) as NeonHttpDatabase<Schema>;

// Query optimization utilities with proper type safety
export const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = CACHE_TTL.USER_GAME_LOGS // Default to user game logs cache TTL
): Promise<T> => {
  try {
    const cached = await cache.get<T>(key);
    if (cached) return cached;

    const data = await fetchFn();
    await cache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`Cache operation failed for key ${key}:`, error);
    // Fallback to direct fetch if cache fails
    return fetchFn();
  }
};

// Batch query optimization with proper error handling
export const batchQuery = async <T extends { id: string }>(
  ids: string[],
  queryFn: (ids: string[]) => Promise<T[]>,
  cacheKeyFn: (id: string) => string,
  ttl = CACHE_TTL.GAME // Default to game cache TTL
): Promise<Map<string, T>> => {
  try {
    // Try to get from cache first
    const cachedResults = new Map<string, T>();

    // Get cached results
    for (const id of ids) {
      const key = cacheKeyFn(id);
      const cached = await cache.get<T>(key);
      if (cached) {
        cachedResults.set(id, cached);
      }
    }

    const missingIds = ids.filter(id => !cachedResults.has(id));

    if (missingIds.length === 0) {
      return cachedResults;
    }

    // Query missing items
    const results = await queryFn(missingIds);

    // Cache new results
    for (const result of results) {
      const key = cacheKeyFn(result.id);
      await cache.set(key, result, ttl);
      cachedResults.set(result.id, result);
    }

    return cachedResults;
  } catch (error) {
    console.error('Batch query operation failed:', error);
    // Fallback to direct query if cache fails
    const results = await queryFn(ids);
    return new Map(results.map(result => [result.id, result]));
  }
};

// Query performance monitoring with proper logging
export const monitorQuery = async <T>(
  name: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): Promise<T> => {
  const {
    timeout = 30000, // 30 seconds default timeout
    retries = 3,
    retryDelay = 1000, // 1 second default retry delay
  } = options;

  const start = performance.now();
  let attempts = 0;

  while (attempts < retries) {
    try {
      const result = await Promise.race([
        queryFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Query timeout after ${timeout}ms`)), timeout)
        ),
      ]);

      const duration = performance.now() - start;

      // Log query performance
      if (duration > 1000) {
        console.warn(`Slow query detected: ${name} took ${duration.toFixed(2)}ms`);
      } else if (appEnv.NODE_ENV === 'development') {
        console.debug(`Query completed: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      attempts++;
      const duration = performance.now() - start;

      if (attempts === retries) {
        console.error(
          `Query failed after ${retries} attempts: ${name} took ${duration.toFixed(2)}ms`,
          error
        );
        throw error;
      }

      console.warn(
        `Query attempt ${attempts} failed: ${name} took ${duration.toFixed(2)}ms, retrying...`,
        error
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
    }
  }

  throw new Error(`Query failed after ${retries} attempts`);
};

// Database transaction wrapper with proper error handling
export async function withDb<T>(
  callback: (db: NeonHttpDatabase<Schema>) => Promise<T>,
  options: QueryOptions = {}
): Promise<T> {
  return monitorQuery(
    'withDb',
    async () => {
      try {
        const result = await callback(db);
        return result;
      } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
      }
    },
    options
  );
}

// Export types
export type { NeonHttpDatabase };
export type { Schema };

// Export schema
export { dbSchema as schema };
