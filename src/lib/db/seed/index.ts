import { schema } from '@/lib/db/schema';
import type { DatabaseConfig, DatabaseClient } from '@/lib/types/db.types';

import { createDatabaseClient, getDb, initializeDb, closeDb } from './config';

// Create and export the database client
export const db: DatabaseClient = createDatabaseClient({
  env: process.env.NODE_ENV || 'development',
});

// Export the schema
export { schema };

// Export database functions
export { createDatabaseClient, getDb, initializeDb, closeDb };

// Alias for getDbClient (commonly used name)
export const getDbClient = () => db;

// Export types
export type { DatabaseConfig, DatabaseClient };
