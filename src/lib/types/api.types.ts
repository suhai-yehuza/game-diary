/**
 * API-related types including configuration, validation, response types, and activity tracking
 */

import type {
  Comment as GeneratedComment,
  Reaction as GeneratedReaction,
  TargetType as GeneratedTargetType,
} from '@/lib/types/generated/graphql';

// Re-export TargetType from generated types
export type TargetType = GeneratedTargetType;

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
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
  errors?: APIError[];
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
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
export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  targetId: string;
  targetType: GeneratedTargetType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

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
export interface DbComment extends GeneratedComment {
  replies?: Comment[];
  parentId: string;
}

// Reaction Types
export interface DbReaction extends GeneratedReaction {
  target?: {
    id: string;
    type: GeneratedTargetType;
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
    type: GeneratedTargetType;
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
  activitiesByTargetType: Record<GeneratedTargetType, number>;
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
