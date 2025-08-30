import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const BASE_URL = getAppUrl();

describe('Cache System Integration Tests', () => {
  describe('Redis Service Integration', () => {
    test('should handle Redis connection test', async () => {
      const response = await fetch(`${BASE_URL}/api/cache?action=test`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('connected');
      expect(typeof data.data.connected).toBe('boolean');
    });

    test('should get cache statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/cache?action=stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('memorySize');
      expect(data.data).toHaveProperty('redisAvailable');
    });

    test('should handle cache get operation', async () => {
      const testKey = 'test-cache-key';
      const response = await fetch(`${BASE_URL}/api/cache?action=get&key=${testKey}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      // Cache miss is expected for test key
      expect(data.data).toBeNull();
    });

    test('should handle cache set and get operations', async () => {
      const testKey = 'test-cache-set-get';
      const testValue = { test: 'data', timestamp: Date.now() };

      // Set cache value
      const setResponse = await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set',
          key: testKey,
          value: testValue,
          ttl: 60,
        }),
      });

      expect(setResponse.status).toBe(200);
      const setData = await setResponse.json();
      expect(setData).toHaveProperty('success');
      expect(setData.success).toBe(true);

      // Get cache value
      const getResponse = await fetch(`${BASE_URL}/api/cache?action=get&key=${testKey}`);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData).toHaveProperty('success');
      expect(getData.success).toBe(true);
      expect(getData.data).toEqual(testValue);
    });

    test('should handle cache delete operation', async () => {
      const testKey = 'test-cache-delete';
      const testValue = { test: 'delete-me' };

      // Set cache value first
      await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set',
          key: testKey,
          value: testValue,
          ttl: 60,
        }),
      });

      // Delete cache value
      const deleteResponse = await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          key: testKey,
        }),
      });

      expect(deleteResponse.status).toBe(200);
      const deleteData = await deleteResponse.json();
      expect(deleteData).toHaveProperty('success');
      expect(deleteData.success).toBe(true);

      // Verify deletion
      const getResponse = await fetch(`${BASE_URL}/api/cache?action=get&key=${testKey}`);
      const getData = await getResponse.json();
      expect(getData.data).toBeNull();
    });

    test('should handle cache namespace operations', async () => {
      const response = await fetch(`${BASE_URL}/api/cache?action=namespaces`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('namespaces');
      expect(Array.isArray(data.data.namespaces)).toBe(true);
      expect(data.data).toHaveProperty('currentStats');
    });

    test('should handle cache clear operations', async () => {
      const response = await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should handle cache clear namespace operations', async () => {
      const response = await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clearNamespace',
          namespace: 'SYSTEM',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });
  });

  describe('Hybrid Cache Strategy Integration', () => {
    test('should get hybrid cache statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid?action=stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('cacheEnabled');
      expect(data.data).toHaveProperty('cacheInstance');
      expect(data.data.cacheInstance).toBe('HybridCache');
    });

    test('should get hybrid cache tables configuration', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid?action=tables`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('nbaTables');
      expect(data.data).toHaveProperty('databaseTables');
      expect(data.data).toHaveProperty('cacheConfig');
      expect(data.data).toHaveProperty('strategy');
      expect(Array.isArray(data.data.nbaTables)).toBe(true);
      expect(Array.isArray(data.data.databaseTables)).toBe(true);
    });

    test('should test hybrid cache functionality', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid?action=test`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('connected');
      expect(data.data).toHaveProperty('testQuery');
      expect(data.data).toHaveProperty('nbaTables');
      expect(data.data).toHaveProperty('databaseTables');
      expect(data.data).toHaveProperty('cacheConfig');
    });

    test('should get hybrid cache strategy details', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid?action=strategy`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('nbaStrategy');
      expect(data.data).toHaveProperty('databaseStrategy');
      expect(data.data.nbaStrategy).toHaveProperty('description');
      expect(data.data.nbaStrategy).toHaveProperty('flow');
      expect(data.data.nbaStrategy).toHaveProperty('benefits');
      expect(data.data.databaseStrategy).toHaveProperty('description');
      expect(data.data.databaseStrategy).toHaveProperty('flow');
      expect(data.data.databaseStrategy).toHaveProperty('benefits');
    });

    test('should handle hybrid cache table invalidation', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalidate',
          table: 'users',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('strategy');
    });

    test('should handle hybrid cache user invalidation', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalidateUser',
          userId: 'test-user-id',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('strategy');
    });

    test('should handle hybrid cache clear all', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('cleared');
      expect(data.cleared).toHaveProperty('nbaCache');
      expect(data.cleared).toHaveProperty('databaseCache');
      expect(data.cleared).toHaveProperty('allNamespaces');
    });

    test('should handle invalid hybrid cache actions', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalid-action',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });

    test('should handle missing parameters for hybrid cache operations', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalidate',
          // Missing table parameter
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Database Cache Integration', () => {
    test('should get database cache statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/db?action=stats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('cacheEnabled');
      expect(data.data).toHaveProperty('cacheInstance');
      expect(data.data.cacheInstance).toBe('DatabaseCache');
    });

    test('should test database cache functionality', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/db?action=test`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('connected');
      expect(data.data).toHaveProperty('testQuery');
      expect(data.data).toHaveProperty('result');
    });

    test('should handle database cache table invalidation', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalidate',
          table: 'users',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
    });

    test('should handle database cache user invalidation', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'invalidateUser',
          userId: 'test-user-id',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
    });

    test('should handle database cache clear all', async () => {
      const response = await fetch(`${BASE_URL}/api/cache/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('message');
    });
  });

  describe('Cache Performance and Load Testing', () => {
    test('should handle concurrent cache operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        fetch(`${BASE_URL}/api/cache?action=set`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'set',
            key: `concurrent-test-${i}`,
            value: { test: i, timestamp: Date.now() },
            ttl: 60,
          }),
        })
      );

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle cache operations under load', async () => {
      const operations = [];

      // Mix of set, get, and delete operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          fetch(`${BASE_URL}/api/cache?action=set`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'set',
              key: `load-test-${i}`,
              value: { load: i, timestamp: Date.now() },
              ttl: 30,
            }),
          })
        );

        operations.push(fetch(`${BASE_URL}/api/cache?action=get&key=load-test-${i}`));
      }

      const responses = await Promise.all(operations);
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });
  });

  describe('Cache Error Handling', () => {
    test('should handle invalid cache actions gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/cache?action=invalid`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });

    test('should handle missing cache parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/cache?action=get`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });

    test('should handle malformed cache requests', async () => {
      const response = await fetch(`${BASE_URL}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect([400, 500]).toContain(response.status);
    });
  });
});
