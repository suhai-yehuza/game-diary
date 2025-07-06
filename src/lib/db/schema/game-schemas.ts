import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  decimal,
  unique,
  boolean,
  serial,
} from 'drizzle-orm/pg-core';

import { baseTableConfig } from '@/lib/db/schema/base-schemas';
import { users } from '@/lib/db/schema/user-schemas';
import { CLASSIFICATION, WATCHED_SETTING, WATCHED_SCOPE } from '@src/lib/types';

// Leagues table
export const leagues = pgTable('leagues', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

// Seasons table
export const seasons = pgTable('seasons', {
  id: serial('id').primaryKey(),
  year: integer('year').notNull().unique(),
});

// NBA Games table - extending base table configuration
export const nba_games = pgTable('nba_games', {
  id: varchar('id', { length: 20 }).primaryKey(), // External API game ID
  game_type: varchar('game_type', { length: 50 }).notNull().default('nba'),
  nba_game_id: varchar('nba_game_id', { length: 255 }),
  date: timestamp('date').notNull(),
  home_team_id: varchar('home_team_id', { length: 255 }).notNull(),
  away_team_id: varchar('away_team_id', { length: 255 }).notNull(),
  home_team_score: integer('home_team_score'),
  away_team_score: integer('away_team_score'),
  status: varchar('status', { length: 50 }).notNull(),
  average_rating: decimal('average_rating', { precision: 4, scale: 2 }).notNull().default('0.00'),
  total_ratings: integer('total_ratings').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Teams table
export const teams = pgTable('teams', {
  id: varchar('id', { length: 20 }).primaryKey(), // External API team ID
  name: varchar('name', { length: 255 }).notNull(),
  nickname: varchar('nickname', { length: 100 }),
  code: varchar('code', { length: 10 }),
  city: varchar('city', { length: 100 }),
  logo: text('logo'),
  all_star: boolean('all_star').notNull().default(false),
  nba_franchise: boolean('nba_franchise').notNull().default(false),
  conference: varchar('conference', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// NBA Players table
export const nba_players = pgTable('nba_players', {
  id: varchar('id', { length: 20 }).primaryKey(), // External API player ID
  first_name: varchar('first_name', { length: 100 }).notNull().default('missing-first-name'),
  last_name: varchar('last_name', { length: 100 }).notNull().default('missing-last-name'),
  birth: text('birth'), // Store as JSON string
  nba: text('nba'), // Store as JSON string
  height: text('height'), // Store as JSON string
  weight: text('weight'), // Store as JSON string
  college: varchar('college', { length: 100 }),
  affiliation: varchar('affiliation', { length: 100 }),
  teams: text('teams'), // Store as JSON string: array of { season: season_id, teams_played_for: [] }
  leagues: text('leagues'), // Store as JSON string
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp({ precision: 6, withTimezone: true }),
});

// Game logs table - extending base table configuration
export const game_logs = pgTable(
  'game_logs',
  {
    user_id: varchar('user_id', { length: 255 }).references(() => users.id, {
      onDelete: 'cascade',
    }),
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => nba_games.id, { onDelete: 'cascade' }),
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
    ...baseTableConfig,
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
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => nba_games.id, { onDelete: 'cascade' }),
    average_rating: decimal('average_rating', { precision: 4, scale: 2 }).notNull().default('0.00'),
    total_ratings: integer('total_ratings').notNull().default(0),
    ...baseTableConfig,
  },
  _table => ({
    // Add unique constraint on game_id
    uniqueGameId: unique().on(_table.game_id),
  })
);
