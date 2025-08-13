import { expect, type Page } from '@playwright/test';

import { createMockLiveGames } from '@src/lib/mock/liveGamesMock';

import { waitForNetworkIdle, waitForPageLoad } from './test-utils';

// Import mock data for testing

// Test data constants based on createMockLiveGames
const MOCK_GAMES_DATA = createMockLiveGames();
const MOCK_GAMES = MOCK_GAMES_DATA.response;

// Specific game data for testing
const KNICKS_CELTICS_GAME = MOCK_GAMES[0]; // BOS @ NYK
const WARRIORS_LAKERS_GAME = MOCK_GAMES[1]; // LAL @ GSW
const HEAT_SIXERS_GAME = MOCK_GAMES[2]; // PHI @ MIA

/**
 * Utility functions for testing live games functionality across different pages
 */

export interface ILiveGamesTestOptions {
  skipBanner?: boolean;
  skipDetail?: boolean;
  skipNavigation?: boolean;
}

/**
 * Test live games banner functionality
 */
export async function testLiveGamesBanner(page: Page, options: ILiveGamesTestOptions = {}) {
  if (options.skipBanner) return;

  // Check for live games banner (handle React Strict Mode duplicate rendering)
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).toBeVisible();

  // Check for live indicator with red pulsing dot
  const liveIndicator = banner.locator('[data-testid="live-indicator"]');
  await expect(liveIndicator).toBeAttached();
  await expect(liveIndicator).toHaveClass(/animate-live-dot-glow/);

  // Check for games count (should be 8 from mock data)
  const gamesCount = banner.locator(`text=${MOCK_GAMES.length} Live Games`);
  await expect(gamesCount).toBeVisible();

  // Check for "View All" link
  const viewAllLink = banner.getByRole('link', { name: 'View All' });
  await expect(viewAllLink).toBeVisible();
  await expect(viewAllLink).toHaveAttribute('href', '/sports/live');
}

/**
 * Test live games banner on auth pages (should not be visible)
 */
export async function testLiveGamesBannerNotVisible(page: Page) {
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).not.toBeVisible();
}

/**
 * Test live games detail page functionality
 */
export async function testLiveGamesDetailPage(page: Page, options: ILiveGamesTestOptions = {}) {
  if (options.skipDetail) return;

  // Navigate to live games page
  await page.goto('/sports/live');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  // Check page title
  const title = page.getByRole('heading', { level: 1 });
  await expect(title).toBeVisible();
  await expect(title).toHaveText('Live NBA Games');

  // Check for games count
  const gamesCount = page.locator(`text=${MOCK_GAMES.length} games`);
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

    // Check for scores
    const scores = gameCards.first().locator('.text-2xl.font-bold');
    await expect(scores.first()).toBeVisible();
  }
}

/**
 * Test navigation from banner to live games page
 */
export async function testLiveGamesNavigation(page: Page, options: ILiveGamesTestOptions = {}) {
  if (options.skipNavigation) return;

  // Check banner is visible (handle React Strict Mode duplicate rendering)
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).toBeVisible();

  // Click "View All" link
  const viewAllLink = banner.getByRole('link', { name: 'View All' });
  await viewAllLink.scrollIntoViewIfNeeded();
  await viewAllLink.click();

  // Should navigate to live games page
  await expect(page).toHaveURL(/\/sports\/live/);
}

/**
 * Test live games banner structure and content with specific mock data
 */
export async function testLiveGamesBannerStructure(page: Page) {
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).toBeVisible();

  // Check for game items in banner
  const gameItems = banner.locator('[data-testid="game"]');
  const gameCount = await gameItems.count();

  if (gameCount > 0) {
    // Check that at least one game is visible
    await expect(gameItems.first()).toBeVisible();

    // Check for team codes from mock data
    const teamCodes = gameItems.locator('text=/[A-Z]{3}/');
    await expect(teamCodes.first()).toBeVisible();

    // Check for scores
    const scores = gameItems.locator('text=/\\d+/');
    await expect(scores.first()).toBeVisible();

    // Check for @ separator
    const separator = gameItems.locator('text=@');
    await expect(separator.first()).toBeVisible();

    // Check for quarter information
    const quarterInfo = gameItems.locator('text=/Q[1-4]|HT/');
    await expect(quarterInfo.first()).toBeVisible();
  }
}

/**
 * Test specific game data in banner
 */
export async function testSpecificGameData(page: Page) {
  const banner = page.locator('[data-testid="live-games-banner"]');
  await expect(banner).toBeVisible();

  // Test for specific teams from mock data (banner shows scores inline)
  const knicksCeltics = banner.locator(`text=${KNICKS_CELTICS_GAME.teams.visitors.code}`);
  const warriorsLakers = banner.locator(`text=${WARRIORS_LAKERS_GAME.teams.visitors.code}`);

  // At least one of these games should be visible
  const hasKnicksCeltics = (await knicksCeltics.count()) > 0;
  const hasWarriorsLakers = (await warriorsLakers.count()) > 0;

  expect(hasKnicksCeltics || hasWarriorsLakers).toBe(true);

  // Check for scores from mock data
  const scores = banner.locator('text=/\\d+/');
  await expect(scores.first()).toBeVisible();
}

/**
 * Test live games detail page structure
 */
export async function testLiveGamesDetailStructure(page: Page) {
  await page.goto('/sports/live');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  const gameCards = page.locator('[data-testid="game-card"]');
  const gameCount = await gameCards.count();

  if (gameCount > 0) {
    const firstGame = gameCards.first();

    // Check for team logos
    const teamLogos = firstGame.locator('img[alt*="logo"], img[alt*="team"]');
    const logoCount = await teamLogos.count();
    if (logoCount > 0) {
      await expect(teamLogos.first()).toBeVisible();
    }

    // Check for arena information
    const arenaInfo = firstGame.locator('text=/Arena:/');
    await expect(arenaInfo).toBeVisible();

    // Check for period information
    const periodInfo = firstGame.locator('text=/Period:/');
    await expect(periodInfo).toBeVisible();
  }
}

/**
 * Test live games loading and error states
 */
export async function testLiveGamesStates(page: Page) {
  await page.goto('/sports/live');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  // Check for either games or no games message
  const gamesGrid = page.locator('[data-testid="live-games-grid"]');
  const noGamesTitle = page.locator('text=No Live Games');
  const noGamesDescription = page.locator('text=There are currently no live NBA games');

  // Wait a bit more for content to load, especially in WebKit
  await page.waitForTimeout(1000);

  const hasGames = (await gamesGrid.count()) > 0;
  const hasNoGamesTitle = (await noGamesTitle.count()) > 0;
  const hasNoGamesDescription = (await noGamesDescription.count()) > 0;

  // Should have either games or no games message (title and description are separate elements)
  expect(hasGames || (hasNoGamesTitle && hasNoGamesDescription)).toBe(true);
}

/**
 * Test live games mobile responsiveness
 */
export async function testLiveGamesMobile(page: Page) {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  // Check banner is visible on mobile
  const banner = page.locator('[data-testid="live-games-banner"]');
  await expect(banner).toBeVisible();

  // Check for horizontal scrolling in banner
  const bannerContent = banner.locator('.flex.items-center.space-x-4.animate-scroll-left');
  await expect(bannerContent).toBeVisible();

  // Navigate to live games page on mobile
  await page.goto('/sports/live');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  // Check games grid adapts to mobile
  const gamesGrid = page.locator('[data-testid="live-games-grid"]');
  await expect(gamesGrid).toBeVisible();
}

/**
 * Test banner animations and scrolling
 */
export async function testBannerAnimations(page: Page) {
  await page.goto('/');
  await waitForPageLoad(page);
  await waitForNetworkIdle(page);

  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).toBeVisible();

  // Check for scrolling animation
  const scrollingContent = banner.locator('.animate-scroll-left');
  await expect(scrollingContent).toBeVisible();

  // Check for live dot animation
  const liveDot = banner.locator('[data-testid="live-indicator"]');
  await expect(liveDot).toBeAttached();
  await expect(liveDot).toHaveClass(/animate-live-dot-glow/);

  // Check for game separators (they might be hidden due to CSS but should exist)
  const separators = banner.locator('.w-px.h-6.bg-gray-600');
  const separatorCount = await separators.count();
  if (separatorCount > 0) {
    await expect(separators.first()).toBeAttached();
  }
}

/**
 * Comprehensive live games test suite that can be run on any page
 */
export async function runLiveGamesTestSuite(page: Page, options: ILiveGamesTestOptions = {}) {
  // Test banner functionality
  await testLiveGamesBanner(page, options);
  await testLiveGamesBannerStructure(page);
  await testSpecificGameData(page);
  await testBannerAnimations(page);

  // Test navigation if not skipped
  if (!options.skipNavigation) {
    await testLiveGamesNavigation(page, options);
  }

  // Test detail page if not skipped
  if (!options.skipDetail) {
    await testLiveGamesDetailPage(page, options);
    await testLiveGamesDetailStructure(page);
    await testLiveGamesStates(page);
  }
}

/**
 * Quick live games banner check for pages that should have it
 */
export async function checkLiveGamesBannerPresent(page: Page) {
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).toBeVisible();
}

/**
 * Quick live games banner check for pages that should NOT have it
 */
export async function checkLiveGamesBannerAbsent(page: Page) {
  const banner = page.locator('[data-testid="live-games-banner"]').first();
  await expect(banner).not.toBeVisible();
}

/**
 * Test data exports for use in other test files
 */
export const TEST_GAMES_DATA = {
  totalGames: MOCK_GAMES.length,
  games: MOCK_GAMES,
  knicksCeltics: KNICKS_CELTICS_GAME,
  warriorsLakers: WARRIORS_LAKERS_GAME,
  heatSixers: HEAT_SIXERS_GAME,
};
