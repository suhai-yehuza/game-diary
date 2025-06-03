/**
 * Shared types used across the application
 */
import type DataLoader from 'dataloader';
import { type InferSelectModel } from 'drizzle-orm';

import { nba_games } from '@/lib/db/schema/nba-schemas';
import type { GameRating } from '@/lib/types/game-log.types';
import type { Classification, DBUser } from '@/lib/types/generated/graphql';

// Common Types
export type SortDirection = 'asc' | 'desc';

// DataLoader Types
export interface Loaders {
  user: DataLoader<string, DBUser | null>;
  game: DataLoader<string, import('./generated/graphql').Game | null>;
  gameLog: DataLoader<string, import('./generated/graphql').GameLog | null>;
  comment: DataLoader<string, import('./generated/graphql').Comment | null>;
  reaction: DataLoader<string, import('./generated/graphql').Reaction | null>;
  friendship: DataLoader<string, import('./generated/graphql').Friendship | null>;
  player: DataLoader<string, import('./generated/graphql').Player | null>;
  gameRating: DataLoader<string, GameRating | null>;
  team: DataLoader<string, import('./generated/graphql').Team | null>;
}

// Common Props Types
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Common Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common Event Types
export interface BaseEvent {
  type: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Base types that can be shared across different type files
export type ValidatableValue = string | number | boolean | null | undefined;

// Database Types
export type DBGameRecord = InferSelectModel<typeof nba_games>;

export type UserWithMetadata = DBUser & {
  metadata?: {
    lastActive?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: string;
  };
};

// Base friendship types
export interface Friendship {
  id: string;
  subscriberId: string;
  userId: string;
  status: string;
  initiator: DBUser;
  recipient: DBUser;
  createdAt: Date;
  updatedAt: Date;
}

// Filter types
export interface GameLogFilters {
  userId?: string;
  gameId?: string;
  classification?: Classification;
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

// Base comment types
export interface Comment {
  id: string;
  content: string;
  userId: string;
  parentId: string;
  parentType: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Base reaction types
export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  targetId: string;
  targetType: string;
  createdAt: Date;
}

// Base player types
export interface DBPlayer {
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
export interface APIConfigOptions {
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

export type LeagueType = 'NBA' | 'WNBA' | 'NCAA' | 'G-League';

// Game and API response types (moved from common.types.ts)
export interface APIGame {
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

export interface GameLogResponse {
  id: string;
  userId: string;
  gameId: string;
  watchedSetting: string;
  watchedDate: string;
  watchedLocation: string;
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

export interface GameLogsResponse {
  gameLogs: {
    edges: Array<{
      cursor: string;
      node: GameLogResponse;
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

export interface RawTeamStatistics {
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

export interface StandingApiResponse {
  get: string;
  parameters: {
    league: string;
    season: string;
    conference?: string;
    division?: string;
    team?: string;
  };
  errors: Error[];
  results: number;
  response: Standing[];
}

export interface Standing {
  league: string;
  season: number;
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  conference: {
    name: string;
    rank: number;
    win: number;
    loss: number;
  };
  division: {
    name: string;
    rank: number;
    win: number;
    loss: number;
    gamesBehind: string | null;
  };
  win: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  loss: {
    home: number;
    away: number;
    total: number;
    percentage: string;
    lastTen: number;
  };
  gamesBehind: string | null;
  streak: number;
  winStreak: boolean;
  tieBreakerPoints: number | null;
}

export interface LeaguesApiResponse {
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

export interface UserSummary {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  emailAddress?: string;
}
