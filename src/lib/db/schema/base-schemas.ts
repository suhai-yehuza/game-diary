import { varchar, timestamp } from 'drizzle-orm/pg-core';

import { generateUUIDv7 } from '@src/lib/utils/id-generator';

/**
 * Enhanced ID generator using UUID v7 for better collision resistance and time-ordering
 */
function generateId(): string {
  return generateUUIDv7();
}

// Common field generators
export const createIdField = () => ({
  id: varchar('id', { length: 255 }).primaryKey().default(generateId()),
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
