import { ErrorHandler } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { ErrorCategory } from '@/types';
import type { ICacheOptions } from '@/types';

import { redisCacheService } from './redis-cache-service';
import { simpleCacheService } from './simple-cache-service';

/**
 * Hybrid cache service that intelligently uses Redis or memory cache
 * based on availability and performance requirements
 */
class HybridCacheService {
  private readonly useRedis: boolean;
  private readonly fallbackToMemory: boolean;
  private readonly errorHandler = ErrorHandler.getInstance();

  constructor() {
    // Check if Redis should be used based on environment
    this.useRedis = this.shouldUseRedis();
    this.fallbackToMemory = true; // Always allow fallback to memory

    logger.info(`Cache strategy: ${this.useRedis ? 'Redis + Memory' : 'Memory only'}`);
  }

  /**
   * Determine if Redis should be used
   */
  private shouldUseRedis(): boolean {
    // Check for Redis environment variables
    const hasRedisConfig = !!(
      process.env.REDIS_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_URL
    );

    // Don't use Redis in test environments unless explicitly enabled
    const isTestEnv = process.env.NODE_ENV === 'test' || process.env.CI === 'true';
    const forceRedis = process.env.FORCE_REDIS_CACHE === 'true';

    return hasRedisConfig && (!isTestEnv || forceRedis);
  }

  /**
   * Get data from cache with intelligent fallback
   */
  async get<T>(key: string, options: ICacheOptions = {}): Promise<T | null> {
    // Try Redis first if enabled
    if (this.useRedis) {
      const result = await this.errorHandler.handleAsync(
        async () => {
          // Wait for Redis initialization
          await redisCacheService.waitForInitialization();

          // Check if Redis is actually available
          const redisStats = redisCacheService.getStats();
          if (redisStats.redisAvailable) {
            const result = await redisCacheService.get<T>(key, options);
            if (result !== null) {
              return result;
            }
          }
          return null;
        },
        {
          component: 'HybridCacheService',
          action: 'get',
          category: ErrorCategory.DATABASE,
        }
      );

      if (result !== null && result !== undefined) {
        return result;
      }
    }

    // Fallback to memory cache
    if (this.fallbackToMemory) {
      const result = await this.errorHandler.handleAsync(
        () => Promise.resolve(simpleCacheService.get<T>(key, options)),
        {
          component: 'HybridCacheService',
          action: 'getMemory',
          category: ErrorCategory.DATABASE,
        }
      );

      if (result !== null && result !== undefined) {
        return result as T;
      }
    }

    return null;
  }

  /**
   * Set data in cache with intelligent strategy
   */
  async set<T>(key: string, data: T, options: ICacheOptions = {}): Promise<void> {
    const promises: Promise<void>[] = [];

    // Set in Redis if enabled
    if (this.useRedis) {
      promises.push(
        this.errorHandler
          .handleAsync(
            async () => {
              await redisCacheService.waitForInitialization();

              // Check if Redis is actually available
              const redisStats = redisCacheService.getStats();
              if (redisStats.redisAvailable) {
                return redisCacheService.set(key, data, options);
              }
            },
            {
              component: 'HybridCacheService',
              action: 'set',
              category: ErrorCategory.DATABASE,
            }
          )
          .then(() => undefined) // Convert to void
      );
    }

    // Set in memory cache as fallback or primary
    if (this.fallbackToMemory) {
      promises.push(
        this.errorHandler
          .handleAsync(() => Promise.resolve(simpleCacheService.set(key, data, options)), {
            component: 'HybridCacheService',
            action: 'setMemory',
            category: ErrorCategory.DATABASE,
          })
          .then(() => undefined) // Convert to void
      );
    }

    // Wait for all cache operations to complete
    await Promise.allSettled(promises);
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string, options: ICacheOptions = {}): Promise<boolean> {
    const promises: Promise<boolean>[] = [];
    let deleted = false;

    // Delete from Redis if enabled
    if (this.useRedis) {
      promises.push(
        this.errorHandler
          .handleAsync(
            async () => {
              const result = await redisCacheService.delete(key, options);
              if (result) deleted = true;
              return result;
            },
            {
              component: 'HybridCacheService',
              action: 'delete',
              category: ErrorCategory.DATABASE,
            }
          )
          .then(result => result ?? false)
      );
    }

    // Delete from memory cache
    if (this.fallbackToMemory) {
      promises.push(
        this.errorHandler
          .handleAsync(
            async () => {
              const result = await Promise.resolve(simpleCacheService.delete(key, options));
              if (result) deleted = true;
              return result;
            },
            {
              component: 'HybridCacheService',
              action: 'deleteMemory',
              category: ErrorCategory.DATABASE,
            }
          )
          .then(result => (result as boolean) ?? false)
      );
    }

    // Wait for all delete operations to complete
    await Promise.allSettled(promises);
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Clear Redis if enabled
    if (this.useRedis) {
      promises.push(
        this.errorHandler
          .handleAsync(async () => redisCacheService.clear(), {
            component: 'HybridCacheService',
            action: 'clear',
            category: ErrorCategory.DATABASE,
          })
          .then(() => undefined) // Convert to void
      );
    }

    // Clear memory cache
    if (this.fallbackToMemory) {
      promises.push(
        this.errorHandler
          .handleAsync(() => Promise.resolve(simpleCacheService.clear()), {
            component: 'HybridCacheService',
            action: 'clearMemory',
            category: ErrorCategory.DATABASE,
          })
          .then(() => undefined) // Convert to void
      );
    }

    // Wait for all clear operations to complete
    await Promise.allSettled(promises);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidate(options: { pattern?: string } = {}): Promise<void> {
    const promises: Promise<void>[] = [];

    // Invalidate Redis if enabled
    if (this.useRedis) {
      promises.push(
        this.errorHandler
          .handleAsync(async () => redisCacheService.invalidate(options), {
            component: 'HybridCacheService',
            action: 'invalidate',
            category: ErrorCategory.DATABASE,
          })
          .then(() => undefined) // Convert to void
      );
    }

    // Invalidate memory cache
    if (this.fallbackToMemory) {
      promises.push(
        this.errorHandler
          .handleAsync(() => Promise.resolve(simpleCacheService.invalidate(options)), {
            component: 'HybridCacheService',
            action: 'invalidateMemory',
            category: ErrorCategory.DATABASE,
          })
          .then(() => undefined) // Convert to void
      );
    }

    // Wait for all invalidate operations to complete
    await Promise.allSettled(promises);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number;
    maxSize: number;
    keys: string[];
    redisAvailable: boolean;
    memorySize: number;
    strategy: string;
  }> {
    const stats = {
      size: 0,
      maxSize: 0,
      keys: [] as string[],
      redisAvailable: false,
      memorySize: 0,
      strategy: 'Memory only',
    };

    // Always check Redis availability dynamically
    await this.errorHandler.handleAsync(
      async () => {
        await redisCacheService.waitForInitialization();
        const redisStats = redisCacheService.getStats();
        stats.redisAvailable = redisStats.redisAvailable;
        stats.size = redisStats.size;
        stats.maxSize = redisStats.maxSize;
        stats.keys = redisStats.keys;
        stats.memorySize = redisStats.memorySize;

        if (redisStats.redisAvailable) {
          stats.strategy = 'Redis + Memory';
        }
        return true;
      },
      {
        component: 'HybridCacheService',
        action: 'getStats',
        category: ErrorCategory.DATABASE,
      }
    );

    // Get memory cache stats
    if (this.fallbackToMemory) {
      await this.errorHandler.handleAsync(
        async () => {
          const memoryStats = await Promise.resolve(simpleCacheService.getStats());
          stats.size = Math.max(stats.size, memoryStats.size);
          stats.maxSize = Math.max(stats.maxSize, memoryStats.maxSize);
          stats.keys = [...new Set([...stats.keys, ...memoryStats.keys])];
          return true;
        },
        {
          component: 'HybridCacheService',
          action: 'getMemoryStats',
          category: ErrorCategory.DATABASE,
        }
      );
    }

    return stats;
  }

  /**
   * Test cache connections
   */
  async testConnections(): Promise<{
    redis: boolean;
    memory: boolean;
  }> {
    const results = {
      redis: false,
      memory: true, // Memory cache is always available
    };

    // Always test Redis connection dynamically
    const redisResult = await this.errorHandler.handleAsync(
      async () => {
        await redisCacheService.waitForInitialization();
        return redisCacheService.testConnection();
      },
      {
        component: 'HybridCacheService',
        action: 'testConnections',
        category: ErrorCategory.DATABASE,
      }
    );

    results.redis = redisResult ?? false;

    // Memory cache is always available
    const memoryResult = await this.errorHandler.handleAsync(
      async () => {
        await Promise.resolve(simpleCacheService.getStats());
        return true;
      },
      {
        component: 'HybridCacheService',
        action: 'testMemory',
        category: ErrorCategory.DATABASE,
      }
    );

    results.memory = (memoryResult as boolean) ?? false;

    return results;
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    redis: boolean;
    memory: boolean;
    strategy: string;
    timestamp: string;
  }> {
    const connections = await this.testConnections();
    const stats = await this.getStats();

    return {
      healthy: connections.memory, // At least memory cache should be working
      redis: connections.redis,
      memory: connections.memory,
      strategy: stats.strategy,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const hybridCacheService = new HybridCacheService();

// Export the class for testing
export { HybridCacheService };
