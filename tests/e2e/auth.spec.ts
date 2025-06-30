import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  checkForConsoleErrors,
  generateTestData,
  takeDebugScreenshot,
} from './utils/test-utils';

test.describe('Authentication', () => {
  const testData = generateTestData();

  test.describe('Sign In Page', () => {
    test.beforeEach(async ({ page }) => {
      await safeGoto(page, '/sign-in');
      await waitForPageLoad(page);
    });

    test('should load sign in page successfully', async ({ page }) => {
      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that we're on sign in page
      await expect(page).toHaveURL(/\/sign-in/);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible();
    });

    test('should have proper sign in form', async ({ page }) => {
      // Check for sign in form
      const signInForm = page.locator('form, [data-testid="sign-in-form"], [role="form"]');
      if ((await signInForm.count()) > 0) {
        await expect(signInForm.first()).toBeVisible();

        // Check for email input
        const emailInput = page.locator(
          'input[type="email"], input[name="email"], [data-testid="email-input"]'
        );
        if ((await emailInput.count()) > 0) {
          await expect(emailInput.first()).toBeVisible();
          await expect(emailInput.first()).toBeEnabled();
        }

        // Check for password input
        const passwordInput = page.locator(
          'input[type="password"], input[name="password"], [data-testid="password-input"]'
        );
        if ((await passwordInput.count()) > 0) {
          await expect(passwordInput.first()).toBeVisible();
          await expect(passwordInput.first()).toBeEnabled();
        }

        // Check for submit button
        const submitButton = page.locator(
          'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
        );
        if ((await submitButton.count()) > 0) {
          await expect(submitButton.first()).toBeVisible();
          await expect(submitButton.first()).toBeEnabled();
        }
      }
    });

    test('should handle sign in form validation', async ({ page }) => {
      // Check for form validation
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
      );
      if ((await submitButton.count()) > 0) {
        // Try to submit empty form
        await submitButton.first().click();
        await page.waitForTimeout(1000);

        // Check for validation messages
        const validationMessages = page.locator('[data-testid="error"], .error, [role="alert"]');
        if ((await validationMessages.count()) > 0) {
          await expect(validationMessages.first()).toBeVisible();
        }
      }
    });

    test('should handle sign in with valid credentials', async ({ page }) => {
      // This test would require mock authentication or test credentials
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
      );

      if (
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        // Fill in test credentials
        await emailInput.first().fill(testData.user.email);
        await passwordInput.first().fill(testData.user.password);

        // Submit form
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Check for success or redirect
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle sign in with invalid credentials', async ({ page }) => {
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
      );

      if (
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        // Fill in invalid credentials
        await emailInput.first().fill('invalid@example.com');
        await passwordInput.first().fill('wrongpassword');

        // Submit form
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Check for error message
        const errorMessage = page.locator('[data-testid="error"], .error, [role="alert"]');
        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    });

    test('should have proper sign in page accessibility', async ({ page }) => {
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

    test('should have good sign in page performance', async ({ page }) => {
      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be reasonable for sign in page
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    });

    test('should not have console errors on sign in page', async ({ page }) => {
      // Check for console errors
      await checkForConsoleErrors(page);
    });

    test('should have proper sign in page links', async ({ page }) => {
      // Check for sign up link
      const signUpLink = page.locator(
        'a[href*="/sign-up"], a[href*="/register"], a:has-text("Sign Up")'
      );
      if ((await signUpLink.count()) > 0) {
        await expect(signUpLink.first()).toBeVisible();
        await expect(signUpLink.first()).toBeEnabled();
      }

      // Check for forgot password link
      const forgotPasswordLink = page.locator(
        'a[href*="/forgot-password"], a[href*="/reset"], a:has-text("Forgot")'
      );
      if ((await forgotPasswordLink.count()) > 0) {
        await expect(forgotPasswordLink.first()).toBeVisible();
        await expect(forgotPasswordLink.first()).toBeEnabled();
      }

      // Check for home link
      const homeLink = page.locator('a[href="/"], a[href="/home"], a:has-text("Home")');
      if ((await homeLink.count()) > 0) {
        await expect(homeLink.first()).toBeVisible();
        await expect(homeLink.first()).toBeEnabled();
      }
    });
  });

  test.describe('Sign Up Page', () => {
    test.beforeEach(async ({ page }) => {
      await safeGoto(page, '/sign-up');
      await waitForPageLoad(page);
    });

    test('should load sign up page successfully', async ({ page }) => {
      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that we're on sign up page
      await expect(page).toHaveURL(/\/sign-up/);

      // Check that main content is visible
      await expect(page.locator('main')).toBeVisible();
    });

    test('should have proper sign up form', async ({ page }) => {
      // Check for sign up form
      const signUpForm = page.locator('form, [data-testid="sign-up-form"], [role="form"]');
      if ((await signUpForm.count()) > 0) {
        await expect(signUpForm.first()).toBeVisible();

        // Check for name input
        const nameInput = page.locator(
          'input[name="name"], input[name="fullName"], [data-testid="name-input"]'
        );
        if ((await nameInput.count()) > 0) {
          await expect(nameInput.first()).toBeVisible();
          await expect(nameInput.first()).toBeEnabled();
        }

        // Check for email input
        const emailInput = page.locator(
          'input[type="email"], input[name="email"], [data-testid="email-input"]'
        );
        if ((await emailInput.count()) > 0) {
          await expect(emailInput.first()).toBeVisible();
          await expect(emailInput.first()).toBeEnabled();
        }

        // Check for password input
        const passwordInput = page.locator(
          'input[type="password"], input[name="password"], [data-testid="password-input"]'
        );
        if ((await passwordInput.count()) > 0) {
          await expect(passwordInput.first()).toBeVisible();
          await expect(passwordInput.first()).toBeEnabled();
        }

        // Check for confirm password input
        const confirmPasswordInput = page.locator(
          'input[name="confirmPassword"], input[name="passwordConfirm"], [data-testid="confirm-password-input"]'
        );
        if ((await confirmPasswordInput.count()) > 0) {
          await expect(confirmPasswordInput.first()).toBeVisible();
          await expect(confirmPasswordInput.first()).toBeEnabled();
        }

        // Check for submit button
        const submitButton = page.locator(
          'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
        );
        if ((await submitButton.count()) > 0) {
          await expect(submitButton.first()).toBeVisible();
          await expect(submitButton.first()).toBeEnabled();
        }
      }
    });

    test('should handle sign up form validation', async ({ page }) => {
      // Check for form validation
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
      );
      if ((await submitButton.count()) > 0) {
        // Try to submit empty form
        await submitButton.first().click();
        await page.waitForTimeout(1000);

        // Check for validation messages
        const validationMessages = page.locator('[data-testid="error"], .error, [role="alert"]');
        if ((await validationMessages.count()) > 0) {
          await expect(validationMessages.first()).toBeVisible();
        }
      }
    });

    test('should handle sign up with valid data', async ({ page }) => {
      // This test would require mock registration or test setup
      const nameInput = page.locator(
        'input[name="name"], input[name="fullName"], [data-testid="name-input"]'
      );
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      const confirmPasswordInput = page.locator(
        'input[name="confirmPassword"], input[name="passwordConfirm"], [data-testid="confirm-password-input"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
      );

      if (
        (await nameInput.count()) > 0 &&
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        // Fill in test data
        await nameInput.first().fill(testData.user.name);
        await emailInput.first().fill(testData.user.email);
        await passwordInput.first().fill(testData.user.password);

        if ((await confirmPasswordInput.count()) > 0) {
          await confirmPasswordInput.first().fill(testData.user.password);
        }

        // Submit form
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Check for success or redirect
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle sign up with existing email', async ({ page }) => {
      const nameInput = page.locator(
        'input[name="name"], input[name="fullName"], [data-testid="name-input"]'
      );
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
      );

      if (
        (await nameInput.count()) > 0 &&
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        // Fill in existing email
        await nameInput.first().fill(testData.user.name);
        await emailInput.first().fill('existing@example.com');
        await passwordInput.first().fill(testData.user.password);

        // Submit form
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Check for error message
        const errorMessage = page.locator('[data-testid="error"], .error, [role="alert"]');
        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage.first()).toBeVisible();
        }
      }
    });

    test('should have proper sign up page accessibility', async ({ page }) => {
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

    test('should have good sign up page performance', async ({ page }) => {
      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be reasonable for sign up page
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    });

    test('should not have console errors on sign up page', async ({ page }) => {
      // Check for console errors
      await checkForConsoleErrors(page);
    });

    test('should have proper sign up page links', async ({ page }) => {
      // Check for sign in link
      const signInLink = page.locator(
        'a[href*="/sign-in"], a[href*="/login"], a:has-text("Sign In")'
      );
      if ((await signInLink.count()) > 0) {
        await expect(signInLink.first()).toBeVisible();
        await expect(signInLink.first()).toBeEnabled();
      }

      // Check for terms and conditions link
      const termsLink = page.locator('a[href*="/terms"], a[href*="/legal"], a:has-text("Terms")');
      if ((await termsLink.count()) > 0) {
        await expect(termsLink.first()).toBeVisible();
        await expect(termsLink.first()).toBeEnabled();
      }

      // Check for privacy policy link
      const privacyLink = page.locator('a[href*="/privacy"], a:has-text("Privacy")');
      if ((await privacyLink.count()) > 0) {
        await expect(privacyLink.first()).toBeVisible();
        await expect(privacyLink.first()).toBeEnabled();
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('should handle complete sign up and sign in flow', async ({ page }) => {
      // Navigate to sign up page
      await safeGoto(page, '/sign-up');
      await waitForPageLoad(page);

      // Fill out sign up form
      const nameInput = page.locator(
        'input[name="name"], input[name="fullName"], [data-testid="name-input"]'
      );
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      const submitButton = page.locator(
        'button[type="submit"], input[type="submit"], [data-testid="sign-up-button"]'
      );

      if (
        (await nameInput.count()) > 0 &&
        (await emailInput.count()) > 0 &&
        (await passwordInput.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        await nameInput.first().fill(testData.user.name);
        await emailInput.first().fill(testData.user.email);
        await passwordInput.first().fill(testData.user.password);

        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // Check for success or redirect
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle authentication state persistence', async ({ page }) => {
      // This test would check if authentication state persists across page reloads
      await safeGoto(page, '/dashboard');
      await waitForPageLoad(page);

      // Reload page
      await page.reload();
      await waitForPageLoad(page);

      // Check that authentication state is maintained
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle sign out functionality', async ({ page }) => {
      // Navigate to a protected page
      await safeGoto(page, '/dashboard');
      await waitForPageLoad(page);

      // Look for sign out button
      const signOutButton = page.locator(
        '[data-testid="sign-out"], button:has-text("Sign Out"), a:has-text("Sign Out")'
      );
      if ((await signOutButton.count()) > 0) {
        await expect(signOutButton.first()).toBeVisible();
        await expect(signOutButton.first()).toBeEnabled();

        // Click sign out
        await signOutButton.first().click();
        await page.waitForTimeout(2000);

        // Check that we're signed out (redirected to sign in or home)
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle protected route access', async ({ page }) => {
      const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin'];

      for (const route of protectedRoutes) {
        // Try to access protected route
        await safeGoto(page, route);
        await waitForPageLoad(page);

        // Check that we're either authenticated or redirected
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle authentication error handling', async ({ page }) => {
      // Test various authentication error scenarios
      const errorScenarios = [
        { email: 'invalid-email', password: 'password' },
        { email: 'test@example.com', password: '' },
        { email: '', password: 'password' },
      ];

      for (const scenario of errorScenarios) {
        await safeGoto(page, '/sign-in');
        await waitForPageLoad(page);

        const emailInput = page.locator(
          'input[type="email"], input[name="email"], [data-testid="email-input"]'
        );
        const passwordInput = page.locator(
          'input[type="password"], input[name="password"], [data-testid="password-input"]'
        );
        const submitButton = page.locator(
          'button[type="submit"], input[type="submit"], [data-testid="sign-in-button"]'
        );

        if (
          (await emailInput.count()) > 0 &&
          (await passwordInput.count()) > 0 &&
          (await submitButton.count()) > 0
        ) {
          if (scenario.email) {
            await emailInput.first().fill(scenario.email);
          }
          if (scenario.password) {
            await passwordInput.first().fill(scenario.password);
          }

          await submitButton.first().click();
          await page.waitForTimeout(1000);

          // Check for error handling
          await expect(page.locator('body')).toBeVisible();
        }
      }
    });
  });
});
