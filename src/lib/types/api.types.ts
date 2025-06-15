/**
 * API-related types including configuration, validation, response types, and activity tracking
 */
import type { NextApiRequest } from 'next';

import type { Comment, Reaction, ParentType as TargetType } from '@src/lib/types/generated/graphql';

// Extended NextApiRequest with additional properties
export interface IExtendedNextApiRequest extends NextApiRequest {
  selectedFields?: string[];
  pagination?: {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
  };
}

// API Configuration Types
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

// API Response Types
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

// Validation Types
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

// API Request Types
export interface IAPIRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// API Client Types
export interface IAPIClient {
  get<T>(endpoint: string, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  post<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  put<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  delete<T>(endpoint: string, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
  patch<T>(endpoint: string, data: unknown, options?: IAPIRequestOptions): Promise<IAPIResponse<T>>;
}

// API Rate Limiting Types
export interface IRateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
}

// API Caching Types
export interface ICacheConfig {
  ttl: number;
  maxSize?: number;
  strategy?: 'memory' | 'redis';
}

// API Monitoring Types
export interface IAPIMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  error?: string;
}

export interface IAPIParameters {
  id?: string;
  date?: string;
  season?: string;
  team?: string;
  live?: string;
  h2h?: string;
}

// Activity Types
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

// API Configuration Types
export interface IRangeConfig {
  min: number;
  max: number;
  step: number;
}

export interface IBatchSizeConfig {
  default: number;
  max: number;
  min: number;
}

export interface IAPISeedingConfig {
  enabled: boolean;
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
}

export interface IClassificationWeights {
  [key: string]: number;
}

export interface IDistributionFunctions {
  [key: string]: (value: number) => number;
}
