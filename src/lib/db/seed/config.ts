/// <reference lib="es2015" />
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { logger } from '@lib/core/logger';
import * as schema from '@src/lib/db/schema';
import type { IDatabaseClient } from '@src/lib/types';
import { envSchema } from '@src/lib/validations/env';

// Module-level database client
let dbClient: IDatabaseClient | null = null;

const getConnectionString = () => {
  const env = envSchema.parse(process.env);
  return env.DATABASE_URL;
};

const createNeonClient = (connectionString: string) => {
  return neon(connectionString);
};

export const createDatabaseClient = (
  _config: Record<string, unknown> = {}
): NeonHttpDatabase<typeof schema> => {
  const connectionString = getConnectionString();
  const sql = createNeonClient(connectionString);
  const db = drizzle(sql, { schema });

  // Add raw property to satisfy DatabaseClient interface
  (db as typeof db & { raw: unknown }).raw = sql;

  return db;
};

export const getDb = (): NeonHttpDatabase<typeof schema> => {
  if (!dbClient) {
    throw new Error('Database not initialized');
  }
  return dbClient as unknown as NeonHttpDatabase<typeof schema>;
};

export const initializeDb = (): NeonHttpDatabase<typeof schema> => {
  if (!dbClient) {
    dbClient = createDatabaseClient() as unknown as IDatabaseClient;
  }
  return dbClient as unknown as NeonHttpDatabase<typeof schema>;
};

export const closeDb = async (): Promise<void> => {
  if (dbClient && 'close' in dbClient && typeof dbClient.close === 'function') {
    await dbClient.close();
  }
  dbClient = null;
};

export async function testConnection(db: NeonHttpDatabase<typeof schema>): Promise<void> {
  try {
    // Try a simple query to test the connection
    await db.execute(`SELECT 1 as test`);
    logger.info('Database connection test successful');
  } catch (error) {
    logger.error('Database connection test failed:', error);
    throw new Error('Database connection test failed');
  }
}
