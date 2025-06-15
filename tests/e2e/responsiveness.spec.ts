import { expect } from '@playwright/test';

import { setupTestAuth } from './utils/auth-utils';
import { test } from './utils/global-setup';
import {
  waitForPageContent,
  setupApiMocking,
  setViewportAndWaitForLayout,
  VIEWPORTS,
  expandMobileMenuIfNeeded,
} from './utils/test-utils';

// Run this suite on all browsers
// (Playwright's default is to run all tests on all configured browsers)
test.describe('Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocking(page);
    await setupTestAuth(page);
  });

  test('should adapt layout for different viewports', async ({ page }) => {
    await setupApiMocking(page);

    // Test desktop viewport
    await setViewportAndWaitForLayout(page, VIEWPORTS.desktop);
    await page.goto('/');
    await waitForPageContent(page);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Test tablet viewport
    await setViewportAndWaitForLayout(page, VIEWPORTS.tablet);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Test mobile viewport
    await setViewportAndWaitForLayout(page, VIEWPORTS.mobile);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('main page layout and navigation is correct on all viewports', async ({ page }) => {
    await setupApiMocking(page);
    await page.goto('/');
    await waitForPageContent(page);

    // Test each viewport
    for (const [, size] of Object.entries(VIEWPORTS)) {
      await setViewportAndWaitForLayout(page, size);
      await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

      // Check mobile menu on smaller screens
      if (size.width <= VIEWPORTS.tablet.width) {
        await expandMobileMenuIfNeeded(page);
        await expect(page.getByRole('navigation')).toBeVisible();
      }
    }
  });
});
