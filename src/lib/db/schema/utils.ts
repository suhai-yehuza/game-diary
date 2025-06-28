import { sql } from 'drizzle-orm';
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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const createSoftDeleteField = () => ({
  deletedAt: timestamp({ precision: 6, withTimezone: true }),
});

// Index creation helper
export const createIndex = (name: string, table: string, columns: string[]) =>
  sql`CREATE INDEX IF NOT EXISTS ${sql.identifier(name)} ON ${sql.identifier(table)} (${sql.join(
    columns.map(col => sql.identifier(col))
  )})`;

// Soft delete helper functions
export const softDelete = {
  // Helper function to check if a record is soft deleted
  isDeleted: (record: { deletedAt: Date | null }) => {
    return record.deletedAt !== null;
  },

  // Helper function to filter out soft deleted records
  filterDeleted: <T extends { deletedAt: Date | null }>(records: T[]) => {
    return records.filter(record => record.deletedAt === null);
  },
};
