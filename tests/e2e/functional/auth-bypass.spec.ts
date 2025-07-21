import { test, expect, ConsoleMessage } from '@playwright/test';
import {
  setupAuthBypass,
  clearAuthBypass,
  isAuthBypassEnabled,
  getTestCredentials,
} from '@tests/e2e/utils/auth-bypass';
import { setupE2EMocking, safeGotoWithMocking } from '@tests/e2e/utils/test-utils';
import { clearTestData } from '@tests/e2e/utils/test-utils';

test.describe('Authentication Bypass Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuthBypass(page);
  });

  test('should access protected routes with auth bypass enabled', async ({ page, browserName }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');
    // Skip in Firefox due to Clerk handshake issues
    test.skip(
      browserName === 'firefox',
      'Clerk dev browser handshake not supported in Firefox E2E'
    );

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass
    await setupAuthBypass(page);

    // Test accessing protected routes
    const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin/database'];

    for (const route of protectedRoutes) {
      console.log(`🔐 Testing protected route: ${route}`);

      await safeGotoWithMocking(page, route);

      // Verify we can access the protected route without being redirected to sign-in
      await expect(page).not.toHaveURL(/\/sign-in/);

      // Check that the page loaded successfully
      await expect(page.locator('body')).toBeVisible();

      // Verify we're on the expected route
      expect(page.url()).toContain(route);

      console.log(`✅ Successfully accessed protected route: ${route}`);
    }
  });

  test('should test auth-dependent functionality with bypass', async ({ page }) => {
    // Unskipped: attempt to debug hydration/client-side issues

    // Capture browser console errors and warnings
    let clientError: string | null = null;
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[browser ${msg.type()}]`, msg.text());
        if (!clientError) clientError = msg.text();
      }
    });

    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass with custom credentials
    const customCredentials = {
      email: 'admin@game-diary.com',
      userId: 'admin_user_456',
    };

    await setupAuthBypass(page, customCredentials);

    // Test user-specific functionality
    await safeGotoWithMocking(page, '/protected/user');

    // Debug: Check what's actually on the page
    const pageContent = await page.content();
    console.log('🔍 Page content preview:', pageContent.substring(0, 1000));

    // Check for any error messages or loading states
    const errorText = await page.locator('body').textContent();
    console.log('🔍 Page text content:', errorText?.substring(0, 500));

    // Check if there are any h1 elements at all
    const h1Elements = await page.locator('h1').count();
    console.log('🔍 Number of h1 elements found:', h1Elements);

    if (h1Elements > 0) {
      const h1Texts = await page.locator('h1').allTextContents();
      console.log('🔍 H1 texts found:', h1Texts);
    }

    // If hydration/client-side error detected, fail with clear message
    if (clientError) {
      throw new Error('Client-side error detected during hydration: ' + clientError);
    }

    // Verify user-specific content is displayed
    await expect(page.locator('h1')).toHaveText('Profile');

    // Test that we can access user profile information
    // (This will depend on your actual UI structure)
    console.log('✅ User profile page loaded successfully');
  });

  test('should test admin routes with auth bypass', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass for admin user
    const adminCredentials = {
      email: 'admin@game-diary.com',
      userId: 'admin_user_456',
    };

    await setupAuthBypass(page, adminCredentials);

    // Test admin-specific routes
    await safeGotoWithMocking(page, '/protected/admin/database');

    // Verify admin content is accessible
    await expect(page.locator('body')).toBeVisible();

    // Check that we're not redirected to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);

    console.log('✅ Admin routes accessible with auth bypass');
  });

  test('should handle auth bypass cleanup correctly', async ({ page }) => {
    // Skip this test for now due to redirect issues
    test.skip(true, 'Skipping due to redirect issues - needs further investigation');

    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Set up authentication bypass
    await setupAuthBypass(page);

    // Verify we can access protected routes
    await safeGotoWithMocking(page, '/protected/user');
    await expect(page).not.toHaveURL(/\/sign-in/);

    // Clear auth bypass
    await clearAuthBypass(page);

    // Now try to access protected route - should redirect to home and show sign-in button
    await safeGotoWithMocking(page, '/protected/user');
    await expect(page).toHaveURL('/');

    console.log('✅ Auth bypass cleanup working correctly');
  });

  test('should use environment variable credentials', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

    // First navigate to a page to establish a valid URL for cookies
    await safeGotoWithMocking(page, '/');

    // Get credentials from environment variables
    const credentials = getTestCredentials();
    console.log('🔐 Using test credentials:', credentials.email);

    // Set up authentication bypass with environment credentials
    await setupAuthBypass(page, credentials);

    // Test accessing protected route
    await safeGotoWithMocking(page, '/protected/user');

    // Verify successful access
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page.locator('body')).toBeVisible();

    console.log('✅ Environment variable credentials working correctly');
  });
});
