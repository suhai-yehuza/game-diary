import type { ConsoleMessage } from '@playwright/test';
import { test } from '@playwright/test';

import {
  testAuthBypassSetup,
  testProtectedRouteWithBypass,
  testAuthDependentFunctionality,
  testAdminFunctionality,
  testUserFunctionality,
  cleanupAuthTests,
} from '@tests/e2e/utils/shared-auth-tests';
import { setupE2EMocking, clearTestData } from '@tests/e2e/utils/test-utils';

test.describe('Authentication Bypass Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await setupE2EMocking(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupAuthTests(page);
  });

  test('should access protected routes with auth bypass enabled', async ({ page, browserName }) => {
    // Skip in Firefox by default; allow override with E2E_FIREFOX=1
    test.skip(
      browserName === 'firefox' && process.env.E2E_FIREFOX !== '1',
      'Clerk dev browser handshake not supported in Firefox E2E (override with E2E_FIREFOX=1)'
    );

    // Set up auth bypass
    await testAuthBypassSetup(page, { enabled: true });

    // Test accessing protected routes
    const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin/database'];

    for (const route of protectedRoutes) {
      await testProtectedRouteWithBypass(page, {
        route,
        expectModal: false,
        expectRedirect: false,
      });
    }
  });

  test('should test auth-dependent functionality with bypass', async ({ page }) => {
    // Capture browser console errors and warnings
    let clientError: string | null = null;
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[browser ${msg.type()}]`, msg.text());
        // Ignore Clerk development key warnings and API errors as they're not real errors
        if (
          !clientError &&
          !msg.text().includes('Clerk has been loaded with development keys') &&
          !msg
            .text()
            .includes('Failed to load resource: the server responded with a status of 401') &&
          !msg
            .text()
            .includes('Failed to load resource: the server responded with a status of 400') &&
          !msg.text().includes('ClerkJS: Network error') &&
          !msg.text().includes('unreachable code after return statement') &&
          !msg.text().includes('Loading failed for the <script> with source') &&
          !msg.text().includes('Clerk: Failed to load Clerk')
        ) {
          clientError = msg.text();
        }
      }
    });

    // Set up auth bypass with custom credentials
    const customCredentials = {
      id: 'user_test_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.jpg',
      hasImage: true,
      profileImageUrl: 'https://example.com/profile.jpg',
      primaryEmailAddressId: 'email_test_123',
      primaryPhoneNumberId: '',
      emailAddress: 'test@example.com',
      phoneNumber: null,
      externalId: '',
      lastActiveAt: new Date().toISOString(),
      lastSignInAt: null,
      bio: null,
      timezone: null,
      preferredLanguage: 'en',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await testAuthBypassSetup(page, {
      enabled: true,
      customCredentials,
    });

    // Test auth-dependent functionality
    await testAuthDependentFunctionality(page, customCredentials);

    if (clientError) {
      throw new Error(`Client-side error detected: ${String(clientError)}`);
    }
  });

  test('should test admin functionality with bypass', async ({ page }) => {
    // Set up auth bypass with admin credentials
    const adminCredentials = {
      id: 'admin_test_123',
      email: 'admin@example.com',
      username: 'adminuser',
      firstName: 'Admin',
      lastName: 'User',
      imageUrl: 'https://example.com/admin-avatar.jpg',
      hasImage: true,
      profileImageUrl: 'https://example.com/admin-profile.jpg',
      primaryEmailAddressId: 'email_admin_123',
      primaryPhoneNumberId: '',
      emailAddress: 'admin@example.com',
      phoneNumber: null,
      externalId: '',
      lastActiveAt: new Date().toISOString(),
      lastSignInAt: null,
      bio: null,
      timezone: null,
      preferredLanguage: 'en',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await testAuthBypassSetup(page, {
      enabled: true,
      customCredentials: adminCredentials,
    });

    // Test admin functionality
    await testAdminFunctionality(page, adminCredentials);
  });

  test('should test user functionality with bypass', async ({ page }) => {
    // Set up auth bypass with user credentials
    const userCredentials = {
      id: 'user_test_456',
      email: 'user@example.com',
      username: 'regularuser',
      firstName: 'Regular',
      lastName: 'User',
      imageUrl: 'https://example.com/user-avatar.jpg',
      hasImage: true,
      profileImageUrl: 'https://example.com/user-profile.jpg',
      primaryEmailAddressId: 'email_user_456',
      primaryPhoneNumberId: '',
      emailAddress: 'user@example.com',
      phoneNumber: null,
      externalId: '',
      lastActiveAt: new Date().toISOString(),
      lastSignInAt: null,
      bio: null,
      timezone: null,
      preferredLanguage: 'en',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await testAuthBypassSetup(page, {
      enabled: true,
      customCredentials: userCredentials,
    });

    // Test user functionality
    await testUserFunctionality(page, userCredentials);
  });

  test('should handle multiple user sessions with bypass', async ({ page }) => {
    // Test with different user credentials
    const credentials = {
      id: 'user_multi_123',
      email: 'multi@example.com',
      username: 'multiuser',
      firstName: 'Multi',
      lastName: 'User',
      imageUrl: 'https://example.com/multi-avatar.jpg',
      hasImage: true,
      profileImageUrl: 'https://example.com/multi-profile.jpg',
      primaryEmailAddressId: 'email_multi_123',
      primaryPhoneNumberId: '',
      emailAddress: 'multi@example.com',
      phoneNumber: null,
      externalId: '',
      lastActiveAt: new Date().toISOString(),
      lastSignInAt: null,
      bio: null,
      timezone: null,
      preferredLanguage: 'en',
      inboundFriendshipIds: [],
      outboundFriendshipIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await testAuthBypassSetup(page, {
      enabled: true,
      customCredentials: credentials,
    });

    // Test accessing user routes
    await testProtectedRouteWithBypass(page, {
      route: '/protected/user',
      expectModal: false,
      expectRedirect: false,
    });
  });
});
