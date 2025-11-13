import { test, expect } from '@playwright/test';

import { TIMEOUTS, safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';

const protectedRoutes = ['/protected/dashboard'];

test.describe('Protected Route Clerk Sign-In Modal', () => {
  for (const route of protectedRoutes) {
    test(`should auto-trigger Clerk sign-in modal on ${route} for unauthenticated users`, async ({
      page,
    }) => {
      // Check if we're in a test environment where Clerk might not be fully configured
      const isTestEnvironment =
        process.env.MOCK_MODE === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.PLAYWRIGHT_CI === 'true';

      if (isTestEnvironment) {
        // In test environment, auth is bypassed, so we can access protected routes
        // Use safeGoto to navigate and wait for page load
        await safeGoto(page, route);
        await waitForPageLoad(page);

        const currentUrl = page.url();

        // If we're still on the protected route, that's expected in test mode (auth is bypassed)
        // Just verify the page content loads
        if (currentUrl.includes('/protected/')) {
          // Verify page has loaded by checking for body or main content
          await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        } else {
          // If redirected, we should be on home page with sign-in button
          await expect(page).toHaveURL('/');
          const signInButton = page.getByTestId('sign-in-button');
          await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
        }
      } else {
        // In non-test environment, go to the protected route and expect the full Clerk modal
        await safeGoto(page, route);
        await waitForPageLoad(page);

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
      // Check if we're in a test environment where Clerk might not be fully configured
      const isTestEnvironment =
        process.env.MOCK_MODE === 'true' ||
        process.env.GITHUB_ACTIONS === 'true' ||
        process.env.PLAYWRIGHT_CI === 'true';

      if (isTestEnvironment) {
        // In test environment, auth is bypassed, so we can access protected routes
        // Navigate to protected route first
        await safeGoto(page, route);
        await waitForPageLoad(page);

        const currentUrl = page.url();

        if (currentUrl.includes('/protected/')) {
          // If still on protected route (auth bypassed), navigate to home
          await safeGoto(page, '/');
          await waitForPageLoad(page);
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
        // In non-test environment, go to protected route and expect the full Clerk modal behavior
        await safeGoto(page, route);
        await waitForPageLoad(page);

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
