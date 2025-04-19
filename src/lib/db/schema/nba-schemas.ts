import { sql } from 'drizzle-orm';
import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  unique,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

import { generateUUID } from '@/lib/utils/index.processing';

import { baseTableConfig, baseGameFields } from './base-schemas';
import { JsonValue } from './shared-types';
import { teams as baseTeams } from './team-schemas';

// NBA Teams table extends base teams
export const teams = baseTeams;

// NBA Games table
export const nba_games = pgTable(
  'nba_games',
  {
    ...baseTableConfig,
    league: text('league').notNull(),
    season_id: integer('season_id').notNull(),
    ...baseGameFields,
    stage: integer('stage').notNull(),
    periods: jsonb('periods').$type<{
      current: number;
      total: number;
      endOfPeriod: boolean;
    }>(),
    arena: jsonb('arena').$type<{
      name: string;
      city: string;
    }>(),
    teams: jsonb('teams').$type<{
      home: {
        id: string;
        name: string;
        nickname: string;
        logo?: string;
      };
      visitors: {
        id: string;
        name: string;
        nickname: string;
        logo?: string;
      };
    }>(),
    scores: jsonb('scores').$type<{
      home: {
        points: number;
      };
      visitors: {
        points: number;
      };
    }>(),
    officials: jsonb('officials').$type<string[]>(),
    times_tied: integer('times_tied'),
    lead_changes: integer('lead_changes'),
    nugget: text('nugget'),
    season: integer('season').notNull(),
  },
  _table => ({
    gameSeasonIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_season ON nba_games (season_id)`,
    gameDateIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_date ON nba_games ((date->>'start'))`,
    gameLeagueIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_league ON nba_games (league)`,
    seasonFk: sql`ALTER TABLE nba_games ADD CONSTRAINT fk_nba_games_season FOREIGN KEY (season_id) REFERENCES seasons(id)`,
  })
);

// Team H2H table
export const team_h2h = pgTable(
  'team_h2h',
  {
    id: text('id').primaryKey().default(generateUUID()),
    team1_id: text('team1_id').notNull(),
    team2_id: text('team2_id').notNull(),
    season_id: integer('season_id')
      .notNull()
      .references(() => seasons.id),
    total_games: integer('total_games').notNull().default(0),
    team1_wins: integer('team1_wins').notNull().default(0),
    team2_wins: integer('team2_wins').notNull().default(0),
    last_5_games: jsonb('last_5_games').notNull().default([]), // Array of game IDs
    average_points_team1: numeric('average_points_team1', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    average_points_team2: numeric('average_points_team2', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  _table => ({
    seasonFk: sql`ALTER TABLE team_h2h ADD CONSTRAINT fk_team_h2h_season FOREIGN KEY (season_id) REFERENCES seasons(id)`,
  })
);

// Seasons table
export const seasons = pgTable('seasons', {
  id: integer('id').primaryKey(),
  year: integer('year').notNull(),
  display_year: text('display_year').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  is_current: boolean('is_current').notNull().default(false),
  is_playoffs: boolean('is_playoffs').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// NBA Players table
export const nba_players = pgTable('nba_players', {
  id: text('id').primaryKey(),
  firstname: varchar('firstname').notNull(),
  lastname: varchar('lastname').notNull(),
  birth: jsonb('birth'),
  nba: jsonb('nba'),
  height: jsonb('height'),
  weight: jsonb('weight'),
  college: varchar('college'),
  affiliation: varchar('affiliation'),
  jersey: varchar('jersey'),
  active: boolean('active').default(true),
  pos: varchar('pos'),
  seasons_active: jsonb('seasons_active').$type<Array<{ season: number; team_ids: string[] }>>(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

// NBA Player Stats table
export const nba_player_stats = pgTable('nba_player_stats', {
  id: text('id').primaryKey(),
  player_id: text('player_id')
    .notNull()
    .references(() => nba_players.id),
  game_id: text('game_id')
    .notNull()
    .references(() => nba_games.id),
  team_id: text('team_id')
    .notNull()
    .references(() => teams.id),
  points: integer('points'),
  assists: integer('assists'),
  rebounds: integer('rebounds'),
  steals: integer('steals'),
  blocks: integer('blocks'),
  turnovers: integer('turnovers'),
  fouls: integer('fouls'),
  minutes: varchar('minutes'),
  field_goals_made: integer('field_goals_made'),
  field_goals_attempted: integer('field_goals_attempted'),
  three_pointers_made: integer('three_pointers_made'),
  three_pointers_attempted: integer('three_pointers_attempted'),
  free_throws_made: integer('free_throws_made'),
  free_throws_attempted: integer('free_throws_attempted'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

// Game stats table
export const game_stats = pgTable(
  'game_stats',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    game_id: varchar('game_id', { length: 255 })
      .notNull()
      .references(() => nba_games.id),
    season_id: integer('season_id')
      .notNull()
      .references(() => seasons.id),
    home_team_id: varchar('home_team_id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    away_team_id: varchar('away_team_id', { length: 255 })
      .notNull()
      .references(() => teams.id),
    game_date: timestamp('game_date').notNull(),
    home_score: integer('home_score'),
    away_score: integer('away_score'),
    status: varchar('status', { length: 50 }).notNull(),
    // Home team statistics
    home_fast_break_points: integer('home_fast_break_points'),
    home_points_in_paint: integer('home_points_in_paint'),
    home_biggest_lead: integer('home_biggest_lead'),
    home_second_chance_points: integer('home_second_chance_points'),
    home_points_off_turnovers: integer('home_points_off_turnovers'),
    home_longest_run: integer('home_longest_run'),
    home_fgm: integer('home_fgm'),
    home_fga: integer('home_fga'),
    home_fgp: numeric('home_fgp', { precision: 5, scale: 2 }),
    home_ftm: integer('home_ftm'),
    home_fta: integer('home_fta'),
    home_ftp: numeric('home_ftp', { precision: 5, scale: 2 }),
    home_tpm: integer('home_tpm'),
    home_tpa: integer('home_tpa'),
    home_tpp: numeric('home_tpp', { precision: 5, scale: 2 }),
    home_off_reb: integer('home_off_reb'),
    home_def_reb: integer('home_def_reb'),
    home_tot_reb: integer('home_tot_reb'),
    home_assists: integer('home_assists'),
    home_p_fouls: integer('home_p_fouls'),
    home_steals: integer('home_steals'),
    home_turnovers: integer('home_turnovers'),
    home_blocks: integer('home_blocks'),
    home_plus_minus: integer('home_plus_minus'),
    home_minutes: varchar('home_minutes', { length: 10 }),
    // Away team statistics
    away_fast_break_points: integer('away_fast_break_points'),
    away_points_in_paint: integer('away_points_in_paint'),
    away_biggest_lead: integer('away_biggest_lead'),
    away_second_chance_points: integer('away_second_chance_points'),
    away_points_off_turnovers: integer('away_points_off_turnovers'),
    away_longest_run: integer('away_longest_run'),
    away_fgm: integer('away_fgm'),
    away_fga: integer('away_fga'),
    away_fgp: numeric('away_fgp', { precision: 5, scale: 2 }),
    away_ftm: integer('away_ftm'),
    away_fta: integer('away_fta'),
    away_ftp: numeric('away_ftp', { precision: 5, scale: 2 }),
    away_tpm: integer('away_tpm'),
    away_tpa: integer('away_tpa'),
    away_tpp: numeric('away_tpp', { precision: 5, scale: 2 }),
    away_off_reb: integer('away_off_reb'),
    away_def_reb: integer('away_def_reb'),
    away_tot_reb: integer('away_tot_reb'),
    away_assists: integer('away_assists'),
    away_p_fouls: integer('away_p_fouls'),
    away_steals: integer('away_steals'),
    away_turnovers: integer('away_turnovers'),
    away_blocks: integer('away_blocks'),
    away_plus_minus: integer('away_plus_minus'),
    away_minutes: varchar('away_minutes', { length: 10 }),
    stats: jsonb('stats').$type<JsonValue>(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  _table => ({
    // Ensure home_team_id and away_team_id are different
    differentTeams: sql`CHECK (home_team_id != away_team_id)`,
    // Ensure game_id is unique
    uniqueGame: unique().on(_table.game_id),
  })
);
