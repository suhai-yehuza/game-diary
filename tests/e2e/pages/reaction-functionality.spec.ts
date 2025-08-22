import { test, expect } from '@playwright/test';

import {
  setupE2EMocking,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Reaction Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should toggle reactions correctly', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Add a reaction
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();
    await page.locator('[aria-label="React with 👍"]').click();

    // Check that reaction appears in existing reactions
    const existingReaction = page.locator('[data-testid="reaction-👍"]');
    await expect(existingReaction).toBeVisible();

    // Click on existing reaction to remove it
    await existingReaction.click();

    // Check that reaction is removed
    await expect(existingReaction).not.toBeVisible();
  });

  test('should show reaction counts correctly', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Add a reaction
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();
    await page.locator('[aria-label="React with 👍"]').click();

    // Check that reaction count is displayed
    const reactionWithCount = page.locator('text=👍 (1)');
    await expect(reactionWithCount).toBeVisible();
  });

  test('should handle multiple reactions on same target', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    const addButton = page.locator('[aria-label="Add reaction"]').first();

    // Add multiple different reactions
    await addButton.click();
    await page.locator('[aria-label="React with 👍"]').click();

    await addButton.click();
    await page.locator('[aria-label="React with ❤️"]').click();

    await addButton.click();
    await page.locator('[aria-label="React with 🔥"]').click();

    // Check that all reactions are displayed
    await expect(page.locator('[data-testid="reaction-👍"]')).toBeVisible();
    await expect(page.locator('[data-testid="reaction-❤️"]')).toBeVisible();
    await expect(page.locator('[data-testid="reaction-🔥"]')).toBeVisible();
  });
});

test.describe('Reaction Performance', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should load reaction picker quickly', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Measure time to open reaction picker
    const startTime = Date.now();
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();
    await expect(page.locator('text=Add Reaction')).toBeVisible();
    const endTime = Date.now();

    // Should open within 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });

  test('should handle multiple reaction pickers efficiently', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check that multiple reaction pickers can be opened
    const addButtons = page.locator('[aria-label="Add reaction"]');
    const buttonCount = await addButtons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Open first reaction picker
    await addButtons.first().click();
    await expect(page.locator('text=Add Reaction')).toBeVisible();

    // Close it
    await page.keyboard.press('Escape');

    // Open second reaction picker (if available)
    if (buttonCount > 1) {
      await addButtons.nth(1).click();
      await expect(page.locator('text=Add Reaction')).toBeVisible();
    }
  });
});
