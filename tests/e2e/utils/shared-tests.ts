import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { checkSignInButtonAvailability } from '@tests/e2e/utils/auth-helpers';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { testHomePage, testSportsPage } from '@tests/e2e/utils/page-tests';
import { TIMEOUTS, safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';

// Configuration types for shared tests
export interface IHomePageConfig {
  checkAccessibility?: boolean;
  checkPerformance?: boolean;
}

export interface ISportsPageConfig {
  sport?: string;
  scope?: 'single' | 'all';
}

export interface ISignInModalConfig {
  method: 'escape' | 'click-outside';
  timeout?: number;
}

export interface IProtectedRouteConfig {
  route: string;
  expectModal?: boolean;
  expectRedirect?: boolean;
  timeout?: number;
}

/**
 * Shared Sign-In Modal Testing
 * Consolidates sign-in modal testing across all specs
 */
export async function testSignInModalVariants(
  page: Page,
  config: ISignInModalConfig
): Promise<void> {
  const { method } = config;

  try {
    await testSignInModal(page, method);
  } catch (error) {
    console.warn(`⚠️ Sign-in modal test failed (${method}):`, error);
    throw error;
  }
}

/**
 * Shared Home Page Testing
 * Configurable home page testing with different check levels
 */
export async function testHomePageWithConfig(
  page: Page,
  config: IHomePageConfig = {}
): Promise<void> {
  const { checkAccessibility = false, checkPerformance = false } = config;

  await testHomePage(page, {
    checkAccessibility,
    checkPerformance,
  });
}

/**
 * Shared Sports Page Testing
 * Parameterized sports page testing with different scopes
 */
export async function testSportsPagesWithScope(
  page: Page,
  config: ISportsPageConfig = {}
): Promise<void> {
  const { sport = 'nba', scope = 'single' } = config;

  if (scope === 'single') {
    await testSportsPage(page, sport);
  } else {
    // For 'all' scope, test multiple sports (limited to avoid rate limiting)
    const sports = ['nba', 'nfl', 'mlb']; // Limit to 3 sports
    for (const testSport of sports) {
      await testSportsPage(page, testSport);
    }
  }
}

/**
 * Shared Protected Route Testing
 * Tests access to protected routes with different expectations
 */
export async function testProtectedRouteAccess(
  page: Page,
  config: IProtectedRouteConfig
): Promise<void> {
  const { route, expectModal = true, expectRedirect = false, timeout = TIMEOUTS.MEDIUM } = config;

  await safeGoto(page, route);
  await waitForPageLoad(page);

  if (expectModal) {
    const modal = page.locator('[data-testid="sign-in-modal"], .cl-modal, [role="dialog"]');
    const modalVisible = await modal.isVisible({ timeout }).catch(() => false);

    if (modalVisible) {
      await modal.waitFor({ timeout });
      // Close modal with escape
      await page.keyboard.press('Escape');
    }
  }

  if (expectRedirect) {
    await expect(page).toHaveURL(/\/sign-in|\/$/);
  }
}

/**
 * Shared Browser Navigation Testing
 * Tests browser back/forward functionality
 */
export async function testBrowserNavigation(
  page: Page,
  routes: string[] = ['/', '/sports/nba', '/sports/nfl']
): Promise<void> {
  // Navigate through routes
  for (const route of routes) {
    await safeGoto(page, route);
    await waitForPageLoad(page);
  }

  // Test back navigation
  for (let i = routes.length - 1; i > 0; i--) {
    await page.goBack();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(new RegExp(routes[i - 1].replace('/', '\\/')));
  }

  // Test forward navigation
  for (let i = 1; i < routes.length; i++) {
    await page.goForward();
    await waitForPageLoad(page);
    await expect(page).toHaveURL(new RegExp(routes[i].replace('/', '\\/')));
  }
}

/**
 * Shared Error State Testing
 * Tests 404 and error handling
 */
export async function testErrorStates(page: Page): Promise<void> {
  await safeGoto(page, '/non-existent-page');
  await waitForPageLoad(page);

  const notFoundContent = page.locator(
    '[data-testid="not-found"], .not-found, h1:has-text("404"), h1:has-text("Not Found")'
  );
  const homeContent = page.locator('main');

  if ((await notFoundContent.count()) > 0) {
    await notFoundContent.first().waitFor({ timeout: TIMEOUTS.MEDIUM });
  } else {
    await homeContent.waitFor({ timeout: TIMEOUTS.MEDIUM });
  }
}

/**
 * Shared Authentication Flow Testing
 * Tests complete authentication flow
 */
export async function testAuthenticationFlow(page: Page): Promise<void> {
  await safeGoto(page, '/');
  await waitForPageLoad(page);

  // Use the utility function to check sign-in button availability
  if (!(await checkSignInButtonAvailability(page, 'authentication flow test'))) {
    return;
  }

  // Test sign-in modal
  await testSignInModalVariants(page, { method: 'escape' });
}

/**
 * Shared Mobile Navigation Testing
 * Tests mobile-specific navigation patterns
 */
export async function testMobileNavigation(page: Page): Promise<void> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);

  if (!isMobile) {
    console.log('Skipping mobile navigation test - not on mobile viewport');
    return;
  }

  // Test mobile menu functionality
  const menuButton = page.locator('[data-testid="menu-button"], .hamburger, [aria-label*="menu"]');

  if (await menuButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();
    await page.waitForTimeout(500);

    // Check if menu is now visible
    const mobileMenu = page.locator(
      '[data-testid="mobile-menu"], .mobile-menu, [role="navigation"]'
    );
    if (await mobileMenu.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
      console.log('Mobile menu opened successfully');
    }
  }
}

/**
 * Shared Performance Testing
 * Tests basic performance metrics
 */
export async function testBasicPerformance(page: Page): Promise<void> {
  await testHomePageWithConfig(page, {
    checkAccessibility: false,
    checkPerformance: true,
  });
}

/**
 * Shared Accessibility Testing
 * Tests basic accessibility features
 */
export async function testBasicAccessibility(page: Page): Promise<void> {
  await testHomePageWithConfig(page, {
    checkAccessibility: true,
    checkPerformance: false,
  });
}
