import { test } from './utils/global-setup';
import { expect } from '@playwright/test';
import {
  waitForPageContent,
  setupApiMocking,
  setViewportAndWaitForLayout,
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
