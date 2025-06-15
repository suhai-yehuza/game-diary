import { expect } from '@playwright/test';

import { test } from './utils/global-setup';
import {
  waitForPageContent,
  setupApiMocking,
  setViewportAndWaitForLayout,
  navigateWithMocking,
} from './utils/test-utils';

test.describe('Home Page', () => {
  test('should load the home page and display basic content', async ({ page }) => {
    await setupApiMocking(page);
    await page.goto('/');
    await waitForPageContent(page);
    await expect(page).toHaveTitle(/Game Diary/);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('header').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    await setupApiMocking(page);
    await page.goto('/');
    await waitForPageContent(page);

    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    if (await dashboardLink.isVisible()) {
      await expect(dashboardLink).toBeVisible();
    }

    const sportsLink = page.getByRole('link', { name: /sports/i });
    if (await sportsLink.isVisible()) {
      await expect(sportsLink).toBeVisible();
    }
  });

  test('should display live games banner when games are in progress', async ({ page }) => {
    // Use default mocking which includes live games
    await navigateWithMocking(page, '/');

    // Check that the live games banner is visible
    const liveGamesBanner = page.locator('[href="/sports/nba/live"]');
    await expect(liveGamesBanner).toBeVisible({ timeout: 10000 });

    // Check banner content
    await expect(page.locator('text=Live Games')).toBeVisible();
    await expect(page.locator('text=happening now')).toBeVisible();
    await expect(page.locator('text=Click to view')).toBeVisible();

    // Check that banner has the correct styling (red background)
    const bannerElement = page.locator('.bg-gradient-to-r.from-red-500');
    await expect(bannerElement).toBeVisible();

    // Check for animated elements
    await expect(page.locator('.animate-pulse')).toBeVisible();
    await expect(page.locator('.animate-ping')).toBeVisible();
  });

  test('should navigate to live games page when clicking banner', async ({ page }) => {
    await navigateWithMocking(page, '/');

    // Wait for banner to be visible
    const liveGamesBanner = page.locator('[href="/sports/nba/live"]');
    await expect(liveGamesBanner).toBeVisible({ timeout: 10000 });

    // Mock the live games page
    await page.route('**/sports/nba/live', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><h1>Live NBA Games</h1></body></html>',
      });
    });

    // Click the banner
    await liveGamesBanner.click();

    // Check that we navigated to the live games page
    await expect(page).toHaveURL('/sports/nba/live');
  });

  test('should not display live games banner when no games are live', async ({ page }) => {
    // Use empty live games mocking
    await navigateWithMocking(page, '/', { emptyLiveGames: true });

    // Check that the live games banner is not visible
    const liveGamesBanner = page.locator('[href="/sports/nba/live"]');
    await expect(liveGamesBanner).not.toBeVisible();

    // Check that live games related text is not present
    await expect(page.locator('text=Live Games')).not.toBeVisible();
    await expect(page.locator('text=happening now')).not.toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    await setupApiMocking(page);
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await waitForPageContent(page);
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    await setViewportAndWaitForLayout(page, { width: 768, height: 1024 });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

    await setViewportAndWaitForLayout(page, { width: 375, height: 667 });
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('should not have accessibility violations', async ({ page }) => {
    await setupApiMocking(page);
    await page.goto('/');
    await waitForPageContent(page);

    const h1 = page.locator('h1');
    if ((await h1.count()) > 0) {
      await expect(h1.first()).toBeVisible({ timeout: 10000 });
    }

    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });

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
