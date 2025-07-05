import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
} from '@tests/e2e/utils/test-utils';

// Mock verification is handled by the compound runner

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Fast Development Tests (Base Level)', () => {
  test.beforeEach(async ({ page }) => {
    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('@fast should load home page successfully', async ({ page }) => {
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

  test('@fast should load sign-in page', async ({ page }) => {
    await safeGoto(page, '/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('@fast should load sign-up page', async ({ page }) => {
    await safeGoto(page, '/sign-up');
    await page.waitForLoadState('domcontentloaded');

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('@fast should load NBA sports page', async ({ page }) => {
    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('@fast should handle basic navigation', async ({ page }) => {
    // Start at home
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Wait for the page to be fully stable
    await page.waitForTimeout(1000);

    // First, check if the header is present and navigation is visible
    const header = page.locator('header');
    try {
      await expect(header).toBeVisible();
    } catch (e) {
      // Print the page HTML for debugging
      const html = await page.content();
      console.log('DEBUG: Page HTML when header not found:');
      console.log(html);
      throw e;
    }

    // Look for a specific sports link - let's try NBA first
    const sportsLink = page.locator('a[href="/sports/nba"]');

    // Debug: Log what links are available
    const allLinks = await page.locator('a').all();
    console.log(`Navigation test: Found ${allLinks.length} links on the page`);
    for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
      const href = await allLinks[i].getAttribute('href');
      const text = await allLinks[i].textContent();
      console.log(`  Link ${i}: href="${href}", text="${text?.trim()}"`);
    }

    // Wait for the sports link to be visible
    await sportsLink.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500); // Wait for any animations to settle

    await sportsLink.click();

    // Wait for navigation to complete and page to be stable
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Debug: Log the current URL and page content
    const currentUrl = page.url();
    console.log(`Navigation test: Current URL after clicking sports link: ${currentUrl}`);

    // Check we're on a sports page - all sports pages now use 'main' elements
    // Use a more robust check that waits for the element to be present and visible
    const mainElement = page.locator('main');
    await mainElement.waitFor({ state: 'visible', timeout: 10000 });
    await expect(mainElement).toBeVisible();

    // Navigate back to home
    const homeLink = page.locator('a[href="/"]');
    await homeLink.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);

    await homeLink.click();

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check we're back on home
    await expect(page.locator('main')).toBeVisible();
  });
});
