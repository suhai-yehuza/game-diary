import type { Page } from '@playwright/test';

import { STAGING_URL } from '@/lib/config/urls';

/**
 * Authentication bypass utilities for deployment testing
 */

export interface TestAuthCredentials {
  email: string;
  password: string;
  userId: string;
  sessionToken: string;
}

// Default test credentials (you can override these with environment variables)
export const DEFAULT_TEST_CREDENTIALS: TestAuthCredentials = {
  email: 'test@game-diary.com',
  password: 'TestPassword123!',
  userId: 'test_user_123',
  sessionToken: 'test_session_token_123',
};

/**
 * Inject a mock for Clerk's useUser and useAuth hooks when bypass is active
 */
export async function mockClerkHooks(page: Page, credentials: Partial<TestAuthCredentials> = {}) {
  const testCreds = { ...DEFAULT_TEST_CREDENTIALS, ...credentials };
  await page.addInitScript(
    ({ userId, email }) => {
      // @ts-ignore
      window.__E2E_AUTH_BYPASS__ = true;
      // Mock Clerk's useUser and useAuth
      const mockUser = {
        id: userId,
        emailAddresses: [
          { emailAddress: email, id: 'email_123', verification: { status: 'verified' } },
        ],
        primaryEmailAddress: {
          emailAddress: email,
          id: 'email_123',
          verification: { status: 'verified' },
        },
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        fullName: 'Test User',
        imageUrl: '',
        createdAt: new Date().toISOString(),
        lastSignInAt: new Date().toISOString(),
      };
      // @ts-ignore
      window.__clerkMock = {
        useUser: () => ({ isLoaded: true, isSignedIn: true, user: mockUser }),
        useAuth: () => ({ getToken: async () => 'test_token', sessionId: 'test_session', userId }),
      };
    },
    { userId: testCreds.userId, email: testCreds.email }
  );
}

/**
 * Set up authentication bypass for deployment testing
 * This mocks Clerk authentication endpoints to simulate a logged-in user
 */
export async function setupAuthBypass(
  page: Page,
  credentials?: Partial<TestAuthCredentials>
): Promise<void> {
  const testCreds = { ...DEFAULT_TEST_CREDENTIALS, ...credentials };

  console.log('🔐 Setting up authentication bypass for deployment testing...');

  // Mock Clerk authentication endpoints
  await page.route('**/v1/sessions/**', async route => {
    console.log(`🔐 Mocking Clerk session endpoint: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: testCreds.sessionToken,
        user_id: testCreds.userId,
        status: 'active',
        last_active_at: new Date().toISOString(),
      }),
    });
  });

  // Mock Clerk user endpoints
  await page.route('**/v1/users/**', async route => {
    console.log(`🔐 Mocking Clerk user endpoint: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: testCreds.userId,
        email_addresses: [{ email_address: testCreds.email, id: 'email_123' }],
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  });

  // Mock Clerk sign-in endpoints
  await page.route('**/v1/sign_in/**', async route => {
    console.log(`🔐 Mocking Clerk sign-in endpoint: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: testCreds.sessionToken,
        user_id: testCreds.userId,
        status: 'active',
        created_at: new Date().toISOString(),
      }),
    });
  });

  // Mock Clerk API endpoints
  await page.route('**/v1/me', async route => {
    console.log(`🔐 Mocking Clerk me endpoint: ${route.request().url()}`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: testCreds.userId,
        email_addresses: [{ email_address: testCreds.email, id: 'email_123' }],
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
  });

  // Inject Clerk hook mocks for client-side
  await mockClerkHooks(page, testCreds);

  // Set authentication cookies to simulate logged-in state
  // First, ensure we have a valid URL to set cookies for
  const currentUrl = page.url();
  const baseUrl = currentUrl || STAGING_URL;
  const url = new URL(baseUrl);

  try {
    await page.context().addCookies([
      {
        name: '__session',
        value: testCreds.sessionToken,
        domain: url.hostname,
        path: '/',
        httpOnly: true,
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
      },
      {
        name: '__client_uat',
        value: new Date().toISOString(),
        domain: url.hostname,
        path: '/',
        httpOnly: false,
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
      },
      // Add additional Clerk cookies that might be needed
      {
        name: '__clerk_db_jwt',
        value: testCreds.sessionToken,
        domain: url.hostname,
        path: '/',
        httpOnly: false,
        secure: url.protocol === 'https:',
        sameSite: 'Lax',
      },
    ]);
    console.log('✅ Authentication cookies set successfully');
  } catch (error) {
    console.warn('⚠️ Could not set authentication cookies:', error);
    console.log('🔐 Continuing with endpoint mocking only...');
  }

  console.log('✅ Authentication bypass setup complete');
}

/**
 * Remove authentication bypass and clear auth state
 */
export async function clearAuthBypass(page: Page): Promise<void> {
  console.log('🔐 Clearing authentication bypass...');

  // Clear authentication cookies
  await page.context().clearCookies();

  // Unroute all authentication endpoints
  await page.unroute('**/v1/sessions/**');
  await page.unroute('**/v1/users/**');
  await page.unroute('**/v1/sign_in/**');
  await page.unroute('**/v1/me');

  console.log('✅ Authentication bypass cleared');
}

/**
 * Check if authentication bypass is enabled via environment variables
 */
export function isAuthBypassEnabled(): boolean {
  return (
    process.env.E2E_AUTH_BYPASS === 'true' ||
    process.env.TEST_AUTH_BYPASS === 'true' ||
    process.env.DEPLOYMENT_TEST_MODE === 'true'
  );
}

/**
 * Get test credentials from environment variables or use defaults
 */
export function getTestCredentials(): TestAuthCredentials {
  return {
    email: process.env.TEST_USER_EMAIL || DEFAULT_TEST_CREDENTIALS.email,
    password: process.env.TEST_USER_PASSWORD || DEFAULT_TEST_CREDENTIALS.password,
    userId: process.env.TEST_USER_ID || DEFAULT_TEST_CREDENTIALS.userId,
    sessionToken: process.env.TEST_SESSION_TOKEN || DEFAULT_TEST_CREDENTIALS.sessionToken,
  };
}
