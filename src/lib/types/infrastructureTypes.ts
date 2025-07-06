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

// Cache duration constants
const CACHE_DURATIONS = {
  SHORT: 5,
  MEDIUM: 10,
  LONG: 15,
  EXTENDED: 30,
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
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// All schema-dependent types moved to dbTypes.ts

// Performance types
// IPerformanceMetrics moved to coreTypes.ts
// export interface IPerformanceMetrics { ... }

// Utility types
export type AsyncFunction<T = unknown> = () => Promise<T>;
export type SyncFunction<T = unknown> = () => T;
export type SomeOtherType = (arg: string) => void;
