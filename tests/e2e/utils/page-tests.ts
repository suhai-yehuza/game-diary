import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import {
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
} from '@tests/e2e/utils/page-checks';
import { checkPerformanceMetrics, checkForConsoleErrors } from '@tests/e2e/utils/performance';
import { TIMEOUTS, safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';

/**
 * Page test utilities for E2E tests
 * Provides functions to test different page types and scenarios
 */

/**
 * Test home page functionality
 */
export async function testHomePage(
  page: Page,
  options: {
    checkAccessibility?: boolean;
    checkPerformance?: boolean;
  } = {}
): Promise<void> {
  const { checkAccessibility = true, checkPerformance = true } = options;

  // Navigate to home page
  await safeGoto(page, '/');
  await waitForPageLoad(page);

  // Basic page checks
  await checkBasicPageStructure(page);
  await checkPageTitle(page);

  // Optional checks
  if (checkAccessibility) {
    await checkAccessibilityBasics(page);
  }

  if (checkPerformance) {
    await checkPerformanceMetrics(page);
  }

  // Always check for console errors
  await checkForConsoleErrors(page);
}

/**
 * Test dashboard page functionality
 */
export async function testDashboardPage(page: Page): Promise<void> {
  // Navigate to dashboard
  await safeGoto(page, '/protected/user');
  await waitForPageLoad(page);

  // Basic page checks
  await checkBasicPageStructure(page);
  await checkPageTitle(page, /Dashboard|User/i);

  // Check for dashboard-specific elements
  const dashboardContent = page.locator('[data-testid="dashboard"], .dashboard, main');
  await expect(dashboardContent).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
}

/**
 * Test multiple pages with consistent validation
 */
export async function testMultiplePages(
  page: Page,
  paths: string[],
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = TIMEOUTS.MEDIUM } = options;

  for (const path of paths) {
    console.log(`🔍 Testing page: ${path}`);

    try {
      await safeGoto(page, path);
      await waitForPageLoad(page);

      // Basic validation
      await checkBasicPageStructure(page);
      await checkPageTitle(page);

      // Check for main content
      const mainContent = page.locator('main, [role="main"], .main-content');
      await expect(mainContent).toBeVisible({ timeout });

      console.log(`✅ Page ${path} passed validation`);
    } catch (error) {
      console.error(`❌ Page ${path} failed validation:`, error);
      throw error;
    }
  }
}

/**
 * Test search functionality
 */
export async function testSearchFunctionality(page: Page): Promise<void> {
  // Navigate to search page
  await safeGoto(page, '/search');
  await waitForPageLoad(page);

  // Check search form
  const searchForm = page.locator('form[role="search"], [data-testid="search-form"]');
  await expect(searchForm).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

  // Check search input
  const searchInput = page.locator(
    'input[type="search"], input[name="search"], [data-testid="search-input"]'
  );
  await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

  // Test basic search
  await searchInput.fill('test');
  await searchInput.press('Enter');

  // Wait for search results or no results message
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });
}

/**
 * Test sports page functionality
 */
export async function testSportsPage(page: Page, sport: string): Promise<void> {
  const path = `/sports/${sport}`;

  // Navigate to sports page
  await safeGoto(page, path);
  await waitForPageLoad(page);

  // Basic page checks
  await checkBasicPageStructure(page);
  await checkPageTitle(page, new RegExp(sport, 'i'));

  // Check for sports-specific content
  const sportsContent = page.locator('[data-testid="sports-content"], .sports-content, main');
  await expect(sportsContent).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

  // Check for live games or standings
  const liveGames = page.locator('[data-testid="live-games"], .live-games');
  const standings = page.locator('[data-testid="standings"], .standings');

  if ((await liveGames.count()) > 0) {
    await expect(liveGames.first()).toBeVisible();
  }

  if ((await standings.count()) > 0) {
    await expect(standings.first()).toBeVisible();
  }
}
