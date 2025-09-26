import { Redis } from '@upstash/redis';

import { ErrorHandler } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { ErrorCategory } from '@/types';
import type { ICacheEntry, ICacheOptions } from '@/types';

/**
 * Redis-based cache service that provides distributed caching
 * with fallback to memory cache for reliability
 */
class RedisCacheService {
  private redis: Redis | null = null;
  private readonly memoryCache: Map<string, ICacheEntry> = new Map();
  private readonly defaultTTL = 5 * 60; // 5 minutes in seconds (Redis uses seconds)
  private readonly maxMemorySize = 1000; // Maximum number of entries in memory fallback
  private isRedisAvailable = false;
  private initializationPromise: Promise<void> | null = null;
  private readonly errorHandler = ErrorHandler.getInstance();

  constructor() {
    // Initialize Redis lazily when first needed
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    const result = await this.errorHandler.handleAsync(
      async () => {
        this.redis = Redis.fromEnv();

        // Test Redis connection
        await this.redis.set('test:connection', 'ping', { ex: 10 });
        const result = await this.redis.get('test:connection');

        if (result === 'ping') {
          await this.redis.del('test:connection');
          this.isRedisAvailable = true;
          logger.info('Redis connection established');
          return true;
        } else {
          throw new Error('Redis connection test failed');
        }
      },
      {
        component: 'RedisCacheService',
        action: 'initializeRedis',
        category: ErrorCategory.DATABASE,
      }
    );

    if (!result) {
      this.isRedisAvailable = false;
      this.redis = null;
    }
  }

  /**
   * Get data from cache (Redis first, then memory fallback)
   */
  async get<T>(key: string, options: ICacheOptions = {}): Promise<T | null> {
    const cacheKey = this.buildCacheKey(key, options.namespace);

    // Try Redis first if available
    if (this.isRedisAvailable && this.redis) {
      const result = await this.errorHandler.handleAsync(
        async () => {
          const result = await this.redis?.get(cacheKey);
          if (result !== null) {
            logger.cache('hit', `redis:${cacheKey}`);
            return result as T;
          }
          return null;
        },
        {
          component: 'RedisCacheService',
          action: 'get',
          category: ErrorCategory.DATABASE,
        }
      );

      if (result !== null && result !== undefined) {
        return result;
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(cacheKey);
    if (!entry) {
      logger.cache('miss', `memory:${cacheKey}`);
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(cacheKey);
      logger.cache('expired', `memory:${cacheKey}`);
      return null;
    }

    logger.cache('hit', `memory:${cacheKey}`);
    return entry.data as T;
  }

  /**
   * Set data in cache (Redis first, then memory fallback)
   */
  async set<T>(key: string, data: T, options: ICacheOptions = {}): Promise<void> {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTTL;

    // Try Redis first if available
    if (this.isRedisAvailable && this.redis) {
      const success = await this.errorHandler.handleAsync(
        async () => {
          await this.redis?.set(cacheKey, data, { ex: ttl });
          logger.cache('set', `redis:${cacheKey}`);
          return true;
        },
        {
          component: 'RedisCacheService',
          action: 'set',
          category: ErrorCategory.DATABASE,
        }
      );

      if (success) {
        // Also store in memory for faster access
        this.setMemoryCache(cacheKey, data, ttl);
        return;
      }
    }

    // Fallback to memory cache
    this.setMemoryCache(cacheKey, data, ttl);
    logger.cache('set', `memory:${cacheKey}`);
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string, options: ICacheOptions = {}): Promise<boolean> {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    let deleted = false;

    // Try Redis first if available
    if (this.isRedisAvailable && this.redis) {
      const result = await this.errorHandler.handleAsync(
        async () => {
          const result = await this.redis?.del(cacheKey);
          const deleted = (result ?? 0) > 0;
          if (deleted) {
            logger.cache('delete', `redis:${cacheKey}`);
          }
          return deleted;
        },
        {
          component: 'RedisCacheService',
          action: 'delete',
          category: ErrorCategory.DATABASE,
        }
      );

      if (result !== undefined) {
        deleted = result;
      }
    }

    // Also delete from memory cache
    const memoryDeleted = this.memoryCache.delete(cacheKey);
    if (memoryDeleted) {
      logger.cache('delete', `memory:${cacheKey}`);
    }

    return deleted || memoryDeleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    // Clear Redis if available
    if (this.isRedisAvailable && this.redis) {
      await this.errorHandler.handleAsync(
        async () => {
          // Note: Upstash Redis has limitations on keys command in production
          // We'll clear by namespaces instead
          const namespaces = [
            'games',
            'users',
            'gameLogs',
            'comments',
            'reactions',
            'search',
            'system',
            'nbaHub',
          ];

          for (const namespace of namespaces) {
            await this.errorHandler.handleAsync(
              async () => {
                // This is a simplified approach - in production, you might want to track keys
                await this.redis?.del(`${namespace}:*`);
              },
              {
                component: 'RedisCacheService',
                action: 'clearNamespace',
                category: ErrorCategory.DATABASE,
                metadata: { namespace },
              }
            );
          }

          logger.cache('cleared', 'redis:all');
        },
        {
          component: 'RedisCacheService',
          action: 'clear',
          category: ErrorCategory.DATABASE,
        }
      );
    }

    // Clear memory cache
    this.memoryCache.clear();
    logger.cache('cleared', 'memory:all');
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidate(options: { pattern?: string } = {}): Promise<void> {
    if (!options.pattern) {
      await this.clear();
      return;
    }

    // Try Redis pattern deletion if available
    if (this.isRedisAvailable && this.redis) {
      await this.errorHandler.handleAsync(
        async () => {
          // Note: Upstash Redis has limitations on pattern matching in production
          // This is a simplified implementation
          const keys = this.getKeysByPattern(options.pattern || '');
          if (keys.length > 0) {
            await this.redis?.del(...keys);
            logger.cache('invalidated', `redis:${options.pattern}`);
          }
        },
        {
          component: 'RedisCacheService',
          action: 'invalidate',
          category: ErrorCategory.DATABASE,
          metadata: { pattern: options.pattern },
        }
      );
    }

    // Also invalidate memory cache
    const keysToDelete = this.getKeysByPattern(options.pattern);
    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
      logger.cache('invalidated', `memory:${key}`);
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
    redisAvailable: boolean;
    memorySize: number;
  } {
    const memoryKeys = Array.from(this.memoryCache.keys());

    return {
      size: memoryKeys.length,
      maxSize: this.maxMemorySize,
      keys: memoryKeys,
      redisAvailable: this.isRedisAvailable,
      memorySize: this.memoryCache.size,
    };
  }

  /**
   * Wait for Redis initialization to complete
   */
  async waitForInitialization(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeRedis();
    }
    await this.initializationPromise;
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    const result = await this.errorHandler.handleAsync(
      async () => {
        await this.redis?.set('test:connection', 'ping', { ex: 10 });
        const result = await this.redis?.get('test:connection');
        await this.redis?.del('test:connection');
        return result === 'ping';
      },
      {
        component: 'RedisCacheService',
        action: 'testConnection',
        category: ErrorCategory.DATABASE,
      }
    );

    return result ?? false;
  }

  /**
   * Get keys by pattern (simple implementation)
   */
  private getKeysByPattern(pattern: string): string[] {
    const keys = Array.from(this.memoryCache.keys());
    if (pattern === '*') {
      return keys;
    }

    // Simple pattern matching - convert glob to regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);

    return keys.filter(key => regex.test(key));
  }

  /**
   * Set data in memory cache
   */
  private setMemoryCache<T>(cacheKey: string, data: T, ttl: number): void {
    // If cache is at max size, remove oldest entry
    if (this.memoryCache.size >= this.maxMemorySize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        logger.cache('evicted', `memory:${oldestKey}`);
      }
    }

    this.memoryCache.set(cacheKey, {
      key: cacheKey,
      value: data,
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert seconds to milliseconds
      createdAt: new Date(),
      accessedAt: new Date(),
      hitCount: 0,
    });
  }

  /**
   * Build cache key with optional namespace
   */
  private buildCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }
}

// Export singleton instance
export const redisCacheService = new RedisCacheService();

// Export the class for testing
export { RedisCacheService };
