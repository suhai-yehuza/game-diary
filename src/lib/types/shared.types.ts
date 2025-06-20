/**
 * Shared types used across the application
 */
import type DataLoader from 'dataloader';
import type { InferSelectModel } from 'drizzle-orm';
import type * as React from 'react';

import type { nba_games } from '@src/lib/db/schema/nba-schemas';
import type {
  Classification,
  DbUser,
  Game,
  GameLog,
  Comment,
  Reaction,
  Friendship,
  Team,
} from '@src/lib/types/generated/graphql';

// Common Types
export type ISortDirection = 'asc' | 'desc';

// DataLoader Types
export interface ILoaders {
  user: DataLoader<string, DbUser | null>;
  game: DataLoader<string, Game | null>;
  gameLog: DataLoader<string, GameLog | null>;
  comment: DataLoader<string, Comment | null>;
  reaction: DataLoader<string, Reaction | null>;
  friendship: DataLoader<string, Friendship | null>;
  player: DataLoader<string, IDBPlayer | null>;
  gameRating: DataLoader<string, unknown | null>;
  team: DataLoader<string, Team | null>;
}

// Common Props Types
export interface IBaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Common Utility Types
export type IDeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? IDeepPartial<T[P]> : T[P];
};

// Common Event Types
export interface IBaseEvent {
  type: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Base types that can be shared across different type files
export type IValidatableValue = string | number | boolean | null | undefined;

// Database Types
export type IDBGameRecord = InferSelectModel<typeof nba_games>;

export interface IUserWithMetadata extends DbUser {
  metadata?: {
    lastActive?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: string;
  };
}

// Filter types
export interface IGameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: Classification;
  searchText?: string;
  minRating?: number;
  maxRating?: number;
  watchedSetting?: string;
  watchedLocation?: string;
  tags?: string[];
  hasNotes?: boolean;
  watchedDateRange?: {
    start?: Date;
    end?: Date;
  };
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  createdAt?: {
    start?: Date;
    end?: Date;
  };
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}

// Base player types
export interface IDBPlayer {
  id: string;
  firstName?: string;
  lastName?: string;
  birth?: {
    date?: Date;
    country?: string;
  };
  height?: {
    feets?: number;
    inches?: number;
    meters?: number;
  };
  weight?: {
    pounds?: number;
    kilograms?: number;
  };
  college?: string;
  affiliation?: string;
  nba?: {
    start?: number;
    pro?: number;
  };
  leagues?: {
    standard?: {
      jersey?: string;
      active?: boolean;
      pos?: string;
    };
    sacramento?: {
      jersey?: string;
      active?: boolean;
      pos?: string;
    };
    vegas?: {
      jersey?: string;
      active?: boolean;
      pos?: string;
    };
    utah?: {
      jersey?: string;
      active?: boolean;
      pos?: string;
    };
  };
  seasons_active?: Array<{
    season?: number;
    teams?: string[];
  }>;
}

// Base API types
export interface IAPIConfigOptions {
  baseUrl: string;
  apiKey: string;
  host: string;
  headers: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  method?: string;
  body?: unknown;
}

export type ILeagueType = 'NBA' | 'WNBA' | 'NCAA' | 'G-League';

// Game and API response types (moved from common.types.ts)
export interface IAPIGame {
  id: string;
  date: string;
  status: {
    long: string;
    short: string;
    clock?: string;
    halftime?: boolean;
  };
  teams: {
    home: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
    visitors: {
      id: string;
      name: string;
      nickname: string;
      code: string;
      logo: string;
    };
  };
}

export interface IGameLogResponse {
  id: string;
  userId: string;
  gameId: string;
  watchedSetting: string;
  watchedDate: string;
  ratingForGame: number;
  watchedScope: string;
  notes: string;
  tags: string[];
  classification: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  game?: {
    id: string;
    date: {
      start: string;
      end: string | null;
      duration: string | null;
    };
    status: {
      short: string | null;
    };
    arena: string;
    league: string;
    season: number;
    stage: number;
    periods: {
      total: number;
      current: number;
      endOfPeriod: boolean;
    };
    scores: {
      home: {
        win: number;
        loss: number;
        points: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
      };
      visitors: {
        win: number;
        loss: number;
        points: number;
        series: {
          win: number;
          loss: number;
        };
        linescore: string[];
      };
    };
    officials: string[];
    timesTied: number;
    leadChanges: number;
    nugget: string | null;
    homeTeamId: string;
    awayTeamId: string;
    teams: {
      home: {
        id: string;
        code: string;
        logo: string;
        name: string;
        nickname: string;
      };
      visitors: {
        id: string;
        code: string;
        logo: string;
        name: string;
        nickname: string;
      };
    };
    isCompleted: boolean;
  };
  comments?: {
    edges: Array<{
      node: {
        id: string;
        content: string;
        userId: string;
        parentId: string;
        parentType: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
        user: {
          id: string;
          username: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
          imageUrl: string;
        };
        reactions: Array<{
          id: string;
          emoji: string;
          user: {
            id: string;
            username: string;
            firstName: string;
            lastName: string;
            emailAddress: string;
            imageUrl: string;
          };
        }>;
      };
    }>;
    totalCount: number;
  };
  reactions?: {
    edges: Array<{
      node: {
        id: string;
        emoji: string;
        user: {
          id: string;
          username: string;
          firstName: string;
          lastName: string;
          emailAddress: string;
          imageUrl: string;
        };
        userId: string;
        targetId: string;
        targetType: string;
        createdAt: string;
        updatedAt: string;
      };
    }>;
    totalCount: number;
  };
}

export interface IGameLogsResponse {
  gameLogs: {
    edges: Array<{
      cursor: string;
      node: IGameLogResponse;
    }>;
    pageInfo: {
      startCursor: string;
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    totalCount: number;
  };
}

export interface IRawTeamStatistics {
  games: number;
  points: number;
  fgp: string;
  tpp: string;
  ftp: string;
  totReb: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  pFouls: number;
  plusMinus: number;
  fastBreakPoints: number;
  pointsInPaint: number;
  biggestLead: number;
  secondChancePoints: number;
  pointsOffTurnovers: number;
  longestRun: number;
}

export interface ILeaguesApiResponse {
  get: string;
  parameters: Record<string, string>;
  errors: Error[];
  results: number;
  response: Array<{
    id: string;
    name: string;
    type: string;
    logo: string;
  }>;
}

export interface IDBGameData {
  id: string;
  date: unknown;
  status: Record<string, unknown> | null;
  arena: unknown;
  league: string;
  season: number;
  stage: number;
  periods: unknown;
  teams: Record<string, Record<string, unknown>> | null;
  scores: unknown;
  officials: unknown;
  timesTied?: number | null;
  leadChanges?: number | null;
  nugget?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IDBArenaData {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Activity Types
export interface IActivity {
  id: string;
  type: string;
  userId: string;
  targetId: string;
  targetType: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
