import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
} from '@tests/e2e/utils/test-utils';

// Fast tests are handled by the compound runner

test.describe.configure({ retries: 2 });

test.describe('Smoke Tests (Extends Fast)', () => {
  test.beforeEach(async ({ page }) => {
    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('@smoke should load all major sports pages', async ({ page }) => {
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
      await safeGoto(page, sportsPage);
      await waitForPageLoad(page);

      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

      // Check for console errors
      await checkForConsoleErrors(page);
    }
  });

  test('@smoke should load dashboard page', async ({ page }) => {
    await safeGoto(page, '/dashboard');
    await waitForPageLoad(page);

    // Check basic page structure
    await checkBasicPageStructure(page);

    // Check page title
    await checkPageTitle(page);

    // Check that main content is visible
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });

    // Check for console errors
    await checkForConsoleErrors(page);
  });

  test('@smoke should handle form interactions', async ({ page }) => {
    // Test sign-in form
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    // Check for form elements
    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
    );

    if ((await emailInput.count()) > 0) {
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toBeEnabled();
    }

    if ((await passwordInput.count()) > 0) {
      await expect(passwordInput).toBeVisible();
      await expect(passwordInput).toBeEnabled();
    }

    if ((await submitButton.count()) > 0) {
      await expect(submitButton.first()).toBeVisible();
      await expect(submitButton.first()).toBeEnabled();
    }
  });

  test('@smoke should have basic accessibility', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check accessibility basics
    await checkAccessibilityBasics(page);

    // Check that page is keyboard navigable
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Check that focus is visible
    const focusedElement = page.locator(':focus');
    if ((await focusedElement.count()) > 0) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('@smoke should have reasonable performance', async ({ page }) => {
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Check performance metrics
    const metrics = await checkPerformanceMetrics(page);

    // Performance should be reasonable for home page
    expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
  });

  test('@smoke should handle navigation between major sections', async ({ page }) => {
    // Start at home
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    // Navigate to sports
    await page.click('a[href*="/sports"]');
    await waitForPageLoad(page);
    await expect(page.locator('main')).toBeVisible();

    // Navigate to dashboard
    await page.click('a[href*="/dashboard"]');
    await waitForPageLoad(page);
    await expect(page.locator('main')).toBeVisible();

    // Navigate back to home
    await page.click('a[href="/"]');
    await waitForPageLoad(page);
    await expect(page.locator('main')).toBeVisible();
  });
});
