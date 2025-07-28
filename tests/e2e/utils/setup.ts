import type { Page } from '@playwright/test';

import { CSS_ANIMATION_DISABLE } from '@tests/e2e/utils/constants';
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
 * Includes test data isolation for clean state
 */
export async function commonTestSetup(page: Page): Promise<void> {
  await clearTestData(page); // Test data isolation: clear storage and cookies
  await setupPageForTesting(page);
}

/**
 * Setup for tests that need to start on a specific page
 */
export async function setupTestOnPage(
  page: Page,
  path: string,
  options: { waitForLoad?: boolean } = {}
): Promise<void> {
  await setupPageForTesting(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });

  if (options.waitForLoad) {
    await waitForNetworkIdle(page);
  }
}

/**
 * Setup for tests that need to be authenticated
 * (Placeholder for future authentication setup)
 */
export async function setupAuthenticatedTest(page: Page): Promise<void> {
  await setupPageForTesting(page);
  // TODO: Add authentication setup when needed
  // This could involve signing in with test credentials
  // or setting up authentication cookies/tokens
}

/**
 * Cleanup after tests
 */
export async function cleanupAfterTest(page: Page): Promise<void> {
  // Clear any test data or state
  await page.evaluate(() => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });
}
