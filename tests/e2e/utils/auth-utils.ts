import { type Page } from '@playwright/test';

// Type definitions for Clerk mocks
interface ClerkMock {
  user: typeof TEST_USER;
  session: {
    id: string;
    userId: string;
    status: 'active' | 'inactive';
  };
  isLoaded: () => boolean;
  isSignedIn: () => boolean;
  signOut: () => Promise<void>;
  organization: null;
  sessionId: string;
  userId: string;
  getToken: () => Promise<string>;
}

interface ClerkMocks {
  useUser: () => {
    user: typeof TEST_USER;
    isLoaded: boolean;
    isSignedIn: boolean;
  };
  useAuth: () => {
    userId: string;
    sessionId: string;
    isLoaded: boolean;
    isSignedIn: boolean;
    getToken: () => Promise<string>;
    signOut: () => Promise<void>;
  };
  useSession: () => {
    session: {
      id: string;
      userId: string;
      status: 'active' | 'inactive';
    };
    isLoaded: boolean;
  };
}

declare global {
  interface Window {
    Clerk: ClerkMock;
    __CLERK_MOCKS: ClerkMocks;
  }
}

// Test user data - matches your database schema
export const TEST_USER = {
  id: 'test_user_e2e_123456789',
  username: 'e2e-test-user',
  firstName: 'E2E',
  lastName: 'TestUser',
  emailAddress: 'e2e-test@gameapp.test',
  imageUrl: 'https://example.com/test-avatar.png',
  inboundFriendshipIds: [],
  outboundFriendshipIds: [],
  banned: false,
  last_sign_in_at: new Date(),
  password_enabled: false,
  two_factor_enabled: false,
  email_verified: true,
  email_verification_strategy: 'test',
  external_id: null,
  external_accounts: [],
  primary_email_address_id: 'test_email_123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as const;

/**
 * Mock Clerk authentication to return our test user
 */
export async function mockClerkAuth(page: Page) {
  // Block external Clerk requests completely for Mobile Safari
  await page.route('**/clerk.accounts.dev/**', route => {
    const url = route.request().url();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: TEST_USER,
        session: { id: 'test_session_123', userId: TEST_USER.id },
        response: { sessions: [{ id: 'test_session_123', userId: TEST_USER.id }] },
      }),
    });
  });

  // Mock Clerk's client-side authentication
  await page.addInitScript(testUser => {
    // Mock window.Clerk
    window.Clerk = {
      user: testUser,
      session: {
        id: 'test_session_123',
        userId: testUser.id,
        status: 'active',
      },
      isLoaded: () => {
        return true;
      },
      isSignedIn: () => {
        return true;
      },
      signOut: () => {
        return Promise.resolve();
      },
      organization: null,
      sessionId: 'test_session_123',
      userId: testUser.id,
      getToken: () => {
        return Promise.resolve('test_token_123');
      },
    };

    // Mock React hooks
    window.__CLERK_MOCKS = {
      useUser: () => {
        return {
          user: testUser,
          isLoaded: true,
          isSignedIn: true,
        };
      },
      useAuth: () => {
        return {
          userId: testUser.id,
          sessionId: 'test_session_123',
          isLoaded: true,
          isSignedIn: true,
          getToken: () => Promise.resolve('test_token_123'),
          signOut: () => Promise.resolve(),
        };
      },
      useSession: () => {
        return {
          session: {
            id: 'test_session_123',
            userId: testUser.id,
            status: 'active',
          },
          isLoaded: true,
        };
      },
    };
  }, TEST_USER);

  // Block Clerk JavaScript files
  await page.route('**/@clerk/clerk-react/**', route => {
    const url = route.request().url();
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        // Mock Clerk React implementation
        const mockClerk = {
          user: ${JSON.stringify(TEST_USER)},
          session: {
            id: 'test_session_123',
            userId: '${TEST_USER.id}',
            status: 'active'
          },
          isLoaded: () => true,
          isSignedIn: () => true,
          signOut: () => Promise.resolve(),
          organization: null,
          sessionId: 'test_session_123',
          userId: '${TEST_USER.id}',
          getToken: () => Promise.resolve('test_token_123')
        };

        // Mock React hooks
        const mockHooks = {
          useUser: () => ({
            user: ${JSON.stringify(TEST_USER)},
            isLoaded: true,
            isSignedIn: true
          }),
          useAuth: () => ({
            userId: '${TEST_USER.id}',
            sessionId: 'test_session_123',
            isLoaded: true,
            isSignedIn: true,
            getToken: () => Promise.resolve('test_token_123'),
            signOut: () => Promise.resolve()
          }),
          useSession: () => ({
            session: {
              id: 'test_session_123',
              userId: '${TEST_USER.id}',
              status: 'active'
            },
            isLoaded: true
          })
        };

        // Export the mocks
        window.Clerk = mockClerk;
        window.__CLERK_MOCKS = mockHooks;
        
        // Mock the Clerk React components
        const mockComponents = {
          ClerkProvider: ({ children }) => children,
          SignedIn: ({ children }) => children,
          SignedOut: ({ children }) => children,
          UserButton: () => null,
          SignIn: () => null,
          SignUp: () => null
        };

        // Export the components
        Object.assign(window, mockComponents);
      `
    });
  });

  // Block Clerk JS files
  await page.route('**/@clerk/clerk-js/**', route => {
    const url = route.request().url();
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        // Mock Clerk JS implementation
        window.Clerk = {
          user: ${JSON.stringify(TEST_USER)},
          session: {
            id: 'test_session_123',
            userId: '${TEST_USER.id}',
            status: 'active'
          },
          isLoaded: () => true,
          isSignedIn: () => true,
          signOut: () => Promise.resolve(),
          organization: null,
          sessionId: 'test_session_123',
          userId: '${TEST_USER.id}',
          getToken: () => Promise.resolve('test_token_123')
        };
      `
    });
  });

  // Mock JWT token validation
  await page.route('**/api/auth/**', route => {
    const url = route.request().url();
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: TEST_USER,
        session: { id: 'test_session_123', userId: TEST_USER.id },
      }),
    });
  });
}

/**
 * Setup authenticated state for testing
 */
export async function setupTestAuth(page: Page) {
  await mockClerkAuth(page);

  // Set authentication cookies/localStorage
  await page.addInitScript(() => {
    localStorage.setItem(
      'clerk-session',
      JSON.stringify({
        id: 'test_session_123',
        userId: 'test_user_e2e_123456789',
        status: 'active',
      })
    );

    // Mock authentication state
    localStorage.setItem(
      'clerk-user',
      JSON.stringify({
        id: 'test_user_e2e_123456789',
        firstName: 'E2E',
        lastName: 'TestUser',
        emailAddresses: [
          {
            emailAddress: 'e2e-test@gameapp.test',
          },
        ],
      })
    );
  });
}

/**
 * Verify user is authenticated in the UI
 */
export async function verifyAuthenticated(page: Page) {
  // Look for authenticated user indicators
  const authIndicators = [
    page.locator('text=E2E TestUser'),
    page.locator('text=e2e-test@gameapp.test'),
    page.locator('[data-testid="user-menu"]'),
    page.locator('[data-testid="authenticated-content"]'),
  ];

  // Check if any authentication indicator is visible
  let isAuthenticated = false;
  for (const indicator of authIndicators) {
    try {
      await indicator.waitFor({ timeout: 2000 });
      isAuthenticated = true;
      break;
    } catch {
      // Continue checking other indicators
    }
  }

  if (!isAuthenticated) {
    const bodyText = await page.textContent('body');
  }

  return isAuthenticated;
}

/**
 * Complete authentication setup for E2E tests
 */
export async function authenticateForE2E(page: Page) {
  await setupTestAuth(page);

  // Additional verification can be added here
  return TEST_USER;
}
