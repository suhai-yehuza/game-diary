import { varchar, timestamp, integer } from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

// Base table configuration that can be shared across different schema files
export const baseTableConfig = {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
};

// Base game fields that can be shared between different game types
export const baseGameFields = {
  date: timestamp('date').notNull(),
  home_team_id: varchar('home_team_id', { length: 255 }).notNull(),
  away_team_id: varchar('away_team_id', { length: 255 }).notNull(),
  home_score: integer('home_score'),
  away_score: integer('away_score'),
  status: varchar('status', { length: 50 }).notNull(),
};
