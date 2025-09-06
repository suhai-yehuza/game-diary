import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { ICacheOptions } from '@/lib/cache/hybrid-cache-service';
import { HybridCacheService } from '@/lib/cache/hybrid-cache-service';

// Mock Redis
const mockRedisMethods = {
  get: vi.fn().mockResolvedValue(null),
  setex: vi.fn(),
  del: vi.fn(),
  flushdb: vi.fn(),
  ping: vi.fn(),
  keys: vi.fn(),
};

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => mockRedisMethods),
}));

// Set environment variables to ensure Redis is initialized
process.env.UPSTASH_REDIS_REST_URL = 'https://mock-redis-url';
process.env.UPSTASH_REDIS_REST_TOKEN = 'mock-redis-token';

// Mock the environment variables at the module level
vi.mock('process', () => ({
  env: {
    UPSTASH_REDIS_REST_URL: 'https://mock-redis-url',
    UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
  },
}));

// Mock window to ensure we're in server-side environment
Object.defineProperty(global, 'window', {
  value: undefined,
  writable: true,
});

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('HybridCacheService', () => {
  let cacheService: HybridCacheService;
  let mockRedis: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Debug environment variables
    console.log('Environment variables:', {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      window: typeof window,
    });

    // Create a new instance for each test
    cacheService = new HybridCacheService();

    // Use the shared mock methods
    mockRedis = mockRedisMethods;
  });

  afterEach(() => {
    // Clean up intervals
    vi.clearAllTimers();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(cacheService).toBeInstanceOf(HybridCacheService);
    });

    it('should start memory cleanup interval', () => {
      vi.useFakeTimers();
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      // Fast forward time
      vi.advanceTimersByTime(60000);

      expect(clearIntervalSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('get method', () => {
    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return cached data from memory', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'memory' };

      await cacheService.set('test-key', testData, options);
      const result = await cacheService.get('test-key', options);

      expect(result).toEqual(testData);
    });

    it('should return cached data from Redis', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'redis' };

      // Mock Redis get to return data
      mockRedis.get.mockResolvedValue(testData);

      const result = await cacheService.get('test-key', options);

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should use hybrid strategy correctly', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'hybrid' };

      // Mock Redis get to return data
      mockRedis.get.mockResolvedValue(testData);

      const result = await cacheService.get('test-key', options);

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should handle Redis errors gracefully', async () => {
      const options: ICacheOptions = { ttl: 300, strategy: 'redis' };

      // Mock Redis get to throw error
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get('test-key', options);

      expect(result).toBeNull();
    });
  });

  describe('set method', () => {
    it('should set data in memory cache', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'memory' };

      await cacheService.set('test-key', testData, options);
      const result = await cacheService.get('test-key', options);

      expect(result).toEqual(testData);
    });

    it('should set data in Redis cache', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'redis' };

      // Mock Redis setex to succeed
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, options);

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 300, testData);
    });

    it('should handle Redis set errors gracefully', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'redis' };

      // Mock Redis setex to throw error
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(cacheService.set('test-key', testData, options)).resolves.not.toThrow();
    });
  });

  describe('delete method', () => {
    it('should delete data from memory cache', async () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'memory' };

      // Set data first
      await cacheService.set('test-key', testData, options);
      let result = await cacheService.get('test-key', options);
      expect(result).toEqual(testData);

      // Delete data
      await cacheService.delete('test-key', options);
      result = await cacheService.get('test-key', options);
      expect(result).toBeNull();
    });

    it('should delete data from Redis cache', async () => {
      const options: ICacheOptions = { ttl: 300, strategy: 'redis' };

      // Mock Redis del to succeed
      mockRedis.del.mockResolvedValue(1);

      await cacheService.delete('test-key', options);

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('invalidate method', () => {
    it('should invalidate all caches', async () => {
      // Mock Redis flushdb to succeed
      mockRedis.flushdb.mockResolvedValue('OK');

      await cacheService.invalidate({ all: true });

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });

    it('should invalidate by namespace', async () => {
      // Mock Redis keys and del
      mockRedis.keys.mockResolvedValue(['namespace:key1', 'namespace:key2']);
      mockRedis.del.mockResolvedValue(2);

      await cacheService.invalidate({ namespace: 'namespace' });

      expect(mockRedis.keys).toHaveBeenCalledWith('namespace:*');
      expect(mockRedis.del).toHaveBeenCalledWith('namespace:key1', 'namespace:key2');
    });

    it('should invalidate by tags', async () => {
      // Mock Redis keys and del
      mockRedis.keys.mockResolvedValue(['tag:tag1:key1', 'tag:tag1:key2']);
      mockRedis.del.mockResolvedValue(2);

      await cacheService.invalidate({ tags: ['tag1'] });

      expect(mockRedis.keys).toHaveBeenCalledWith('*:tag:tag1:*');
      expect(mockRedis.del).toHaveBeenCalledWith('tag:tag1:key1', 'tag:tag1:key2');
    });
  });

  describe('getStats method', () => {
    it('should return cache statistics', () => {
      const stats = cacheService.getStats();

      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(stats).toHaveProperty('memoryUsage');
    });
  });

  describe('clear method', () => {
    it('should clear all caches', async () => {
      // Mock Redis flushdb to succeed
      mockRedis.flushdb.mockResolvedValue('OK');

      await cacheService.clear();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });
  });

  describe('healthCheck method', () => {
    it('should return health status', async () => {
      // Mock Redis ping to succeed
      mockRedis.ping.mockResolvedValue('PONG');

      const health = await cacheService.healthCheck();

      expect(health).toHaveProperty('memory');
      expect(health).toHaveProperty('redis');
      expect(health).toHaveProperty('database');
      expect(health.memory).toBe(true);
      expect(health.redis).toBe(true);
    });

    it('should handle Redis health check failure', async () => {
      // Mock Redis ping to throw error
      mockRedis.ping.mockRejectedValue(new Error('Redis error'));

      const health = await cacheService.healthCheck();

      expect(health.redis).toBe(false);
      expect(health.memory).toBe(true);
    });
  });

  describe('Cache key building', () => {
    it('should build cache key with namespace', () => {
      const result = (cacheService as any).buildCacheKey('test-key', 'test-namespace');
      expect(result).toBe('test-namespace:test-key');
    });

    it('should build cache key without namespace', () => {
      const result = (cacheService as any).buildCacheKey('test-key');
      expect(result).toBe('test-key');
    });
  });

  describe('Memory cache management', () => {
    it('should evict memory cache when limit reached', () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 300, strategy: 'memory' };

      // Fill cache beyond limit
      for (let i = 0; i < 11000; i++) {
        (cacheService as any).setInMemory(`key-${i}`, testData, options);
      }

      // Check that eviction occurred
      const stats = cacheService.getStats();
      expect(stats.memoryUsage).toBeLessThan(10000);
    });

    it('should handle expired entries', () => {
      const testData = { id: 1, name: 'test' };
      const options: ICacheOptions = { ttl: 1, strategy: 'memory' }; // 1 second TTL

      // Set data
      (cacheService as any).setInMemory('test-key', testData, options);

      // Fast forward time
      vi.useFakeTimers();
      vi.advanceTimersByTime(2000); // 2 seconds

      // Try to get expired data
      const result = (cacheService as any).getFromMemory('test-key');
      expect(result).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('Performance monitoring', () => {
    it('should track query performance', async () => {
      const _startTime = Date.now();

      // Mock Redis get to simulate delay
      mockRedis.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      await cacheService.get('test-key', { strategy: 'redis' });

      const stats = cacheService.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });

    it('should track cache hits and misses', async () => {
      // First call - miss
      await cacheService.get('test-key', { strategy: 'memory' });

      // Set data
      await cacheService.set('test-key', { data: 'test' }, { strategy: 'memory' });

      // Second call - hit
      await cacheService.get('test-key', { strategy: 'memory' });

      const stats = cacheService.getStats();
      expect(stats.totalRequests).toBe(2);
      expect(stats.memoryHits).toBe(1);
      expect(stats.memoryMisses).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      // Mock Redis methods to throw errors
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));
      mockRedis.setex.mockRejectedValue(new Error('Connection failed'));
      mockRedis.del.mockRejectedValue(new Error('Connection failed'));

      // These should not throw
      await expect(cacheService.get('test-key', { strategy: 'redis' })).resolves.not.toThrow();
      await expect(
        cacheService.set('test-key', { data: 'test' }, { strategy: 'redis' })
      ).resolves.not.toThrow();
      await expect(cacheService.delete('test-key', { strategy: 'redis' })).resolves.not.toThrow();
    });

    it('should handle invalid cache options gracefully', async () => {
      const invalidOptions = { strategy: 'invalid' as any };

      // These should not throw
      await expect(cacheService.get('test-key', invalidOptions)).resolves.not.toThrow();
      await expect(
        cacheService.set('test-key', { data: 'test' }, invalidOptions)
      ).resolves.not.toThrow();
    });
  });
});
