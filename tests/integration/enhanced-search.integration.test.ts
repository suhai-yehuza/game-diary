import fetch from 'node-fetch';
import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

if (!global.fetch) global.fetch = fetch as unknown as typeof global.fetch;

const BASE_URL = getAppUrl();

describe('Enhanced Search Integration Tests', () => {
  describe('Search Page', () => {
    test('should load search page', async () => {
      const response = await fetch(`${BASE_URL}/search`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should include search functionality', async () => {
      const response = await fetch(`${BASE_URL}/search`);
      const html = await response.text();

      expect(response.status).toBe(200);
      // Check for search-related content
      expect(html).toContain('search');
    });
  });

  describe('Search API with Different Result Types', () => {
    test('should search for games', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=lakers&type=game`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should search for players', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=lebron&type=player`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should search for teams', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=lakers&type=team`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should search for users', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=user&type=user`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should search for game logs', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=game&type=game-logs`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });
  });

  describe('Search with Multiple Filters', () => {
    test('should handle search with date range', async () => {
      const response = await fetch(
        `${BASE_URL}/api/search?q=lakers&startDate=2024-01-01&endDate=2024-12-31`
      );
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should handle search with user filter', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=game&user=testuser`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should handle search with multiple type filters', async () => {
      const response = await fetch(
        `${BASE_URL}/api/search?q=lakers&type=game&type=player&type=team`
      );
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should handle search with pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=test&page=1&limit=10`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
      if (data.pagination) {
        expect(data.pagination).toHaveProperty('page');
        expect(data.pagination).toHaveProperty('limit');
      }
    });
  });

  describe('Search Edge Cases', () => {
    test('should handle empty search query', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
    });

    test('should handle search with special characters', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=O'Connor%20Jr.`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });

    test('should handle search with very long query', async () => {
      const longQuery = 'a'.repeat(1000);
      const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(longQuery)}`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
    });

    test('should handle search with invalid type', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=test&type=invalid`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      // Should handle invalid type gracefully
    });
  });

  describe('Search Performance', () => {
    test('should return search results within reasonable time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/api/search?q=lakers`);
      const data = (await response.json()) as any;
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(endTime - startTime).toBeLessThan(3000); // 3 seconds max
    });

    test('should handle concurrent search requests', async () => {
      const promises = [
        fetch(`${BASE_URL}/api/search?q=lakers`),
        fetch(`${BASE_URL}/api/search?q=lebron`),
        fetch(`${BASE_URL}/api/search?q=game`),
      ];

      const responses = await Promise.all(promises);

      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = (await response.json()) as any;
        expect(data).toHaveProperty('success');
      }
    });
  });

  describe('Search Result Structure', () => {
    test('should return properly structured search results', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=lakers`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);

      if (data.data && Array.isArray(data.data)) {
        // If results exist, check their structure
        for (const result of data.data) {
          expect(result).toHaveProperty('id');
          expect(result).toHaveProperty('type');
        }
      }
    });

    test('should include search analytics when available', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=lakers`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      // Analytics might be included in the response
    });
  });

  describe('Search Suggestions', () => {
    test('should handle search suggestions', async () => {
      const response = await fetch(`${BASE_URL}/api/search?q=leb&suggestions=true`);
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    });
  });
});
