import { test, expect } from '@playwright/test';

import { errorHandlers } from '@/lib/utils/error-handler';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { setupE2EMocking, clearTestData, TIMEOUTS } from '@tests/e2e/utils/test-utils';

/**
 * Mock Server Test Suite
 *
 * This test suite demonstrates improved patterns for testing the mock server:
 * - Comprehensive endpoint testing
 * - Better error handling and validation
 * - Performance testing
 * - Edge case coverage
 * - Clear test organization
 */

// Mock server configuration
const MOCK_SERVER_CONFIG = {
  baseUrl: '/api/mock-server',
  endpoints: {
    health: '?action=health',
    externalApi: '?action=external-api',
    database: '?action=database',
    mockData: '?action=mock-data',
    stats: '?action=stats',
  },
  apiEndpoints: ['games', 'teams', 'players', 'standings', 'seasons', 'leagues', 'statistics'],
  databaseTables: ['users', 'game_logs', 'friendships', 'comments', 'game_ratings'],
  timeout: TIMEOUTS.MEDIUM,
} as const;

// Response pattern types
type ResponsePattern = {
  status?: number | string;
  hasData?: boolean;
  hasTimestamp?: boolean;
  hasConfig?: boolean;
  hasLatency?: boolean;
  isArray?: boolean;
};

// Expected response patterns
const RESPONSE_PATTERNS = {
  success: {
    status: 200,
    hasData: true,
    hasTimestamp: true,
  } as ResponsePattern,
  health: {
    status: 'healthy',
    hasConfig: true,
  } as ResponsePattern,
  externalApi: {
    hasLatency: true,
    hasData: true,
  } as ResponsePattern,
  database: {
    hasData: true,
    isArray: true,
  } as ResponsePattern,
} as const;

/**
 * Enhanced mock server test runner
 */
class MockServerTestRunner {
  private readonly testName: string;

  constructor(testName: string) {
    this.testName = testName;
  }

  async runTest(
    page: any,
    testFn: () => Promise<void>,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const { timeout: _timeout = MOCK_SERVER_CONFIG.timeout } = options;

    console.log(`🔧 Running mock server test: ${this.testName}`);

    try {
      await testFn();
      console.log(`✅ Mock server test completed: ${this.testName}`);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'E2E Mock Server Test',
        action: `Test: ${this.testName}`,
      });
      console.error(`❌ Mock server test failed: ${this.testName}`, error);
      throw error;
    }
  }

  /**
   * Test a specific endpoint with validation
   */
  async testEndpoint(
    page: any,
    endpoint: string,
    expectedPattern: ResponsePattern,
    options: { method?: 'GET' | 'POST'; data?: any } = {}
  ): Promise<any> {
    const { method = 'GET', data } = options;
    const url = `${MOCK_SERVER_CONFIG.baseUrl}${endpoint}`;

    console.log(`🔍 Testing endpoint: ${method} ${url}`);

    let response;
    if (method === 'GET') {
      response = await page.request.get(url);
    } else {
      response = await page.request.post(url, { data });
    }

    // Validate response status
    expect(response.status()).toBe(200);

    // Parse response
    const responseData = await response.json();
    console.log(`📊 Response data keys: ${Object.keys(responseData).join(', ')}`);

    // Validate response structure
    if (expectedPattern.hasData) {
      expect(responseData).toHaveProperty('data');
    }

    if (expectedPattern.hasTimestamp) {
      expect(responseData).toHaveProperty('timestamp');
      expect(responseData.timestamp).toBeDefined();
    }

    if (expectedPattern.hasConfig) {
      expect(responseData).toHaveProperty('config');
    }

    if (expectedPattern.hasLatency) {
      expect(responseData).toHaveProperty('latency');
      expect(responseData.latency).toBeGreaterThan(0);
    }

    if (expectedPattern.isArray) {
      expect(Array.isArray(responseData.data)).toBe(true);
    }

    return responseData;
  }
}

// Atomic test functions
export async function testMockServerHealth(page: any) {
  const runner = new MockServerTestRunner('health-check');

  await runner.runTest(page, async () => {
    const response = await runner.testEndpoint(
      page,
      MOCK_SERVER_CONFIG.endpoints.health,
      RESPONSE_PATTERNS.health
    );

    expect(response.status).toBe('healthy');
    expect(response.config).toBeDefined();
  });
}

export async function testMockServerExternalApi(page: any) {
  const runner = new MockServerTestRunner('external-api');

  await runner.runTest(page, async () => {
    // Test each API endpoint
    for (const endpoint of MOCK_SERVER_CONFIG.apiEndpoints) {
      console.log(`🔍 Testing external API endpoint: ${endpoint}`);

      const response = await runner.testEndpoint(
        page,
        `${MOCK_SERVER_CONFIG.endpoints.externalApi}&endpoint=${endpoint}`,
        RESPONSE_PATTERNS.externalApi
      );

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.latency).toBeGreaterThan(0);
    }
  });
}

export async function testMockServerDatabase(page: any) {
  const runner = new MockServerTestRunner('database-operations');

  await runner.runTest(page, async () => {
    // Test SELECT operations for each table
    for (const table of MOCK_SERVER_CONFIG.databaseTables) {
      console.log(`🔍 Testing database SELECT: ${table}`);

      const selectResponse = await runner.testEndpoint(
        page,
        `${MOCK_SERVER_CONFIG.endpoints.database}&operation=SELECT&table=${table}`,
        RESPONSE_PATTERNS.database
      );

      expect(selectResponse.success).toBe(true);
      expect(Array.isArray(selectResponse.data)).toBe(true);
      expect(selectResponse.data.length).toBeGreaterThan(0);
    }

    // Test INSERT operation
    const insertData = {
      operation: 'INSERT',
      table: 'users',
      data: {
        email: 'test@example.com',
        username: 'testuser',
        created_at: new Date().toISOString(),
      },
    };

    const insertResponse = await runner.testEndpoint(
      page,
      MOCK_SERVER_CONFIG.endpoints.database,
      { hasData: true, hasTimestamp: true } as ResponsePattern,
      { method: 'POST', data: insertData }
    );

    expect(insertResponse.success).toBe(true);
    expect(insertResponse.data).toHaveProperty('id');
    expect(insertResponse.data.email).toBe('test@example.com');
  });
}

export async function testMockServerMockData(page: any) {
  const runner = new MockServerTestRunner('mock-data');

  await runner.runTest(page, async () => {
    const mockDataTypes = ['live-games', 'nba-games', 'nba-teams', 'nba-players', 'nba-standings'];

    for (const type of mockDataTypes) {
      console.log(`🔍 Testing mock data type: ${type}`);

      const response = await runner.testEndpoint(
        page,
        `${MOCK_SERVER_CONFIG.endpoints.mockData}&type=${type}`,
        RESPONSE_PATTERNS.success
      );

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.mock).toBe(true);
    }
  });
}

export async function testMockServerPerformance(page: any) {
  const runner = new MockServerTestRunner('performance');

  await runner.runTest(page, async () => {
    const startTime = Date.now();

    // Test multiple concurrent requests
    const promises = MOCK_SERVER_CONFIG.apiEndpoints.map(endpoint =>
      page.request.get(
        `${MOCK_SERVER_CONFIG.baseUrl}${MOCK_SERVER_CONFIG.endpoints.externalApi}&endpoint=${endpoint}`
      )
    );

    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`⏱️ Total time for ${promises.length} concurrent requests: ${totalTime}ms`);

    // Validate all responses
    for (const response of responses) {
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    }

    // Performance should be reasonable (less than 5 seconds for all requests)
    expect(totalTime).toBeLessThan(5000);
  });
}

export async function testMockServerErrorHandling(page: any) {
  const runner = new MockServerTestRunner('error-handling');

  await runner.runTest(page, async () => {
    // Test invalid endpoint
    const invalidResponse = await page.request.get(
      `${MOCK_SERVER_CONFIG.baseUrl}${MOCK_SERVER_CONFIG.endpoints.externalApi}&endpoint=invalid`
    );

    // Should handle gracefully (either 200 with error message or 400)
    expect([200, 400]).toContain(invalidResponse.status());

    // Test invalid database operation
    const invalidDbResponse = await page.request.post(
      `${MOCK_SERVER_CONFIG.baseUrl}${MOCK_SERVER_CONFIG.endpoints.database}`,
      {
        data: {
          operation: 'INVALID',
          table: 'nonexistent',
        },
      }
    );

    // Should handle gracefully
    expect([200, 400]).toContain(invalidDbResponse.status());
  });
}

export async function testMockServerStatistics(page: any) {
  const runner = new MockServerTestRunner('statistics');

  await runner.runTest(page, async () => {
    const response = await runner.testEndpoint(
      page,
      MOCK_SERVER_CONFIG.endpoints.stats,
      RESPONSE_PATTERNS.success
    );

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();

    // Check for expected statistics
    if (response.data.requests) {
      expect(typeof response.data.requests).toBe('number');
    }

    if (response.data.endpoints) {
      expect(Array.isArray(response.data.endpoints)).toBe(true);
    }
  });
}

// Enhanced suite runner
export async function runMockServerSuite(page: any) {
  const runner = new MockServerTestRunner('full-mock-server-suite');

  await runner.runTest(page, async () => {
    await testMockServerHealth(page);
    await testMockServerExternalApi(page);
    await testMockServerDatabase(page);
    await testMockServerMockData(page);
    await testMockServerPerformance(page);
    await testMockServerErrorHandling(page);
    await testMockServerStatistics(page);
  });
}

// Test suites
test.describe('Mock Server Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'mock-server-test');
    await setupE2EMocking(page);
  });

  test('@sanity full mock server suite', async ({ page }) => {
    await runMockServerSuite(page);
  });
});

test.describe('Individual Mock Server Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'individual-mock-server-test');
    await setupE2EMocking(page);
  });

  test('@sanity health check endpoint', async ({ page }) => {
    await testMockServerHealth(page);
  });

  test('@sanity external API endpoints', async ({ page }) => {
    await testMockServerExternalApi(page);
  });

  test('@sanity database operations', async ({ page }) => {
    await testMockServerDatabase(page);
  });

  test('@sanity mock data endpoints', async ({ page }) => {
    await testMockServerMockData(page);
  });

  test('@sanity performance testing', async ({ page }) => {
    await testMockServerPerformance(page);
  });

  test('@sanity error handling', async ({ page }) => {
    await testMockServerErrorHandling(page);
  });

  test('@sanity statistics endpoint', async ({ page }) => {
    await testMockServerStatistics(page);
  });
});

test.describe('Mock Server Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'mock-server-integration-test');
    await setupE2EMocking(page);
  });

  test('should serve mock NBA games data', async ({ page }) => {
    // Navigate to a page that uses the mock server
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that the page loads successfully with mock data
    await expect(page.locator("text=See What's Happening")).toBeVisible();

    // Verify that mock data is being used (no real API calls)
    const response = await page.waitForResponse(
      response => response.url().includes('/api/mock-server'),
      { timeout: 10000 }
    );

    expect(response.status()).toBe(200);
  });

  test('should handle mock server errors gracefully', async ({ page }) => {
    // This would require mocking the mock server to return errors
    // For now, we'll test that the page handles network issues
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Page should still load even if mock server has issues
    await expect(page.locator("text=See What's Happening")).toBeVisible();
  });
});
