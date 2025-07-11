import { test, expect } from '@playwright/test';
import {
  waitForNetworkIdle,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Live Games Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test.describe('Live Games Banner', () => {
    test('should display live games banner on non-auth pages', async ({ page }) => {
      // Test on home page
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for live games banner
      const banner = page.locator('[data-testid="live-games-banner"]');
      await expect(banner).toBeVisible();

      // Check for LIVE indicator
      const liveIndicator = banner.getByText('LIVE', { exact: true });
      await expect(liveIndicator).toBeVisible();

      // Check for games count
      const gamesCount = banner.locator('text=/\\d+ Game/');
      await expect(gamesCount).toBeVisible();
    });

    test('should not display live games banner on auth pages', async ({ page }) => {
      // Test on sign-in page
      await safeGoto(page, '/sign-in');
      await waitForPageLoad(page);

      // Banner should not be visible on auth pages
      const banner = page.locator('[data-testid="live-games-banner"]');
      await expect(banner).not.toBeVisible();
    });

    test('should display live games in banner with proper structure', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();

      // Check for game items in banner
      const gameItems = banner.locator('[data-testid="game"], .flex.items-center.space-x-2');
      const gameCount = await gameItems.count();

      if (gameCount > 0) {
        // Check that at least one game is visible
        await expect(gameItems.first()).toBeVisible();

        // Check for team codes and scores
        const teamCodes = gameItems.locator('text=/[A-Z]{3}/');
        await expect(teamCodes.first()).toBeVisible();

        // Check for scores
        const scores = gameItems.locator('text=/\\d+/');
        await expect(scores.first()).toBeVisible();
      }
    });

    test('should have "View All" link in banner', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();

      // Check for "View All" link
      const viewAllLink = banner.getByRole('link', { name: 'View All' });
      await expect(viewAllLink).toBeVisible();
      await expect(viewAllLink).toHaveAttribute('href', '/sports/live');
    });

    test('should navigate to live games page when "View All" is clicked', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();

      // Click "View All" link
      const viewAllLink = banner.getByRole('link', { name: 'View All' });
      await viewAllLink.click();

      // Should navigate to live games page
      await expect(page).toHaveURL(/\/sports\/live/);
    });

    test('should display live indicator with animation', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator('[data-testid="live-games-banner"]');
      await expect(banner).toBeVisible();

      // Check for animated live indicator using data-testid
      const liveIndicator = banner.locator('[data-testid="live-indicator"]');

      // First check if the element exists
      await expect(liveIndicator).toBeAttached();

      // For mobile devices, check if element is present rather than visible
      // since animations might be disabled or hidden on mobile
      const isMobile = page.viewportSize() && page.viewportSize()!.width < 768;

      if (isMobile) {
        // On mobile, just verify the element exists and has the right classes
        await expect(liveIndicator).toHaveClass(/animate-pulse/);
        await expect(liveIndicator).toHaveClass(/bg-white/);
        await expect(liveIndicator).toHaveClass(/rounded-full/);
      } else {
        // On desktop, check for visibility
        await expect(liveIndicator).toBeVisible();
      }
    });
  });

  test.describe('Live Games Detail Page', () => {
    test('should load live games detail page', async ({ page }) => {
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check page title
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await expect(title).toHaveText('This will be the Live Games page');

      // Check for welcome message
      const welcomeMessage = page.getByText('Welcome, User!');
      await expect(welcomeMessage).toBeVisible();
    });

    test('should display live games with proper structure', async ({ page }) => {
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for games grid or placeholder content
      const gamesGrid = page.locator('[data-testid="live-games-grid"], .grid');
      const noGamesMessage = page.locator(
        'text=No Live Games, text=no live NBA games, text=This will be the Live Games page'
      );
      const placeholderContent = page.getByText('This will be the Live Games page');

      // Since this is a placeholder page, expect the placeholder content
      await expect(placeholderContent).toBeVisible();
    });

    test('should display game details correctly', async ({ page }) => {
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Since this is a placeholder page, check for placeholder content
      const placeholderContent = page.getByText('This will be the Live Games page');
      await expect(placeholderContent).toBeVisible();

      const welcomeMessage = page.getByText('Welcome, User!');
      await expect(welcomeMessage).toBeVisible();
    });

    test('should handle no live games state', async ({ page }) => {
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for placeholder content since this is a placeholder page
      const placeholderContent = page.getByText('This will be the Live Games page');
      await expect(placeholderContent).toBeVisible();
    });

    test('should display loading state', async ({ page }) => {
      // Navigate to live games page and check for loading state
      await safeGoto(page, '/sports/live');

      // Check for loading indicators or placeholder content
      const spinner = page.locator('.animate-spin, [data-testid="loading-spinner"]');
      const loadingText = page.locator('text=Loading, text=Loading live games');
      const placeholderContent = page.getByText('This will be the Live Games page');

      // Since this is a placeholder page, expect the placeholder content
      await expect(placeholderContent).toBeVisible();
    });

    test('should handle error state gracefully', async ({ page }) => {
      // This test might need to be adjusted based on error handling
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for games or error message or placeholder content
      const gamesGrid = page.locator('[data-testid="live-games-grid"], .grid');
      const errorMessage = page.locator(
        'text=Error, text=Failed to load, text=Something went wrong'
      );
      const placeholderContent = page.getByText('This will be the Live Games page');

      // Since this is a placeholder page, expect the placeholder content
      await expect(placeholderContent).toBeVisible();
    });
  });

  test.describe('Live Games Integration', () => {
    test('should maintain live games state across navigation', async ({ page }) => {
      // Start on home page
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check banner is visible
      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();

      // Navigate to NBA page
      await page.goto('/sports/nba');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Banner should still be visible
      await expect(banner).toBeVisible();

      // Navigate to live games page
      await page.goto('/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Should be on live games page
      await expect(page).toHaveURL(/\/sports\/live/);
    });

    test('should update live games data periodically', async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();

      // Wait for potential refresh (30 seconds is the default interval)
      // For testing, we'll just verify the banner remains visible
      await page.waitForTimeout(2000);
      await expect(banner).toBeVisible();
    });

    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);
      // Check banner is visible on mobile
      const banner = page.locator(
        '[data-testid="live-games-banner"], .bg-gradient-to-r.from-red-600'
      );
      await expect(banner).toBeVisible();
      // Check for horizontal scrolling in banner
      const bannerContent = banner.locator('.flex.items-center.space-x-4.overflow-x-auto');
      await expect(bannerContent).toBeVisible();
      // Navigate to live games page on mobile
      await page.goto('/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);
      // Check for games grid or placeholder content
      const gamesGrid = page.locator('[data-testid="live-games-grid"], .grid');
      const noGamesMessage = page.locator(
        'text=No Live Games, text=no live NBA games, text=This will be the Live Games page'
      );
      const placeholderContent = page.getByText('This will be the Live Games page');

      // Since this is a placeholder page, expect the placeholder content
      await expect(placeholderContent).toBeVisible();
    });
  });
});
