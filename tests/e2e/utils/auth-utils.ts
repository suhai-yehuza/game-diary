import type { Page } from '@playwright/test';

// Type definitions for Clerk mocks
interface ClerkMock {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl: string;
  };
  session: {
    id: string;
    token: string;
  };
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
  load: () => Promise<void>;
  mountSignIn: () => Promise<void>;
  mountSignUp: () => Promise<void>;
  openSignIn: () => Promise<void>;
  openSignUp: () => Promise<void>;
  addListener: () => () => {};
  removeListener: () => {};
}

interface ClerkMocks {
  Clerk: ClerkMock;
}

declare global {
  interface Window {
    Clerk: ClerkMock;
    __CLERK_MOCKS__: ClerkMocks;
  }
}

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
    const mockComponents = {
      Clerk: {
        isLoaded: true,
        isSignedIn: true,
        user: {
          id: 'test_user_123',
          firstName: 'Test',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          imageUrl: 'https://example.com/avatar.jpg',
        },
        session: {
          id: 'test_session_123',
          token: 'test_token_123',
        },
        signOut: () => Promise.resolve(),
        getToken: () => Promise.resolve('test_token_123'),
        load: () => Promise.resolve(),
        mountSignIn: () => Promise.resolve(),
        mountSignUp: () => Promise.resolve(),
        openSignIn: () => Promise.resolve(),
        openSignUp: () => Promise.resolve(),
        addListener: () => () => {},
        removeListener: () => {},
      },
    };

    // Export the components
    Object.assign(window, mockComponents);
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
    return window.Clerk?.isSignedIn === true;
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
