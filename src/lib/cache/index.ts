// Removed client export as client.ts was deleted
// export * from './client';

// Comprehensive caching system with Redis service integration
import type { ICacheConfig, ICacheEntry, ICacheStats } from '@/lib/types';
import { CacheNamespace } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

import { redisService } from './redis-service';

// In-memory cache implementation for fallback
class MemoryCache {
  private readonly cache: Map<string, ICacheEntry> = new Map();
  private readonly stats: ICacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
  };

  set(key: string, value: unknown, ttl = 300000): void {
    const entry: ICacheEntry = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;
    this.cleanup();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || typeof entry.timestamp !== 'number' || typeof entry.ttl !== 'number') {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }
    const { timestamp, ttl, value } = entry;
    if (Date.now() - timestamp > ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }
    this.stats.hits++;
    return value as T;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!entry || typeof entry.timestamp !== 'number' || typeof entry.ttl !== 'number') {
        this.cache.delete(key);
        continue;
      }
      const { timestamp, ttl } = entry;
      if (now - timestamp > ttl) {
        this.cache.delete(key);
      }
    }
    this.stats.size = this.cache.size;
  }

  getStats(): ICacheStats {
    return { ...this.stats };
  }
}

// Enhanced cache manager that uses Redis service with memory fallback
class CacheManager {
  private readonly memoryCache: MemoryCache;
  private readonly config: ICacheConfig;

  constructor(config: ICacheConfig = {}) {
    this.memoryCache = new MemoryCache();
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      enableRedis: true, // Enable Redis by default
      ...config,
    };
  }

  async set(
    key: string,
    value: unknown,
    ttl?: number,
    namespace: CacheNamespace = CacheNamespace.SYSTEM
  ): Promise<void> {
    const cacheTTL = ttl ?? this.config.defaultTTL;

    // Always set in memory cache for fast access
    this.memoryCache.set(key, value, cacheTTL);

    // Set in Redis if enabled
    if (this.config.enableRedis) {
      try {
        await redisService.set(key, value, namespace, 'medium');
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'Cache Manager',
          action: 'Set Redis Cache',
          metadata: { key, namespace },
        });
        console.warn('Redis set failed, using memory cache only');
      }
    }
  }

  async get<T>(key: string, namespace: CacheNamespace = CacheNamespace.SYSTEM): Promise<T | null> {
    // First try memory cache (fastest)
    const memoryResult = this.memoryCache.get<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // If not in memory and Redis is enabled, try Redis
    if (this.config.enableRedis) {
      try {
        const redisResult = await redisService.get<T>(key, namespace);
        if (redisResult !== null) {
          // Store in memory cache for future fast access
          this.memoryCache.set(key, redisResult, this.config.defaultTTL);
          return redisResult;
        }
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'Cache Manager',
          action: 'Get Redis Cache',
          metadata: { key, namespace },
        });
        console.warn('Redis get failed, using memory cache only');
      }
    }

    return null;
  }

  async delete(key: string, namespace: CacheNamespace = CacheNamespace.SYSTEM): Promise<boolean> {
    // Delete from memory cache
    const memoryDeleted = this.memoryCache.delete(key);

    // Delete from Redis if enabled
    if (this.config.enableRedis) {
      try {
        await redisService.delete(key, namespace);
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'Cache Manager',
          action: 'Delete Redis Cache',
          metadata: { key, namespace },
        });
        console.warn('Redis delete failed');
      }
    }

    return memoryDeleted;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();

    // Clear Redis if enabled
    if (this.config.enableRedis) {
      try {
        await redisService.clear();
      } catch (error) {
        errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
          component: 'Cache Manager',
          action: 'Clear Redis Cache',
        });
        console.warn('Redis clear failed');
      }
    }
  }

  getStats(): ICacheStats {
    return this.memoryCache.getStats();
  }

  // Get Redis service stats
  getRedisStats() {
    return redisService.getStats();
  }

  // Test Redis connection
  async testRedisConnection(): Promise<boolean> {
    if (!this.config.enableRedis) {
      return false;
    }
    return redisService.testConnection();
  }
}

// Global cache instance
const cacheManager = new CacheManager();

// Export the cache manager and utilities
export { cacheManager as cache };
export { CacheManager };

// Utility functions
export function getCache(): CacheManager {
  return cacheManager;
}

export async function testRedisConnection(): Promise<boolean> {
  return cacheManager.testRedisConnection();
}

// Export types
export type { ICacheConfig, ICacheEntry, ICacheStats };
