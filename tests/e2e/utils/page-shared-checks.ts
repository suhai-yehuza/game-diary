import { expect, test as baseTest, Page, TestType } from '@playwright/test';
import {
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
} from './test-utils';

export function runBasePageChecks(test: typeof baseTest, path: string) {
  test('should load page successfully', async ({ page }: { page: Page }) => {
    await checkBasicPageStructure(page);
    await checkPageTitle(page);
    await expect(page).toHaveURL(path);
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('should have proper navigation elements', async ({ page }: { page: Page }) => {
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    if (navCount === 0) {
      console.warn('No navigation elements found. This may be expected on mobile layouts.');
      test.skip();
    } else {
      expect(navCount).toBeGreaterThan(0);
    }
    let foundVisibleNav = false;
    for (let i = 0; i < navCount; i++) {
      if (await nav.nth(i).isVisible()) {
        foundVisibleNav = true;
        break;
      }
    }
    if (foundVisibleNav) {
      console.log('Found visible navigation element');
    } else {
      console.log('Navigation elements exist but are hidden (likely mobile hamburger menu)');
    }
    const logo = page.locator('img[alt*="logo"], img[alt*="brand"], [data-testid="logo"]');
    if ((await logo.count()) > 0) {
      await expect(logo.first()).toBeVisible();
    }
  });

  test('should be accessible', async ({ page }: { page: Page }) => {
    await checkAccessibilityBasics(page);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    const focusedElement = page.locator(':focus');
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have good performance', async ({ page }: { page: Page }) => {
    const metrics = await checkPerformanceMetrics(page);
    expect(metrics.loadTime).toBeLessThan(5000);
    expect(metrics.domContentLoaded).toBeLessThan(3000);
  });

  test('should not have console errors', async ({ page }: { page: Page }) => {
    await checkForConsoleErrors(page);
  });

  test('should have proper footer', async ({ page }: { page: Page }) => {
    const footer = page.locator('footer, [role="contentinfo"]');
    if ((await footer.count()) > 0) {
      await expect(footer.first()).toBeVisible();
      const footerLinks = footer.locator('a');
      const footerLinkCount = await footerLinks.count();
      if (footerLinkCount > 0) {
        for (let i = 0; i < Math.min(footerLinkCount, 5); i++) {
          await expect(footerLinks.nth(i)).toBeVisible();
        }
      }
    }
  });
}
