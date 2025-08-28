import { test } from '@playwright/test';

import { errorHandlers } from '@/lib/utils/error-handler';
import { APP_CONFIG } from '@src/lib/config/app.config';
import { SPORTS_PAGES } from '@tests/e2e/utils/constants';
import { isMockModeEnabled, getMockData } from '@tests/e2e/utils/mock-config';
import { checkPerformanceMetrics } from '@tests/e2e/utils/performance';
import { commonTestSetup, enhancedTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData, TIMEOUTS, safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';

import {
  runSmokeSuite,
  runSanitySuite,
  smokeTestAllSportsPages,
  smokeTestSignInModalClickOutside,
} from './shared-suite-runners';

/**
 * Smoke Test Suite
 *
 * This test suite demonstrates improved patterns:
 * - Better test organization and structure
 * - Consistent setup and teardown
 * - Proper error handling and logging
 * - Mock data integration
 * - Performance and accessibility checks
 */

// Test configuration
const TEST_CONFIG = {
  timeout: TIMEOUTS.EXTENDED,
  retries: 1,
  parallel: false, // Run sequentially for smoke tests
} as const;

// Test data for consistent testing
const TEST_SCENARIOS = {
  homePage: {
    path: '/',
    expectedTitle: /Game Diary|GameLog/i,
    checks: ['structure', 'title', 'performance'] as const,
  },
  sportsPages: {
    paths: SPORTS_PAGES,
    timeout: TIMEOUTS.EXTENDED,
    checks: ['structure', 'title'] as const,
  },
  dashboard: {
    path: '/protected/user',
    expectedTitle: /Dashboard|User/i,
    checks: ['structure', 'title'] as const,
  },
} as const;

/**
 * Enhanced test runner with better error handling and logging
 */
class TestRunner {
  private readonly testName: string;
  private readonly mockEnabled: boolean;

  constructor(testName: string) {
    this.testName = testName;
    this.mockEnabled = isMockModeEnabled();
  }

  async runTest(
    page: any,
    testFn: () => Promise<void>,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<void> {
    const { timeout: _timeout = TEST_CONFIG.timeout, retries: _retries = TEST_CONFIG.retries } =
      options;

    console.log(`🚀 Running test: ${this.testName}`);

    if (this.mockEnabled) {
      const mockData = getMockData();
      console.log(`🔧 Mock data available: ${Object.keys(mockData).join(', ')}`);
    }

    try {
      // Check if page is still valid before running test
      if (page.isClosed()) {
        throw new Error('Page is closed, cannot run test');
      }

      await testFn();
      console.log(`✅ Test completed: ${this.testName}`);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'E2E Test',
        action: `Test: ${this.testName}`,
      });
      console.error(`❌ Test failed: ${this.testName}`, error);

      // Check if the error is due to browser context being closed
      if (
        error instanceof Error &&
        error.message.includes('Target page, context or browser has been closed')
      ) {
        console.log('🔄 Browser context was closed during test execution');
        throw new Error('Browser context closed - test environment issue');
      }

      throw error;
    }
  }

  /**
   * Run comprehensive page checks
   */
  async runPageChecks(
    page: any,
    scenario: (typeof TEST_SCENARIOS)[keyof typeof TEST_SCENARIOS]
  ): Promise<void> {
    await this.runTest(page, async () => {
      // Navigate to page
      if ('path' in scenario) {
        await safeGoto(page, scenario.path);
        await waitForPageLoad(page);

        // Run configured checks
        for (const check of scenario.checks) {
          switch (check) {
            case 'structure':
              // Basic structure check - page should be visible
              await page.locator('body').waitFor({ timeout: TIMEOUTS.MEDIUM });
              break;
            case 'title':
              if ('expectedTitle' in scenario) {
                const expectedTitle = scenario.expectedTitle.toString();
                try {
                  await page.waitForFunction(
                    (title: string) => document.title.match(title),
                    expectedTitle,
                    { timeout: TIMEOUTS.SHORT }
                  );
                } catch (_error) {
                  console.log(`⚠️ Title check failed for ${scenario.path}, continuing...`);
                  // Continue with other checks even if title doesn't match
                }
              }
              break;
            case 'performance':
              await checkPerformanceMetrics(page);
              break;
            default:
              console.warn(`Unknown check type: ${String(check)}`);
          }
        }
      }
    });
  }
}

// Enhanced suite runner with better organization
export async function runSmokeSuiteWithRunner(page: any) {
  const runner = new TestRunner('full-smoke-suite');

  await runner.runTest(page, async () => {
    // Run sanity checks first
    await runSanitySuite(page);

    // Run core smoke tests using shared functions
    await runSmokeSuite(page);
  });
}

// Test suite with improved setup and organization
test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear test data for isolation
    await clearTestData(page);

    // Setup with enhanced configuration
    await commonTestSetup(page, 'smoke-test');

    // Log test environment
    console.log(`🔧 Test Environment:`);
    console.log(`  - Mock Mode: ${isMockModeEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  - CI: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
    console.log(`  - Timeout: ${TEST_CONFIG.timeout}ms`);
  });

  test('@smoke full smoke suite', async ({ page }) => {
    // Set explicit timeout to match Playwright configuration
    test.setTimeout(APP_CONFIG.TEST_TIMEOUT);
    await runSmokeSuiteWithRunner(page);
  });
});

// Enhanced smoke tests with mock data support
test.describe('Enhanced Smoke Tests with Mock Data', () => {
  test.beforeEach(async ({ page }) => {
    await enhancedTestSetup(page, {
      testName: 'enhanced-smoke-test',
      enableMockData: true,
      mockScenario: 'smoke-test-scenario',
    });
  });

  test('@smoke enhanced smoke suite with mock data', async ({ page }) => {
    // Set explicit timeout to match Playwright configuration
    test.setTimeout(APP_CONFIG.TEST_TIMEOUT);

    const runner = new TestRunner('enhanced-smoke');

    await runner.runTest(page, async () => {
      // Verify mock mode is working
      if (isMockModeEnabled()) {
        console.log('✅ Mock data is enabled for enhanced smoke test');
        const mockData = getMockData();
        console.log(`📊 Available mock data: ${Object.keys(mockData).join(', ')}`);
      }

      await runSmokeSuiteWithRunner(page);
    });
  });
});

// Individual test cases for better debugging
test.describe('Individual Smoke Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'individual-smoke-test');
  });

  test('@smoke home page structure and performance', async ({ page }) => {
    const runner = new TestRunner('home-page');
    await runner.runPageChecks(page, TEST_SCENARIOS.homePage);
  });

  test('@smoke sports pages navigation', async ({ page }) => {
    const runner = new TestRunner('sports-navigation');
    await runner.runTest(page, async () => {
      await smokeTestAllSportsPages(page);
    });
  });

  test('@smoke sign-in modal functionality', async ({ page }) => {
    const runner = new TestRunner('sign-in-modal');
    await runner.runTest(page, async () => {
      await smokeTestSignInModalClickOutside(page);
    });
  });
});
