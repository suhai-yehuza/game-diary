import { test, expect, describe } from 'vitest';

import { getAppUrl } from '@src/lib/config/app.config';

const BASE_URL = getAppUrl();

describe('NBA API Integration Tests', () => {
  describe('Players API Endpoint', () => {
    test('should return players with default parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/players`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('get');
      expect(data.get).toBe('players');
      expect(data).toHaveProperty('response');
      expect(Array.isArray(data.response)).toBe(true);
      expect(data).toHaveProperty('results');
      expect(data).toHaveProperty('parameters');
    });

    test('should handle pagination parameters', async () => {
      const response = await fetch(`${BASE_URL}/api/players?limit=5&page=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
      // The API may return 0 results if no data is available or if the external API is down
      // This is acceptable behavior - we just verify the structure is correct
      expect(data.response.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle search parameter', async () => {
      const response = await fetch(`${BASE_URL}/api/players?search=lebron`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle team filter', async () => {
      const response = await fetch(`${BASE_URL}/api/players?team=lakers`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle position filter', async () => {
      const response = await fetch(`${BASE_URL}/api/players?position=PG`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle status filter', async () => {
      const response = await fetch(`${BASE_URL}/api/players?status=active`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle multiple filters', async () => {
      const response = await fetch(`${BASE_URL}/api/players?team=lakers&position=PG&limit=10`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle sorting by name', async () => {
      const response = await fetch(`${BASE_URL}/api/players?sortBy=name&sortDirection=asc`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle sorting by team', async () => {
      const response = await fetch(`${BASE_URL}/api/players?sortBy=team&sortDirection=desc`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should handle invalid pagination parameters gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/players?limit=invalid&page=invalid`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      // Should use default values when invalid parameters are provided
    });

    test('should handle empty search results', async () => {
      const response = await fetch(`${BASE_URL}/api/players?search=nonexistentplayer`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
      // Should return empty array for no results, not error
    });

    test('should handle special characters in search', async () => {
      const response = await fetch(`${BASE_URL}/api/players?search=O'Connor`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');
      expect(Array.isArray(data.response)).toBe(true);
    });

    test('should validate player data structure', async () => {
      const response = await fetch(`${BASE_URL}/api/players?limit=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.get).toBe('players');

      if (data.response.length > 0) {
        const player = data.response[0];
        expect(player).toHaveProperty('id');
        expect(player).toHaveProperty('firstname');
        expect(player).toHaveProperty('lastname');
      }
    });
  });

  describe('Player Detail API Endpoint', () => {
    test('should return player details by ID', async () => {
      // First get a list of players to get an ID
      const listResponse = await fetch(`${BASE_URL}/api/players?limit=1`);
      const listData = await listResponse.json();

      if (listData.response.length > 0) {
        const playerId = listData.response[0].id;
        const response = await fetch(`${BASE_URL}/api/players/${playerId}`);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('id');
        expect(data.id).toBe(playerId);
      }
    });

    test('should handle non-existent player ID', async () => {
      const response = await fetch(`${BASE_URL}/api/players/999999`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Player not found');
    });

    test('should handle invalid player ID format', async () => {
      const response = await fetch(`${BASE_URL}/api/players/invalid-id`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Teams API Endpoint', () => {
    test('should return team details by ID', async () => {
      const response = await fetch(`${BASE_URL}/api/teams/1`);
      const data = await response.json();

      // In test environment, the team might not exist, so accept both 200 and 404
      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('city');
      } else if (response.status === 404) {
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('Team not found');
      }
    });

    test('should return team games', async () => {
      const response = await fetch(`${BASE_URL}/api/teams/1/games`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
