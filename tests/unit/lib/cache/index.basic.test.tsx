import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { testRedisConnection, getCache } from '@/lib/cache';

// Mock Redis service
vi.mock('@/lib/cache/redis-service', () => ({
  redisService: {
    set: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(true),
    clear: vi.fn().mockResolvedValue(undefined),
    testConnection: vi.fn().mockResolvedValue(false),
    getStats: vi.fn().mockReturnValue({}),
  },
}));

describe('Cache Utils', () => {
  let cache: any;

  beforeEach(() => {
    cache = getCache();
    cache.clear();
  });

  afterEach(() => {
    cache.clear();
  });

  describe('testRedisConnection', () => {
    it('returns a Promise<boolean> value', async () => {
      const result = await testRedisConnection();
      expect(typeof result).toBe('boolean');
    });

    it('does not throw an error', async () => {
      await expect(testRedisConnection()).resolves.toBeDefined();
    });
  });

  describe('getCache', () => {
    it('returns a cache manager instance', () => {
      const cacheManager = getCache();
      expect(cacheManager).toBeDefined();
      expect(typeof cacheManager.set).toBe('function');
      expect(typeof cacheManager.get).toBe('function');
      expect(typeof cacheManager.delete).toBe('function');
      expect(typeof cacheManager.clear).toBe('function');
      expect(typeof cacheManager.getStats).toBe('function');
    });

    it('returns the same instance on multiple calls', () => {
      const cache1 = getCache();
      const cache2 = getCache();
      expect(cache1).toBe(cache2);
    });
  });

  describe('Cache Manager Operations', () => {
    it('sets and gets values', async () => {
      await cache.set('test-key', 'test-value');
      const result = await cache.get('test-key');
      expect(result).toBe('test-value');
    });

    it('returns null for non-existent keys', async () => {
      const result = await cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('deletes values', async () => {
      await cache.set('test-key', 'test-value');
      const deleteResult = await cache.delete('test-key');
      expect(deleteResult).toBe(true);

      const getResult = await cache.get('test-key');
      expect(getResult).toBeNull();
    });

    it('clears all values', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      await cache.clear();

      const result1 = await cache.get('key1');
      const result2 = await cache.get('key2');
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('handles different data types', async () => {
      const testData = {
        string: 'test',
        number: 123,
        boolean: true,
        object: { key: 'value' },
        array: [1, 2, 3],
        null: null,
      };

      for (const [key, value] of Object.entries(testData)) {
        await cache.set(key, value);
        const result = await cache.get(key);
        expect(result).toEqual(value);
      }
    });

    it('respects TTL', async () => {
      // Set a value with a very short TTL
      await cache.set('test-key', 'test-value', 10); // 10ms TTL

      // Should be available immediately
      const immediateResult = await cache.get('test-key');
      expect(immediateResult).toBe('test-value');

      // Wait for TTL to expire and then some
      await new Promise(resolve => setTimeout(resolve, 50));

      // Try to get the expired value
      const expiredResult = await cache.get('test-key');
      expect(expiredResult).toBeNull();
    });

    it('provides cache statistics', () => {
      const stats = cache.getStats();
      expect(stats).toBeDefined();
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.size).toBe('number');
      expect(stats.hits).toBeGreaterThanOrEqual(0);
      expect(stats.misses).toBeGreaterThanOrEqual(0);
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });

    it('updates statistics correctly', async () => {
      // Get a fresh cache instance to avoid interference from other tests
      const freshCache = getCache();
      await freshCache.clear();

      // Set a value
      await freshCache.set('test-key', 'test-value');
      expect(freshCache.getStats().size).toBe(1);

      // Get the value (hit)
      await freshCache.get('test-key');
      const statsAfterHit = freshCache.getStats();
      expect(statsAfterHit.hits).toBeGreaterThan(0);

      // Get non-existent value (miss)
      await freshCache.get('non-existent');
      const statsAfterMiss = freshCache.getStats();
      expect(statsAfterMiss.misses).toBeGreaterThan(0);

      // Verify that both hits and misses are tracked
      expect(statsAfterMiss.hits).toBeGreaterThanOrEqual(statsAfterHit.hits);
    });

    it('handles concurrent operations', async () => {
      const promises = [];

      // Set multiple values concurrently
      for (let i = 0; i < 10; i++) {
        promises.push(cache.set(`key-${i}`, `value-${i}`));
      }

      await Promise.all(promises);

      // Verify all values were set
      for (let i = 0; i < 10; i++) {
        const result = await cache.get(`key-${i}`);
        expect(result).toBe(`value-${i}`);
      }
    });

    it('handles large objects', async () => {
      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `value-${i}` })),
        metadata: { timestamp: Date.now(), version: '1.0.0' },
      };

      await cache.set('large-object', largeObject);
      const retrieved = await cache.get('large-object');
      expect(retrieved).toEqual(largeObject);
    });

    it('handles special characters in keys', async () => {
      const specialKey = 'test-key-with-special-chars:!@#$%^&*()';
      const value = 'special-value';

      await cache.set(specialKey, value);
      const retrieved = await cache.get(specialKey);
      expect(retrieved).toBe(value);
    });
  });

  describe('Cache Performance', () => {
    it('handles rapid set/get operations', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        await cache.set(`key-${i}`, `value-${i}`);
        await cache.get(`key-${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust as needed)
      expect(duration).toBeLessThan(1000);
    });

    it('maintains data integrity under load', async () => {
      const promises = [];

      // Set values
      for (let i = 0; i < 50; i++) {
        promises.push(cache.set(`key-${i}`, `value-${i}`));
      }
      await Promise.all(promises);

      // Get values
      const getPromises = [];
      for (let i = 0; i < 50; i++) {
        getPromises.push(cache.get(`key-${i}`));
      }
      const results = await Promise.all(getPromises);

      // Verify all values are correct
      for (let i = 0; i < 50; i++) {
        expect(results[i]).toBe(`value-${i}`);
      }
    });
  });
});
