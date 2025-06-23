import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@src/lib/db/schema';
import type { Database } from '@src/lib/types/infrastructure.types';

// Only create database connection if DATABASE_URL is available
let sql: ReturnType<typeof neon> | null = null;
let db: Database | null = null;

if (process.env.DATABASE_URL) {
  try {
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } catch (error) {
    console.warn('Failed to initialize database connection:', error);
  }
}

export { db };

// Create database client function for scripts
export function createDatabaseClient(_options?: { env?: string }) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

// Test database connection function for scripts
export async function testConnection(
  dbInstance?: ReturnType<typeof createDatabaseClient>
): Promise<boolean> {
  try {
    const db = dbInstance || createDatabaseClient();
    await db.execute('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
