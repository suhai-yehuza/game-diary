import { varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Simple UUID generator
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

// Common field generators
export const createIdField = () => ({
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
});

export const createTimestampFields = () => ({
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Base table configuration that can be shared across different schema files
export const baseTableConfig = {
  ...createIdField(),
  ...createTimestampFields(),
};
