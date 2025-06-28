import type { InferInsertModel } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { GraphQLResolveInfo } from 'graphql';

import type * as schema from '@src/lib/db/schema';

import type { Maybe } from './generated/graphql';

// Redis client types
export type IRedisClient = unknown; // Simplified to avoid import issues
export type IRedisClientType = 'upstash' | 'ioredis' | null;

// Redis Configuration
export interface IRedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  ttl?: number;
}

// Time constants for cache TTL calculations
const TIME_CONSTANTS = {
  MINUTES: 60,
  SECONDS: 1,
  MILLISECONDS_PER_SECOND: 1000,
} as const;

// Cache TTL (Time To Live) constants in milliseconds
export const CACHE_TTL = {
  USER: 5 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 5 minutes
  GAME: 10 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 10 minutes
  TEAM: 15 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 15 minutes
  PLAYER: 15 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 15 minutes
  USER_GAME_LOGS: 5 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 5 minutes
  GAME_STATS: 10 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 10 minutes
  TEAM_STATS: 15 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 15 minutes
  PLAYER_STATS: 15 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 15 minutes
  COMMENTS: 5 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 5 minutes
  REACTIONS: 5 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 5 minutes
  NOTIFICATIONS: TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 1 minute
  FRIENDSHIPS: 5 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 5 minutes
  SEASONS: 30 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 30 minutes
  LEAGUES: 30 * TIME_CONSTANTS.MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_SECOND, // 30 minutes
} as const;

// Cache key prefix constants
export const CACHE_KEY_PREFIX = {
  USER: 'user:',
  GAME: 'game:',
  TEAM: 'team:',
  PLAYER: 'player:',
  USER_GAME_LOGS: 'user_game_logs:',
  GAME_STATS: 'game_stats:',
  TEAM_STATS: 'team_stats:',
  PLAYER_STATS: 'player_stats:',
  COMMENTS: 'comments:',
  REACTIONS: 'reactions:',
  NOTIFICATIONS: 'notifications:',
  FRIENDSHIPS: 'friendships:',
  SEASONS: 'seasons:',
  LEAGUES: 'leagues:',
} as const;

// Cache configuration types
export interface IRedisCacheConfig {
  ttl: number;
  prefix: string;
  maxSize?: number;
  maxAge?: number;
}

export interface ICacheOptions {
  ttl?: number;
  prefix?: string;
  maxSize?: number;
  maxAge?: number;
}

export interface ICacheStats {
  hits: number;
  misses: number;
  keys: number;
  size: number;
  lastCleanup: Date;
}

export interface ICacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  keysCount: number;
  lastCleanup: Date;
}

export interface ICacheManager {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ========================================
// SEEDING TYPES
// ========================================

export type MadeAttempted = { made?: number; attempted?: number } | null | undefined;

// Drizzle insert types
export type UserInsert = InferInsertModel<typeof schema.users>;
export type FriendshipInsert = InferInsertModel<typeof schema.friendships>;
export type GameLogInsert = InferInsertModel<typeof schema.game_logs>;
export type CommentInsert = InferInsertModel<typeof schema.comments>;
export type ReactionInsert = InferInsertModel<typeof schema.reactions>;
export type GameInsert = InferInsertModel<typeof schema.games>;

// Database client type
export type DatabaseClient = NeonHttpDatabase<typeof schema>;

// Batch insert options interface
export interface IBatchInsertOptions {
  table: PgTable;
  data: Record<string, unknown>[];
  batchSize?: number;
  tableName?: string;
}

// Database query result types
export interface ITableExistsResult {
  rows: Array<{ exists: boolean }>;
}

export interface ITableCountResult {
  rows: Array<{ count: number }>;
}

// ========================================
// GRAPHQL TYPES
// ========================================

export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = object, TContext = object, TArgs = object> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface ISubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface ISubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key: string]: TResult }, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, { [key: string]: TResult }, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | ISubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | ISubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = object,
  TContext = object,
  TArgs = object,
> =
  | ((
      ...args: [TArgs, TContext, GraphQLResolveInfo]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = object, TContext = object> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = object, TContext = object> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = object,
  TParent = object,
  TContext = object,
  TArgs = object,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

// Database types
export type Database = ReturnType<typeof import('drizzle-orm/neon-http').drizzle>;
