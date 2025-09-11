import { logger } from '@/lib/utils/logger';
import type { ICacheEntry, ICacheOptions } from '@/types';

class SimpleCacheService {
  private readonly cache: Map<string, ICacheEntry> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly maxSize = 1000; // Maximum number of entries

  /**
   * Get data from cache
   */
  get<T>(key: string, options: ICacheOptions = {}): T | null {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      logger.cache('miss', cacheKey);
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      logger.cache('expired', cacheKey);
      return null;
    }

    logger.cache('hit', cacheKey);
    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, options: ICacheOptions = {}): void {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTTL;

    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.cache('evicted', oldestKey);
      }
    }

    this.cache.set(cacheKey, {
      key: cacheKey,
      value: data,
      data,
      timestamp: Date.now(),
      ttl,
      createdAt: new Date(),
      accessedAt: new Date(),
      hitCount: 0,
    });

    logger.cache('set', cacheKey);
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string, options: ICacheOptions = {}): boolean {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    const deleted = this.cache.delete(cacheKey);
    if (deleted) {
      logger.cache('delete', cacheKey);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    logger.cache('cleared', 'all');
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(options: { pattern?: string } = {}): void {
    if (!options.pattern) {
      this.clear();
      return;
    }

    // Get keys matching the pattern
    const keysToDelete = this.getKeysByPattern(options.pattern);

    // Delete matching entries
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      logger.cache('invalidated', key);
    });
    logger.cache('invalidated', `pattern: ${options.pattern}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get keys by pattern (simple implementation)
   */
  getKeysByPattern(pattern: string): string[] {
    const keys = Array.from(this.cache.keys());
    if (pattern === '*') {
      return keys;
    }

    // Simple pattern matching - convert glob to regex
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);

    return keys.filter(key => regex.test(key));
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Build cache key with optional namespace
   */
  private buildCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }
}

// Export singleton instance
export const simpleCacheService = new SimpleCacheService();

// Export the class for testing
export { SimpleCacheService };
