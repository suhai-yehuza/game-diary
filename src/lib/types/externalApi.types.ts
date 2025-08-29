/**
 * External API Types
 * TypeScript interfaces for NBA API endpoints and general API infrastructure
 * Documentation: https://api-sports.io/documentation/nba/v2
 */
import type { Comment, Reaction, ParentType as TargetType } from './generated/graphql';

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
  mapResponse?: (response: unknown) => unknown;
}

// ========================================
// API INFRASTRUCTURE TYPES
// ========================================

export interface IApiCacheConfig {
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
// BASE API RESPONSE STRUCTURE
// ========================================

export interface IBaseApiResponse<T = unknown> {
  get: string;
  parameters: Record<string, string>;
  errors: string[];
  results: number;
  response: T[];
}

// ========================================
// SEASONS ENDPOINT TYPES
// ========================================

export interface ISeasonResponse {
  season: number;
}

export type ISeasonsApiResponse = IBaseApiResponse<ISeasonResponse>;

// ========================================
// LEAGUES ENDPOINT TYPES
// ========================================

export interface ILeagueResponse {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: {
    id: number;
    name: string;
    code: string;
    flag: string;
  };
  flag: string;
  season: number;
  round: string;
}

export type ILeaguesApiResponse = IBaseApiResponse<ILeagueResponse>;

// ========================================
// GAMES ENDPOINT TYPES
// ========================================

export interface IGameResponse {
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

export type IGamesApiResponse = IBaseApiResponse<IGameResponse>;

// ========================================
// GAME STATISTICS ENDPOINT TYPES
// ========================================

export interface IGameStatisticsResponse {
  game: {
    id: number;
    date: string;
    time: string;
    timestamp: number;
    timezone: string;
    stage: number;
    week: string;
    status: {
      long: string;
      short: string;
      timer?: string;
    };
  };
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

export type IGameStatisticsApiResponse = IBaseApiResponse<IGameStatisticsResponse>;

// ========================================
// TEAMS ENDPOINT TYPES
// ========================================

export interface ITeamResponse {
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
    vegas?: {
      conference: string | null;
      division: string | null;
    };
    utah?: {
      conference: string | null;
      division: string | null;
    };
    sacramento?: {
      conference: string | null;
      division: string | null;
    };
  };
}

export type ITeamsApiResponse = IBaseApiResponse<ITeamResponse>;

// ========================================
// TEAM STATISTICS ENDPOINT TYPES
// ========================================

export interface ITeamStatisticsResponse {
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

export type ITeamStatisticsApiResponse = IBaseApiResponse<ITeamStatisticsResponse>;

// ========================================
// PLAYERS ENDPOINT TYPES
// ========================================

export interface IPlayerResponse {
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
    sacramento?: {
      jersey: number | null;
      active: boolean;
      pos: string;
    };
  };
}

export type IPlayersApiResponse = IBaseApiResponse<IPlayerResponse>;

// ========================================
// PLAYER STATISTICS ENDPOINT TYPES
// ========================================

export interface IPlayerStatisticsResponse {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    birth: {
      date: string | null;
      country: string | null;
    };
    nba: {
      start: number;
      pro: number;
    };
    height: {
      feets: string | null;
      inches: string | null;
      meters: string | null;
    };
    weight: {
      pounds: string | null;
      kilograms: string | null;
    };
    college: string | null;
    affiliation: string | null;
    leagues: {
      standard: {
        jersey: number | null;
        active: boolean;
        pos: string;
      };
    };
  };
  statistics: {
    games: number;
    points: number;
    min: string;
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

export type IPlayerStatisticsApiResponse = IBaseApiResponse<IPlayerStatisticsResponse>;

// ========================================
// STANDINGS ENDPOINT TYPES
// ========================================

export interface IStandingResponse {
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

export type IStandingsApiResponse = IBaseApiResponse<IStandingResponse>;

// ========================================
// API PARAMETER TYPES
// ========================================

export type ISeasonsParams = Record<string, never>;

export type ILeaguesParams = Record<string, never>;

export interface IGamesParams {
  id?: string;
  date?: string;
  league?: string;
  season?: string;
  team?: string;
  h2h?: string;
  live?: string;
}

export interface IGameStatisticsParams {
  id: string; // Required
}

export interface ITeamsParams {
  id?: string;
  name?: string;
  code?: string;
  league?: string;
  conference?: string;
  division?: string;
  search?: string;
}

export interface ITeamStatisticsParams {
  id: string; // Required
  season: string; // Required
  stage?: string;
}

export interface IPlayersParams {
  id?: string;
  name?: string;
  team?: string;
  season?: string;
  country?: string;
  search?: string;
}

export interface IPlayerStatisticsParams {
  id?: string;
  game?: string;
  team?: string;
  season?: string;
}

export interface IStandingsParams {
  league: string; // Required
  season: string; // Required
  team?: string;
  conference?: string;
  division?: string;
}

// ========================================
// NAVIGATION ITEM TYPE
// ========================================

export interface IApiNavItem {
  key: 'seasons' | 'leagues' | 'games' | 'teams' | 'players' | 'standings';
  label: string;
  url: string;
  endpoint: string;
}

// ========================================
// API ENDPOINT CONFIGURATION
// ========================================

import { API_ENDPOINTS } from '@/lib/constants';

export const NBA_API_ENDPOINTS = API_ENDPOINTS.NBA;

export type NBAEndpoint = (typeof NBA_API_ENDPOINTS)[keyof typeof NBA_API_ENDPOINTS];

// ========================================
// RESPONSE TYPE MAPPING
// ========================================

export type ApiResponseMap = {
  [NBA_API_ENDPOINTS.SEASONS]: ISeasonsApiResponse;
  [NBA_API_ENDPOINTS.LEAGUES]: ILeaguesApiResponse;
  [NBA_API_ENDPOINTS.GAMES]: IGamesApiResponse;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: IGameStatisticsApiResponse;
  [NBA_API_ENDPOINTS.TEAMS]: ITeamsApiResponse;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: ITeamStatisticsApiResponse;
  [NBA_API_ENDPOINTS.PLAYERS]: IPlayersApiResponse;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: IPlayerStatisticsApiResponse;
  [NBA_API_ENDPOINTS.STANDINGS]: IStandingsApiResponse;
};

export type ParamsMap = {
  [NBA_API_ENDPOINTS.SEASONS]: ISeasonsParams;
  [NBA_API_ENDPOINTS.LEAGUES]: ILeaguesParams;
  [NBA_API_ENDPOINTS.GAMES]: IGamesParams;
  [NBA_API_ENDPOINTS.GAME_STATISTICS]: IGameStatisticsParams;
  [NBA_API_ENDPOINTS.TEAMS]: ITeamsParams;
  [NBA_API_ENDPOINTS.TEAM_STATISTICS]: ITeamStatisticsParams;
  [NBA_API_ENDPOINTS.PLAYERS]: IPlayersParams;
  [NBA_API_ENDPOINTS.PLAYER_STATISTICS]: IPlayerStatisticsParams;
  [NBA_API_ENDPOINTS.STANDINGS]: IStandingsParams;
};

export type NBAEndpointKey = keyof typeof NBA_API_ENDPOINTS;

// ========================================
// UTILITY TYPES
// ========================================

export type RequiredParams<T> = {
  [K in keyof T]: T[K] extends string ? T[K] : never;
}[keyof T];

export type OptionalParams<T> = {
  [K in keyof T]: T[K] extends string | undefined ? T[K] : never;
}[keyof T];

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
