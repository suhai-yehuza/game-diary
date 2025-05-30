import { sql } from 'drizzle-orm';
import { pgTable, integer, text, timestamp, varchar, decimal } from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

import { nba_games } from './nba-schemas';
import { teams } from './team-schemas';
import { users } from './user-schemas';

// Games table
export const games = pgTable('games', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  gameType: varchar('gameType', { length: 50 }).notNull().default('nba'),
  nbaGameId: text('nbaGameId').references(() => nba_games.id),
  date: timestamp('date').notNull(),
  homeTeamId: varchar('homeTeamId', { length: 255 })
    .notNull()
    .references(() => teams.id),
  awayTeamId: varchar('awayTeamId', { length: 255 })
    .notNull()
    .references(() => teams.id),
  homeScore: integer('homeScore'),
  awayScore: integer('awayScore'),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Game logs table
export const game_logs = pgTable(
  'game_logs',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    userId: varchar('userId', { length: 255 }).references(() => users.id),
    gameId: text('gameId')
      .notNull()
      .references(() => nba_games.id),
    watchedSetting: varchar('watchedSetting', { length: 50 }).notNull().default('tv'),
    watchedDate: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watchedLocation: text('watchedLocation').default(''),
    ratingForGame: integer('ratingForGame').notNull(),
    ratingStars: text('ratingStars').default(''),
    watchedCount: integer('watchedCount').notNull().default(0),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
    classification: text('classification').notNull().default('PROTECTED'),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ precision: 6, withTimezone: true }),
  },
  t => [
    sql`CHECK (${t.ratingForGame} >= 1 AND ${t.ratingForGame} <= 5)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_created ON game_logs (userId, createdAt)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_game ON game_logs (gameId)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_date ON game_logs (watchedDate)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_rating ON game_logs (ratingForGame)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_watched_date ON game_logs (userId, watchedDate)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_classification ON game_logs (classification)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_setting ON game_logs (watchedSetting)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_classification ON game_logs (userId, classification)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_count ON game_logs (watchedCount)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_watched_count ON game_logs (userId, watchedCount)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_deleted_at ON game_logs (deletedAt)`,
  ]
);

// Game ratings table
export const game_ratings = pgTable('game_ratings', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  gameId: text('gameId').notNull().unique(),
  averageRating: decimal('averageRating', { precision: 3, scale: 2 }).notNull().default('0.00'),
  totalRatings: integer('totalRatings').notNull().default(0),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
});

// Team head-to-head table
export const team_h2h = pgTable(
  'team_h2h',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    team1Id: varchar('team1Id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    team2Id: varchar('team2Id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    season: integer('season').notNull(),
    last5Games: text('last5Games').array().default([]),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  _table => ({
    differentTeams: sql`CHECK (team1Id != team2Id)`,
  })
);
