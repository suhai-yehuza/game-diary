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

import { JsonValue } from './shared-types';
import { teams as baseTeams } from './team-schemas';

// NBA Teams table extends base teams
export const teams = baseTeams;

// NBA Games table
export const nba_games = pgTable(
  'nba_games',
  {
    id: text('id').primaryKey().default(generateUUID()),
    league: text('league').notNull(),
    season: integer('season').notNull(),
    date: jsonb('date').$type<{
      start: string;
      end: string | null;
      duration: string | null;
    }>(),
    stage: integer('stage').notNull(),
    status: jsonb('status').$type<{
      clock: string | null;
      halftime: boolean;
      short: number | string;
      long: string;
    }>(),
    periods: jsonb('periods').$type<{
      current: number;
      total: number;
      endOfPeriod: boolean;
    }>(),
    arena: jsonb('arena').$type<{
      name: string;
      city: string;
      state: string | null;
      country: string | null;
    }>(),
    teams: jsonb('teams').$type<{
      home: {
        id: number;
        name: string;
        nickname: string;
        code: string;
        logo: string;
      };
      visitors: {
        id: number;
        name: string;
        nickname: string;
        code: string;
        logo: string;
      };
    }>(),
    scores: jsonb('scores').$type<{
      home: {
        win: number;
        loss: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
        points: number;
      };
      visitors: {
        win: number;
        loss: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
        points: number;
      };
    }>(),
    officials: jsonb('officials').$type<string[]>(),
    timesTied: integer('timesTied'),
    leadChanges: integer('leadChanges'),
    nugget: text('nugget'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  _table => ({
    gameSeasonIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_season ON nba_games (season)`,
    gameDateIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_date ON nba_games ((date->>'start'))`,
    gameLeagueIndex: sql`CREATE INDEX IF NOT EXISTS idx_nba_games_league ON nba_games (league)`,
  })
);

// Team H2H table
export const team_h2h = pgTable(
  'team_h2h',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    team1Id: varchar('team1Id', { length: 255 }).notNull(),
    team2Id: varchar('team2Id', { length: 255 }).notNull(),
    season: integer('season')
      .notNull()
      .references(() => seasons.id),
    totalGames: integer('totalGames').notNull().default(0),
    team1Wins: integer('team1Wins').notNull().default(0),
    team2Wins: integer('team2Wins').notNull().default(0),
    last5Games: jsonb('last5Games').notNull().default([]), // Array of game IDs
    averagePointsTeam1: numeric('averagePointsTeam1', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    averagePointsTeam2: numeric('averagePointsTeam2', { precision: 5, scale: 2 })
      .notNull()
      .default('0.00'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  _table => ({
    seasonFk: sql`ALTER TABLE team_h2h ADD CONSTRAINT fk_team_h2h_season FOREIGN KEY (season) REFERENCES seasons(id)`,
  })
);

// Seasons table
export const seasons = pgTable('seasons', {
  id: integer('id').primaryKey(),
  year: integer('year').notNull(),
  displayYear: text('displayYear').notNull(),
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(),
  isCurrent: boolean('isCurrent').notNull().default(false),
  isPlayoffs: boolean('isPlayoffs').notNull().default(false),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// NBA Players table
export const nba_players = pgTable('nba_players', {
  id: varchar('id', { length: 255 }).primaryKey(),
  firstName: varchar('firstName', { length: 255 }).notNull(),
  lastName: varchar('lastName', { length: 255 }).notNull(),
  birth: jsonb('birth'),
  nba: jsonb('nba'),
  height: jsonb('height'),
  weight: jsonb('weight'),
  college: varchar('college', { length: 255 }),
  affiliation: varchar('affiliation', { length: 255 }),
  jersey: varchar('jersey', { length: 10 }),
  active: boolean('active').default(true),
  pos: varchar('pos', { length: 10 }),
  seasonsActive: jsonb('seasonsActive').$type<Array<{ season: number; teamIds: string[] }>>(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

// NBA Player Stats table
export const nba_player_stats = pgTable('nba_player_stats', {
  id: varchar('id', { length: 255 }).primaryKey(),
  playerId: varchar('playerId', { length: 255 })
    .notNull()
    .references(() => nba_players.id),
  gameId: varchar('gameId', { length: 255 })
    .notNull()
    .references(() => nba_games.id),
  teamId: varchar('teamId', { length: 255 })
    .notNull()
    .references(() => teams.id),
  points: integer('points'),
  assists: integer('assists'),
  rebounds: integer('rebounds'),
  steals: integer('steals'),
  blocks: integer('blocks'),
  turnovers: integer('turnovers'),
  fouls: integer('fouls'),
  minutes: varchar('minutes', { length: 10 }),
  fieldGoalsMade: integer('fieldGoalsMade'),
  fieldGoalsAttempted: integer('fieldGoalsAttempted'),
  threePointersMade: integer('threePointersMade'),
  threePointersAttempted: integer('threePointersAttempted'),
  freeThrowsMade: integer('freeThrowsMade'),
  freeThrowsAttempted: integer('freeThrowsAttempted'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

// Game stats table
export const game_stats = pgTable(
  'game_stats',
  {
    id: varchar('id', { length: 255 }).primaryKey().default(generateUUID()),
    gameId: varchar('gameId', { length: 255 })
      .notNull()
      .references(() => nba_games.id),
    seasonId: integer('seasonId')
      .notNull()
      .references(() => seasons.id),
    homeTeamId: varchar('homeTeamId', { length: 255 })
      .notNull()
      .references(() => teams.id),
    awayTeamId: varchar('awayTeamId', { length: 255 })
      .notNull()
      .references(() => teams.id),
    gameDate: timestamp('gameDate').notNull(),
    homeScore: integer('homeScore'),
    awayScore: integer('awayScore'),
    status: varchar('status', { length: 50 }).notNull(),
    // Home team statistics
    homeFastBreakPoints: integer('homeFastBreakPoints'),
    homePointsInPaint: integer('homePointsInPaint'),
    homeBiggestLead: integer('homeBiggestLead'),
    homeSecondChancePoints: integer('homeSecondChancePoints'),
    homePointsOffTurnovers: integer('homePointsOffTurnovers'),
    homeLongestRun: integer('homeLongestRun'),
    homeFgm: integer('homeFgm'),
    homeFga: integer('homeFga'),
    homeFgp: numeric('homeFgp', { precision: 5, scale: 2 }),
    homeFtm: integer('homeFtm'),
    homeFta: integer('homeFta'),
    homeFtp: numeric('homeFtp', { precision: 5, scale: 2 }),
    homeTpm: integer('homeTpm'),
    homeTpa: integer('homeTpa'),
    homeTpp: numeric('homeTpp', { precision: 5, scale: 2 }),
    homeOffReb: integer('homeOffReb'),
    homeDefReb: integer('homeDefReb'),
    homeTotReb: integer('homeTotReb'),
    homeAssists: integer('homeAssists'),
    homePFouls: integer('homePFouls'),
    homeSteals: integer('homeSteals'),
    homeTurnovers: integer('homeTurnovers'),
    homeBlocks: integer('homeBlocks'),
    homePlusMinus: integer('homePlusMinus'),
    homeMinutes: varchar('homeMinutes', { length: 10 }),
    // Away team statistics
    awayFastBreakPoints: integer('awayFastBreakPoints'),
    awayPointsInPaint: integer('awayPointsInPaint'),
    awayBiggestLead: integer('awayBiggestLead'),
    awaySecondChancePoints: integer('awaySecondChancePoints'),
    awayPointsOffTurnovers: integer('awayPointsOffTurnovers'),
    awayLongestRun: integer('awayLongestRun'),
    awayFgm: integer('awayFgm'),
    awayFga: integer('awayFga'),
    awayFgp: numeric('awayFgp', { precision: 5, scale: 2 }),
    awayFtm: integer('awayFtm'),
    awayFta: integer('awayFta'),
    awayFtp: numeric('awayFtp', { precision: 5, scale: 2 }),
    awayTpm: integer('awayTpm'),
    awayTpa: integer('awayTpa'),
    awayTpp: numeric('awayTpp', { precision: 5, scale: 2 }),
    awayOffReb: integer('awayOffReb'),
    awayDefReb: integer('awayDefReb'),
    awayTotReb: integer('awayTotReb'),
    awayAssists: integer('awayAssists'),
    awayPFouls: integer('awayPFouls'),
    awaySteals: integer('awaySteals'),
    awayTurnovers: integer('awayTurnovers'),
    awayBlocks: integer('awayBlocks'),
    awayPlusMinus: integer('awayPlusMinus'),
    awayMinutes: varchar('awayMinutes', { length: 10 }),
    stats: jsonb('stats').$type<JsonValue>(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  _table => ({
    // Ensure homeTeamId and awayTeamId are different
    differentTeams: sql`CHECK (homeTeamId != awayTeamId)`,
    // Ensure gameId is unique
    uniqueGame: unique().on(_table.gameId),
  })
);
