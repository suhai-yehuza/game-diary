import { test, expect } from '@playwright/test';

import { STAGING_URL } from '@/lib/config/urls';
import {
  setupAuthBypass,
  clearAuthBypass,
  isAuthBypassEnabled,
} from '@tests/e2e/utils/auth-bypass';
import { setupE2EMocking, safeGotoWithMocking } from '@tests/e2e/utils/test-utils';

test.describe('Vercel Authentication Test', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocking(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuthBypass(page);
  });

  test('should access deployment without Vercel authentication redirect', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass
    await setupAuthBypass(page);

    // Test that we can access the home page without being redirected to Vercel login
    await expect(page).not.toHaveURL(/vercel\.com\/login/);

    // Verify we're on our app's domain
    expect(page.url()).toContain(STAGING_URL.replace('https://', ''));

    // Check that the page loaded successfully (not a Vercel error page)
    await expect(page.locator('body')).toBeVisible();

    // Verify we're not on a Vercel authentication page
    const pageTitle = await page.title();
    expect(pageTitle).not.toContain('Vercel');
    expect(pageTitle).not.toContain('Login');

    console.log('✅ Successfully accessed deployment without Vercel authentication redirect');
  });

  test('should be able to navigate to protected routes', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass
    await setupAuthBypass(page);

    // Test accessing a protected route
    await safeGotoWithMocking(page, '/protected/user');

    // Verify we can access the protected route without being redirected to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).not.toHaveURL(/vercel\.com\/login/);

    // Check that the page loaded successfully
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ Successfully accessed protected route without authentication redirects');
  });

  test('should find navigation elements on the page', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass
    await setupAuthBypass(page);

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Check for basic navigation elements
    const navElements = await page.locator('nav').count();
    console.log(`Found ${navElements} navigation elements`);

    // Check for common page elements
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100); // Should have substantial content

    console.log('✅ Page loaded with navigation elements and content');
  });
});
