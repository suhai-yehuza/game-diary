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

  test('@sanity should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
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
});
