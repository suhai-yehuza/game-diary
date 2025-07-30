import { test, expect } from '@playwright/test';

import { testHomePage } from '@tests/e2e/utils/page-tests';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData, TIMEOUTS, waitForNetworkIdle, safeGoto } from '@tests/e2e/utils/test-utils';

// Full E2E test suite for performance testing
test.describe('Full E2E Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test.afterEach(async ({ page }) => {
    await clearTestData(page);
  });

  test('should handle full application performance', async ({ page }) => {
    // Test home page performance
    await testHomePage(page);

    // Test navigation performance
    await page.goto('/sports');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);
    await expect(page).toHaveTitle(/Sports/);

    // Test search performance
    await page.goto('/search');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);
    await expect(page).toHaveTitle(/Search/);

    // Test live games performance
    await page.goto('/sports/live');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);
    await expect(page).toHaveTitle(/Live Games/);
  });

  test('should handle critical user flows efficiently', async ({ page }) => {
    // Test critical navigation flows
    await safeGoto(page, '/');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);

    // Navigate through main sections
    await page.click('text=Sports');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);

    await page.click('text=Live Games');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);

    await page.click('text=Search');
    await waitForNetworkIdle(page, TIMEOUTS.SHORT);
  });
});
