/// <reference lib="es2015" />
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import * as schema from '@/lib/db/schema';
import { env } from '@/lib/env';
import type { BaseDatabaseClient, DatabaseConfig } from '@/lib/types';

interface RawDatabaseClient {
  execute: (query: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }>;
  query?: (query: string) => Promise<unknown>;
}

// Module-level database client
let dbClient: BaseDatabaseClient | null = null;

const getConnectionString = () => {
  return env.DATABASE_URL;
};

const createNeonClient = (connectionString: string) => {
  return neon(connectionString);
};

export const createDatabaseClient = (
  _config: DatabaseConfig = {}
): NeonHttpDatabase<typeof schema> => {
  const connectionString = getConnectionString();
  const sql = createNeonClient(connectionString);
  return drizzle(sql, { schema }) as NeonHttpDatabase<typeof schema>;
};

export const getDb = () => {
  if (!dbClient) {
    throw new Error('Database not initialized');
  }
  return dbClient;
};

export const initializeDb = () => {
  if (!dbClient) {
    dbClient = createDatabaseClient();
  }
  return dbClient;
};

export const closeDb = async () => {
  if (dbClient) {
    // Add any cleanup logic here
    dbClient = null;
  }
};

export type { DatabaseConfig };

export async function testConnection(db: BaseDatabaseClient | RawDatabaseClient): Promise<void> {
  // Try a simple query to test the connection
  if ('execute' in db && typeof db.execute === 'function') {
    await db.execute(sql`SELECT 1`);
  } else if ('query' in db && typeof db.query === 'function') {
    await db.query('SELECT 1');
  } else {
    throw new Error('Database client does not support execute or query');
  }
}
