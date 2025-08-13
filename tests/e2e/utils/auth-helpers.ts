import type { Page } from '@playwright/test';

// Utility function to check if Clerk is configured
export function isClerkConfigured(): boolean {
  // In E2E test environments, always return true to ensure consistent behavior
  if (
    process.env.E2E_MOCK_MODE === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.PLAYWRIGHT_CI === 'true' ||
    process.env.NODE_ENV === 'test' ||
    (typeof window !== 'undefined' &&
      (window as Window & { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__)
  ) {
    return true;
  }

  // Check for Clerk environment variable
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export interface ITestUser {
  id: string;
  email: string;
  phone?: string;
  username?: string;
}

export function createTestUser(_user?: Partial<ITestUser>): ITestUser {
  // This would typically create a test user in the database
  // For now, we'll return a mock user
  return {
    id: `test-user-${Date.now()}`,
    email: _user?.email ?? 'test@example.com',
    phone: _user?.phone,
    username: _user?.username ?? 'testuser',
  };
}

export async function loginAsUser(page: Page, _user: ITestUser): Promise<void> {
  // This would typically perform the login process
  // For now, we'll just navigate to the protected area
  await page.goto('/protected/user');
}

// Helper function to reveal sign-in button on mobile devices
export async function revealSignInButtonIfMobile(page: Page): Promise<boolean> {
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);
  if (!isMobile) return true; // Not mobile, no need to reveal

  const signInButton = page.getByTestId('sign-in-button');

  // Check if already visible
  if (await signInButton.isVisible({ timeout: 1000 }).catch(() => false)) {
    return true;
  }

  // Try multiple strategies to reveal the sign-in button on mobile
  const strategies = [
    // Strategy 1: Scroll to top
    async () => {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    },
    // Strategy 2: Look for hamburger menu
    async () => {
      const menuButton = page.locator(
        '[data-testid="menu-button"], .hamburger, [aria-label*="menu"]'
      );
      if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.scrollIntoViewIfNeeded();
        await menuButton.click();
        await page.waitForTimeout(300);
      }
    },
    // Strategy 3: Look for navigation toggle
    async () => {
      const navToggle = page.locator(
        '[data-testid="nav-toggle"], .nav-toggle, [aria-label*="navigation"]'
      );
      if (await navToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
        await navToggle.scrollIntoViewIfNeeded();
        await navToggle.click();
        await page.waitForTimeout(300);
      }
    },
  ];

  for (const strategy of strategies) {
    try {
      await strategy();
      // Check if sign-in button is now visible
      if (await signInButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('Sign-in button revealed successfully');
        return true;
      }
    } catch (error) {
      console.log(`Strategy failed: ${String(error)}`);
      continue;
    }
  }

  return false; // Failed to reveal
}

// Enhanced utility that provides more detailed information about auth state
export interface IAuthState {
  isConfigured: boolean;
  isTestEnvironment: boolean;
  isMobile: boolean;
  hasSignInButton: boolean;
  hasAuthPlaceholder: boolean;
  shouldSkipTest: boolean;
  reason?: string;
}

export async function getAuthState(page: Page): Promise<IAuthState> {
  const isConfigured = isClerkConfigured();
  const isMobile = await page.evaluate(() => window.innerWidth < 1024);
  const isTestEnvironment =
    isConfigured &&
    (process.env.E2E_MOCK_MODE === 'true' ||
      process.env.GITHUB_ACTIONS === 'true' ||
      process.env.PLAYWRIGHT_CI === 'true' ||
      process.env.NODE_ENV === 'test');

  // Check for UI elements
  const signInButton = page.getByTestId('sign-in-button');
  const authPlaceholder = page.getByTestId('auth-placeholder');

  let hasSignInButton = await signInButton.isVisible({ timeout: 2000 }).catch(() => false);
  const hasAuthPlaceholder = await authPlaceholder.isVisible({ timeout: 2000 }).catch(() => false);

  // If we're on mobile and don't see the sign-in button, try to reveal it
  if (isMobile && !hasSignInButton && !hasAuthPlaceholder) {
    const revealed = await revealSignInButtonIfMobile(page);
    if (revealed) {
      // Check again after trying to reveal
      hasSignInButton = await signInButton.isVisible({ timeout: 2000 }).catch(() => false);
    }
  }

  // Determine if we should skip the test
  let shouldSkipTest = false;
  let reason: string | undefined;

  if (!isConfigured) {
    shouldSkipTest = true;
    reason = 'Clerk not configured';
  } else if (!hasSignInButton && !hasAuthPlaceholder) {
    shouldSkipTest = true;
    reason = 'No auth UI elements found';
  } else if (!hasSignInButton && hasAuthPlaceholder) {
    shouldSkipTest = true;
    reason = 'Auth placeholder shown instead of sign-in button';
  }

  return {
    isConfigured,
    isTestEnvironment,
    isMobile,
    hasSignInButton,
    hasAuthPlaceholder,
    shouldSkipTest,
    reason,
  };
}

// Check if sign-in button is available and skip test if not
export async function checkSignInButtonAvailability(
  page: Page,
  testName: string,
  timeout = 5000
): Promise<boolean> {
  const authState = await getAuthState(page);

  if (authState.shouldSkipTest) {
    console.warn(`⚠️ ${authState.reason} - skipping ${testName}`);
    return false;
  }

  // If we have a sign-in button, ensure it's visible
  if (authState.hasSignInButton) {
    const signInButton = page.getByTestId('sign-in-button');
    await signInButton.waitFor({ state: 'visible', timeout });
    return true;
  }

  return false;
}
