import type { Page } from '@playwright/test';

import type { IClerkMock, IExtendedWindow } from '@src/lib/types';

// Test user data - matches your database schema
export const TEST_USER = {
  id: 'test_user_123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  imageUrl: 'https://example.com/avatar.jpg',
};

/**
 * Mock Clerk authentication to return our test user
 */
export async function mockClerkAuth(page: Page) {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = request.url();

    // Block external requests
    if (!url.startsWith('http://localhost')) {
      await route.abort();
      return;
    }

    await route.continue();
  });

  await page.addInitScript(() => {
    const mockClerk: IClerkMock = {
      isLoaded: true,
      isSignedIn: true,
      user: {
        id: 'test-user-id',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        imageUrl: 'https://test.com/avatar.jpg',
      },
      session: {
        id: 'test_session_123',
        token: 'test_token_123',
      },
      signOut: () => Promise.resolve(),
      getToken: () => Promise.resolve('test_token_123'),
    };

    // Export the components
    (window as IExtendedWindow).Clerk = mockClerk;
  });
}

/**
 * Setup authenticated state for testing
 */
export async function setupTestAuth(page: Page) {
  await mockClerkAuth(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Verify user is authenticated in the UI
 */
export async function verifyAuthenticated(page: Page) {
  const isAuthenticated = await page.evaluate(() => {
    return (window as IExtendedWindow).Clerk?.isSignedIn === true;
  });

  if (!isAuthenticated) {
    throw new Error('User is not authenticated');
  }
}

/**
 * Complete authentication setup for E2E tests
 */
export async function authenticateForE2E(page: Page) {
  await setupTestAuth(page);
  await verifyAuthenticated(page);
}
