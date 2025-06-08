import { test, expect } from '@playwright/test';
import { setupApiMocking, testResponsiveness, expandMobileMenuIfNeeded } from './utils/test-utils';
import { setupTestAuth } from './utils/auth-utils';

// Run this suite on all browsers
// (Playwright's default is to run all tests on all configured browsers)
test.describe('Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocking(page);
    await setupTestAuth(page);
  });

  test('main page layout and navigation is correct on all viewports', async ({ page }) => {
    await page.goto('/');
    await testResponsiveness(page, async viewport => {
      // Check main content
      await expect(page.locator('main.grow').first()).toBeVisible();
      await expect(page).toHaveTitle(/Game Diary/);

      if (viewport === 'mobile') {
        // Mobile should have menu button
        await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
        
        try {
          // Expand mobile menu to check navigation links
          await expandMobileMenuIfNeeded(page);
          await expect(page.getByRole('link', { name: /nba/i })).toBeVisible();
          await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
        } catch (error) {
          console.log('Mobile navigation test failed, taking screenshot for debugging');
          await page.screenshot({ path: `mobile-nav-debug-${Date.now()}.png` });
          // Check if links exist but are not visible
          const nbaLinkExists = await page.getByRole('link', { name: /nba/i }).count();
          const dashboardLinkExists = await page.getByRole('link', { name: /dashboard/i }).count();
          console.log(`NBA link count: ${nbaLinkExists}, Dashboard link count: ${dashboardLinkExists}`);
          throw error;
        }
      } else {
        // Desktop/tablet should have visible navigation links
        await expect(page.getByRole('link', { name: /nba/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
      }
    });
  });
});
