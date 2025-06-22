/**
 * API Types
 * All API-related types including configuration, validation, response types, and activity tracking
 */
import type { Comment, Reaction, ParentType as TargetType } from '@src/lib/types/generated/graphql';

// ========================================
// API REQUEST & RESPONSE TYPES
// ========================================

// Extended NextApiRequest with additional properties (Next.js compatible)
export interface IExtendedNextApiRequest {
  query?: { [key: string]: string | string[] };
  body?: unknown;
  cookies?: { [key: string]: string };
  headers?: { [key: string]: string | string[] };
  method?: string;
  url?: string;
  selectedFields?: string[];
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}

// Generic API Response
export interface IAPIResponse<T = unknown> {
  response?: T[];
  data?: T[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

export interface IAPIError {
  code: string;
  message: string;
  details?: unknown;
}

// ========================================
// API CONFIGURATION TYPES
// ========================================

export interface IAPIConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: string;
  };
  headers: {
    [key: string]: string;
  };
  timeout: number;
  retries: number;
  cacheTTL: number;
}

export interface IRapidAPIConfig extends IAPIConfig {
  apiKey: string;
  host: string;
}

export interface IAPIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface IAPIClient {
  get<T>(endpoint: string, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  post<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  put<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  delete<T>(endpoint: string, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  patch<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
}

export interface IAPIParameters {
  id?: string;
  date?: string;
  season?: string;
  team?: string;
  live?: string;
  h2h?: string;
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface IValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

export interface IValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

// ========================================
// API INFRASTRUCTURE TYPES
// ========================================

export interface ICacheConfig {
  ttl: number;
  maxSize?: number;
  strategy?: 'memory' | 'redis';
}

export interface IAPIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  error?: string;
}

// ========================================
// EXTERNAL API RESPONSE TYPES
// ========================================

export interface IGameResponseData {
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

export interface IGameApiResponse {
  response: IGameResponseData[];
  data?: IGameResponseData[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

export interface ITeamResponseData {
  id: number;
  name: string;
  nickname: string;
  code: string;
  city: string;
  logo: string;
  allStar: boolean;
  nbaFranchise: boolean;
  leagues: {
    standard?: {
      conference: string | null;
      division: string | null;
    };
  };
}

export type ITeamApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: ITeamResponseData[];
};

export interface ITeamStatisticsResponseData {
  team: {
    id: number;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  statistics: {
    games: number;
    fastBreakPoints: number;
    pointsInPaint: number;
    biggestLead: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    longestRun: number;
    points: number;
    fgm: number;
    fga: number;
    fgp: string;
    ftm: number;
    fta: number;
    ftp: string;
    tpm: number;
    tpa: number;
    tpp: string;
    offReb: number;
    defReb: number;
    totReb: number;
    assists: number;
    pFouls: number;
    steals: number;
    turnovers: number;
    blocks: number;
    plusMinus: number;
  }[];
}

export type ITeamStatisticsApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: IAPIError[];
  results: number;
  response: ITeamStatisticsResponseData[];
  data?: ITeamStatisticsResponseData[];
};

export interface IPlayerApiResponse {
  response: {
    get: string;
    parameters: {
      team: string;
      season: string;
    };
    errors: string[];
    results: number;
    response: Array<{
      id: number;
      firstname: string;
      lastname: string;
      birth?: {
        date: string | null;
        country: string | null;
      };
      nba?: {
        start: number;
        pro: number;
      };
      height?: {
        feets: string | null;
        inches: string | null;
        meters: string | null;
      };
      weight?: {
        pounds: string | null;
        kilograms: string | null;
      };
      college: string | null;
      affiliation: string | null;
      leagues?: {
        standard?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        vegas?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
        utah?: {
          jersey: number | null;
          active: boolean;
          pos: string;
        };
      };
    }>;
  };
}

export type ISeasonApiResponse = {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: number[];
};

export interface IStandingResponseData {
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
    gamesBehind: string;
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
  streak: number;
  winStreak: boolean;
}

// ========================================
// ACTIVITY TYPES
// ========================================

export interface IActivity {
  id: string;
  userId: string;
  message: string;
  targetType: TargetType;
  targetId: string;
  createdAt: Date;
  read: boolean;
  type: IActivityType;
}

export type IActivityType =
  | 'game_log_created'
  | 'game_log_updated'
  | 'friend_added'
  | 'friend_removed'
  | 'profile_updated'
  | 'reaction_added'
  | 'comment_added'
  | 'all'
  | 'replay'
  | 'favorite'
  | 'note'
  | 'watch';

export interface IDbComment extends Comment {
  replies?: Comment[];
  parentId: string;
}

export interface IDbReaction extends Reaction {
  target?: {
    id: string;
    type: TargetType;
    title?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface ITimelineItem {
  id: string;
  type: IActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    type: TargetType;
    title?: string;
    description?: string;
    image?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type ITimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export interface IActivityFeed {
  items: ITimelineItem[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

export interface IActivityStats {
  totalActivities: number;
  activitiesByType: Record<IActivityType, number>;
  activitiesByTargetType: Record<TargetType, number>;
  recentActivityCount: number;
  lastActivityDate?: Date;
}

export interface IActivityTimelineProps {
  gameLogs: Array<{
    id: string;
    createdAt: string;
    ratingForGame: number;
    watchedSetting: string;
    notes?: string;
    game: {
      season: string;
      teams: {
        visitors: { name: string };
        home: { name: string };
      };
    };
  }>;
}

export interface IFriendActivityProps {
  friendId: string;
}
