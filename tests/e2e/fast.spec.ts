import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
} from './utils/test-utils';

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Fast Development Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('should load home page successfully', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should load sign-in page', async ({ page }) => {
    await safeGoto(page, '/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should load sign-up page', async ({ page }) => {
    await safeGoto(page, '/sign-up');
    await page.waitForLoadState('domcontentloaded');

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should load NBA sports page', async ({ page }) => {
    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('should handle basic navigation', async ({ page }) => {
    // Start at home
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Navigate to sports
    await page.click('a[href*="/sports"]');
    await waitForPageLoad(page);

    // Check we're on a sports page
    await expect(page.locator('main')).toBeVisible();

    // Navigate back to home
    await page.click('a[href="/"]');
    await waitForPageLoad(page);

    // Check we're back on home
    await expect(page.locator('main')).toBeVisible();
  });
});
