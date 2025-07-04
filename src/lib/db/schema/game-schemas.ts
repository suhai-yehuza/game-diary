import { pgTable, integer, text, timestamp, varchar, decimal, unique } from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { users } from '@/lib/db/schema/user-schemas';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@src/lib/types';

// Games table - extending base table configuration
export const games = pgTable('games', {
  ...baseTableConfig,
  game_type: varchar('game_type', { length: 50 }).notNull().default('nba'),
  nba_game_id: varchar('nba_game_id', { length: 255 }),
  date: timestamp('date').notNull(),
  home_team_id: varchar('home_team_id', { length: 255 }).notNull(),
  away_team_id: varchar('away_team_id', { length: 255 }).notNull(),
  home_team_score: integer('home_team_score'),
  away_team_score: integer('away_team_score'),
  status: varchar('status', { length: 50 }).notNull(),
});

// Game logs table - extending base table configuration
export const game_logs = pgTable(
  'game_logs',
  {
    ...baseTableConfig,
    user_id: varchar('user_id', { length: 255 }).references(() => users.id),
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => games.id),
    classification: varchar('classification', { length: 50 })
      .notNull()
      .default(CLASSIFICATION.PROTECTED),
    watched_setting: varchar('watched_setting', { length: 50 })
      .notNull()
      .default(WATCHED_SETTING.TV),
    watched_scope: varchar('watched_scope', { length: 50 })
      .notNull()
      .default(WATCHED_SCOPE.FULL_GAME),
    watched_date: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watched_location: varchar('watched_location', { length: 255 }).default(''),
    rating_for_game: integer('rating_for_game').notNull(),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
  },
  _table => ({
    // Ensure a user can only have one game log per game
    userGameUnique: unique().on(_table.user_id, _table.game_id),
  })
);

// Game ratings table - extending base table configuration
export const game_ratings = pgTable(
  'game_ratings',
  {
    ...baseTableConfig,
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => games.id),
    average_rating: decimal('average_rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    total_ratings: integer('total_ratings').notNull().default(0),
  },
  _table => ({
    // Add unique constraint on game_id
    uniqueGameId: unique().on(_table.game_id),
  })
);
