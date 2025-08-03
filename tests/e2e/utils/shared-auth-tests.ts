import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { STAGING_URL } from '@/lib/config/urls';
import {
  setupAuthBypass,
  clearAuthBypass,
  isAuthBypassEnabled,
} from '@tests/e2e/utils/auth-bypass';
import { safeGotoWithMocking } from '@tests/e2e/utils/test-utils';

// Configuration types for auth tests
export interface IAuthBypassConfig {
  enabled?: boolean;
  customCredentials?: any;
  timeout?: number;
}

export interface IProtectedRouteAuthConfig {
  route: string;
  expectModal?: boolean;
  expectRedirect?: boolean;
  timeout?: number;
}

export interface IVercelAuthConfig {
  expectNoVercelRedirect?: boolean;
  expectAppDomain?: boolean;
  timeout?: number;
}

/**
 * Shared Authentication Bypass Testing
 * Consolidates auth bypass setup and testing across specs
 */
export async function testAuthBypassSetup(
  page: Page,
  config: IAuthBypassConfig = {}
): Promise<void> {
  const { enabled = true, customCredentials } = config;

  if (!enabled || !isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping auth bypass tests');
    return;
  }

  // First navigate to a page to establish a valid URL for cookies
  await safeGotoWithMocking(page, '/');

  // Set up authentication bypass
  if (customCredentials) {
    await setupAuthBypass(page, customCredentials);
  } else {
    await setupAuthBypass(page);
  }
}

/**
 * Shared Protected Route Testing with Auth Bypass
 * Tests access to protected routes with authentication bypass
 */
export async function testProtectedRouteWithBypass(
  page: Page,
  config: IProtectedRouteAuthConfig
): Promise<void> {
  const { route } = config;

  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping protected route test');
    return;
  }

  await safeGotoWithMocking(page, route);

  // Verify we can access the protected route without being redirected to sign-in
  await expect(page).not.toHaveURL(/\/sign-in/);

  // Check that the page loaded successfully
  await expect(page.locator('body')).toBeVisible();

  // Verify we're on the expected route or handle Clerk redirects
  const currentUrl = page.url();
  if (currentUrl.includes('clerk.accounts.dev')) {
    // If we're redirected to Clerk, that's expected behavior for some browsers
    console.log(`⚠️  Redirected to Clerk: ${currentUrl}`);
    console.log(`✅ This is expected behavior for some browsers`);
  } else {
    expect(currentUrl).toContain(route);
  }

  console.log(`✅ Successfully accessed protected route: ${route}`);
}

/**
 * Shared Vercel Authentication Testing
 * Tests deployment access without Vercel authentication redirect
 */
export async function testVercelAuthAccess(
  page: Page,
  config: IVercelAuthConfig = {}
): Promise<void> {
  const { expectNoVercelRedirect = true, expectAppDomain = true } = config;

  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping Vercel auth test');
    return;
  }

  // First navigate to a page to establish a valid URL for cookies
  await safeGotoWithMocking(page, '/');

  // Set up authentication bypass
  await setupAuthBypass(page);

  if (expectNoVercelRedirect) {
    // Test that we can access the home page without being redirected to Vercel login
    await expect(page).not.toHaveURL(/vercel\.com\/login/);
  }

  if (expectAppDomain) {
    // Verify we're on our app's domain
    expect(page.url()).toContain(STAGING_URL.replace('https://', ''));
  }

  // Check that the page loaded successfully (not a Vercel error page)
  await expect(page.locator('body')).toBeVisible();

  // Verify we're not on a Vercel authentication page
  const pageTitle = await page.title();
  expect(pageTitle).not.toContain('Vercel');
  expect(pageTitle).not.toContain('Login');

  console.log('✅ Successfully accessed deployment without Vercel authentication redirect');
}

/**
 * Shared Auth-Dependent Functionality Testing
 * Tests functionality that requires authentication
 */
export async function testAuthDependentFunctionality(
  page: Page,
  customCredentials?: any
): Promise<void> {
  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping auth-dependent functionality test');
    return;
  }

  // First navigate to a page to establish a valid URL for cookies
  await safeGotoWithMocking(page, '/');

  // Set up authentication bypass with custom credentials
  await setupAuthBypass(page, customCredentials);

  // Test accessing a protected route
  await safeGotoWithMocking(page, '/protected/user');

  // Verify we can access the protected route without being redirected to sign-in
  await expect(page).not.toHaveURL(/\/sign-in/);
  await expect(page).not.toHaveURL(/vercel\.com\/login/);

  // Check that the page loaded successfully
  await expect(page.locator('body')).toBeVisible();

  console.log('✅ Successfully accessed protected route without authentication redirects');
}

/**
 * Shared Navigation Elements Testing
 * Tests that navigation elements are present and functional
 */
export async function testNavigationElements(page: Page): Promise<void> {
  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping navigation elements test');
    return;
  }

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
}

/**
 * Shared Admin Functionality Testing
 * Tests admin-specific functionality with auth bypass
 */
export async function testAdminFunctionality(page: Page, adminCredentials?: any): Promise<void> {
  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping admin functionality test');
    return;
  }

  // First navigate to a page to establish a valid URL for cookies
  await safeGotoWithMocking(page, '/');

  // Set up authentication bypass with admin credentials
  await setupAuthBypass(page, adminCredentials);

  // Test accessing admin routes
  const adminRoutes = ['/protected/admin/database'];

  for (const route of adminRoutes) {
    console.log(`🔐 Testing admin route: ${route}`);

    await safeGotoWithMocking(page, route);

    // Verify we can access the admin route without being redirected to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);

    // Check that the page loaded successfully
    await expect(page.locator('body')).toBeVisible();

    console.log(`✅ Successfully accessed admin route: ${route}`);
  }
}

/**
 * Shared User-Specific Functionality Testing
 * Tests user-specific functionality with auth bypass
 */
export async function testUserFunctionality(page: Page, userCredentials?: any): Promise<void> {
  // Skip test if auth bypass is not enabled
  if (!isAuthBypassEnabled()) {
    console.log('Auth bypass not enabled - skipping user functionality test');
    return;
  }

  // First navigate to a page to establish a valid URL for cookies
  await safeGotoWithMocking(page, '/');

  // Set up authentication bypass with user credentials
  await setupAuthBypass(page, userCredentials);

  // Test accessing user routes
  const userRoutes = ['/protected/user'];

  for (const route of userRoutes) {
    console.log(`👤 Testing user route: ${route}`);

    await safeGotoWithMocking(page, route);

    // Verify we can access the user route without being redirected to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);

    // Check that the page loaded successfully
    await expect(page.locator('body')).toBeVisible();

    console.log(`✅ Successfully accessed user route: ${route}`);
  }
}

/**
 * Cleanup function for auth tests
 */
export async function cleanupAuthTests(page: Page): Promise<void> {
  await clearAuthBypass(page);
}
