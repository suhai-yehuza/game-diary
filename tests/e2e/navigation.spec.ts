import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);
  });

  test('should navigate to sports pages', async ({ page }) => {
    const sportsPages = [
      '/sports/nba',
      '/sports/nfl',
      '/sports/mlb',
      '/sports/nhl',
      '/sports/mls',
      '/sports/all-sports',
      '/sports/live',
    ];

    for (const sportsPage of sportsPages) {
      // Navigate to sports page
      await safeGoto(page, sportsPage);
      await waitForPageLoad(page);

      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that we're on the correct page
      await expect(page).toHaveURL(sportsPage);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Navigate to dashboard
    await safeGoto(page, '/dashboard');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that we're on dashboard page
    await expect(page).toHaveURL('/dashboard');

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    // Navigate to sign in page
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that we're on sign in page
    await expect(page).toHaveURL(/\/sign-in/);

    // Check for sign in form elements
    const signInForm = page.locator('form, [data-testid="sign-in-form"]');
    if ((await signInForm.count()) > 0) {
      await expect(signInForm.first()).toBeVisible();
    }
  });

  test('should navigate to sign up page', async ({ page }) => {
    // Navigate to sign up page
    await safeGoto(page, '/sign-up');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that we're on sign up page
    await expect(page).toHaveURL(/\/sign-up/);

    // Check for sign up form elements
    const signUpForm = page.locator('form, [data-testid="sign-up-form"]');
    if ((await signUpForm.count()) > 0) {
      await expect(signUpForm.first()).toBeVisible();
    }
  });

  test('should navigate to protected routes', async ({ page }) => {
    const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin'];

    for (const route of protectedRoutes) {
      // Navigate to protected route
      await safeGoto(page, route);
      await waitForPageLoad(page);

      // Check that we're on the correct page
      await expect(page).toHaveURL(route);

      // Check that page content is visible (or redirect happened)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation via links', async ({ page }) => {
    // Test navigation via sports links
    const sportsLinks = page.locator('a[href*="/sports"]');
    const sportsCount = await sportsLinks.count();

    if (sportsCount > 0) {
      // Click on first sports link
      await sportsLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Check that we navigated to a sports page
      await expect(page).toHaveURL(/\/sports/);

      // Check that page content is visible
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to a sports page first
    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);

    // Navigate to another page
    await safeGoto(page, '/sports/nfl');
    await waitForPageLoad(page);

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Check that we're back on NBA page
    await expect(page).toHaveURL(/\/sports\/nba/);

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Check that we're on NFL page
    await expect(page).toHaveURL(/\/sports\/nfl/);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    const testUrls = [
      '/',
      '/sports/nba',
      '/sports/nfl',
      '/sports/mlb',
      '/sports/nhl',
      '/sports/mls',
      '/sports/all-sports',
      '/sports/live',
      '/dashboard',
      '/sign-in',
      '/sign-up',
    ];

    for (const url of testUrls) {
      // Navigate directly to URL
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check that we're on the correct page
      await expect(page).toHaveURL(url);

      // Check that page content is visible
      await expect(page.locator('body')).toBeVisible();

      // Check that main content is visible
      const main = page.locator('main');
      if ((await main.count()) > 0) {
        await expect(main).toBeVisible();
      }
    }
  });

  test('should handle navigation with query parameters', async ({ page }) => {
    // Test navigation with query parameters
    const testUrls = [
      '/sports/nba?season=2024',
      '/sports/nfl?week=1',
      '/dashboard?tab=profile',
      '/sign-in?redirect=/dashboard',
    ];

    for (const url of testUrls) {
      // Navigate to URL with query parameters
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check that we're on the correct page with query parameters
      await expect(page).toHaveURL(new RegExp(url.split('?')[0]));

      // Check that page content is visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation to non-existent pages', async ({ page }) => {
    const nonExistentUrls = [
      '/non-existent-page',
      '/sports/invalid-sport',
      '/invalid-route',
      '/dashboard/non-existent',
    ];

    for (const url of nonExistentUrls) {
      // Navigate to non-existent page
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check that we're on the correct page (should be 404 or redirect)
      await expect(page).toHaveURL(url);

      // Check that some content is visible (error page or redirect)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation performance', async ({ page }) => {
    const testUrls = ['/sports/nba', '/sports/nfl', '/sports/mlb', '/dashboard'];

    for (const url of testUrls) {
      // Navigate to page
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be reasonable for navigation
      expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    }
  });

  test('should handle navigation accessibility', async ({ page }) => {
    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const url of testUrls) {
      // Navigate to page
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check accessibility basics
      await checkAccessibilityBasics(page);

      // Check keyboard navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      // Check that focus is visible
      const focusedElement = page.locator(':focus');
      if ((await focusedElement.count()) > 0) {
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test('should handle navigation without console errors', async ({ page }) => {
    const testUrls = ['/sports/nba', '/sports/nfl', '/sports/mlb', '/dashboard'];

    for (const url of testUrls) {
      // Navigate to page
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check for console errors
      await checkForConsoleErrors(page);
    }
  });

  test('should handle navigation with different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      for (const url of testUrls) {
        // Navigate to page
        await safeGoto(page, url);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(new RegExp(url.split('/')[1]));

        // Check that page content is visible
        await expect(page.locator('body')).toBeVisible();

        // Check that main content is visible
        const main = page.locator('main');
        if ((await main.count()) > 0) {
          await expect(main).toBeVisible();
        }
      }
    }
  });

  test('should handle navigation with slow network', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.continue();
    });

    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const url of testUrls) {
      // Navigate to page with slow network
      await safeGoto(page, url);
      await waitForPageLoad(page);

      // Check that we're on the correct page
      await expect(page).toHaveURL(new RegExp(url.split('/')[1]));

      // Check that page content is visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation with offline mode', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Try to navigate to a page
    await safeGoto(page, '/sports/nba');

    // Check that some content is visible (offline page or cached content)
    await expect(page.locator('body')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle navigation with different user agents', async ({ page }) => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    ];

    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const userAgent of userAgents) {
      await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });

      for (const url of testUrls) {
        // Navigate to page
        await safeGoto(page, url);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(new RegExp(url.split('/')[1]));

        // Check that page content is visible
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should handle navigation with different languages', async ({ page }) => {
    const languages = ['en-US', 'es-ES', 'fr-FR'];

    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const language of languages) {
      await page.setExtraHTTPHeaders({ 'Accept-Language': language });

      for (const url of testUrls) {
        // Navigate to page
        await safeGoto(page, url);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(new RegExp(url.split('/')[1]));

        // Check that page content is visible
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should handle navigation with different screen sizes', async ({ page }) => {
    const screenSizes = [
      { width: 320, height: 568 }, // Small mobile
      { width: 375, height: 667 }, // iPhone
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // Small desktop
      { width: 1920, height: 1080 }, // Large desktop
    ];

    const testUrls = ['/sports/nba', '/sports/nfl', '/dashboard'];

    for (const screenSize of screenSizes) {
      await page.setViewportSize(screenSize);

      for (const url of testUrls) {
        // Navigate to page
        await safeGoto(page, url);
        await waitForPageLoad(page);

        // Check that we're on the correct page
        await expect(page).toHaveURL(new RegExp(url.split('/')[1]));

        // Check that page content is visible
        await expect(page.locator('body')).toBeVisible();

        // Check that main content is visible
        const main = page.locator('main');
        if ((await main.count()) > 0) {
          await expect(main).toBeVisible();
        }
      }
    }
  });
});

test.describe('Cross-Browser Navigation', () => {
  test('should work consistently across different browsers', async ({ page, browserName }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Test navigation based on browser
    if (browserName === 'chromium' || browserName === 'firefox') {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      const focusedElement = page.locator(':focus');
      if ((await focusedElement.count()) > 0) {
        await expect(focusedElement).toBeVisible();
      }
    }

    // Test navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test first few navigation links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        await expect(link).toBeVisible();
        await expect(link).toBeEnabled();

        // Test hover interaction
        await link.hover();
        await page.waitForTimeout(100);
      }
    }
  });

  test('should handle different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check that navigation is always present
      const nav = page.locator('nav, [role="navigation"]');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Check that main content is always visible
      const main = page.locator('main');
      if ((await main.count()) > 0) {
        await expect(main).toBeVisible();
      }

      // Check that content doesn't overflow
      const body = page.locator('body');
      const box = await body.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('should handle mobile navigation menu', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check for mobile menu button
    const menuButton = page.locator(
      '[data-testid="mobile-menu"], button[aria-label*="menu"], button[aria-label*="Menu"]'
    );
    if ((await menuButton.count()) > 0) {
      await expect(menuButton.first()).toBeVisible();
      await expect(menuButton.first()).toBeEnabled();

      // Test menu toggle
      await menuButton.first().click();
      await page.waitForTimeout(1000);

      // Check that menu is visible
      const menu = page.locator('[data-testid="mobile-nav"], .mobile-nav, [role="menu"]');
      if ((await menu.count()) > 0) {
        await expect(menu.first()).toBeVisible();
      }
    }
  });

  test('should handle tablet navigation', async ({ page }) => {
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that tablet navigation is appropriate
    const nav = page.locator('nav, [role="navigation"]');
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible();

      // Check that navigation items are properly spaced for tablet
      const navItems = nav.locator('a, button');
      const itemCount = await navItems.count();

      if (itemCount > 1) {
        // Check spacing between items
        const firstItem = navItems.first();
        const secondItem = navItems.nth(1);

        const firstBox = await firstItem.boundingBox();
        const secondBox = await secondItem.boundingBox();

        if (firstBox && secondBox) {
          const spacing = secondBox.x - (firstBox.x + firstBox.width);
          expect(spacing).toBeGreaterThan(10); // Minimum spacing
        }
      }
    }
  });

  test('should handle desktop navigation', async ({ page }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that desktop navigation is comprehensive
    const nav = page.locator('nav, [role="navigation"]');
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible();

      // Check that all navigation items are visible on desktop
      const navItems = nav.locator('a, button');
      const itemCount = await navItems.count();

      if (itemCount > 0) {
        // All items should be visible on desktop
        for (let i = 0; i < itemCount; i++) {
          await expect(navItems.nth(i)).toBeVisible();
        }
      }
    }
  });
});
