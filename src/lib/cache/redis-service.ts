import { Redis } from '@upstash/redis';

import { CacheNamespace } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

// Cache priority levels with different TTLs
export const CACHE_PRIORITIES = {
  low: { ttl: 5 * 60, memoryTTL: 2 * 60 }, // 5min Redis, 2min Memory
  medium: { ttl: 15 * 60, memoryTTL: 5 * 60 }, // 15min Redis, 5min Memory
  high: { ttl: 60 * 60, memoryTTL: 15 * 60 }, // 1hour Redis, 15min Memory
  critical: { ttl: 24 * 60 * 60, memoryTTL: 60 * 60 }, // 24hour Redis, 1hour Memory
} as const;

// In-memory cache for fast access
class MemoryCache {
  private readonly cache = new Map<string, { value: unknown; timestamp: number; ttl: number }>();
  private readonly maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, value: unknown, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const { timestamp, ttl, value } = entry;
    if (Date.now() - timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return value as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Redis service with fallback to memory cache
class RedisService {
  private redis: Redis | null = null;
  private readonly memoryCache: MemoryCache;
  private isRedisAvailable = false;

  constructor() {
    this.memoryCache = new MemoryCache(1000);
    this.initializeRedis();
  }

  private initializeRedis(): void {
    try {
      this.redis = Redis.fromEnv();
      this.isRedisAvailable = true;
      console.log('✅ Redis service initialized successfully');
    } catch (error) {
      console.warn('⚠️ Redis not available, using memory cache only:', error);
      this.isRedisAvailable = false;
    }
  }

  /**
   * Set a value in cache with namespace and priority
   */
  async set(
    key: string,
    value: unknown,
    namespace: CacheNamespace = CacheNamespace.SYSTEM,
    priority: keyof typeof CACHE_PRIORITIES = 'medium'
  ): Promise<void> {
    const cacheKey = `${namespace}:${key}`;
    const { ttl, memoryTTL } = CACHE_PRIORITIES[priority];

    try {
      // Always set in memory cache for fast access
      this.memoryCache.set(cacheKey, value, memoryTTL * 1000);

      // Set in Redis if available
      if (this.isRedisAvailable && this.redis) {
        const serializedValue = JSON.stringify({
          value,
          timestamp: Date.now(),
          priority,
        });

        await this.redis.set(cacheKey, serializedValue, { ex: ttl });
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Redis Service',
        action: 'Set Cache',
      });
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, namespace: CacheNamespace = CacheNamespace.SYSTEM): Promise<T | null> {
    const cacheKey = `${namespace}:${key}`;

    try {
      // First, try memory cache (fastest)
      const memoryResult = this.memoryCache.get<T>(cacheKey);
      if (memoryResult !== null) {
        return memoryResult;
      }

      // If not in memory, try Redis
      if (this.isRedisAvailable && this.redis) {
        const redisResult = await this.redis.get(cacheKey);
        if (redisResult) {
          try {
            const parsed = JSON.parse(redisResult as string);
            const { value, priority } = parsed;

            // Store in memory cache for future fast access
            const priorityKey = (priority || 'medium') as keyof typeof CACHE_PRIORITIES;
            const { memoryTTL } = CACHE_PRIORITIES[priorityKey];
            this.memoryCache.set(cacheKey, value, memoryTTL * 1000);

            return value as T;
          } catch (parseError) {
            console.warn('Failed to parse Redis cache entry:', parseError);
            // Remove corrupted entry
            await this.redis.del(cacheKey);
          }
        }
      }

      return null;
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Redis Service',
        action: 'Get Cache',
      });
      return null;
    }
  }

  /**
   * Delete a cache entry
   */
  async delete(key: string, namespace: CacheNamespace = CacheNamespace.SYSTEM): Promise<void> {
    const cacheKey = `${namespace}:${key}`;

    try {
      // Delete from memory cache
      this.memoryCache.delete(cacheKey);

      // Delete from Redis if available
      if (this.isRedisAvailable && this.redis) {
        await this.redis.del(cacheKey);
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Redis Service',
        action: 'Delete Cache',
      });
    }
  }

  /**
   * Clear all cache entries for a namespace
   */
  async clearNamespace(namespace: CacheNamespace): Promise<void> {
    try {
      if (this.isRedisAvailable && this.redis) {
        const pattern = `${namespace}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🧹 Cleared ${keys.length} Redis keys for namespace: ${namespace}`);
        }
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Redis Service',
        action: 'Clear Namespace',
      });
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();

      if (this.isRedisAvailable && this.redis) {
        await this.redis.flushdb();
        console.log('🧹 Cleared all Redis cache entries');
      }
    } catch (error) {
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'Redis Service',
        action: 'Clear All Cache',
      });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    redisAvailable: boolean;
  } {
    return {
      memorySize: this.memoryCache.getSize(),
      redisAvailable: this.isRedisAvailable,
    };
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isRedisAvailable || !this.redis) {
      return false;
    }

    try {
      await this.redis.set('test:connection', 'ping', { ex: 10 });
      const result = await this.redis.get('test:connection');
      await this.redis.del('test:connection');
      return result === 'ping';
    } catch (error) {
      console.error('Redis connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();

// Export utilities
export { RedisService, MemoryCache };
