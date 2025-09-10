/**
 * @fileoverview Database connection management and utilities
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import { logger } from '@src/lib/utils/logger';
import { createDatabaseClient } from '@src/lib/db';

// Configure neon for better stability
neonConfig.wsProxy = host => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;
neonConfig.fetchFunction = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'User-Agent': 'Game-Diary-DB-Manager/1.0',
    },
  });
};

// Create SQL client (lazy initialization)
let _sqlClient: ReturnType<typeof neon> | null = null;

export function getSqlClient() {
  if (!_sqlClient) {
    if (!process.env.DATABASE_URL) {
      console.log(
        'Available env vars:',
        Object.keys(process.env).filter(k => k.includes('DATABASE'))
      );
      throw new Error('DATABASE_URL environment variable is not set');
    }
    console.log('DATABASE_URL found, length:', process.env.DATABASE_URL.length);
    _sqlClient = neon(process.env.DATABASE_URL);
  }
  return _sqlClient;
}

// Export the getter function for use in other modules
export { getSqlClient as sqlClient };

/**
 * Verify database connection
 */
export async function verifyConnection(): Promise<boolean> {
  try {
    console.log('Attempting to verify connection...');
    const client = getSqlClient();
    console.log('Got SQL client, attempting query...');
    await client`SELECT 1 as test`;
    logger.info('✅ Database connection verified');
    return true;
  } catch (error) {
    console.log('Connection verification error:', error);
    logger.error(
      'Database connection verification failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

/**
 * Ensure database connection with retries
 */
export async function ensureConnection(): Promise<void> {
  let attempts = 0;
  const maxAttempts = 5;
  const delay = 1000;

  while (attempts < maxAttempts) {
    const isConnected = await verifyConnection();
    if (isConnected) {
      return;
    }
    attempts++;
    if (attempts === maxAttempts) {
      throw new Error('Failed to establish database connection after multiple attempts');
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Create database client for specific environment
 */
export function createDbClient(environment: string) {
  return createDatabaseClient({ env: environment });
}
