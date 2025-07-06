import { test, expect } from '@playwright/test';

test.describe('Clerk Auth Modal', () => {
  test('should open Clerk sign in modal and show form fields', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

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
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

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

  // You can add a similar test for sign-up if needed
});
