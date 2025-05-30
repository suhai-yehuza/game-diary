import { sql } from 'drizzle-orm';
import { pgTable, integer, text, timestamp, varchar, decimal } from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

import { nba_games } from './nba-schemas';
import { teams } from './team-schemas';
import { users } from './user-schemas';

// Games table
export const games = pgTable('games', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  game_type: varchar('game_type', { length: 50 }).notNull().default('nba'),
  nba_game_id: text('nba_game_id').references(() => nba_games.id),
  date: timestamp('date').notNull(),
  home_team_id: varchar('home_team_id', { length: 255 })
    .notNull()
    .references(() => teams.id),
  away_team_id: varchar('away_team_id', { length: 255 })
    .notNull()
    .references(() => teams.id),
  home_score: integer('home_score'),
  away_score: integer('away_score'),
  status: varchar('status', { length: 50 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Game logs table
export const game_logs = pgTable(
  'game_logs',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    user_id: varchar('user_id', { length: 255 }).references(() => users.id),
    game_id: text('game_id')
      .notNull()
      .references(() => nba_games.id),
    watched_setting: varchar('watched_setting', { length: 50 }).notNull().default('tv'),
    watched_date: timestamp({ precision: 6, withTimezone: true }).notNull(),
    watched_location: text('watched_location').default(''),
    rating_for_game: integer('rating_for_game').notNull(),
    rating_stars: text('rating_stars').default(''),
    watched_count: integer('watched_count').notNull().default(0),
    notes: text('notes').default(''),
    tags: text('tags').array().default([]),
    classification: text('classification').notNull().default('PROTECTED'),
    created_at: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
    deleted_at: timestamp({ precision: 6, withTimezone: true }),
  },
  t => [
    sql`CHECK (${t.rating_for_game} >= 1 AND ${t.rating_for_game} <= 5)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_created ON game_logs (user_id, created_at)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_game ON game_logs (game_id)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_date ON game_logs (watched_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_rating ON game_logs (rating_for_game)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_watched_date ON game_logs (user_id, watched_date)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_classification ON game_logs (classification)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_setting ON game_logs (watched_setting)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_classification ON game_logs (user_id, classification)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_watched_count ON game_logs (watched_count)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_user_watched_count ON game_logs (user_id, watched_count)`,
    sql`CREATE INDEX IF NOT EXISTS idx_game_logs_deleted_at ON game_logs (deleted_at)`,
  ]
);

// Game ratings table
export const game_ratings = pgTable('game_ratings', {
  id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
  game_id: text('game_id').notNull().unique(),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
  total_ratings: integer('total_ratings').notNull().default(0),
  created_at: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ precision: 6, withTimezone: true }).notNull().defaultNow(),
});

// Team head-to-head table
export const team_h2h = pgTable(
  'team_h2h',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    team1_id: varchar('team1_id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    team2_id: varchar('team2_id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    season_id: integer('season_id').notNull(),
    last_5_games: text('last_5_games').array().default([]),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  _table => ({
    differentTeams: sql`CHECK (team1_id != team2_id)`,
  })
);
