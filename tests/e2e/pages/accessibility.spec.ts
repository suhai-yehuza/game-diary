import { test, expect } from '@playwright/test';

import {
  setupE2EMocking,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check ARIA labels
    await expect(page.locator('[aria-label="Add reaction"]')).toBeVisible();

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    await expect(page.locator('[aria-label="Close"]')).toBeVisible();
    await expect(page.locator('[aria-label="React with 👍"]')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Test keyboard navigation
    await page.keyboard.press('Escape');
    await expect(page.locator('text=Add Reaction')).not.toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Check that focus is managed properly
    const closeButton = page.locator('[aria-label="Close"]');
    await expect(closeButton).toBeFocused();
  });
});
