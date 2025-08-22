import { test, expect } from '@playwright/test';

import {
  setupE2EMocking,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network errors
    await page.route('**/api/graphql', route => route.abort());

    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Page should still load even with network errors
    await expect(page.locator('text=Game Diary')).toBeVisible();
  });

  test('should handle invalid reaction data gracefully', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Try to add a reaction (should work normally)
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();
    await page.locator('[aria-label="React with 👍"]').click();

    // Should not crash or show errors
    await expect(page.locator('text=Add Reaction')).not.toBeVisible();
  });
});
