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
} from '@tests/e2e/utils/test-utils';

/**
 * Base page test suite - fundamental tests that all pages should pass
 * This is the foundation for all page-specific tests
 */
export async function runBasePageTests(page: any, path: string, pageName: string) {
  test.describe(`${pageName} - Base Tests`, () => {
    test.beforeEach(async ({ page }) => {
      await safeGoto(page, path);
      await waitForPageLoad(page);
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });

    test('should load page successfully', async ({ page }) => {
      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that we're on the correct page
      await expect(page).toHaveURL(path);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

      // Check that page is interactive
      await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
    });

    test('should have proper navigation elements', async ({ page }) => {
      // Check for navigation menu
      const nav = page.locator('nav, [role="navigation"]');
      const navCount = await nav.count();

      // Navigation should exist (even if hidden on mobile)
      expect(navCount).toBeGreaterThan(0);

      // Check if any nav is visible (optional - mobile might hide nav in hamburger menu)
      let foundVisibleNav = false;
      for (let i = 0; i < navCount; i++) {
        if (await nav.nth(i).isVisible()) {
          foundVisibleNav = true;
          break;
        }
      }

      // On mobile, nav might be hidden, so this is optional
      if (foundVisibleNav) {
        console.log('Found visible navigation element');
      } else {
        console.log('Navigation elements exist but are hidden (likely mobile hamburger menu)');
      }

      // Check for logo/brand
      const logo = page.locator('img[alt*="logo"], img[alt*="brand"], [data-testid="logo"]');
      if ((await logo.count()) > 0) {
        await expect(logo.first()).toBeVisible();
      }
    });

    test('should be accessible', async ({ page }) => {
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
    });

    test('should have good performance', async ({ page }) => {
      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Basic performance checks
      expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds for any page
      expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    });

    test('should not have console errors', async ({ page }) => {
      // Check for console errors
      await checkForConsoleErrors(page);
    });

    test('should have proper footer', async ({ page }) => {
      // Check for footer
      const footer = page.locator('footer, [role="contentinfo"]');
      if ((await footer.count()) > 0) {
        await expect(footer.first()).toBeVisible();

        // Check for footer links
        const footerLinks = footer.locator('a');
        const footerLinkCount = await footerLinks.count();

        if (footerLinkCount > 0) {
          // Check that footer links are visible
          for (let i = 0; i < Math.min(footerLinkCount, 5); i++) {
            await expect(footerLinks.nth(i)).toBeVisible();
          }
        }
      }
    });
  });
}
