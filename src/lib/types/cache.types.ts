/**
 * Cache-related type definitions and constants for the application.
 */
import type { Redis as UpstashRedis } from '@upstash/redis';
import type IORedis from 'ioredis';

// Redis client types
export type IRedisClient = UpstashRedis | IORedis;
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

// Cache TTL (Time To Live) constants in milliseconds
export const CACHE_TTL = {
  USER: 5 * 60 * 1000, // 5 minutes
  GAME: 10 * 60 * 1000, // 10 minutes
  TEAM: 15 * 60 * 1000, // 15 minutes
  PLAYER: 15 * 60 * 1000, // 15 minutes
  USER_GAME_LOGS: 5 * 60 * 1000, // 5 minutes
  GAME_STATS: 10 * 60 * 1000, // 10 minutes
  TEAM_STATS: 15 * 60 * 1000, // 15 minutes
  PLAYER_STATS: 15 * 60 * 1000, // 15 minutes
  COMMENTS: 5 * 60 * 1000, // 5 minutes
  REACTIONS: 5 * 60 * 1000, // 5 minutes
  NOTIFICATIONS: 1 * 60 * 1000, // 1 minute
  FRIENDSHIPS: 5 * 60 * 1000, // 5 minutes
  SEASONS: 30 * 60 * 1000, // 30 minutes
  LEAGUES: 30 * 60 * 1000, // 30 minutes
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
