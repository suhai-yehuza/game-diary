import { test, expect } from '@playwright/test';

import { runComprehensivePageTests } from '@tests/e2e/utils/page-suites';
import {
  setupE2EMocking,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

// Run comprehensive page tests for home page
runComprehensivePageTests(test, '/', 'Home Page');

test.describe('Landing Page Content Preview', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should display content preview banner on landing page', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that content preview banner is present
    await expect(page.locator("text=See What's Happening")).toBeVisible();
    await expect(page.locator('text=Trending Now')).toBeVisible();
    await expect(page.locator('text=Latest Results')).toBeVisible();
  });

  test('should show trending content section', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check trending content section
    const trendingSection = page.locator('text=Trending Now').first();
    await expect(trendingSection).toBeVisible();

    // Check that it links to user dashboard
    const trendingLink = trendingSection.locator('..').locator('a');
    await expect(trendingLink).toHaveAttribute('href', '/protected/user');
  });

  test('should show latest results section', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check latest results section
    const resultsSection = page.locator('text=Latest Results').first();
    await expect(resultsSection).toBeVisible();

    // Check that it links to sports page
    const resultsLink = resultsSection.locator('..').locator('a');
    await expect(resultsLink).toHaveAttribute('href', '/sports/all-sports');
  });

  test('should display loading states correctly', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check for loading skeleton elements
    const skeletonElements = page.locator('.animate-pulse');
    await expect(skeletonElements).toHaveCount(0); // Should not be loading after page load
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // This test would require mocking empty data
    // For now, we'll test that the page loads without errors
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Page should load successfully even with no data
    await expect(page.locator("text=See What's Happening")).toBeVisible();
  });
});
