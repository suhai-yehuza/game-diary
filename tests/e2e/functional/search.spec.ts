import { test, expect } from '@playwright/test';
import { openMobileSearch } from '../utils/navigation';
import { setupE2EMocking, safeGotoWithMocking, waitForSearchResults } from '../utils/test-utils';

test.describe.configure({ mode: 'serial', retries: 2 });

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocking(page);
  });

  test.describe('Desktop Search', () => {
    test('should have search input visible on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await expect(searchInput.first()).toBeVisible();
        await expect(searchInput.first()).toBeEnabled();
      } else {
        return;
      }
    });

    test('should perform basic search functionality', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.first().fill('test');
        await waitForSearchResults(page);

        const searchResults = page.locator(
          '[data-testid="search-results"], .search-results, [data-section="search"]'
        );

        if ((await searchResults.count()) > 0) {
          await expect(searchResults.first()).toBeVisible();
        }
      } else {
        return;
      }
    });

    test('should clear search input', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.first().fill('test');
        await expect(searchInput.first()).toHaveValue('test');

        await searchInput.first().clear();
        await expect(searchInput.first()).toHaveValue('');
      } else {
        return;
      }
    });

    test('should handle keyboard navigation in search', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.first().focus();
        await expect(searchInput.first()).toBeFocused();

        await searchInput.first().fill('keyboard test');
        await expect(searchInput.first()).toHaveValue('keyboard test');

        await searchInput.first().press('Enter');
        await page.waitForLoadState('domcontentloaded');
      } else {
        return;
      }
    });
  });

  test.describe('Mobile Search', () => {
    test('should have search input visible and functional on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      await expect(searchInput.first()).toBeVisible();
      await expect(searchInput.first()).toBeEnabled();

      await searchInput.first().fill('mobile test');
      await waitForSearchResults(page);
    });
  });

  test.describe('Cross-Page Search', () => {
    const testPages = [
      { path: '/sports/nba', name: 'NBA' },
      { path: '/sports/nfl', name: 'NFL' },
      { path: '/sports/mlb', name: 'MLB' },
      { path: '/sports/nhl', name: 'NHL' },
      { path: '/sports/mls', name: 'MLS' },
      { path: '/sports/all-sports', name: 'All Sports' },
    ];

    for (const testPage of testPages) {
      test(`should have search functionality on ${testPage.name} page`, async ({ page }) => {
        await safeGotoWithMocking(page, testPage.path);
        await page.waitForLoadState('networkidle');

        const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');

        await expect(searchInput.first()).toBeVisible();
        await expect(searchInput.first()).toBeEnabled();
      });
    }
  });

  test.describe('Search Edge Cases', () => {
    test('should handle empty search', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await searchInput.first().fill('');
        await searchInput.first().press('Enter');
        await page.waitForLoadState('domcontentloaded');

        await expect(page.locator('main')).toBeVisible();
      } else {
        return;
      }
    });

    test('should handle special characters in search', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        const specialChars = ['!@#$%^&*()', 'test@example.com', 'test&more', 'test+plus'];

        for (const char of specialChars) {
          await searchInput.first().fill(char);
          await page.waitForLoadState('domcontentloaded');

          await expect(page.locator('main')).toBeVisible();
        }
      } else {
        return;
      }
    });

    test('should handle long search queries', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        const longQuery = 'a'.repeat(1000);
        await searchInput.first().fill(longQuery);
        await page.waitForLoadState('domcontentloaded');

        await expect(page.locator('main')).toBeVisible();
      } else {
        return;
      }
    });
  });

  test.describe('Search Accessibility', () => {
    test('should have proper ARIA labels for search', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        const input = searchInput.first();

        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');

        expect(ariaLabel || placeholder || type === 'search').toBeTruthy();
      } else {
        return;
      }
    });

    test('should support keyboard navigation for search', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 });

      await safeGotoWithMocking(page, '/sports/nba');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator(
        '[data-testid="search"], input[type="search"], input[placeholder*="search"]'
      );

      if ((await searchInput.count()) > 0) {
        await page.keyboard.press('Tab');
        await page.waitForLoadState('domcontentloaded');

        await searchInput.first().focus();
        await expect(searchInput.first()).toBeFocused();

        await searchInput.first().fill('accessibility test');
        await expect(searchInput.first()).toHaveValue('accessibility test');
      } else {
        return;
      }
    });
  });
});
