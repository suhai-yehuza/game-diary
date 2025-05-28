import { Agent } from 'https';

import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

import { CACHE_TTL } from '@/lib/types/config.types';
import type { RedisClient, RedisClientType } from '@/lib/types/redis.types';
import { sleep } from '@/lib/utils/index.time';

// Cache keys with type safety
export const CACHE_KEYS = {
  SEASONS: 'nba:seasons',
  LEAGUES: 'nba:leagues',
  GAMES: 'nba:games',
  GAME: (id: string) => `nba:game:${id}`,
  TEAMS: 'nba:teams',
  TEAM: (id: string) => `nba:team:${id}`,
  PLAYERS: 'nba:players',
  PLAYER: (id: string) => `nba:player:${id}`,
  STANDINGS: (season: string) => `nba:standings:${season}`,
  GAME_STATS: (gameId: string) => `nba:game:${gameId}:stats`,
  PLAYER_STATS: (player_id: string) => `nba:player:${player_id}:stats`,
  TEAM_STATS: (teamId: string) => `nba:team:${teamId}:stats`,
  LIVE_GAMES: 'nba:live:games',
  USERS: 'users',
  USER: (id: string) => `user:${id}`,
  FRIENDSHIPS: 'friendships',
  GAME_LOGS: 'game_logs',
  USER_GAME_LOGS: (userId: string) => `user:${userId}:game_logs`,
  GAME_RATINGS: 'game_ratings',
  GAME_RATING: (game_id: string) => `game_rating:${game_id}`,
  COMMENTS: (parent_id: string) => `comments:${parent_id}`,
  REACTIONS: (target_id: string) => `reactions:${target_id}`,
  PLAYER_SEASON_STATS: (playerId: string, season: string) =>
    `nba:player:${playerId}:season:${season}:stats`,
  TEAM_SEASON_STATS: (teamId: string, season: string) =>
    `nba:team:${teamId}:season:${season}:stats`,
  TOP_PLAYERS: (season: string) => `nba:top_players:${season}`,
  USER_GAME_LOGS_FILTERED: (userId: string, filters: string) =>
    `user:${userId}:game_logs:${filters}`,
  PLAYER_GAME_STATS: (gameId: string, playerId: string) =>
    `nba:game:${gameId}:player:${playerId}:stats`,
} as const;

/**
 * Cache class for handling Redis operations with support for both Upstash and IORedis
 */
export class Cache {
  private client: RedisClient | null = null;
  private isRedisAvailable = false;
  private initializationPromise: Promise<void> | null = null;
  private clientType: RedisClientType = null;

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isRedisAvailable;
  }

  /**
   * Initialize Redis connection with appropriate client
   */
  public async initializeRedis(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeRedisClient();
    return this.initializationPromise;
  }

  /**
   * Initialize Redis client with appropriate configuration
   */
  private async initializeRedisClient(): Promise<void> {
    try {
      if (await this.initializeUpstashRedis()) return;
      if (await this.initializeIORedis()) return;

      this.handleMissingConfiguration();
    } catch (error) {
      this.handleInitializationError(error);
      throw error;
    }
  }

  /**
   * Initialize Upstash Redis client
   */
  private async initializeUpstashRedis(): Promise<boolean> {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return false;
    }

    console.log('=== Redis Initialization (Upstash) ===');
    this.logRedisConfiguration('upstash');

    try {
      this.client = new UpstashRedis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
        automaticDeserialization: false,
        agent: new Agent({
          keepAlive: true,
          timeout: 30000,
        }),
      });
      this.clientType = 'upstash';

      return await this.testConnection();
    } catch (error) {
      console.error('Failed to initialize Upstash Redis:', error);
      this.resetClient();
      return false;
    }
  }

  /**
   * Initialize IORedis client
   */
  private async initializeIORedis(): Promise<boolean> {
    if (!process.env.REDIS_URL) {
      return false;
    }

    console.log('=== Redis Initialization (ioredis) ===');
    this.logRedisConfiguration('ioredis');

    try {
      this.client = new Redis(process.env.REDIS_URL, {
        tls: {
          rejectUnauthorized: false,
        },
        connectTimeout: 30000,
        maxRetriesPerRequest: 3,
      });
      this.clientType = 'ioredis';

      return await this.testConnection();
    } catch (error) {
      console.error('Failed to initialize IORedis:', error);
      this.resetClient();
      return false;
    }
  }

  /**
   * Test Redis connection with timeout
   */
  private async testConnection(): Promise<boolean> {
    try {
      // Increase timeout for initial connection test
      await Promise.race([this.client!.ping(), sleep(30000)]);
      this.isRedisAvailable = true;
      console.log('✅ Redis connection established successfully');
      console.log('=== Redis Initialization Complete ===\n');
      return true;
    } catch (error) {
      console.error('Redis connection test failed:', error);
      this.resetClient();
      return false;
    }
  }

  /**
   * Log Redis configuration status
   */
  private logRedisConfiguration(type: 'upstash' | 'ioredis'): void {
    console.log('Testing Redis connection...');
    console.log('Environment:', process.env.NODE_ENV);

    if (type === 'upstash') {
      console.log('Redis URL configured:', process.env.KV_REST_API_URL ? 'Yes' : 'No');
      console.log('Redis Token configured:', process.env.KV_REST_API_TOKEN ? 'Yes' : 'No');
    } else {
      console.log('Redis URL configured:', process.env.REDIS_URL ? 'Yes' : 'No');
    }

    console.log(`Redis is running with [${type}] configuration:`);
  }

  /**
   * Handle missing Redis configuration
   */
  private handleMissingConfiguration(): void {
    console.warn('=== Redis Configuration Missing ===');
    console.warn('Environment:', process.env.NODE_ENV);
    console.warn(
      'Redis URL configured:',
      process.env.KV_REST_API_URL || process.env.REDIS_URL ? 'Yes' : 'No'
    );
    console.warn('Caching will be disabled.');
    console.warn('===============================\n');
    this.resetClient();
  }

  /**
   * Handle Redis initialization error
   */
  private handleInitializationError(error: unknown): void {
    console.error('=== Redis Initialization Error ===');
    console.error('Environment:', process.env.NODE_ENV);
    console.error('Error:', error);
    console.error('================================\n');
    this.resetClient();
  }

  /**
   * Reset client state
   */
  private resetClient(): void {
    this.client = null;
    this.isRedisAvailable = false;
    this.clientType = null;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isRedisAvailable || !this.client) {
      console.log(`[Cache.get] Redis not available. Key: ${key}`);
      return null;
    }

    try {
      console.log(`[Cache.get] Getting key: ${key}`);
      const data = await this.getFromClient(key);

      if (!data) {
        console.log(`[Cache.get] Key not found: ${key}`);
        return null;
      }

      return this.parseValue<T>(data, key);
    } catch (error) {
      console.error(`[Cache.get] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get value from appropriate Redis client
   */
  private async getFromClient(key: string): Promise<string | null> {
    if (this.clientType === 'upstash') {
      return await (this.client as UpstashRedis).get(key);
    }
    return await (this.client as Redis).get(key);
  }

  /**
   * Parse value from Redis
   */
  private parseValue<T>(data: string | null, key: string): T {
    if (!data) {
      return null as T;
    }

    // If data is already an object, return it directly
    if (typeof data === 'object' && data !== null) {
      console.log(`[Cache.get] Data is already an object for key: ${key}`);
      return data as T;
    }

    // If data is a string, try to parse it as JSON
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data) as T;
        console.log(`[Cache.get] Successfully parsed JSON string for key: ${key}`);
        return parsedData;
      } catch (parseError) {
        console.warn(`[Cache.get] Parse error for key ${key}:`, parseError);

        // If it's a string representation of an object, try to evaluate it safely
        if (data.startsWith('[object Object]')) {
          try {
            // Extract the object content and try to parse it
            const objectContent = data.replace('[object Object]', '{}');
            const parsedObject = JSON.parse(objectContent);
            console.log(`[Cache.get] Successfully parsed object string for key: ${key}`);
            return parsedObject as T;
          } catch (evalError) {
            console.warn(`[Cache.get] Failed to parse object string for key ${key}:`, evalError);
            return null as T;
          }
        }

        // If all parsing attempts fail, return the raw string
        console.log(`[Cache.get] Returning raw string value for key: ${key}`);
        return data as unknown as T;
      }
    }

    // If we get here, return the data as is
    return data as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.isRedisAvailable || !this.client) {
      console.log(`[Cache.set] Redis not available. Key: ${key}`);
      return false;
    }

    try {
      console.log(`[Cache.set] Setting key: ${key} with ttl: ${ttl || 'none'}`);
      const serializedValue = this.serializeValue(value);
      await this.setInClient(key, serializedValue, ttl);
      console.log(`[Cache.set] Successfully set key: ${key}`);
      return true;
    } catch (error) {
      console.error(`[Cache.set] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Serialize value for storage
   */
  private serializeValue<T>(value: T): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('[Cache.serializeValue] Error serializing value:', error);
      throw new Error('Failed to serialize value for cache storage');
    }
  }

  /**
   * Set value in appropriate Redis client
   */
  private async setInClient(key: string, value: string, ttl?: number): Promise<void> {
    if (this.clientType === 'upstash') {
      if (ttl) {
        await (this.client as UpstashRedis).set(key, value, { ex: ttl });
      } else {
        await (this.client as UpstashRedis).set(key, value);
      }
    } else {
      if (ttl) {
        await (this.client as Redis).set(key, value, 'EX', ttl);
      } else {
        await (this.client as Redis).set(key, value);
      }
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isRedisAvailable || !this.client) {
      console.log(`[Cache.del] Redis not available. Key: ${key}`);
      return false;
    }

    try {
      console.log(`[Cache.del] Deleting key: ${key}`);
      const result = await this.client.del(key);
      const success = result > 0;
      console.log(`[Cache.del] ${success ? 'Successfully' : 'Key not found'}: ${key}`);
      return success;
    } catch (error) {
      console.error(`[Cache.del] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all values from cache
   */
  async clear(): Promise<boolean> {
    if (!this.isRedisAvailable || !this.client) {
      console.log('[Cache.clear] Redis not available');
      return false;
    }

    try {
      console.log('[Cache.clear] Clearing all keys');
      if (this.clientType === 'upstash') {
        await (this.client as UpstashRedis).flushall();
      } else {
        await (this.client as Redis).flushall();
      }
      console.log('[Cache.clear] Successfully cleared all keys');
      return true;
    } catch (error) {
      console.error('[Cache.clear] Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    if (!this.isRedisAvailable || !this.client) {
      console.log(`[Cache.keys] Redis not available. Pattern: ${pattern}`);
      return [];
    }

    try {
      console.log(`[Cache.keys] Getting keys matching pattern: ${pattern}`);
      if (this.clientType === 'upstash') {
        return await (this.client as UpstashRedis).keys(pattern);
      }
      return await (this.client as Redis).keys(pattern);
    } catch (error) {
      console.error(`[Cache.keys] Error getting keys for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Batch cache multiple items
   */
  async batchCache<T extends { id: string }>(
    items: T[],
    keyPrefix: string,
    ttl?: number
  ): Promise<boolean> {
    if (!this.isRedisAvailable || !this.client || items.length === 0) {
      return false;
    }

    try {
      console.log(`[Cache.batchCache] Caching ${items.length} items with prefix: ${keyPrefix}`);
      if (this.clientType === 'upstash') {
        await this.batchCacheUpstash(items, keyPrefix, ttl);
      } else {
        await this.batchCacheIORedis(items, keyPrefix, ttl);
      }
      console.log('[Cache.batchCache] Successfully cached all items');
      return true;
    } catch (error) {
      console.error('[Cache.batchCache] Error in batch cache operation:', error);
      return false;
    }
  }

  /**
   * Batch cache using Upstash Redis
   */
  private async batchCacheUpstash<T extends { id: string }>(
    items: T[],
    keyPrefix: string,
    ttl?: number
  ): Promise<void> {
    const pipeline = (this.client as UpstashRedis).pipeline();
    items.forEach(item => {
      const key = `${keyPrefix}:${item.id}`;
      const serializedValue = JSON.stringify(item);
      if (ttl) {
        pipeline.set(key, serializedValue, { ex: ttl });
      } else {
        pipeline.set(key, serializedValue);
      }
    });
    await pipeline.exec();
  }

  /**
   * Batch cache using IORedis
   */
  private async batchCacheIORedis<T extends { id: string }>(
    items: T[],
    keyPrefix: string,
    ttl?: number
  ): Promise<void> {
    const pipeline = (this.client as Redis).pipeline();
    items.forEach(item => {
      const key = `${keyPrefix}:${item.id}`;
      const serializedValue = JSON.stringify(item);
      if (ttl) {
        pipeline.set(key, serializedValue, 'EX', ttl);
      } else {
        pipeline.set(key, serializedValue);
      }
    });
    await pipeline.exec();
  }

  /**
   * Batch get multiple items from cache
   */
  async batchGetCache<T>(ids: string[], keyPrefix: string): Promise<Map<string, T>> {
    if (!this.isRedisAvailable || !this.client || ids.length === 0) {
      return new Map();
    }

    try {
      console.log(`[Cache.batchGetCache] Getting ${ids.length} items with prefix: ${keyPrefix}`);
      const keys = ids.map(id => `${keyPrefix}:${id}`);
      const values = await this.batchGetFromClient(keys);
      return this.processBatchGetResults<T>(ids, values);
    } catch (error) {
      console.error('[Cache.batchGetCache] Error in batch get cache operation:', error);
      return new Map();
    }
  }

  /**
   * Get multiple values from appropriate Redis client
   */
  private async batchGetFromClient(keys: string[]): Promise<(string | null)[]> {
    if (this.clientType === 'upstash') {
      return await (this.client as UpstashRedis).mget(keys);
    }
    return await (this.client as Redis).mget(keys);
  }

  /**
   * Process results from batch get operation
   */
  private processBatchGetResults<T>(ids: string[], values: (string | null)[]): Map<string, T> {
    const result = new Map<string, T>();
    values.forEach((value: string | null, index: number) => {
      if (value !== null) {
        try {
          result.set(ids[index], JSON.parse(value) as T);
        } catch {
          result.set(ids[index], value as unknown as T);
        }
      }
    });
    return result;
  }

  /**
   * Get the underlying Redis client
   */
  getRedisClient(): RedisClient | null {
    return this.client;
  }
}

// Singleton instance
let cacheInstance: Cache | null = null;

/**
 * Get singleton cache instance
 */
export function getCache(): Cache {
  if (!cacheInstance) {
    cacheInstance = new Cache();
  }
  return cacheInstance;
}

/**
 * Get cache key with parameters
 */
export const getCacheKey = (key: string, ...params: string[]): string => {
  return params.length > 0 ? `${key}:${params.join(':')}` : key;
};

/**
 * Get cache TTL for key
 */
export const getCacheTTL = (key: keyof typeof CACHE_TTL): number => {
  return CACHE_TTL[key];
};

/**
 * Cache data with retry mechanism
 */
export const cacheWithRetry = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number,
  maxRetries = 3
): Promise<T> => {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const cache = getCache();

      // Try to get from cache first
      if (cache.isAvailable()) {
        const cachedData = await cache.get<T>(key);
        if (cachedData) {
          return cachedData;
        }
      }

      // Fetch fresh data
      const data = await fetchFn();

      // Cache the data
      if (cache.isAvailable()) {
        await cache.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Cache retry ${i + 1}/${maxRetries} failed:`, lastError);
      await sleep(Math.pow(2, i) * 1000);
    }
  }

  throw lastError;
};

/**
 * Invalidate related cache entries
 */
export const invalidateRelatedCaches = async (
  cache: Cache,
  type: 'game' | 'player' | 'team' | 'user' | 'game_log',
  id: string,
  relatedIds?: { playerId?: string; teamId?: string; season?: string }
): Promise<void> => {
  try {
    switch (type) {
      case 'game':
        await Promise.all([
          cache.del(CACHE_KEYS.GAME(id)),
          cache.del(CACHE_KEYS.GAME_STATS(id)),
          relatedIds?.playerId && cache.del(CACHE_KEYS.PLAYER_GAME_STATS(id, relatedIds.playerId)),
        ]);
        break;
      case 'player':
        await Promise.all([
          cache.del(CACHE_KEYS.PLAYER(id)),
          cache.del(CACHE_KEYS.PLAYER_STATS(id)),
          relatedIds?.season && cache.del(CACHE_KEYS.PLAYER_SEASON_STATS(id, relatedIds.season)),
        ]);
        break;
      case 'team':
        await Promise.all([
          cache.del(CACHE_KEYS.TEAM(id)),
          cache.del(CACHE_KEYS.TEAM_STATS(id)),
          relatedIds?.season && cache.del(CACHE_KEYS.TEAM_SEASON_STATS(id, relatedIds.season)),
        ]);
        break;
      case 'user':
        await Promise.all([
          cache.del(CACHE_KEYS.USER(id)),
          cache.del(CACHE_KEYS.USER_GAME_LOGS(id)),
        ]);
        break;
      case 'game_log':
        await Promise.all([
          cache.del(CACHE_KEYS.USER_GAME_LOGS(relatedIds?.playerId || '')),
          cache.del(CACHE_KEYS.USER_GAME_LOGS_FILTERED(relatedIds?.playerId || '', '*')),
        ]);
        break;
    }
  } catch (error) {
    console.error(`Error invalidating cache for ${type} ${id}:`, error);
  }
};

/**
 * Test Redis connection and basic operations
 */
export const testRedisConnection = async () => {
  try {
    const cache = getCache();
    await cache.initializeRedis();

    if (!cache.isAvailable()) {
      throw new Error('Redis is not available after initialization attempt');
    }

    const testKey1 = 'test:connection:1';
    const testKey2 = 'test:connection:2';
    const testValue = { message: 'Redis connection test', timestamp: new Date().toISOString() };

    // Test setting multiple cache entries
    const setResult1 = await cache.set(testKey1, testValue, 60);
    const setResult2 = await cache.set(testKey2, testValue, 60);
    if (!setResult1 || !setResult2) {
      throw new Error('Failed to set test values in cache');
    }

    await sleep(1000);

    // Test getting cache
    const retrievedValue1 = await cache.get(testKey1);
    const retrievedValue2 = await cache.get(testKey2);

    if (!retrievedValue1 || !retrievedValue2) {
      throw new Error('Retrieved values are null or undefined');
    }

    const setValueStr = JSON.stringify(testValue);
    const retrievedValue1Str = JSON.stringify(retrievedValue1);
    const retrievedValue2Str = JSON.stringify(retrievedValue2);

    if (setValueStr !== retrievedValue1Str || setValueStr !== retrievedValue2Str) {
      throw new Error('Retrieved values do not match set values');
    }

    // Test clearing cache
    const clearResult = await cache.clear();
    if (!clearResult) {
      throw new Error('Failed to clear cache');
    }

    // Verify all values were cleared
    const value1AfterClear = await cache.get(testKey1);
    const value2AfterClear = await cache.get(testKey2);
    if (value1AfterClear !== null || value2AfterClear !== null) {
      throw new Error('Values still exist in cache after clearing');
    }

    // Test setting cache again after clear
    const setResultAfterClear = await cache.set(testKey1, testValue, 60);
    if (!setResultAfterClear) {
      throw new Error('Failed to set test value in cache after clearing');
    }

    // Test deleting cache
    const deleteResult = await cache.del(testKey1);
    if (!deleteResult) {
      throw new Error('Failed to delete test value from cache');
    }

    // Verify the value was actually deleted
    const valueAfterDelete = await cache.get(testKey1);
    if (valueAfterDelete !== null) {
      throw new Error('Value still exists in cache after deletion');
    }

    return true;
  } catch (error) {
    console.error('Redis test failed:', error);
    throw error;
  }
};
