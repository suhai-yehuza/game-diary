import type { Page } from '@playwright/test';

import { CSS_ANIMATION_DISABLE } from '@tests/e2e/utils/constants';
import {
  setupMockDataForTest,
  cleanupMockDataAfterTest,
  isMockModeEnabled,
} from '@tests/e2e/utils/mock-config';
import { enhancedE2ECleanup } from '@tests/e2e/utils/test-database';
import { waitForNetworkIdle, clearTestData } from '@tests/e2e/utils/test-utils';

/**
 * Test setup utilities for E2E tests
 * Handles common test initialization and configuration
 */

/**
 * Disable CSS animations and transitions for test reliability
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: CSS_ANIMATION_DISABLE,
  });
}

/**
 * Setup page for reliable testing
 */
export async function setupPageForTesting(page: Page): Promise<void> {
  // Disable animations
  await disableAnimations(page);

  // Set a reasonable viewport if not already set
  const viewport = page.viewportSize();
  if (!viewport || viewport.width < 375) {
    await page.setViewportSize({ width: 1280, height: 720 });
  }
}

/**
 * Common test setup that can be used in beforeEach hooks
 * Includes test data isolation for clean state and mock data setup
 */
export async function commonTestSetup(page: Page, testName?: string): Promise<void> {
  await clearTestData(page); // Test data isolation: clear storage and cookies
  await setupPageForTesting(page);

  // Setup mock data if enabled
  if (isMockModeEnabled()) {
    setupMockDataForTest(testName);
  }
}

/**
 * Setup for tests that need to start on a specific page
 */
export async function setupTestOnPage(
  page: Page,
  path: string,
  options: { waitForLoad?: boolean; testName?: string } = {}
): Promise<void> {
  await setupPageForTesting(page);

  // Setup mock data if enabled
  if (isMockModeEnabled()) {
    setupMockDataForTest(options.testName);
  }

  await page.goto(path, { waitUntil: 'domcontentloaded' });

  if (options.waitForLoad) {
    await waitForNetworkIdle(page);
  }
}

/**
 * Setup for tests that need to be authenticated
 * (Placeholder for future authentication setup)
 */
export async function setupAuthenticatedTest(page: Page, testName?: string): Promise<void> {
  await setupPageForTesting(page);

  // Setup mock data if enabled
  if (isMockModeEnabled()) {
    setupMockDataForTest(testName);
  }

  // TODO: Add authentication setup when needed
  // This could involve signing in with test credentials
  // or setting up authentication cookies/tokens
}

/**
 * Cleanup after tests
 */
export async function cleanupAfterTest(page: Page): Promise<void> {
  // Use enhanced cleanup that includes database cleanup
  await enhancedE2ECleanup(page);

  // Cleanup mock data if enabled
  if (isMockModeEnabled()) {
    cleanupMockDataAfterTest();
  }
}

/**
 * Setup mock data for specific test scenarios
 */
export async function setupMockDataForScenario(page: Page, scenario: string): Promise<void> {
  if (!isMockModeEnabled()) {
    return;
  }

  setupMockDataForTest(scenario);

  // Inject mock data into page context if needed
  await page.evaluate(() => {
    // Set a flag to indicate mock mode is active
    (window as any).__MOCK_MODE__ = true;
  });
}

/**
 * Enhanced test setup with mock data support
 */
export async function enhancedTestSetup(
  page: Page,
  options: {
    testName?: string;
    enableMockData?: boolean;
    mockScenario?: string;
  } = {}
): Promise<void> {
  await commonTestSetup(page, options.testName);

  if (options.enableMockData && options.mockScenario) {
    await setupMockDataForScenario(page, options.mockScenario);
  }
}
