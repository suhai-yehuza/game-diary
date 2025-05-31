import { sql } from 'drizzle-orm';
import { pgTable, integer, text, timestamp, varchar, decimal, unique } from 'drizzle-orm/pg-core';

import { CLASSIFICATIONS, WATCHED_SETTING, WATCHED_SCOPE } from '@/lib/types/config.types';
import { generateUUID } from '@/lib/utils/index.processing';

import { nba_games } from './nba-schemas';
import { teams } from './team-schemas';
import { users } from './user-schemas';

// Games table
export const games = pgTable('games', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  gameType: varchar('gameType', { length: 50 }).notNull().default('nba'),
  nbaGameId: varchar('nbaGameId', { length: 255 }).references(() => nba_games.id),
  date: timestamp('date').notNull(),
  homeTeamId: varchar('homeTeamId', { length: 255 })
    .notNull()
    .references(() => teams.id),
  awayTeamId: varchar('awayTeamId', { length: 255 })
    .notNull()
    .references(() => teams.id),
  homeTeamScore: integer('homeTeamScore'),
  awayTeamScore: integer('awayTeamScore'),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt').default(sql`null`),
});

// Game logs table
export const game_logs = pgTable(
  'game_logs',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    gameId: varchar('gameId', { length: 255 })
      .notNull()
      .references(() => nba_games.id),
    classification: varchar('classification', { length: 50 })
      .notNull()
      .default(CLASSIFICATIONS.PROTECTED),
    watchedSetting: varchar('watchedSetting', { length: 50 }).notNull().default(WATCHED_SETTING.TV),
    watchedScope: varchar('watchedScope', { length: 50 })
      .notNull()
      .default(WATCHED_SCOPE.FULL_GAME),
    watchedDate: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watchedLocation: varchar('watchedLocation', { length: 255 }).default(''),
    ratingForGame: integer('ratingForGame').notNull(),
    ratingStars: varchar('ratingStars', { length: 10 }).notNull().default(''),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ precision: 6, withTimezone: true }),
  },
  _table => ({
    // Ensure userId and gameId are different
    differentUserGame: sql`CHECK (userId != gameId)`,
  })
);

// Game ratings table
export const game_ratings = pgTable(
  'game_ratings',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    gameId: varchar('gameId', { length: 255 })
      .notNull()
      .references(() => nba_games.id),
    averageRating: decimal('averageRating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    totalRatings: integer('totalRatings').notNull().default(0),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt').default(sql`null`),
  },
  _table => ({
    // Add unique constraint on gameId
    uniqueGameId: unique().on(_table.gameId),
  })
);
