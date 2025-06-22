import { integer, varchar, timestamp } from 'drizzle-orm/pg-core';

/**
 * Simple UUID generator
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

// Base table configuration that can be shared across different schema files
export const baseTableConfig = {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
};

// Base game fields that can be shared between different game types
export const baseGameFields = {
  date: timestamp('date').notNull(),
  homeTeamId: varchar('homeTeamId', { length: 255 }).notNull(),
  awayTeamId: varchar('awayTeamId', { length: 255 }).notNull(),
  homeTeamScore: integer('homeTeamScore'),
  awayTeamScore: integer('awayTeamScore'),
  status: varchar('status', { length: 50 }).notNull(),
};
