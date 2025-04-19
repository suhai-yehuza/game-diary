/**
 * Game-related type definitions for the application.
 * This file contains types for game data, statistics, and API responses.
 */

import { ApolloError } from '@apollo/client';
import type { InferSelectModel } from 'drizzle-orm';

import { nba_games } from '@/lib/db/schema/nba-schemas';

import { APIError, APIParameters } from './api.types';
import type {
  Game,
  GameLog,
  Player,
  Reaction,
  TeamStats,
  Team,
  Classification,
  GameFilters as GeneratedGameFilters,
  DateRangeInput,
} from './generated/graphql';
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
  player_id: string;
  team_id: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutes: string;
  plus_minus: number;
  field_goals: { made: number; attempted: number };
  three_pointers: { made: number; attempted: number };
  free_throws: { made: number; attempted: number };
}

export interface GamePlayerStats {
  id: string;
  player_id: string;
  name: string;
  team_id: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutes_played: number;
  plus_minus: number;
  field_goals: { made: number; attempted: number };
  three_pointers: { made: number; attempted: number };
  free_throws: { made: number; attempted: number };
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
  game_id: string;
  average_rating: string;
  total_ratings: number;
  created_at: string;
  updated_at: string;
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
  date: string;
  status: string;
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
    state: string;
    country: string;
  };
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
export interface GameFilters extends GeneratedGameFilters {
  search?: string;
  dateRange?: DateRangeInput;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface GameSortInput {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SeasonData {
  id: string;
  year: number;
  display_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_playoffs: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface PlayerData {
  id: string;
  first_name: string;
  last_name: string;
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
  | 'times_tied'
  | 'lead_changes'
  | 'nugget'
  | 'created_at'
  | 'updated_at';

export interface GameStatsProps {
  game: GameWithStatistics;
}

export interface ComponentGameStats {
  players: GamePlayerStats[];
  homeTeam: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
    fieldGoals: { made: number; attempted: number };
    threePointers: { made: number; attempted: number };
    freeThrows: { made: number; attempted: number };
  };
  awayTeam: {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
    fieldGoals: { made: number; attempted: number };
    threePointers: { made: number; attempted: number };
    freeThrows: { made: number; attempted: number };
  };
}

export type GameApiResponse = {
  get: string;
  parameters: APIParameters;
  errors: APIError[];
  results: number;
  response: GameResponseData[];
  data: GameResponseData[]; // For backward compatibility
};

export type GameResponseData = {
  id: number;
  league: string;
  season: number;
  date: {
    start: string;
    end: string | null;
    duration: string | null;
  };
  stage: number;
  status: {
    clock: string | null;
    halftime: boolean;
    short: number;
    long: string;
  };
  periods: {
    current: number;
    total: number;
    endOfPeriod: boolean;
  };
  arena: {
    name: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
  };
  teams: {
    visitors: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
    home: {
      id: number;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
  };
  scores: {
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
  };
  officials: string[];
  timesTied: number;
  leadChanges: number;
  nugget: string | null;
};

export interface TransformedGame extends GameResponseData {
  homeTeam: GameResponseData['teams']['home'];
  awayTeam: GameResponseData['teams']['visitors'];
  homeTeamScore: number;
  awayTeamScore: number;
}

export type GameTeams = {
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

export type GameScores = {
  home: {
    points: number;
  };
  visitors: {
    points: number;
  };
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
  };
  officials?: string[];
  times_tied?: number;
  lead_changes?: number;
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
