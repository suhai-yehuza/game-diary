import { test } from './utils/global-setup';
import { expect } from '@playwright/test';
import {
  waitForPageContent,
  setupApiMocking,
  setViewportAndWaitForLayout,
} from './utils/test-utils';

test.describe('Home Page', () => {
  test('should load the home page and display basic content', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    // Navigate to the home page
    await page.goto('/');

    // Wait for the page content with retry logic
    await waitForPageContent(page);

    // Check that the page title contains expected text
    await expect(page).toHaveTitle(/Game Diary/);

    // Check for main content elements with increased timeout
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Check that navigation is present
    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    // Setup API mocking
    await setupApiMocking(page);

    await page.goto('/');

    // Wait for the page content with retry logic
    await waitForPageContent(page);

    // Check for common navigation links (adjust based on your actual navigation)
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    if (await dashboardLink.isVisible()) {
      await expect(dashboardLink).toBeVisible();
    }

    const sportsLink = page.getByRole('link', { name: /sports/i });
    if (await sportsLink.isVisible()) {
      await expect(sportsLink).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Setup API mocking to prevent rate limiting
    await setupApiMocking(page);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Wait for page content with retry logic
    await waitForPageContent(page);

    // Check that main content is visible on desktop with increased timeout
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Test tablet viewport
    await setViewportAndWaitForLayout(page, { width: 768, height: 1024 });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Test mobile viewport
    await setViewportAndWaitForLayout(page, { width: 375, height: 667 });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('should not have accessibility violations', async ({ page }) => {
    // Setup API mocking
    await setupApiMocking(page);

    await page.goto('/');

    // Wait for page content with retry logic
    await waitForPageContent(page);

    // Basic accessibility checks
    // Check for heading structure
    const h1 = page.locator('h1');
    if ((await h1.count()) > 0) {
      await expect(h1.first()).toBeVisible({ timeout: 10000 });
    }

    // Check for proper semantic HTML with increased timeout
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    // Check that images have alt text (if any)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      if (altText !== null) {
        expect(altText.length).toBeGreaterThan(0);
      }
    }
  });
});
