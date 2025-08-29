/**
 * Consolidated Infrastructure Types
 * Infrastructure, middleware, and system-related type definitions
 */

// ========================================
// REDIS TYPES
// ========================================

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

export interface ICacheConfigOptions {
  ttl?: number;
  prefix?: string;
  maxSize?: number;
  maxAge?: number;
}

export interface ICacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
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

// ========================================
// CACHE TYPES
// ========================================

export interface ICacheEntry {
  value: unknown;
  timestamp: number;
  ttl: number;
}

// Cache configuration interface
export interface ICacheConfig {
  defaultTTL?: number;
  maxSize?: number;
  enableRedis?: boolean;
}

// ========================================
// MIDDLEWARE TYPES
// ========================================

// Admin Auth Types
export interface IAdminAuthContext {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
}

// ========================================
// AUDIT LOG TYPES
// ========================================

export interface IAuditLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  severity: string;
  user_id?: string;
  description?: string;
  success: boolean;
  error_message?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, unknown>;
}

export interface IFilters {
  category?: string;
  action?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export type AuditLogSearchField =
  | 'all'
  | 'category'
  | 'action'
  | 'severity'
  | 'user_id'
  | 'description';

// ========================================
// TEST TYPES
// ========================================

export interface TestConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export interface CoverageTarget {
  category: string;
  target: number; // percentage
  description: string;
  testFiles: string[];
}

export interface TestCategory {
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userJourneys: string[];
  testFiles: string[];
}

// ========================================
// UTILITY TYPES
// ========================================

export type AsyncFunction<T = unknown> = () => Promise<T>;
export type SyncFunction<T = unknown> = () => T;
export type SomeOtherType = (arg: string) => void;
