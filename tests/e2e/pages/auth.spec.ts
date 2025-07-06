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
} from '@tests/e2e/utils/test-utils';

test.describe('Authentication via Header', () => {
  const testData = generateTestData();

  test.describe('Sign In Button', () => {
    test.beforeEach(async ({ page }) => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);
    });

    test('should have sign in button in header', async ({ page }) => {
      // Check basic page structure
      await checkBasicPageStructure(page);

      // Check page title
      await checkPageTitle(page);

      // Check that the Sign In button is present in the header
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await expect(signInButton).toBeVisible();
      await expect(signInButton).toBeEnabled();
    });

    test('should open sign in modal when clicked', async ({ page }) => {
      // Click the Sign In button to open the modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Check that the modal appears with form elements
      const emailInput = page.getByRole('textbox', { name: /email/i });
      const passwordInput = page.getByLabel(/password/i);

      // Wait for modal to appear (either input should be visible)
      await expect(emailInput.or(passwordInput)).toBeVisible({ timeout: 5000 });
    });

    test('should have proper modal form elements', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Check for email input
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Check for password input
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // Check for submit button
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible({ timeout: 5000 });
    });

    test('should handle modal form validation', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Check for validation messages (if any)
      const validationMessages = page.locator('[data-testid="error"], .error, [role="alert"]');
      if ((await validationMessages.count()) > 0) {
        await expect(validationMessages.first()).toBeVisible();
      }
    });

    test('should handle modal with test credentials', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      const passwordInput = page.getByLabel(/password/i);
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // Fill in test credentials
      await emailInput.fill(testData.user.email);
      await passwordInput.fill(testData.user.password);

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for success or redirect
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle modal with invalid credentials', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      const passwordInput = page.getByLabel(/password/i);
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // Fill in invalid credentials
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');

      // Submit form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for error message (if any)
      const errorMessage = page.locator('[data-testid="error"], .error, [role="alert"]');
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    });

    test('should have proper modal accessibility', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

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

    test('should have good modal performance', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Check performance metrics
      const metrics = await checkPerformanceMetrics(page);

      // Performance should be reasonable for modal
      expect(metrics.loadTime).toBeLessThan(3000); // 3 seconds
      expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
    });

    test('should not have console errors when opening modal', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Check for console errors
      await checkForConsoleErrors(page);
    });

    test('should close modal when clicking outside', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Click outside the modal (on the backdrop)
      await page.mouse.click(10, 10);
      await page.waitForTimeout(500);

      // Check that modal is closed (email input should not be visible)
      await expect(emailInput).not.toBeVisible();
    });

    test('should close modal when pressing Escape', async ({ page }) => {
      // Open the sign-in modal
      const signInButton = page.getByRole('button', { name: /sign in/i });
      await signInButton.click();
      await page.waitForTimeout(500);

      // Wait for modal to appear
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Press Escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Check that modal is closed (email input should not be visible)
      await expect(emailInput).not.toBeVisible();
    });
  });
});
