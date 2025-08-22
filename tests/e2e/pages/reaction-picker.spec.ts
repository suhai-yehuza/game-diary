import { test, expect } from '@playwright/test';

import {
  setupE2EMocking,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Reaction Picker Component', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test('should display reaction picker on game logs', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Check that reaction picker is present
    const reactionPicker = page.locator('[data-testid="reaction-picker"]');
    await expect(reactionPicker).toBeVisible();

    // Check that add reaction button is present
    const addButton = page.locator('[aria-label="Add reaction"]');
    await expect(addButton).toBeVisible();
  });

  test('should open reaction picker popover when add button is clicked', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Click add reaction button
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Check that popover opens
    await expect(page.locator('text=Add Reaction')).toBeVisible();
    await expect(page.locator('text=Reactions')).toBeVisible();
    await expect(page.locator('text=Sports')).toBeVisible();
    await expect(page.locator('text=Actions')).toBeVisible();
  });

  test('should display emoji categories correctly', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Check Reactions category (default)
    await expect(page.locator('text=Reactions')).toHaveClass(/text-blue-600/);
    await expect(page.locator('text=👍')).toBeVisible();
    await expect(page.locator('text=❤️')).toBeVisible();

    // Switch to Sports category
    await page.locator('text=Sports').click();
    await expect(page.locator('text=Sports')).toHaveClass(/text-blue-600/);
    await expect(page.locator('text=🏀')).toBeVisible();
    await expect(page.locator('text=⚽')).toBeVisible();

    // Switch to Actions category
    await page.locator('text=Actions').click();
    await expect(page.locator('text=Actions')).toHaveClass(/text-blue-600/);
    await expect(page.locator('text=🔥')).toBeVisible();
    await expect(page.locator('text=💪')).toBeVisible();
  });

  test('should add reaction when emoji is clicked', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Click on thumbs up emoji
    const thumbsUpButton = page.locator('[aria-label="React with 👍"]');
    await thumbsUpButton.click();

    // Wait for popover to close
    await expect(page.locator('text=Add Reaction')).not.toBeVisible();

    // Check that reaction was added (should show in existing reactions)
    await expect(page.locator('text=👍')).toBeVisible();
  });

  test('should close popover when close button is clicked', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Click close button
    const closeButton = page.locator('[aria-label="Close"]');
    await closeButton.click();

    // Check that popover closes
    await expect(page.locator('text=Add Reaction')).not.toBeVisible();
  });

  test('should close popover when Escape key is pressed', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Open reaction picker
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Check that popover closes
    await expect(page.locator('text=Add Reaction')).not.toBeVisible();
  });

  test('should highlight user reactions in the grid', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Add a reaction first
    const addButton = page.locator('[aria-label="Add reaction"]').first();
    await addButton.click();
    const thumbsUpButton = page.locator('[aria-label="React with 👍"]');
    await thumbsUpButton.click();

    // Open reaction picker again
    await addButton.click();

    // Check that user reaction is highlighted
    const highlightedButton = page.locator('[aria-label="React with 👍"]');
    await expect(highlightedButton).toHaveClass(/bg-blue-100/);
  });

  test('should show recently used section when reactions exist', async ({ page }) => {
    await safeGoto(page, '/protected/user');
    await waitForPageLoad(page);

    // Wait for game logs to load
    await page.waitForSelector('[data-testid="game-log-item"]', { timeout: 10000 });

    // Add multiple reactions
    const addButton = page.locator('[aria-label="Add reaction"]').first();

    // Add thumbs up
    await addButton.click();
    await page.locator('[aria-label="React with 👍"]').click();

    // Add heart
    await addButton.click();
    await page.locator('[aria-label="React with ❤️"]').click();

    // Open reaction picker again
    await addButton.click();

    // Check that recently used section appears
    await expect(page.locator('text=Recently Used')).toBeVisible();

    // Check that recently used reactions are shown
    await expect(page.locator('text=👍')).toBeVisible();
    await expect(page.locator('text=❤️')).toBeVisible();
  });
});
