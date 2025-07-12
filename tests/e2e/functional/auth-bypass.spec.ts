import { test, expect } from '@playwright/test';
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

  test('should access protected routes with auth bypass enabled', async ({ page }) => {
    // Skip test if auth bypass is not enabled
    test.skip(!isAuthBypassEnabled(), 'Auth bypass not enabled - set E2E_AUTH_BYPASS=true');

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

    // Verify user-specific content is displayed
    await expect(page.locator('body')).toContainText('User');

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
    await expect(page.getByTestId('sign-in-button')).toBeVisible({ timeout: 10000 });

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
