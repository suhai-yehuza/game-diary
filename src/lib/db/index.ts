import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from '@src/lib/db/schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type Database = typeof db;

// Create database client function for scripts
export function createDatabaseClient(_options?: { env?: string }) {
  const databaseUrl = process.env.DATABASE_URL!;
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
