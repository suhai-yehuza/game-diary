import { test, expect } from '@playwright/test';

import { setupE2EMocking } from '@tests/e2e/utils/test-utils';

test.describe('Mock Server (E2E)', () => {
  test('@sanity should provide health check endpoint', async ({ page }) => {
    await setupE2EMocking(page);

    // Navigate to the mock server health endpoint
    const response = await page.request.get('/api/mock-server?action=health');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
    expect(data.config).toBeDefined();
  });

  test('@sanity should provide mock data endpoints', async ({ page }) => {
    await setupE2EMocking(page);

    // Test different mock data types
    const mockDataTypes = ['live-games', 'nba-games', 'nba-teams', 'nba-players', 'nba-standings'];

    for (const type of mockDataTypes) {
      const response = await page.request.get(`/api/mock-server?action=mock-data&type=${type}`);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.mock).toBe(true);
      expect(data.timestamp).toBeDefined();
    }
  });

  test('@sanity should handle external API calls with latency', async ({ page }) => {
    await setupE2EMocking(page);

    const startTime = Date.now();

    // Test external API call
    const response = await page.request.get('/api/mock-server?action=external-api&endpoint=games');

    const endTime = Date.now();
    const latency = endTime - startTime;

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.latency).toBeGreaterThan(0);

    // Verify that artificial latency was applied (should be at least 50ms)
    expect(latency).toBeGreaterThan(40); // Allow some tolerance
  });

  test('@sanity should handle database operations', async ({ page }) => {
    await setupE2EMocking(page);

    // Test database SELECT operation
    const selectResponse = await page.request.get(
      '/api/mock-server?action=database&operation=SELECT&table=users'
    );

    expect(selectResponse.status()).toBe(200);

    const selectData = await selectResponse.json();
    expect(selectData.success).toBe(true);
    expect(selectData.data).toBeDefined();
    expect(Array.isArray(selectData.data)).toBe(true);
    expect(selectData.data.length).toBeGreaterThan(0);

    // Test database INSERT operation
    const insertData = {
      operation: 'INSERT',
      table: 'users',
      data: {
        email: 'test@example.com',
        username: 'testuser',
      },
    };

    const insertResponse = await page.request.post('/api/mock-server?action=database', {
      data: insertData,
    });

    expect(insertResponse.status()).toBe(200);

    const insertResult = await insertResponse.json();
    expect(insertResult.success).toBe(true);
    expect(insertResult.data).toBeDefined();
    expect(insertResult.data.id).toBeDefined();
    expect(insertResult.data.email).toBe('test@example.com');
  });

  test('@sanity should simulate realistic error conditions', async ({ page }) => {
    await setupE2EMocking(page);

    // Test invalid endpoint
    const invalidResponse = await page.request.get(
      '/api/mock-server?action=external-api&endpoint=invalid/endpoint'
    );

    expect(invalidResponse.status()).toBe(200);

    const invalidData = await invalidResponse.json();
    expect(invalidData.success).toBe(false);
    expect(invalidData.error).toBeDefined();

    // Test missing parameters
    const missingParamsResponse = await page.request.get('/api/mock-server?action=mock-data');

    expect(missingParamsResponse.status()).toBe(400);

    const missingParamsData = await missingParamsResponse.json();
    expect(missingParamsData.error).toBeDefined();
  });

  test('@sanity should provide server statistics', async ({ page }) => {
    await setupE2EMocking(page);

    // Make some requests to generate statistics
    await page.request.get('/api/mock-server?action=mock-data&type=nba-games');
    await page.request.get('/api/mock-server?action=external-api&endpoint=teams');
    await page.request.get('/api/mock-server?action=database&operation=SELECT&table=users');

    // Get statistics
    const statsResponse = await page.request.get('/api/mock-server?action=stats');

    expect(statsResponse.status()).toBe(200);

    const stats = await statsResponse.json();
    expect(stats.uptime).toBeDefined();
    expect(stats.memory).toBeDefined();
    expect(stats.config).toBeDefined();
  });

  test('@sanity should handle concurrent requests with realistic latency', async ({ page }) => {
    await setupE2EMocking(page);

    // Make multiple concurrent requests
    const requests = [
      page.request.get('/api/mock-server?action=mock-data&type=live-games'),
      page.request.get('/api/mock-server?action=external-api&endpoint=games'),
      page.request.get('/api/mock-server?action=database&operation=SELECT&table=game_logs'),
      page.request.get('/api/mock-server?action=mock-data&type=nba-teams'),
      page.request.get('/api/mock-server?action=external-api&endpoint=players'),
    ];

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // Verify all requests succeeded
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }

    // Verify that artificial latency was applied (total time should be reasonable)
    expect(totalTime).toBeGreaterThan(100); // At least 100ms total for 5 requests
    expect(totalTime).toBeLessThan(2000); // Should not take too long
  });

  test('@sanity should provide realistic mock data structure', async ({ page }) => {
    await setupE2EMocking(page);

    // Test NBA games data structure
    const gamesResponse = await page.request.get(
      '/api/mock-server?action=mock-data&type=nba-games'
    );
    const gamesData = await gamesResponse.json();

    expect(gamesData.success).toBe(true);
    expect(gamesData.data).toBeDefined();

    // Check if data has a response array (NBA games structure)
    if (gamesData.data.response && Array.isArray(gamesData.data.response)) {
      expect(Array.isArray(gamesData.data.response)).toBe(true);

      if (gamesData.data.response.length > 0) {
        const game = gamesData.data.response[0];
        expect(game.id).toBeDefined();
        expect(game.teams).toBeDefined();
        expect(game.scores).toBeDefined();
        expect(game.status).toBeDefined();
        expect(game.date).toBeDefined();
      }
    } else if (Array.isArray(gamesData.data)) {
      // Direct array structure
      expect(Array.isArray(gamesData.data)).toBe(true);

      if (gamesData.data.length > 0) {
        const game = gamesData.data[0];
        expect(game.id).toBeDefined();
        expect(game.home_team_id).toBeDefined();
        expect(game.away_team_id).toBeDefined();
        expect(game.status).toBeDefined();
        expect(game.date).toBeDefined();
      }
    } else {
      // Fallback: just check that data exists
      expect(gamesData.data).toBeDefined();
    }

    // Test users data structure
    const usersResponse = await page.request.get(
      '/api/mock-server?action=database&operation=SELECT&table=users'
    );
    const usersData = await usersResponse.json();

    expect(usersData.success).toBe(true);
    expect(Array.isArray(usersData.data)).toBe(true);

    if (usersData.data.length > 0) {
      const user = usersData.data[0];
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.username).toBeDefined();
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    }
  });

  test('@sanity should handle POST requests for database operations', async ({ page }) => {
    await setupE2EMocking(page);

    // Test POST for database operations
    const postData = {
      operation: 'INSERT',
      table: 'game_logs',
      data: {
        user_id: 'user_1',
        game_id: 'game_123',
        title: 'Test Game Log',
        content: 'This is a test game log entry',
        rating: 4,
      },
    };

    const response = await page.request.post('/api/mock-server?action=database', {
      data: postData,
    });

    expect(response.status()).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.id).toBeDefined();
    expect(result.data.title).toBe('Test Game Log');
    expect(result.data.content).toBe('This is a test game log entry');
    expect(result.data.rating).toBe(4);
  });
});
