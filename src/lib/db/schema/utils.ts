import { sql, eq } from 'drizzle-orm';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { varchar, timestamp } from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

import { SoftDeletableTable } from './shared-types';

// Import required types for the functions below

// Define JsonValue locally to avoid circular dependency
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Common field generators
export const createIdField = () => ({
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
});

export const createTimestampFields = () => ({
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const createSoftDeleteField = () => ({
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Index creation helper
export const createIndex = (name: string, table: string, columns: string[]) =>
  sql`CREATE INDEX IF NOT EXISTS ${sql.identifier(name)} ON ${sql.identifier(table)} (${sql.join(
    columns.map(col => sql.identifier(col))
  )})`;

// Soft delete helper functions
export const softDelete = {
  users: async (db: NeonHttpDatabase<{ users: SoftDeletableTable }>, userId: string) => {
    const { users } = await import('./user-schemas');
    return await db.update(users).set({ deleted_at: new Date() }).where(eq(users.id, userId));
  },

  gameLogs: async (db: NeonHttpDatabase<{ game_logs: SoftDeletableTable }>, gameLogId: string) => {
    const { game_logs } = await import('./game-schemas');
    return await db
      .update(game_logs)
      .set({ deleted_at: new Date() })
      .where(eq(game_logs.id, gameLogId));
  },

  comments: async (db: NeonHttpDatabase<{ comments: SoftDeletableTable }>, commentId: string) => {
    const { comments } = await import('./user-schemas');
    return await db
      .update(comments)
      .set({ deleted_at: new Date() })
      .where(eq(comments.id, commentId));
  },

  // Helper function to check if a record is soft deleted
  isDeleted: (record: { deleted_at: Date | null }) => {
    return record.deleted_at !== null;
  },

  // Helper function to filter out soft deleted records
  filterDeleted: <T extends { deleted_at: Date | null }>(records: T[]) => {
    return records.filter(record => record.deleted_at === null);
  },
};
