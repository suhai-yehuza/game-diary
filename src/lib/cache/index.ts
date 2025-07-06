// Removed client export as client.ts was deleted
// export * from './client';

// Comprehensive caching system with in-memory cache
import type { ICacheConfig, ICacheEntry, ICacheStats } from '@/lib/types/infrastructureTypes';

// In-memory cache implementation
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
    return this.cache.delete(key);
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

// Main cache manager
class CacheManager {
  private readonly memoryCache: MemoryCache;
  private readonly config: ICacheConfig;

  constructor(config: ICacheConfig = {}) {
    this.memoryCache = new MemoryCache();
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      enableRedis: false, // Disabled for now
      ...config,
    };
  }

  set(key: string, value: unknown, ttl?: number): Promise<void> {
    const cacheTTL = ttl ?? this.config.defaultTTL;
    this.memoryCache.set(key, value, cacheTTL);
    return Promise.resolve();
  }

  get<T>(key: string): Promise<T | null> {
    return Promise.resolve(this.memoryCache.get<T>(key));
  }

  delete(key: string): Promise<boolean> {
    return Promise.resolve(this.memoryCache.delete(key));
  }

  clear(): void {
    this.memoryCache.clear();
  }

  getStats(): ICacheStats {
    return this.memoryCache.getStats();
  }
}

// Global cache instance
const cacheManager = new CacheManager();

// Export cache utilities
export function testRedisConnection(): boolean {
  try {
    // Simple connection test - placeholder implementation
    console.warn('Redis connection test not implemented');
    return true;
  } catch {
    return false;
  }
}

export function getCache(): CacheManager {
  return cacheManager;
}

// Export cache manager as default
export default cacheManager;
