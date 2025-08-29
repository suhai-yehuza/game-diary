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

  constructor(maxSize = Number(process.env.MEMORY_CACHE_MAX_SIZE) || 1000) {
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
    // Initialize Redis asynchronously
    this.initializeRedis().catch(error => {
      console.warn('Failed to initialize Redis service:', error);
    });
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = Redis.fromEnv();
      this.isRedisAvailable = true;
      console.log('✅ Redis service initialized successfully');

      // Clean corrupted entries on startup
      await this.cleanCorruptedEntries();
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
            // Check if the result is already a string that looks like JSON
            let dataToParse = redisResult;
            if (typeof redisResult === 'object') {
              // If it's an object, stringify it first
              dataToParse = JSON.stringify(redisResult);
            }

            const parsed = JSON.parse(dataToParse as string);
            const { value, priority } = parsed;

            // Store in memory cache for future fast access
            const priorityKey = (priority || 'medium') as keyof typeof CACHE_PRIORITIES;
            const { memoryTTL } = CACHE_PRIORITIES[priorityKey];
            this.memoryCache.set(cacheKey, value, memoryTTL * 1000);

            return value as T;
          } catch (parseError) {
            // Log the error but don't throw it
            console.warn(`Failed to parse Redis cache entry for key "${cacheKey}":`, parseError);
            console.warn('Redis result type:', typeof redisResult);
            console.warn('Redis result:', redisResult);

            // Remove corrupted entry silently
            try {
              await this.redis.del(cacheKey);
              console.log(`🗑️ Removed corrupted cache entry: ${cacheKey}`);
            } catch (deleteError) {
              console.warn('Failed to delete corrupted cache entry:', deleteError);
            }
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
   * Clean corrupted cache entries
   */
  async cleanCorruptedEntries(): Promise<void> {
    try {
      if (!this.isRedisAvailable || !this.redis) {
        return;
      }

      console.log('🔍 Scanning for corrupted cache entries...');
      const allKeys = await this.redis.keys('*');
      let corruptedCount = 0;

      for (const key of allKeys) {
        try {
          const value = await this.redis.get(key);
          if (value) {
            // Try to parse the value
            if (typeof value === 'object') {
              JSON.stringify(value); // This will throw if it's not serializable
            } else {
              JSON.parse(value as string);
            }
          }
        } catch (_error) {
          console.warn(`Found corrupted cache entry: ${key}`);
          try {
            await this.redis.del(key);
            corruptedCount++;
          } catch (deleteError) {
            console.warn(`Failed to delete corrupted key ${key}:`, deleteError);
          }
        }
      }

      if (corruptedCount > 0) {
        console.log(`🧹 Cleaned ${corruptedCount} corrupted cache entries`);
      } else {
        console.log('✅ No corrupted cache entries found');
      }
    } catch (error) {
      console.warn('Failed to clean corrupted cache entries:', error);
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
