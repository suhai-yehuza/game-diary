import { test, expect } from '@playwright/test';

import {
  testBannerAnimations,
  testLiveGamesStates,
  TEST_GAMES_DATA,
} from '@tests/e2e/utils/live-games-tests';
import {
  isMockModeEnabled,
  getMockDataByType,
  setupMockDataForTest,
} from '@tests/e2e/utils/mock-config';
import { enhancedTestSetup } from '@tests/e2e/utils/setup';
import {
  waitForNetworkIdle,
  clearTestData,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

test.describe('Live Games Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock mode for live games tests
    setupMockDataForTest('live-games-test');
    await clearTestData(page);
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test.describe('Live Games Banner', () => {
    test('should display live games banner on non-auth pages', async ({ page }) => {
      // Setup with mock data support
      await enhancedTestSetup(page, {
        testName: 'live-games-banner-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      // Test on home page
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for live games banner (handle React Strict Mode duplicate rendering)
      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      // Check for Live indicator (should be "8 Live Games" from mock data)
      const liveIndicator = banner.locator('[data-testid="live-indicator"]');
      await expect(liveIndicator).toBeVisible();

      // Check for games count in the container
      const gamesCount = banner.locator(`text=${TEST_GAMES_DATA.totalGames} Live Games`);
      await expect(gamesCount).toBeVisible();
    });

    test('should display live games in banner with proper structure', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-structure-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      // Check for game items in banner
      const gameItems = banner.locator('[data-testid="game"]');
      const gameCount = await gameItems.count();

      if (gameCount > 0) {
        // Check that at least one game is visible
        await expect(gameItems.first()).toBeVisible();

        // Check for team codes and scores in the new structure
        const firstGame = gameItems.first();

        // Check for team codes (now in spans within flex containers)
        const teamCodes = firstGame.locator('span.text-xs.font-medium');
        await expect(teamCodes.first()).toBeVisible();

        // Check for scores (now in spans with font-bold)
        const scores = firstGame.locator('span.text-xs.font-bold');
        await expect(scores.first()).toBeVisible();

        // Check for @ separator (now in a specific span)
        const separator = firstGame.locator('span.text-xs.text-gray-200:text-is("@")');
        await expect(separator).toBeVisible();

        // Check for quarter information (now in a specific span)
        const quarterInfo = firstGame
          .locator('span.text-xs.text-gray-200')
          .filter({ hasText: /Q[1-4]|HT/ });
        await expect(quarterInfo).toBeVisible();
      }
    });

    test('should have "View All" link in banner', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-link-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      const viewAllLink = banner.getByRole('link', { name: 'View All' });
      await expect(viewAllLink).toBeVisible();
      await expect(viewAllLink).toHaveAttribute('href', '/sports/live');
    });
  });

  test.describe('Enhanced Live Games Tests with Mock Data', () => {
    test.beforeEach(async ({ page }) => {
      await enhancedTestSetup(page, {
        testName: 'enhanced-live-games-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });
    });

    test('should use mock data for live games functionality', async ({ page }) => {
      // Verify mock data is available
      if (isMockModeEnabled()) {
        const liveGamesMock = getMockDataByType('liveGames');
        console.log('✅ Using mock live games data:', liveGamesMock?.results || 'No data');
      }

      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Test live games banner with mock data
      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      // Test with mock data expectations
      if (isMockModeEnabled()) {
        const liveGamesMock = getMockDataByType('liveGames');
        if (liveGamesMock?.results) {
          const expectedGameCount = liveGamesMock.results;
          const gamesCount = banner.locator(`text=${expectedGameCount} Live Games`);
          await expect(gamesCount).toBeVisible();
        }
      }
    });

    test('should navigate to live games detail page with mock data', async ({ page }) => {
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check page title
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Live NBA Games');

      // Check for games count with mock data
      if (isMockModeEnabled()) {
        const liveGamesMock = getMockDataByType('liveGames');
        if (liveGamesMock?.results) {
          const gamesCount = page.locator(`text=${liveGamesMock.results} Games currently live`);
          await expect(gamesCount).toBeVisible();
        }
      }
    });
  });

  test.describe('Live Games Detail Page', () => {
    test('should display live games detail page correctly', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-detail-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check page title
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Live NBA Games');

      // Check for games count
      const gamesCount = page.locator(`text=${TEST_GAMES_DATA.totalGames} Games currently live`);
      await expect(gamesCount).toBeVisible();

      // Check for games grid
      const gamesGrid = page.locator('[data-testid="live-games-grid"]');
      await expect(gamesGrid).toBeVisible();

      // Check for individual game cards
      const gameCards = page.locator('[data-testid="game-card"]');
      const gameCount = await gameCards.count();

      if (gameCount > 0) {
        // Check that at least one game card is visible
        await expect(gameCards.first()).toBeVisible();

        // Check for live status indicator
        const liveStatus = gameCards.first().locator('text=LIVE');
        await expect(liveStatus).toBeVisible();

        // Check for team information
        const teamInfo = gameCards.first().locator('.font-semibold');
        await expect(teamInfo.first()).toBeVisible();
      }
    });
  });

  test.describe('Live Games States', () => {
    test('should handle different live games states', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-states-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      await testLiveGamesStates(page);
    });
  });

  test.describe('Live Games Mobile', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-mobile-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check for live games banner on mobile
      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      // Check for responsive design
      const bannerStyle = await banner.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          width: style.width,
        };
      });

      // Banner should be visible and properly sized on mobile
      expect(bannerStyle.display).not.toBe('none');
    });
  });

  test.describe('Live Games Animations', () => {
    test('should have proper animations for live indicator', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-animations-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      await testBannerAnimations(page);
    });
  });

  test.describe('Live Games Navigation', () => {
    test('should navigate between live games pages', async ({ page }) => {
      // Setup with mock data
      await enhancedTestSetup(page, {
        testName: 'live-games-navigation-test',
        enableMockData: true,
        mockScenario: 'live-games-scenario',
      });

      // Test navigation from home to live games
      await safeGoto(page, '/');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Verify the banner is visible and has the correct link
      const banner = page.locator('[data-testid="live-games-banner"]').first();
      await expect(banner).toBeVisible();

      const viewAllLink = banner.getByRole('link', { name: 'View All' });
      await expect(viewAllLink).toBeVisible();
      await expect(viewAllLink).toHaveAttribute('href', '/sports/live');

      // Navigate directly to live games page to test the functionality
      await safeGoto(page, '/sports/live');
      await waitForPageLoad(page);
      await waitForNetworkIdle(page);

      // Check that we're on the live games page
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Live NBA Games');
    });
  });
});
