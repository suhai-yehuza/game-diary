/**
 * API-related types including configuration, validation, response types, and activity tracking
 */
import type {
  Comment,
  Reaction,
  Game,
  UserSummary,
  GameLog,
  ParentType as TargetType,
} from '@src/lib/types/generated/graphql';

// API Configuration Types
export interface APIConfig {
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

export interface RapidAPIConfig extends APIConfig {
  apiKey: string;
  host: string;
}

// API Response Types
export interface APIResponse<T = unknown> {
  response?: T[];
  data?: T[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationRule {
  validate: (value: unknown) => boolean;
  message: string;
}

// API Request Types
export interface APIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// API Client Types
export interface APIClient {
  get<T>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>>;
  post<T>(endpoint: string, data: unknown, options?: APIRequestOptions): Promise<APIResponse<T>>;
  put<T>(endpoint: string, data: unknown, options?: APIRequestOptions): Promise<APIResponse<T>>;
  delete<T>(endpoint: string, options?: APIRequestOptions): Promise<APIResponse<T>>;
  patch<T>(endpoint: string, data: unknown, options?: APIRequestOptions): Promise<APIResponse<T>>;
}

// API Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

// API Caching Types
export interface CacheConfig {
  ttl: number;
  maxSize?: number;
  strategy?: 'memory' | 'redis';
}

// API Monitoring Types
export interface APIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  error?: string;
}

export interface APIParameters {
  id?: string;
  date?: string;
  season?: string;
  team?: string;
  live?: string;
  h2h?: string;
}

export interface GameApiResponse {
  id: string;
  date: string;
  homeTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  awayTeam: {
    id: string;
    name: string;
    nickname: string;
    code: string;
    logo: string;
  };
  homeScore: number;
  awayScore: number;
  status: string;
  season: string;
  period: number;
  postseason: boolean;
}

export interface GameResponseData {
  game: Game;
  gameLog?: GameLog;
}

export interface PlayerApiResponse {
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
}

export interface TeamApiResponse {
  id: string;
  name: string;
  nickname: string;
  code: string;
  logo: string;
  city?: string;
  state?: string;
  conference?: string;
  division?: string;
}

export interface UserApiResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress?: string;
  imageUrl?: string;
}

export interface Activity {
  id: string;
  userId: string;
  message: string;
  targetType: TargetType;
  targetId: string;
  createdAt: Date;
  read: boolean;
  type: ActivityType;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T> {
  data?: T;
  errors?: ApiError[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
  sort?: Record<string, 'asc' | 'desc'>;
}

export interface ApiRequestOptions {
  pagination?: PaginationParams;
  search?: SearchParams;
  headers?: Record<string, string>;
}

export interface ExtendedNextApiRequest {
  user?: UserSummary;
  query: Record<string, string | string[]>;
  body: Record<string, unknown>;
  headers: Record<string, string>;
}

export type SeasonApiResponse = {
  get: string;
  parameters: APIParameters;
  errors: APIError[];
  results: number;
  response: number[];
  data: number[]; // For backward compatibility
};

export type RangeConfig = {
  min: number;
  max: number;
  step: number;
};

export type BatchSizeConfig = {
  default: number;
  max: number;
  min: number;
};

export type APISeedingConfig = {
  enabled: boolean;
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
};

export type ClassificationWeights = {
  [key: string]: number;
};

export type DistributionFunctions = {
  [key: string]: (value: number) => number;
};

// Activity Types
// export interface Activity {
//   id: string;
//   userId: string;
//   type: ActivityType;
//   targetId: string;
//   targetType: TargetType;
//   metadata?: Record<string, unknown>;
//   createdAt: Date;
//   updatedAt: Date;
// }

export type ActivityType =
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

// Comment Types
export interface DbComment extends Comment {
  replies?: Comment[];
  parentId: string;
}

// Reaction Types
export interface DbReaction extends Reaction {
  target?: {
    id: string;
    type: TargetType;
    title?: string;
  };
  metadata?: Record<string, unknown>;
}

// Timeline Types
export interface TimelineItem {
  id: string;
  type: ActivityType;
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

export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

// Activity Feed Types
export interface ActivityFeed {
  items: TimelineItem[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

// Activity Stats Types
export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  activitiesByTargetType: Record<TargetType, number>;
  recentActivityCount: number;
  lastActivityDate?: Date;
}

export type ActivityTimelineProps = {
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
};

export interface FriendActivityProps {
  friendId: string;
}
