import { test } from '@playwright/test';

import { commonTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe('Cross-Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'cross-browser-test');
  });

  test('@sanity should work across browsers', async ({ page }) => {
    // Basic cross-browser test
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check that page loads
    expect(page.locator('body')).toBeVisible();
  });
});
