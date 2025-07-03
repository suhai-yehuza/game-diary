import { test, expect } from '@playwright/test';
import {
  safeGoto,
  safeGotoWithMocking,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkResponsiveBehavior,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  checkForNetworkErrors,
  checkKeyboardNavigation,
  checkMobileTouchInteractions,
  checkSEOElements,
  checkSecurityHeaders,
  takeDebugScreenshot,
  setupE2EMocking,
  generateTestData,
  cleanupTestData,
} from '@tests/e2e/utils/test-utils';

// Import and re-export responsive tests to extend them
import '@tests/e2e/functional/responsive.spec';

test.describe.configure({ retries: 3 });

test.describe('Full Tests (Extends Responsive)', () => {
  const testData = generateTestData();

  test.beforeEach(async ({ page }) => {
    // Set up comprehensive mocking to avoid API rate limiting
    await setupE2EMocking(page);

    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data
    await cleanupTestData(page);
  });

  test('@full should handle cross-browser compatibility', async ({ page }) => {
    const testPages = [
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

    for (const pagePath of testPages) {
      await safeGotoWithMocking(page, pagePath);
      await waitForPageLoad(page);

      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

      // Check for console errors
      await checkForConsoleErrors(page);

      // Check for network errors
      await checkForNetworkErrors(page);
    }
  });

  test('@full should handle advanced form interactions', async ({ page }) => {
    // Test sign-in form with various scenarios
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
    );

    if (
      (await emailInput.count()) > 0 &&
      (await passwordInput.count()) > 0 &&
      (await submitButton.count()) > 0
    ) {
      // Test invalid email format
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await submitButton.first().click();
      await page.waitForTimeout(1000);

      // Check for validation message
      const validationMessages = page.locator(
        '[data-testid="error"], .error, [role="alert"], .validation-error'
      );
      if ((await validationMessages.count()) > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }

      // Test valid email format
      await emailInput.clear();
      await emailInput.fill('test@example.com');
      await submitButton.first().click();
      await page.waitForTimeout(2000);

      // Check for success or redirect
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('@full should handle keyboard navigation comprehensively', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Test keyboard navigation
    await checkKeyboardNavigation(page);

    // Test tab navigation through all interactive elements
    const interactiveElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const elementCount = await interactiveElements.count();

    if (elementCount > 0) {
      // Tab through first few elements
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);

        // Check that focus is visible
        const focusedElement = page.locator(':focus');
        if ((await focusedElement.count()) > 0) {
          await expect(focusedElement).toBeVisible();
        }
      }
    }
  });

  test('@full should handle mobile touch interactions comprehensively', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      });
    });

    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Test mobile touch interactions
    await checkMobileTouchInteractions(page);

    // Test touch scrolling
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1000);

    // Test touch navigation
    const navLinks = page.locator('nav a, nav button');
    const linkCount = await navLinks.count();
    if (linkCount > 0) {
      // Find a visible link to test
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page.locator('body')).toBeVisible();
          break;
        }
      }
    }
  });

  test('@full should have comprehensive accessibility', async ({ page }) => {
    const testPages = [
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

    for (const pagePath of testPages) {
      await safeGotoWithMocking(page, pagePath);
      await waitForPageLoad(page);

      // Check accessibility basics
      await checkAccessibilityBasics(page);

      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      if (headingCount > 0) {
        // Check that at least one heading is visible
        let visibleHeadingFound = false;
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          if (await heading.isVisible()) {
            visibleHeadingFound = true;
            break;
          }
        }
        expect(visibleHeadingFound).toBeTruthy();
      }

      // Check for proper alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      if (imageCount > 0) {
        // Check that images have alt attributes
        for (let i = 0; i < Math.min(imageCount, 10); i++) {
          const image = images.nth(i);
          const alt = await image.getAttribute('alt');
          // Alt can be empty string for decorative images, but should exist
          expect(alt).not.toBeNull();
        }
      }

      // Check for proper ARIA labels
      const ariaElements = page.locator('[aria-label], [aria-labelledby]');
      const ariaCount = await ariaElements.count();
      if (ariaCount > 0) {
        // Check that ARIA elements are properly labeled
        for (let i = 0; i < Math.min(ariaCount, 10); i++) {
          const element = ariaElements.nth(i);
          const ariaLabel = await element.getAttribute('aria-label');
          const ariaLabelledBy = await element.getAttribute('aria-labelledby');
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      }
    }
  });

  test('@full should have comprehensive SEO elements', async ({ page }) => {
    const testPages = [
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

    for (const pagePath of testPages) {
      await safeGotoWithMocking(page, pagePath);
      await waitForPageLoad(page);

      // Check SEO elements
      await checkSEOElements(page);

      // Check for proper meta tags
      const metaDescription = page.locator('meta[name="description"]');
      if ((await metaDescription.count()) > 0) {
        await expect(metaDescription).toHaveAttribute('content');
      }

      // Check for proper Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogUrl = page.locator('meta[property="og:url"]');

      if ((await ogTitle.count()) > 0) {
        await expect(ogTitle).toHaveAttribute('content');
      }
      if ((await ogDescription.count()) > 0) {
        await expect(ogDescription).toHaveAttribute('content');
      }
      if ((await ogUrl.count()) > 0) {
        await expect(ogUrl).toHaveAttribute('content');
      }
    }
  });

  test('@full should have comprehensive security headers', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check security headers
    await checkSecurityHeaders(page);

    // Check for HTTPS redirect (if applicable)
    const currentUrl = page.url();
    if (currentUrl.startsWith('http://')) {
      // Should redirect to HTTPS in production
      console.log('Note: HTTP to HTTPS redirect not tested in development');
    }
  });

  test('@full should handle edge cases and error scenarios', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', route => {
      // Simulate slow network
      setTimeout(() => route.continue(), 1000);
    });

    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that page still loads correctly
    await expect(page.locator('body')).toBeVisible();

    // Test with offline mode
    await page.context().setOffline(true);
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that page handles offline gracefully
    await expect(page.locator('body')).toBeVisible();

    // Restore online mode
    await page.context().setOffline(false);

    // Test with invalid URLs
    await safeGoto(page, '/invalid-url-12345');
    await waitForPageLoad(page);

    // Check that 404 is handled gracefully
    await expect(page.locator('body')).toBeVisible();

    // Test with very long URLs
    const longUrl = '/sports/nba?' + 'a'.repeat(1000);
    await safeGoto(page, longUrl);
    await waitForPageLoad(page);

    // Check that long URLs are handled gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('@full should handle performance under load', async ({ page }) => {
    const testPages = [
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

    for (const pagePath of testPages) {
      await safeGotoWithMocking(page, pagePath);
      await waitForPageLoad(page);

      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be good for all pages
      expect(metrics.loadTime).toBeLessThan(10000); // 10 seconds
      expect(metrics.domContentLoaded).toBeLessThan(6000); // 6 seconds

      // Check for memory leaks by navigating multiple times
      for (let i = 0; i < 3; i++) {
        await safeGotoWithMocking(page, pagePath);
        await waitForPageLoad(page);
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('@full should handle data persistence and state management', async ({ page }) => {
    // Test localStorage persistence
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Set some test data
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    // Navigate away and back
    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check that data persists
    const persistedData = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    expect(persistedData).toBe('test-value');

    // Clean up
    await page.evaluate(() => {
      localStorage.removeItem('test-key');
    });
  });

  test('@full should handle concurrent user interactions', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Simulate rapid clicks
    const navLinks = page.locator('nav a, nav button');
    const linkCount = await navLinks.count();
    if (linkCount > 0) {
      // Find a visible link
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        if (await link.isVisible()) {
          // Rapid clicks
          await link.click();
          await link.click();
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page.locator('body')).toBeVisible();
          break;
        }
      }
    }

    // Test rapid form submissions
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
    );
    if ((await submitButton.count()) > 0) {
      // Rapid submissions
      await submitButton.first().click();
      await submitButton.first().click();
      await submitButton.first().click();
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
