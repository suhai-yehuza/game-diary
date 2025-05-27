/**
 * Shared types used across the application
 */

// Common Types
export type SortDirection = 'asc' | 'desc';

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type ErrorType = 'validation' | 'network' | 'server' | 'auth' | 'unknown';

// Route Types
export interface Route {
  path: string;
  name: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

// Common Props Types
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface WithId {
  id: string;
}

export interface WithTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Common State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Common Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Common Filter Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface SearchParams {
  query: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    direction: SortDirection;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

// Common Utility Types
export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Common Event Types
export interface BaseEvent {
  type: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: Error;
  context?: Record<string, unknown>;
}

// Common Config Types
export interface Config {
  env: string;
  debug: boolean;
  version: string;
  apiUrl: string;
  wsUrl?: string;
  features: Record<string, boolean>;
}

// Common Constants
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

// Base types that can be shared across different type files
export type ValidatableValue =
  | string
  | number
  | boolean
  | null
  | ValidatableValue[]
  | { [key: string]: ValidatableValue };

// Base user types
export interface BaseUser {
  id: string;
  username?: string;
  imageUrl?: string;
}

// Base friendship types
export interface Friendship {
  id: string;
  subscriberId: string;
  userId: string;
  status: string;
  initiator: BaseUser;
  recipient: BaseUser;
  created_at: Date;
  updated_at: Date;
}

// Base game types
export interface Game {
  id: string;
  date: Date;
  status: {
    clock: string;
  };
  homeTeamId: string;
  awayTeamId: string;
  created_at: Date;
  updated_at: Date;
}

// Base game log types
export interface GameLog {
  id: string;
  gameId: string;
  userId: string;
  classification: string;
  notes?: string;
  rating?: number;
  tags: string[];
  watchedDate?: Date;
  watchedSetting: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Base comment types
export interface Comment {
  id: string;
  content: string;
  userId: string;
  parent_id: string;
  parent_type: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Base reaction types
export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  targetId: string;
  targetType: string;
  created_at: Date;
}

// Base player types
export interface DBPlayer {
  id: string;
  first_name?: string;
  last_name?: string;
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
  rating: number;
  ratingForGame: number;
  ratingStars: number | null;
  watchedCount: number;
  notes: string;
  tags: string[];
  classification: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    image_url: string;
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
