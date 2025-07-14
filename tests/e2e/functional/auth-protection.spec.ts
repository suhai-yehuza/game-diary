import { test, expect } from '@playwright/test';

const protectedRoutes = ['/protected/user'];

test.describe('Protected Route Clerk Sign-In Modal', () => {
  for (const route of protectedRoutes) {
    test(`should auto-trigger Clerk sign-in modal on ${route} for unauthenticated users`, async ({
      page,
    }) => {
      // Go to the protected route
      await page.goto(route);
      // Wait for Clerk modal to appear
      const modal = page.locator('[data-testid="sign-in-modal"], .cl-modal, [role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 10000 });
      // Check for email and password fields
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      await expect(emailInput.or(passwordInput)).toBeVisible({ timeout: 10000 });
    });

    test(`should redirect to home when Clerk modal is closed on ${route}`, async ({ page }) => {
      await page.goto(route);
      // Wait for modal
      const modal = page.locator('[data-testid="sign-in-modal"], .cl-modal, [role="dialog"]');
      await expect(modal).toBeVisible({ timeout: 10000 });
      // Press Escape to close modal
      await page.keyboard.press('Escape');
      // Wait for redirect
      await expect(page).toHaveURL('/');
      // Home page should show sign-in button
      const signInButton = page.getByTestId('sign-in-button');
      await expect(signInButton).toBeVisible({ timeout: 10000 });
    });
  }
});
