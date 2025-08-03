import { test, expect } from '@playwright/test';

import { commonTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe('Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'responsive-test');
  });

  test('@sanity should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});
