import { test } from './utils/global-setup';
import { expect } from '@playwright/test';
import { testResponsiveness, waitForPageContent, setupApiMocking } from './utils/test-utils';

// Run this suite on all browsers
// (Playwright's default is to run all tests on all configured browsers)
test.describe('Responsiveness', () => {
  test('main page layout and navigation is correct on all viewports', async ({ page }) => {
    // Setup API mocking to avoid real network calls
    await setupApiMocking(page);
    await page.goto('/');
    await waitForPageContent(page);

    await testResponsiveness(page, async (viewport: string) => {
      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible();
      // Check that the page title is correct (customize as needed)
      await expect(page).toHaveTitle(/Game Diary/i);
      // Optionally, add viewport-specific assertions
      if (viewport === 'mobile') {
        // Example: check for mobile nav menu
        // await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      }
      if (viewport === 'desktop') {
        // Example: check for desktop nav bar
        // await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
      }
    });
  });
});
