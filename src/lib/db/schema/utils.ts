import { sql, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { varchar, timestamp } from 'drizzle-orm/pg-core';

import type { SoftDeletableTable } from '@src/lib/types';
import { generateUUID } from '@src/lib/utils/processing';

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
  users: async (db: NeonHttpDatabase<{ users: SoftDeletableTable }>, userId: string) => {
    const { users } = await import('./user-schemas');
    return await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId));
  },

  gameLogs: async (db: NeonHttpDatabase<{ game_logs: SoftDeletableTable }>, gameLogId: string) => {
    const { game_logs } = await import('./game-schemas');
    return await db
      .update(game_logs)
      .set({ deletedAt: new Date() })
      .where(eq(game_logs.id, gameLogId));
  },

  comments: async (db: NeonHttpDatabase<{ comments: SoftDeletableTable }>, commentId: string) => {
    const { comments } = await import('./user-schemas');
    return await db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(eq(comments.id, commentId));
  },

  // Helper function to check if a record is soft deleted
  isDeleted: (record: { deletedAt: Date | null }) => {
    return record.deletedAt !== null;
  },

  // Helper function to filter out soft deleted records
  filterDeleted: <T extends { deletedAt: Date | null }>(records: T[]) => {
    return records.filter(record => record.deletedAt === null);
  },
};
