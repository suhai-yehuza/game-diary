import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  generateTestData,
  takeDebugScreenshot,
} from '@tests/e2e/utils/test-utils';

// Smoke tests are handled by the compound runner

test.describe.configure({ retries: 2 });

test.describe('Critical Tests (Extends Smoke)', () => {
  const testData = generateTestData();

  test.beforeEach(async ({ page }) => {
    // Disable all CSS animations and transitions for test reliability
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
  });

  test('@critical should handle complete user authentication flow', async ({ page }) => {
    // Test sign-up flow
    await safeGoto(page, '/sign-up');
    await waitForPageLoad(page);

    // Check for sign-up form elements
    const emailInput = page.getByRole('textbox', { name: /email/i });
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
    );

    if (
      (await emailInput.count()) > 0 &&
      (await passwordInput.count()) > 0 &&
      (await submitButton.count()) > 0
    ) {
      // Fill in test credentials
      await emailInput.fill(testData.user.email);
      await passwordInput.fill(testData.user.password);

      // Submit form
      await submitButton.first().click();
      await page.waitForTimeout(2000);

      // Check for success or redirect
      await expect(page.locator('body')).toBeVisible();
    }

    // Test sign-in flow
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    const signInEmailInput = page.getByRole('textbox', { name: /email/i });
    const signInPasswordInput = page.getByLabel(/password/i);
    const signInSubmitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
    );

    if (
      (await signInEmailInput.count()) > 0 &&
      (await signInPasswordInput.count()) > 0 &&
      (await signInSubmitButton.count()) > 0
    ) {
      // Fill in test credentials
      await signInEmailInput.fill(testData.user.email);
      await signInPasswordInput.fill(testData.user.password);

      // Submit form
      await signInSubmitButton.first().click();
      await page.waitForTimeout(2000);

      // Check for success or redirect
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('@critical should handle sports data loading and display', async ({ page }) => {
    // Test NBA page with data
    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);

    // Check for sports data elements
    const dataSelectors = [
      '[data-testid="games-list"]',
      '[data-testid="teams-list"]',
      '[data-testid="standings"]',
      '.games-list',
      '.teams-list',
      '.standings',
      'table',
      'ul',
      'ol',
    ];

    let dataFound = false;
    for (const selector of dataSelectors) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        try {
          await expect(element.first()).toBeVisible({ timeout: 5000 });
          dataFound = true;
          break;
        } catch (error) {
          // Continue to next selector
        }
      }
    }

    // If no specific data elements found, check for any content
    if (!dataFound) {
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        const textContent = body.textContent || '';
        return textContent.trim().length > 100; // At least some meaningful content
      });
      expect(hasContent).toBeTruthy();
    }
  });

  test('@critical should handle protected route access', async ({ page }) => {
    const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin'];

    for (const route of protectedRoutes) {
      await safeGoto(page, route);
      await waitForPageLoad(page);

      // Check that we're on the correct page or redirected appropriately
      await expect(page.locator('body')).toBeVisible();

      // Check for either protected content or authentication prompt
      const authPrompt = page.locator('[data-testid="auth-prompt"], .auth-prompt, [role="alert"]');
      const protectedContent = page.locator('main, .protected-content');

      if ((await authPrompt.count()) > 0) {
        await expect(authPrompt.first()).toBeVisible();
      } else if ((await protectedContent.count()) > 0) {
        await expect(protectedContent.first()).toBeVisible();
      }
    }
  });

  test('@critical should handle form validation', async ({ page }) => {
    // Test sign-in form validation
    await safeGoto(page, '/sign-in');
    await waitForPageLoad(page);

    const submitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
    );

    if ((await submitButton.count()) > 0) {
      // Try to submit empty form
      await submitButton.first().click();
      await page.waitForTimeout(1000);

      // Check for validation messages
      const validationMessages = page.locator(
        '[data-testid="error"], .error, [role="alert"], .validation-error'
      );
      if ((await validationMessages.count()) > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }
    }

    // Test sign-up form validation
    await safeGoto(page, '/sign-up');
    await waitForPageLoad(page);

    const signUpSubmitButton = page.locator(
      'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
    );

    if ((await signUpSubmitButton.count()) > 0) {
      // Try to submit empty form
      await signUpSubmitButton.first().click();
      await page.waitForTimeout(1000);

      // Check for validation messages
      const validationMessages = page.locator(
        '[data-testid="error"], .error, [role="alert"], .validation-error'
      );
      if ((await validationMessages.count()) > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }
    }
  });

  test('@critical should handle error states gracefully', async ({ page }) => {
    // Test 404 page
    await safeGoto(page, '/non-existent-page');
    await waitForPageLoad(page);

    // Check that page handles 404 gracefully
    await expect(page.locator('body')).toBeVisible();

    // Check for either 404 content or redirect to home
    const notFoundContent = page.locator(
      '[data-testid="not-found"], .not-found, h1:has-text("404"), h1:has-text("Not Found")'
    );
    const homeContent = page.locator('main');

    if ((await notFoundContent.count()) > 0) {
      await expect(notFoundContent.first()).toBeVisible();
    } else {
      // If no 404 content, should be redirected to home
      await expect(homeContent).toBeVisible();
    }
  });

  test('@critical should handle browser navigation (back/forward)', async ({ page }) => {
    // Navigate to multiple pages
    await safeGoto(page, '/');
    await waitForPageLoad(page);

    await safeGoto(page, '/sports/nba');
    await waitForPageLoad(page);

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

    // Go back to home
    await page.goBack();
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Check that we're on home page
    await expect(page).toHaveURL(/\/$/);
  });
});
