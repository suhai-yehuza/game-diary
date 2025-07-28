import { test, expect } from '@playwright/test';

import { TIMEOUTS } from '@tests/e2e/utils/test-utils';

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
      await expect(modal).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      // Check for email and password fields
      const emailInput = page.locator(
        'input[type="email"], input[name="email"], [data-testid="email-input"]'
      );
      const passwordInput = page.locator(
        'input[type="password"], input[name="password"], [data-testid="password-input"]'
      );
      await expect(emailInput.or(passwordInput)).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });

    test(`should redirect to home when Clerk modal is closed on ${route}`, async ({ page }) => {
      await page.goto(route);
      // Wait for modal
      const modal = page.locator('[data-testid="sign-in-modal"], .cl-modal, [role="dialog"]');
      await expect(modal).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      // Press Escape to close modal
      await page.keyboard.press('Escape');
      // Wait for redirect
      await expect(page).toHaveURL('/');
      // On mobile, ensure the mobile menu is closed before looking for the sign-in button
      const isMobile = await page.evaluate(() => window.innerWidth < 1024);
      if (isMobile) {
        // If the menu overlay is visible, close it
        const menuOverlay = page.locator('[data-testid="mobile-menu-overlay"]');
        if (await menuOverlay.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          // Click the close button (X) if present
          const closeButton = page.locator('[data-testid="mobile-menu-button"]');
          if (await closeButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
            await closeButton.click();
            await expect(menuOverlay).not.toBeVisible({ timeout: TIMEOUTS.SHORT });
          }
        }
        // Click the search icon to expand the header right section
        const searchButton = page.locator('button[aria-label="Open search"]');
        if (await searchButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
          await searchButton.click();
        }
      }
      // Home page should show sign-in button
      const signInButton = page.getByTestId('sign-in-button');
      await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }
});
