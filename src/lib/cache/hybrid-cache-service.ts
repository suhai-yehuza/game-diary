import { Redis } from '@upstash/redis';

import { logger } from '@/lib/utils/logger';
import type { ICacheOptions, ICacheEntry, ICacheStats, ICacheInvalidationOptions } from '@/types';

class HybridCacheService {
  private readonly memoryCache: Map<string, ICacheEntry> = new Map();
  private readonly redis: Redis | null;
  private readonly defaultTTL = 300; // 5 minutes
  private readonly maxMemorySize = 100 * 1024 * 1024; // 100MB
  private readonly maxMemoryEntries = 10000; // 10k entries
  private memoryCleanupInterval?: NodeJS.Timeout;
  private statsUpdateInterval?: NodeJS.Timeout;
  private readonly stats: ICacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    keyCount: 0,
    evictions: 0,
    timestamp: new Date().toISOString(),
    memoryHits: 0,
    memoryMisses: 0,
    redisHits: 0,
    redisMisses: 0,
    databaseHits: 0,
    databaseMisses: 0,
    redisUsage: 0,
    namespace: 'hybrid-cache',
    cacheKeys: {},
    health: {
      status: 'healthy',
      memory: true,
      redis: false, // Will be updated in constructor
      database: true,
    },
    totalKeys: 0,
  };

  constructor() {
    // Only initialize Redis if we're on the server side and have environment variables
    if (
      typeof window === 'undefined' &&
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      try {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Redis client initialized successfully');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Redis client:', error);
        this.redis = null;
      }
    } else {
      // Client side or missing environment variables
      if (typeof window !== 'undefined') {
        console.log('ℹ️ Running on client side - Redis disabled');
      } else {
        console.warn('⚠️ Missing Redis environment variables - Redis disabled');
      }
      this.redis = null;
    }

    // Update Redis status in health
    if (this.stats.health) {
      this.stats.health.redis = !!this.redis;
    }

    // Start memory cleanup interval
    this.startMemoryCleanup();

    // Start stats update interval
    this.startStatsUpdate();
  }

  /**
   * Get effective cache strategy based on environment and availability
   */
  private getEffectiveStrategy(strategy?: string): string {
    // If no strategy specified, use hybrid
    if (!strategy) {
      return 'hybrid';
    }

    // On client side, force memory-only strategy
    if (typeof window !== 'undefined') {
      return 'memory';
    }

    // On server side, use the requested strategy
    return strategy;
  }

  /**
   * Get data from cache using optimal strategy
   */
  async get<T>(key: string, options: ICacheOptions = {}): Promise<T | null> {
    const startTime = Date.now();
    const cacheKey = this.buildCacheKey(key, options.namespace);

    try {
      this.stats.totalRequests++;

      // Auto-adjust strategy based on environment
      const effectiveStrategy = this.getEffectiveStrategy(options.strategy);

      // Strategy 1: Check in-memory cache first (fastest)
      if (effectiveStrategy !== 'redis' && effectiveStrategy !== 'database') {
        const memoryResult = this.getFromMemory<T>(cacheKey);
        if (memoryResult !== null) {
          this.stats.memoryHits = (this.stats.memoryHits ?? 0) + 1;
          this.updateResponseTime(Date.now() - startTime);
          return memoryResult;
        }
        this.stats.memoryMisses = (this.stats.memoryMisses ?? 0) + 1;
      }

      // Strategy 2: Check Redis cache (only on server side)
      if (effectiveStrategy !== 'memory' && effectiveStrategy !== 'database' && this.redis) {
        const redisResult = await this.getFromRedis<T>(cacheKey);
        if (redisResult !== null) {
          this.stats.redisHits = (this.stats.redisHits ?? 0) + 1;

          // Optionally store in memory for faster subsequent access
          if (effectiveStrategy === 'hybrid') {
            this.setInMemory(cacheKey, redisResult, options);
          }

          this.updateResponseTime(Date.now() - startTime);
          return redisResult;
        }
        this.stats.redisMisses = (this.stats.redisMisses ?? 0) + 1;
      }

      // Strategy 3: Check database (if configured)
      if (options.strategy === 'database') {
        const dbResult = this.getFromDatabase<T>(cacheKey);
        if (dbResult !== null) {
          this.stats.databaseHits = (this.stats.databaseHits ?? 0) + 1;
          this.updateResponseTime(Date.now() - startTime);
          return dbResult;
        }
        this.stats.databaseMisses = (this.stats.databaseMisses ?? 0) + 1;
      }

      this.updateResponseTime(Date.now() - startTime);
      return null;
    } catch (error) {
      logger.error('Cache get error', { key: cacheKey, error, options });
      return null;
    }
  }

  /**
   * Set data in cache using optimal strategy
   */
  async set<T>(key: string, data: T, options: ICacheOptions = {}): Promise<void> {
    const cacheKey = this.buildCacheKey(key, options.namespace);
    const ttl = options.ttl || this.defaultTTL;

    try {
      // Auto-adjust strategy based on environment
      const effectiveStrategy = this.getEffectiveStrategy(options.strategy);

      // Strategy 1: Set in memory (fastest)
      if (effectiveStrategy !== 'redis' && effectiveStrategy !== 'database') {
        this.setInMemory(cacheKey, data, { ...options, ttl });
      }

      // Strategy 2: Set in Redis (persistent, only on server side)
      if (effectiveStrategy !== 'memory' && effectiveStrategy !== 'database' && this.redis) {
        await this.setInRedis(cacheKey, data, { ...options, ttl });
      }

      // Strategy 3: Set in database (if configured)
      if (options.strategy === 'database') {
        await this.setInDatabase(cacheKey, data, { ...options, ttl });
      }

      // logger.debug('Cache set successful', { key: cacheKey, strategy: options.strategy });
    } catch (error) {
      logger.error('Cache set error', { key: cacheKey, error, options });
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string, options: ICacheOptions = {}): Promise<void> {
    const cacheKey = this.buildCacheKey(key, options.namespace);

    try {
      // Delete from memory
      this.memoryCache.delete(cacheKey);

      // Delete from Redis
      await this.redis?.del(cacheKey);

      // Delete from database if configured
      if (options.strategy === 'database') {
        await this.deleteFromDatabase(cacheKey);
      }

      // logger.debug('Cache delete successful', { key: cacheKey });
    } catch (error) {
      logger.error('Cache delete error', { key: cacheKey, error });
    }
  }

  /**
   * Invalidate cache by namespace, tags, or pattern
   */
  async invalidate(options: ICacheInvalidationOptions = {}): Promise<void> {
    try {
      if (options.all) {
        // Invalidate all caches
        this.memoryCache.clear();
        await this.redis?.flushdb();
        logger.info('All caches invalidated');
        return;
      }

      if (options.namespace) {
        // Invalidate by namespace
        const pattern = `${options.namespace}:*`;
        await this.invalidateByPattern(pattern);
      }

      if (options.tags && options.tags.length > 0) {
        // Invalidate by tags
        await this.invalidateByTags(options.tags);
      }

      if (options.pattern) {
        // Invalidate by pattern
        await this.invalidateByPattern(options.pattern);
      }

      logger.info('Cache invalidation completed', { options });
    } catch (error) {
      logger.error('Cache invalidation error', { error, options });
    }
  }

  /**
   * Get keys by pattern (for cache discovery)
   */
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        return keys || [];
      }

      // Fallback to memory cache pattern matching
      const memoryKeys: string[] = [];
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));

      for (const key of this.memoryCache.keys()) {
        if (regex.test(key)) {
          memoryKeys.push(key);
        }
      }

      return memoryKeys;
    } catch (error) {
      logger.warn('Pattern key search failed', { pattern, error });
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): ICacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.redis?.flushdb();
    this.resetStats();
    logger.info('All caches cleared');
  }

  /**
   * Health check for cache services
   */
  async healthCheck(): Promise<{
    memory: boolean;
    redis: boolean;
    database: boolean;
  }> {
    const health = {
      memory: true,
      redis: false,
      database: false,
    };

    try {
      // Test Redis connection
      if (this.redis) {
        await this.redis.ping();
        health.redis = true;
      }
    } catch (error) {
      logger.warn('Redis health check failed', { error });
    }

    try {
      // Test database connection (if configured)
      // This would be implemented based on your database setup
      health.database = true;
    } catch (error) {
      logger.warn('Database health check failed', { error });
    }

    return health;
  }

  // Private methods

  private buildCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > (entry.timestamp ?? 0) + entry.ttl * 1000) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount = (entry.accessCount ?? 0) + 1;
    entry.lastAccessed = Date.now();
    this.memoryCache.set(key, entry);

    return (entry.data ?? null) as T | null;
  }

  private setInMemory<T>(key: string, data: T, options: ICacheOptions): void {
    const entry: ICacheEntry<T> = {
      key,
      value: data,
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
      createdAt: new Date(),
      accessedAt: new Date(),
      hitCount: 1,
      accessCount: 1,
      lastAccessed: Date.now(),
      size: this.calculateSize(data),
    };

    // Check memory limits
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      this.evictMemoryCache();
    }

    this.memoryCache.set(key, entry);
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redis?.get(key);
      return result as T;
    } catch (error) {
      logger.warn('Redis get failed, falling back to memory', { key, error });
      return null;
    }
  }

  private async setInRedis<T>(key: string, data: T, options: ICacheOptions): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      await this.redis?.setex(key, ttl, data);
    } catch (error) {
      logger.warn('Redis set failed', { key, error });
    }
  }

  private getFromDatabase<T>(_key: string): T | null {
    // This would be implemented based on your database setup
    // For now, return null as placeholder
    return null;
  }

  private async setInDatabase<T>(_key: string, _data: T, _options: ICacheOptions): Promise<void> {
    // This would be implemented based on your database setup
    // For now, do nothing as placeholder
  }

  private async deleteFromDatabase(_key: string): Promise<void> {
    // This would be implemented based on your database setup
    // For now, do nothing as placeholder
  }

  private async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis?.keys(pattern);
      if (keys && keys.length > 0) {
        await this.redis?.del(...keys);

        // Also remove from memory cache
        keys.forEach(key => this.memoryCache.delete(key));
      }
    } catch (error) {
      logger.warn('Pattern invalidation failed', { pattern, error });
    }
  }

  private async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const pattern = `*:tag:${tag}:*`;
        await this.invalidateByPattern(pattern);
      }
    } catch (error) {
      logger.warn('Tag invalidation failed', { tags, error });
    }
  }

  private calculateSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  private evictMemoryCache(): void {
    // LRU eviction based on last accessed time
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => (a[1].lastAccessed ?? 0) - (b[1].lastAccessed ?? 0));

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  private startMemoryCleanup(): void {
    this.memoryCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > (entry.timestamp ?? 0) + entry.ttl * 1000) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  private startStatsUpdate(): void {
    this.statsUpdateInterval = setInterval(() => {
      void this.updateStats();
    }, 5000); // Update stats every 5 seconds
  }

  private async updateStats(): Promise<void> {
    const totalHits =
      (this.stats.memoryHits ?? 0) + (this.stats.redisHits ?? 0) + (this.stats.databaseHits ?? 0);
    const totalRequests = this.stats.totalRequests;

    this.stats.hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;
    this.stats.memoryUsage = this.memoryCache.size;

    // Calculate memory usage in bytes
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size ?? 0;
    }
    this.stats.memoryUsage = totalSize;

    // Update health status
    try {
      const health = await this.healthCheck();
      this.stats.health = {
        ...this.stats.health,
        ...health,
        status: health.memory && health.redis && health.database ? 'healthy' : 'degraded',
      };
    } catch (error) {
      logger.warn('Failed to update health status', { error });
    }
  }

  private updateResponseTime(responseTime: number): void {
    const currentAvg = this.stats.averageResponseTime;
    const totalRequests = this.stats.totalRequests;

    this.stats.averageResponseTime =
      (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
  }

  private resetStats(): void {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
    this.stats.totalRequests = 0;
    this.stats.averageResponseTime = 0;
    this.stats.memoryUsage = 0;
    this.stats.keyCount = 0;
    this.stats.evictions = 0;
    this.stats.timestamp = new Date().toISOString();
    this.stats.memoryHits = 0;
    this.stats.memoryMisses = 0;
    this.stats.redisHits = 0;
    this.stats.redisMisses = 0;
    this.stats.databaseHits = 0;
    this.stats.databaseMisses = 0;
    this.stats.redisUsage = 0;
    this.stats.health = {
      status: 'healthy',
      memory: true,
      redis: !!this.redis,
      database: true,
    };
    this.stats.totalKeys = 0;
  }

  /**
   * Clean up resources and stop all intervals
   * Call this method when the cache service is no longer needed
   */
  public destroy(): void {
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
      this.memoryCleanupInterval = undefined;
    }
    if (this.statsUpdateInterval) {
      clearInterval(this.statsUpdateInterval);
      this.statsUpdateInterval = undefined;
    }
    logger.info('HybridCacheService destroyed - all intervals cleared');
  }
}

// Export singleton instance
export const hybridCacheService = new HybridCacheService();

// Export the class for testing
export { HybridCacheService };
