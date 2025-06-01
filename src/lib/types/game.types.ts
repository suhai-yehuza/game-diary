/**
 * Game-related type definitions for the application.
 * This file contains types for game data, statistics, and API responses.
 */

import { ApolloError } from '@apollo/client';
import type { InferSelectModel } from 'drizzle-orm';

import { nba_games } from '@/lib/db/schema/nba-schemas';
import type { GameStatusValue } from '@/lib/types/config.types';

import type {
  Game,
  GameLog,
  Player,
  Reaction,
  TeamStats,
  Team,
  Classification,
  SortDirection,
} from './generated/graphql';
import type { GameTeamStatistics } from './shared.types';
import type { CustomTeam } from './team.types';

// Re-export types from generated/graphql
export type { Game, GameLog, Player, Reaction, Team, Classification };

// Database Types
export type DBGameRecord = InferSelectModel<typeof nba_games>;

// API Response Types
export interface APITeamResponse {
  id: number;
  name: string;
  code: string;
}

// Game Statistics Types
export interface GameStatistics {
  playerId: string;
  teamId: string;
  minutes: string;
  minutesPlayed: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
    percentage: string;
  };
  threePointers: {
    made: number;
    attempted: number;
    percentage: string;
  };
  freeThrows: {
    made: number;
    attempted: number;
    percentage: string;
  };
}

export interface GamePlayerStats {
  id: string;
  playerId: string;
  name: string;
  teamId: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutesPlayed: number;
  plusMinus: number;
  fieldGoals: {
    made: number;
    attempted: number;
  };
  threePointers: {
    made: number;
    attempted: number;
  };
  freeThrows: {
    made: number;
    attempted: number;
  };
}

export interface CustomTeamStats extends TeamStats {
  fastBreakPoints: number;
  pointsInPaint: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
}

// Game Data Types
export interface GameRating {
  id: string;
  gameId: string;
  averageRating: string;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameRatingWithUser {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    photoUrl?: string;
  };
}

export interface GameWithStats extends Game {
  homeTeamStats?: CustomTeamStats;
  awayTeamStats?: CustomTeamStats;
}

export interface GameWithStatistics extends Game {
  statistics: GameStatistics[];
}

export interface GameWithDetails extends Game {
  homeTeam: GameTeamWithStats;
  awayTeam: GameTeamWithStats;
  gameLogs: GameLogWithReactions[];
  ratings: GameRatingWithUser[];
  userRating?: GameRatingWithUser;
}

export interface GameLogWithReactions extends Omit<GameLog, 'reactions'> {
  reactions: Reaction[];
}

export interface GameTeamWithStats extends CustomTeam {
  stats?: CustomTeamStats;
}

export interface PlayerWithOptionalPhoto extends Player {
  photoUrl?: string;
}

// Search and Query Types
export interface SearchGame {
  id: string;
  date: {
    start: string;
    end: string;
    duration: string;
  };
  status: {
    clock: string;
    halftime: boolean;
    long: string;
    short: string;
  };
  teams: {
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
  };
  scores: {
    home: {
      points: number;
    };
    visitors: {
      points: number;
    };
  };
  arena: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  league: string;
  season: number;
  stage: number;
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameQueryResult {
  loading: boolean;
  error?: ApolloError;
  data?: {
    games?: {
      items: SearchGame[];
    };
  };
}

export interface ProcessedGameData {
  isLoading: boolean;
  hasError: boolean;
  games: SearchGame[];
}

// Filter and Sort Types
export interface GameFilters {
  gameId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  season?: number;
  status?: GameStatusValue;
  dateRange?: {
    start: Date;
    end?: Date;
  };
  classification?: Classification;
  userId?: string;
  leadChangesMin?: number;
  leadChangesMax?: number;
  timesTiedMin?: number;
  timesTiedMax?: number;
  minScore?: number;
  maxScore?: number;
  officials?: string[];
  teamId?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
  league?: string;
  stage?: number;
  period?: number;
  arena?: string;
  nugget?: string;
}

export interface GameSortInput {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SeasonData {
  id: string;
  year: number;
  displayYear: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isPlayoffs: boolean;
}

export interface TeamData {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: {
      conference?: string;
      division?: string;
    };
    [key: string]:
      | {
          conference?: string;
          division?: string;
        }
      | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  birth: {
    date: string;
    country: string;
  };
  nba: {
    start: number;
    pro: number;
  };
  height: {
    feets: number;
    inches: number;
    meters: number;
  };
  weight: {
    pounds: number;
    kilograms: number;
  };
  college: string;
  affiliation: string;
  leagues: {
    standard: {
      jersey: string;
      active: boolean;
      pos: string;
    };
  };
  seasons_active: Array<{
    season: number;
    teams: string[];
  }>;
}

export type GameField =
  | 'season'
  | 'league'
  | 'date'
  | 'id'
  | 'stage'
  | 'status'
  | 'periods'
  | 'arena'
  | 'teams'
  | 'scores'
  | 'officials'
  | 'timesTied'
  | 'leadChanges'
  | 'nugget'
  | 'createdAt'
  | 'updatedAt';

export interface GameStatsProps {
  game: GameWithStatistics;
}

export interface ComponentGameStats {
  players: GamePlayerStats[];
  homeTeam: GameTeamStatistics;
  awayTeam: GameTeamStatistics;
}

export interface GameApiResponse {
  response: GameResponseData[];
  data?: GameResponseData[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

export interface GameResponseData {
  id: number;
  league: string;
  season: number;
  date: {
    start: string;
    end?: string;
    duration?: string;
  };
  stage: number;
  status: {
    clock?: string;
    halftime: boolean;
    short: string;
    long: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  arena: {
    name: string;
    city: string;
    state?: string;
    country?: string;
  };
  teams: {
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
  };
  scores: {
    home: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
    visitors: {
      win: number;
      loss: number;
      series: {
        win: number;
        loss: number;
      };
      linescore: number[];
      points: number;
    };
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget?: string;
}

export interface TransformedGame extends Game {
  homeTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo: string | null;
  };
  homeTeamScore: number;
  awayTeamScore: number;
}

export type GameTeams = {
  home: { id: string };
  visitors: { id: string };
};

export type GameScores = {
  home: { points: number };
  visitors: { points: number };
};

export type ExtendedGame = Game & {
  teams: GameTeams;
  scores: GameScores;
  arena?: {
    name: string;
    city: string;
  };
  periods?: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  officials?: string[];
  timesTied?: number;
  leadChanges?: number;
  nugget?: string;
};

export enum ConferenceType {
  EASTERN = 'eastern',
  WESTERN = 'western',
}

export enum DivisionType {
  ATLANTIC = 'atlantic',
  CENTRAL = 'central',
  SOUTHEAST = 'southeast',
  NORTHWEST = 'northwest',
  PACIFIC = 'pacific',
  SOUTHWEST = 'southwest',
}

export type GameTeamSortInput = {
  field: string;
  direction: 'asc' | 'desc';
};

export type GamePlayerSortInput = {
  field: string;
  direction: 'asc' | 'desc';
};

export interface GameEdge {
  node: Game;
}

export interface GameConnection {
  edges: GameEdge[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface GameQueryResponse {
  games: GameConnection;
}
