import { test, expect } from '@playwright/test';
import { runInteractivePageTests } from '@tests/e2e/utils/page-suites';

test.describe('Clerk Auth Modal', () => {
  // Run interactive page tests for home page (where auth modal is tested)
  runInteractivePageTests(test, '/', 'Home Page with Auth');

  // Auth-specific tests
  test.describe('Clerk Auth - Specific Tests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // Disable all CSS animations and transitions for test reliability
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });

    test('should open Clerk sign in modal and show form fields', async ({ page }) => {
      // Find the sign in button using the data-testid we have in the header
      const signInButton = page.getByTestId('sign-in-button');
      await expect(signInButton).toBeVisible();

      // Click the sign in button
      await signInButton.click();

      // Wait a bit for the modal to appear
      await page.waitForTimeout(1000);

      // Check for Clerk modal elements - try multiple possible selectors
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );

      // Wait for either email or password input to be visible (indicating modal is open)
      await expect(emailInput.or(passwordInput)).toBeVisible({ timeout: 10000 });

      // If we found the inputs, verify they are properly visible
      if ((await emailInput.count()) > 0) {
        await expect(emailInput.first()).toBeVisible();
      }

      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }

      // Also check for common Clerk modal elements
      const modalContent = page.locator('[role="dialog"], .clerk-modal, [data-clerk-modal]');
      if ((await modalContent.count()) > 0) {
        await expect(modalContent.first()).toBeVisible();
      }
    });

    test('should handle sign in button click without errors', async ({ page }) => {
      // Find and click the sign in button
      const signInButton = page.getByTestId('sign-in-button');
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();

      // Click should not throw any errors
      await signInButton.click();

      // Wait a bit and verify page is still stable
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle sign up button if present', async ({ page }) => {
      // Check for sign up button
      const signUpButton = page.getByTestId('sign-up-button');
      if ((await signUpButton.count()) > 0) {
        await expect(signUpButton).toBeVisible();
        await expect(signUpButton).toBeEnabled();

        // Click should not throw any errors
        await signUpButton.click();

        // Wait a bit and verify page is still stable
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle auth modal keyboard interactions', async ({ page }) => {
      // Open the sign in modal
      const signInButton = page.getByTestId('sign-in-button');
      await signInButton.click();
      await page.waitForTimeout(1000);

      // Test escape key to close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      // Check that modal is closed
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).not.toBeVisible({ timeout: 5000 });
    });

    test('should handle auth modal focus management', async ({ page }) => {
      // Open the sign in modal
      const signInButton = page.getByTestId('sign-in-button');
      await signInButton.click();
      await page.waitForTimeout(1000);

      // Check that focus is properly managed within modal
      const modalContent = page.locator('[role="dialog"], .clerk-modal, [data-clerk-modal]');
      if ((await modalContent.count()) > 0) {
        const focusableElements = modalContent.locator('button, a, input, select, textarea');
        if ((await focusableElements.count()) > 0) {
          // Focus should be within modal
          await focusableElements.first().focus();
          const focusedElement = page.locator(':focus');
          await expect(focusedElement).toBeVisible();
        }
      }
    });
  });
});
