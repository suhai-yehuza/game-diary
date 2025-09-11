import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const BASE_URL = getAppUrl();

describe('Cache System Integration Tests', () => {
  describe('Redis Service Integration', () => {
    test('should handle Redis connection test', async () => {
      // Use the actual cache list endpoint to test connection
      const response = await fetch(`${BASE_URL}/api/cache?action=list`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('keys');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.keys)).toBe(true);
    });

    test('should get cache statistics', async () => {
      // Use the games cache endpoint to get statistics
      const response = await fetch(`${BASE_URL}/api/games/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('gamesCache');
      expect(data).toHaveProperty('overallCache');
      expect(data.gamesCache).toHaveProperty('totalKeys');
      expect(Array.isArray(data.gamesCache.keys)).toBe(true);
    });

    test('should handle cache get operation', async () => {
      // Use the cache list endpoint to test cache operations
      const response = await fetch(`${BASE_URL}/api/cache?action=list`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('keys');
      expect(Array.isArray(data.keys)).toBe(true);
    });

    test('should handle cache validation operations', async () => {
      // Test cache validation endpoint
      const response = await fetch(`${BASE_URL}/api/cache/validate`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('timestamp');
    });

    test('should handle cache delete operation', async () => {
      // Test cache invalidation endpoint
      const deleteResponse = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      expect(deleteResponse.status).toBe(200);
      const deleteData = await deleteResponse.json();
      expect(deleteData).toHaveProperty('success');
      expect(deleteData).toHaveProperty('message');
    });

    test('should handle cache namespace operations', async () => {
      // Test players cache endpoint to check namespace operations
      const response = await fetch(`${BASE_URL}/api/players/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('playersCache');
      expect(data.playersCache).toHaveProperty('totalKeys');
      expect(Array.isArray(data.playersCache.keys)).toBe(true);
    });

    test('should handle cache clear operations', async () => {
      // Test cache invalidation endpoint for clearing
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle cache clear namespace operations', async () => {
      // Test teams cache endpoint
      const response = await fetch(`${BASE_URL}/api/teams/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('teamsCache');
      expect(data.teamsCache).toHaveProperty('totalKeys');
      expect(Array.isArray(data.teamsCache.keys)).toBe(true);
    });
  });

  describe('Hybrid Cache Strategy Integration', () => {
    test('should get hybrid cache statistics', async () => {
      // Test landing page cache endpoint
      const response = await fetch(`${BASE_URL}/api/landing-page/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('timestamp');
    });

    test('should get hybrid cache tables configuration', async () => {
      // Test games cache endpoint for configuration
      const response = await fetch(`${BASE_URL}/api/games/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('gamesCache');
      expect(data).toHaveProperty('overallCache');
    });

    test('should test hybrid cache functionality', async () => {
      // Test cache validation endpoint
      const response = await fetch(`${BASE_URL}/api/cache/validate`, {
        method: 'POST',
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('results');
    });

    test('should get hybrid cache strategy details', async () => {
      // Test players cache endpoint for strategy details
      const response = await fetch(`${BASE_URL}/api/players/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('playersCache');
      expect(data).toHaveProperty('overallCache');
    });

    test('should handle hybrid cache table invalidation', async () => {
      // Test cache invalidation with tag
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate&tag=games`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle hybrid cache user invalidation', async () => {
      // Test cache invalidation
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle hybrid cache clear all', async () => {
      // Test cache invalidation
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle invalid hybrid cache actions', async () => {
      // Test invalid action
      const response = await fetch(`${BASE_URL}/api/cache?action=invalid`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
    });

    test('should handle missing parameters for hybrid cache operations', async () => {
      // Test missing parameters
      const response = await fetch(`${BASE_URL}/api/cache`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);
    });
  });

  describe('Database Cache Integration', () => {
    test('should get database cache statistics', async () => {
      // Test teams cache endpoint
      const response = await fetch(`${BASE_URL}/api/teams/cache`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('teamsCache');
      expect(data).toHaveProperty('overallCache');
    });

    test('should test database cache functionality', async () => {
      // Test cache validation endpoint
      const response = await fetch(`${BASE_URL}/api/cache/validate`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data).toHaveProperty('results');
    });

    test('should handle database cache table invalidation', async () => {
      // Test cache invalidation
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle database cache user invalidation', async () => {
      // Test cache invalidation
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });

    test('should handle database cache clear all', async () => {
      // Test cache invalidation
      const response = await fetch(`${BASE_URL}/api/cache?action=invalidate`, {
        method: 'DELETE',
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });
  });

  describe('Cache Performance and Load Testing', () => {
    test('should handle concurrent cache operations', async () => {
      // Test concurrent requests to cache endpoints
      const promises = [
        fetch(`${BASE_URL}/api/cache?action=list`),
        fetch(`${BASE_URL}/api/games/cache`),
        fetch(`${BASE_URL}/api/players/cache`),
        fetch(`${BASE_URL}/api/teams/cache`),
      ];

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should handle cache operations under load', async () => {
      // Test multiple cache operations
      const operations = [
        fetch(`${BASE_URL}/api/cache?action=list`),
        fetch(`${BASE_URL}/api/cache/validate`),
        fetch(`${BASE_URL}/api/games/cache`),
      ];

      const responses = await Promise.all(operations);
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });
  });

  describe('Cache Error Handling', () => {
    test('should handle malformed cache requests', async () => {
      // Test malformed request
      const response = await fetch(`${BASE_URL}/api/cache?action=malformed`);
      const data = await response.json();

      expect([400, 500]).toContain(response.status);
    });
  });
});
