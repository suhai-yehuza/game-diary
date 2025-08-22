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

test.describe('Responsive Design - Reaction System', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'responsive-reaction-test');
    await setupE2EMocking(page);
  });

  test('should display correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check that reaction picker is still functional on mobile
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await expect(addButton).toBeVisible();

    // Open reaction picker
    await addButton.click();
    await expect(page.locator('text=Add Reaction')).toBeVisible();

    // Check that emoji grid is properly sized for mobile
    const emojiButtons = page.locator('[aria-label^="React with"]');
    await expect(emojiButtons.first()).toBeVisible();
  });

  test('should display correctly on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check that reaction picker works on tablet
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await expect(addButton).toBeVisible();

    // Open reaction picker
    await addButton.click();
    await expect(page.locator('text=Add Reaction')).toBeVisible();
  });

  test('should display correctly on desktop devices', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check that reaction picker works on desktop
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await expect(addButton).toBeVisible();

    // Open reaction picker
    await addButton.click();
    await expect(page.locator('text=Add Reaction')).toBeVisible();
  });
});
