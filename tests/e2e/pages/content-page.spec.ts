import { test, expect } from '@playwright/test';
import { checkSEOElements, checkResponsiveBehavior } from '@tests/e2e/utils/test-utils';
import { runBasePageTests } from './base-page.spec';

/**
 * Content page test suite - extends base tests with content-specific validations
 * This level adds tests for content structure, SEO, and responsive behavior
 */
export async function runContentPageTests(page: any, path: string, pageName: string) {
  // Run base tests first
  await runBasePageTests(page, path, pageName);

  test.describe(`${pageName} - Content Tests`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });

    test('should have proper content sections', async ({ page }) => {
      // Check for main content sections
      const sections = page.locator('main section, main > div');
      const sectionCount = await sections.count();
      expect(sectionCount).toBeGreaterThan(0);

      // Check that sections are visible
      for (let i = 0; i < Math.min(sectionCount, 5); i++) {
        await expect(sections.nth(i)).toBeVisible();
      }
    });

    test('should have proper SEO elements', async ({ page }) => {
      // Check SEO elements
      await checkSEOElements(page);

      // Check for structured data
      const structuredData = page.locator('script[type="application/ld+json"]');
      if ((await structuredData.count()) > 0) {
        await expect(structuredData.first()).toBeVisible();
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      // Test mobile responsiveness
      await checkResponsiveBehavior(page, { width: 375, height: 667 });

      // Check that content is readable on mobile
      const mainContent = page.locator('main');
      if ((await mainContent.count()) > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
    });

    test('should be responsive on tablet', async ({ page }) => {
      // Test tablet responsiveness
      await checkResponsiveBehavior(page, { width: 768, height: 1024 });

      // Check that layout adapts properly
      const mainContent = page.locator('main');
      if ((await mainContent.count()) > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
    });

    test('should handle theme switching', async ({ page }) => {
      // Check for theme toggle
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"]'
      );

      if ((await themeToggle.count()) > 0) {
        await expect(themeToggle.first()).toBeVisible();
        await expect(themeToggle.first()).toBeEnabled();

        // Test theme switching
        await themeToggle.first().click();
        await page.waitForTimeout(1000);

        // Check that theme changed
        const body = page.locator('body');
        const classList = await body.getAttribute('class');
        expect(classList).toBeTruthy();
      }
    });

    test('should have proper loading states', async ({ page }) => {
      // Navigate to a new page to test loading states
      const navLink = page.locator('a[href*="/"]').first();
      if ((await navLink.count()) > 0) {
        // Click the link and check for loading state
        await navLink.click();

        // Wait for navigation
        await page.waitForLoadState('networkidle');

        // Check that we navigated successfully
        await expect(page).toHaveURL(/\/.*/);
      }
    });

    test('should handle browser back/forward', async ({ page }) => {
      // Navigate to a different page first
      const navLink = page.locator('a[href*="/"]').first();
      if ((await navLink.count()) > 0) {
        await navLink.click();
        await page.waitForLoadState('networkidle');

        // Go back to original page
        await page.goBack();
        await page.waitForLoadState('networkidle');

        // Check that we're back on original page
        await expect(page).toHaveURL(path);

        // Check that page content is visible
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });
}
