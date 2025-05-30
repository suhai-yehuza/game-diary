import { varchar, timestamp, integer } from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

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
  homeScore: integer('homeScore'),
  awayScore: integer('awayScore'),
  status: varchar('status', { length: 50 }).notNull(),
};
