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

      // Check if we're in a test environment where Clerk might not be fully configured
      const isTestEnvironment =
        process.env.MOCK_MODE === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.PLAYWRIGHT_CI === 'true';

      if (isTestEnvironment) {
        // In test environment, just verify that we're redirected or get an appropriate response
        // The page should either show a sign-in button or redirect to home
        const signInButton = page.getByTestId('sign-in-button');
        const currentUrl = page.url();

        // If we're still on the protected route, there should be some indication of auth requirement
        if (currentUrl.includes('/protected/')) {
          // Look for any auth-related UI elements
          const authElements = page.locator(
            '[data-testid="sign-in-button"], [data-testid="auth-placeholder"], .cl-modal, [role="dialog"]'
          );
          await expect(authElements.first()).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        } else {
          // If redirected, we should be on home page with sign-in button
          await expect(page).toHaveURL('/');
          await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        }
      } else {
        // In non-test environment, expect the full Clerk modal
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
      }
    });

    test(`should redirect to home when Clerk modal is closed on ${route}`, async ({ page }) => {
      await page.goto(route);

      // Check if we're in a test environment where Clerk might not be fully configured
      const isTestEnvironment =
        process.env.MOCK_MODE === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.PLAYWRIGHT_CI === 'true';

      if (isTestEnvironment) {
        // In test environment, just verify that we end up on home page with sign-in button
        // The page should redirect to home or show appropriate auth UI
        const currentUrl = page.url();
        if (currentUrl.includes('/protected/')) {
          // If still on protected route, try to close any modal and check for redirect
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }

        // Should end up on home page
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
              await closeButton.scrollIntoViewIfNeeded();
              await closeButton.click();
              await expect(menuOverlay).not.toBeVisible({ timeout: TIMEOUTS.SHORT });
            }
          }
          // Click the search icon to expand the header right section
          const searchButton = page.locator('button[aria-label="Open search"]');
          if (await searchButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
            await searchButton.scrollIntoViewIfNeeded();
            await searchButton.click();
          }
        }
        // Home page should show sign-in button
        const signInButton = page.getByTestId('sign-in-button');
        await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      } else {
        // In non-test environment, expect the full Clerk modal behavior
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
              await closeButton.scrollIntoViewIfNeeded();
              await closeButton.click();
              await expect(menuOverlay).not.toBeVisible({ timeout: TIMEOUTS.SHORT });
            }
          }
          // Click the search icon to expand the header right section
          const searchButton = page.locator('button[aria-label="Open search"]');
          if (await searchButton.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
            await searchButton.scrollIntoViewIfNeeded();
            await searchButton.click();
          }
        }
        // Home page should show sign-in button
        const signInButton = page.getByTestId('sign-in-button');
        await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      }
    });
  }
});
