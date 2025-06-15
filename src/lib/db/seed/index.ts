import { schema } from '@src/lib/db/schema';
import type { IDatabaseConfig, IDatabaseClient } from '@src/lib/types/database.types';

import { createDatabaseClient, getDb, initializeDb, closeDb } from './config';

// Create and export the database client
export const db = createDatabaseClient({
  env: process.env.NODE_ENV || 'development',
});

// Add raw property to satisfy DatabaseClient interface
(db as typeof db & { raw: unknown; $client: unknown }).raw = (
  db as typeof db & { $client: unknown }
).$client;

// Export the schema
export { schema };

// Export database functions
export { createDatabaseClient, getDb, initializeDb, closeDb };

// Alias for getDbClient (commonly used name)
export const getDbClient = () => db;

// Export types
export type { IDatabaseConfig, IDatabaseClient };
