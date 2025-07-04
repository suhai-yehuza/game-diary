import { pgTable, integer, text, timestamp, varchar, decimal, unique } from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { users } from '@/lib/db/schema/user-schemas';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@src/lib/types';

// Games table - extending base table configuration
export const games = pgTable('games', {
  ...baseTableConfig,
  gameType: varchar('gameType', { length: 50 }).notNull().default('nba'),
  nbaGameId: varchar('nbaGameId', { length: 255 }),
  date: timestamp('date').notNull(),
  homeTeamId: varchar('homeTeamId', { length: 255 }).notNull(),
  awayTeamId: varchar('awayTeamId', { length: 255 }).notNull(),
  homeTeamScore: integer('homeTeamScore'),
  awayTeamScore: integer('awayTeamScore'),
  status: varchar('status', { length: 50 }).notNull(),
});

// Game logs table - extending base table configuration
export const game_logs = pgTable(
  'game_logs',
  {
    ...baseTableConfig,
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    gameId: varchar('gameId', { length: 255 })
      .notNull()
      .references(() => games.id),
    classification: varchar('classification', { length: 50 })
      .notNull()
      .default(CLASSIFICATION.PROTECTED),
    watchedSetting: varchar('watchedSetting', { length: 50 }).notNull().default(WATCHED_SETTING.TV),
    watchedScope: varchar('watchedScope', { length: 50 })
      .notNull()
      .default(WATCHED_SCOPE.FULL_GAME),
    watchedDate: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watchedLocation: varchar('watchedLocation', { length: 255 }).default(''),
    ratingForGame: integer('ratingForGame').notNull(),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
  },
  _table => ({
    // Ensure a user can only have one game log per game
    userGameUnique: unique().on(_table.userId, _table.gameId),
  })
);

// Game ratings table - extending base table configuration
export const game_ratings = pgTable(
  'game_ratings',
  {
    ...baseTableConfig,
    gameId: varchar('gameId', { length: 255 })
      .notNull()
      .references(() => games.id),
    averageRating: decimal('averageRating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    totalRatings: integer('totalRatings').notNull().default(0),
  },
  _table => ({
    // Add unique constraint on gameId
    uniqueGameId: unique().on(_table.gameId),
  })
);
