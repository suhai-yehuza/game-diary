import fetch from 'node-fetch';
import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

if (!global.fetch) global.fetch = fetch as unknown as typeof global.fetch;

const BASE_URL = getAppUrl();

describe('Sports Pages Integration Tests', () => {
  describe('NBA Main Page', () => {
    test('should load NBA main page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should include NBA-specific content', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba`);
      const html = await response.text();

      expect(response.status).toBe(200);
      // Check for NBA-specific content
      expect(html).toContain('NBA');
    });
  });

  describe('NBA Games Page', () => {
    test('should load NBA games page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/games`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle games page with query parameters', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/games?date=2024-01-01`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should load specific game page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/games/123`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle non-existent game gracefully', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/games/999999`);

      // Should either return 404 or 200 with appropriate content
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('NBA Players Page', () => {
    test('should load NBA players page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/players`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle players page with filters', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/players?team=lakers&position=PG`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should load specific player page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/players/123`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle non-existent player gracefully', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/players/999999`);

      // Should either return 404 or 200 with appropriate content
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('NBA Teams Page', () => {
    test('should load NBA teams page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/teams`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should load specific team page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/teams/1`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle non-existent team gracefully', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/teams/999999`);

      // Should either return 404 or 200 with appropriate content
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('All Sports Page', () => {
    test('should load all sports page', async () => {
      const response = await fetch(`${BASE_URL}/sports/all-sports`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });
  });

  describe('Dynamic Sports Page', () => {
    test('should handle dynamic sport parameter', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    test('should handle unsupported sport gracefully', async () => {
      const response = await fetch(`${BASE_URL}/sports/unsupported-sport`);

      // Should either return 404 or 200 with appropriate content
      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Sports Page Navigation', () => {
    test('should maintain consistent navigation structure', async () => {
      const pages = [
        '/sports/nba',
        '/sports/nba/games',
        '/sports/nba/players',
        '/sports/nba/teams',
      ];

      for (const page of pages) {
        const response = await fetch(`${BASE_URL}${page}`);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/html');
      }
    });
  });

  describe('Sports Page SEO and Meta', () => {
    test('should include proper meta tags on NBA page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba`);
      const html = await response.text();

      expect(response.status).toBe(200);
      // Check for basic HTML structure
      expect(html).toContain('<html');
      expect(html).toContain('<head');
      expect(html).toContain('<body');
    });

    test('should include proper meta tags on games page', async () => {
      const response = await fetch(`${BASE_URL}/sports/nba/games`);
      const html = await response.text();

      expect(response.status).toBe(200);
      // Check for basic HTML structure
      expect(html).toContain('<html');
      expect(html).toContain('<head');
      expect(html).toContain('<body');
    });
  });

  describe('Sports Page Performance', () => {
    test('should load NBA page within reasonable time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/sports/nba`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    test('should load games page within reasonable time', async () => {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/sports/nba/games`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
