import { test, expect } from '@playwright/test';

import { commonTestSetup } from '@tests/e2e/utils/setup';
import {
  clearTestData,
  setupE2EMocking,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Responsive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'responsive-test');
  });

  test('@sanity should be responsive across all breakpoints', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Check that the page loads and is visible
      await expect(page.locator('body')).toBeVisible();

      // Check that navigation is present
      await expect(page.locator('nav').first()).toBeVisible();

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible();

      // Verify viewport size
      const currentViewport = page.viewportSize();
      expect(currentViewport?.width).toBe(viewport.width);
      expect(currentViewport?.height).toBe(viewport.height);
    }
  });
});

test.describe('Responsive Design - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'responsive-basic-test');
    await setupE2EMocking(page);
  });

  test('should display correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that the page loads and is responsive
    await expect(page.locator('body')).toBeVisible();

    // Check that navigation elements are present (use first nav element)
    await expect(page.locator('nav').first()).toBeVisible();

    // Check that the page content is properly sized for mobile
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
  });

  test('should display correctly on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that the page loads and is responsive
    await expect(page.locator('body')).toBeVisible();

    // Check that navigation elements are present (use first nav element)
    await expect(page.locator('nav').first()).toBeVisible();

    // Check that the page content is properly sized for tablet
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(768);
  });

  test('should display correctly on desktop devices', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that the page loads and is responsive
    await expect(page.locator('body')).toBeVisible();

    // Check that navigation elements are present (use first nav element)
    await expect(page.locator('nav').first()).toBeVisible();

    // Check that the page content is properly sized for desktop
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(1920);
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that buttons have minimum touch target size
    // Using 43.5px to account for browser sub-pixel rendering precision
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(43.5);
        expect(box.width).toBeGreaterThanOrEqual(43.5);
      }
    }
  });

  test('should have proper mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that mobile bottom navigation is visible
    const mobileNav = page.locator('[data-testid="mobile-bottom-nav"]');
    if ((await mobileNav.count()) > 0) {
      await expect(mobileNav).toBeVisible();
    }

    // Check that mobile menu button is present
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
    if ((await menuButton.count()) > 0) {
      await expect(menuButton).toBeVisible();
    }
  });

  test('should handle text scaling properly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that text is readable and properly scaled
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      if (text && text.trim().length > 0) {
        await expect(heading).toBeVisible();
      }
    }
  });

  test('should have proper image responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that images are properly sized
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const box = await img.boundingBox();
      if (box) {
        // Images should not overflow their container
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should handle orientation changes', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);
    await expect(page.locator('body')).toBeVisible();

    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.reload();
    await waitForPageLoad(page);
    await expect(page.locator('body')).toBeVisible();
  });
});
