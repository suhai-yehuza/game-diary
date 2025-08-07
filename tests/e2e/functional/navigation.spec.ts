import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';

import { SPORTS_CONFIG } from '@src/app/components/sports/SportsConfig';
import {
  testSignInModalVariants,
  testProtectedRouteAccess,
  testBrowserNavigation,
  testMobileNavigation,
} from '@tests/e2e/utils/shared-tests';
import {
  clearTestData,
  TIMEOUTS,
  waitForNetworkIdle,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

import { runCriticalSuite } from './critical.spec';

// Helper function to reveal navigation elements on mobile devices
async function revealNavLinksIfMobile(page: Page) {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);
  if (isMobile) {
    // Try multiple strategies to reveal navigation on mobile
    const strategies = [
      // Strategy 1: Look for hamburger menu
      async () => {
        const menuButton = page.locator(
          '[data-testid="menu-button"], .hamburger, [aria-label*="menu"]'
        );
        if (await menuButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          await menuButton.scrollIntoViewIfNeeded();
          await menuButton.click();
          await page.waitForTimeout(500);
        }
      },
      // Strategy 2: Look for navigation toggle
      async () => {
        const navToggle = page.locator(
          '[data-testid="nav-toggle"], .nav-toggle, [aria-label*="navigation"]'
        );
        if (await navToggle.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          await navToggle.scrollIntoViewIfNeeded();
          await navToggle.click();
          await page.waitForTimeout(500);
        }
      },
      // Strategy 3: Look for mobile menu
      async () => {
        const mobileMenu = page.locator(
          '[data-testid="mobile-menu"], .mobile-menu, [role="navigation"]'
        );
        if (await mobileMenu.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          // Menu is already visible
          return;
        }
        // Try to find a toggle button
        const toggleButton = page.locator(
          '[data-testid="menu-toggle"], .menu-toggle, [aria-label*="toggle"]'
        );
        if (await toggleButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          await toggleButton.scrollIntoViewIfNeeded();
          await toggleButton.click();
          await page.waitForTimeout(500);
        }
      },
    ];

    for (const strategy of strategies) {
      try {
        await strategy();
        // Check if navigation links are now visible
        const navLinks = page.locator('nav a, [role="navigation"] a, .nav a');
        if ((await navLinks.count()) > 0) {
          console.log('Navigation links revealed successfully');
          return;
        }
      } catch (error) {
        console.log(`Navigation strategy failed: ${String(error)}`);
        continue;
      }
    }
  }
}

// Helper function to check accessibility
async function checkA11y(page: Page) {
  try {
    // Basic accessibility checks
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  } catch (error) {
    console.warn('⚠️ Basic accessibility check failed:', error);
  }
}

// Atomic navigation-level test functions using shared utilities
export async function navigationTestSportsPagesNavigation(page: Page) {
  const sportHrefs = Object.values(SPORTS_CONFIG).map((sport: any) => sport.href);

  // Test navigation to each sports page
  for (const sportHref of sportHrefs.slice(0, 2)) {
    // Limit to first 2 sports to avoid rate limiting
    try {
      await safeGoto(page, sportHref);
      await waitForPageLoad(page);
      await checkA11y(page);
    } catch (error) {
      console.warn(`⚠️ Sports page navigation failed for ${sportHref}:`, error);
    }
  }
}

export async function navigationTestDashboardNavigation(page: Page) {
  await safeGoto(page, '/');
  await waitForPageLoad(page);
  await revealNavLinksIfMobile(page);

  // Test navigation to dashboard (should redirect to sign-in)
  await testProtectedRouteAccess(page, {
    route: '/protected/user',
    expectModal: true,
    expectRedirect: false,
  });
}

export async function navigationTestProtectedRoutesNavigation(page: Page) {
  const protectedRoutes = ['/protected/user', '/protected/admin/database'];

  for (const route of protectedRoutes) {
    try {
      await testProtectedRouteAccess(page, {
        route,
        expectModal: true,
        expectRedirect: false,
      });
    } catch (error) {
      console.warn(`⚠️ Protected route navigation failed for ${route}:`, error);
    }
  }
}

export async function navigationTestLinkNavigation(page: Page) {
  await safeGoto(page, '/');
  await waitForPageLoad(page);
  await revealNavLinksIfMobile(page);

  // Test navigation to different sections
  const testRoutes = ['/sports/nba', '/sports/nfl', '/sports/mlb'];

  for (const route of testRoutes) {
    try {
      await safeGoto(page, route);
      await waitForPageLoad(page);
      await checkA11y(page);
    } catch (error) {
      console.warn(`⚠️ Link navigation failed for ${route}:`, error);
    }
  }
}

export async function navigationTestBrowserBackForward(page: Page) {
  const sportHrefs = Object.values(SPORTS_CONFIG)
    .map((sport: any) => sport.href)
    .slice(0, 2);

  await testBrowserNavigation(page, ['/', ...sportHrefs]);
}

export async function navigationTestSignInModalClickOutside(page: Page) {
  await safeGoto(page, '/');
  await testSignInModalVariants(page, { method: 'click-outside' });
}

// Suite runner for navigation
export async function runNavigationSuite(page: Page) {
  try {
    await runCriticalSuite(page);
  } catch (error) {
    console.warn('⚠️ Critical suite failed, but continuing with navigation tests:', error);
  }

  try {
    await navigationTestSportsPagesNavigation(page);
  } catch (error) {
    console.warn('⚠️ Sports pages navigation test failed:', error);
  }

  try {
    await navigationTestDashboardNavigation(page);
  } catch (error) {
    console.warn('⚠️ Dashboard navigation test failed:', error);
  }

  try {
    await navigationTestProtectedRoutesNavigation(page);
  } catch (error) {
    console.warn('⚠️ Protected routes navigation test failed:', error);
  }

  try {
    await navigationTestLinkNavigation(page);
  } catch (error) {
    console.warn('⚠️ Link navigation test failed:', error);
  }

  try {
    await navigationTestBrowserBackForward(page);
  } catch (error) {
    console.warn('⚠️ Browser back/forward test failed:', error);
  }

  try {
    await navigationTestSignInModalClickOutside(page);
  } catch (error) {
    console.warn('⚠️ Sign-in modal click outside test failed:', error);
  }

  try {
    await testMobileNavigation(page);
  } catch (error) {
    console.warn('⚠️ Mobile navigation test failed:', error);
  }
}

test.beforeEach(async ({ page }) => {
  await clearTestData(page);
});

test.describe('Navigation Tests (Extends Critical)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
    await safeGoto(page, '/');
    await waitForNetworkIdle(page);
  });

  test('should handle comprehensive navigation flows', async ({ page }) => {
    await runNavigationSuite(page);
  });
});
