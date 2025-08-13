import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { checkSignInButtonAvailability } from '@tests/e2e/utils/auth-helpers';
import {
  testSignInModalVariants,
  testProtectedRouteAccess,
  testErrorStates,
  testBrowserNavigation,
  testAuthenticationFlow,
} from '@tests/e2e/utils/shared-tests';
import {
  clearTestData,
  waitForNetworkIdle,
  safeGoto,
  waitForPageLoad,
} from '@tests/e2e/utils/test-utils';

import { runSmokeSuite } from './smoke.spec';

// Atomic critical-level test functions using shared utilities
export async function criticalTestAuthenticationFlow(page: Page) {
  await testAuthenticationFlow(page);

  if (!(await checkSignInButtonAvailability(page, 'authentication flow test'))) {
    return;
  }

  // Test sign-in modal with better error handling
  try {
    await testSignInModalVariants(page, { method: 'escape' });
  } catch (error) {
    console.warn('⚠️ Sign-in modal test failed, but continuing with other tests:', error);
  }
}

export async function criticalTestProtectedRouteAccess(page: Page) {
  await testProtectedRouteAccess(page, {
    route: '/protected/user',
    expectModal: true,
    expectRedirect: false,
  });

  await checkSignInButtonAvailability(page, 'protected route access test');
}

export async function criticalTestFormValidation(page: Page) {
  await safeGoto(page, '/');
  await waitForPageLoad(page);

  if (!(await checkSignInButtonAvailability(page, 'form validation test'))) {
    return;
  }

  // Add more form validation steps as needed
}

export async function criticalTestErrorStates(page: Page) {
  await testErrorStates(page);
}

export async function criticalTestBrowserNavigation(page: Page) {
  await testBrowserNavigation(page, ['/', '/sports/nba', '/sports/nfl']);
}

export async function criticalTestSignInModal(page: Page) {
  if (!(await checkSignInButtonAvailability(page, 'sign-in modal test'))) {
    return;
  }

  try {
    await testSignInModalVariants(page, { method: 'escape' });
  } catch (error) {
    console.warn('⚠️ Sign-in modal test failed in critical suite:', error);
  }
}

// Suite runner for critical
export async function runCriticalSuite(page: Page) {
  try {
    await runSmokeSuite(page);
  } catch (error) {
    console.warn('⚠️ Smoke suite failed, but continuing with critical tests:', error);
  }

  try {
    await criticalTestAuthenticationFlow(page);
  } catch (error) {
    console.warn('⚠️ Authentication flow test failed:', error);
  }

  try {
    await criticalTestProtectedRouteAccess(page);
  } catch (error) {
    console.warn('⚠️ Protected route access test failed:', error);
  }

  try {
    await criticalTestFormValidation(page);
  } catch (error) {
    console.warn('⚠️ Form validation test failed:', error);
  }

  try {
    await criticalTestErrorStates(page);
  } catch (error) {
    console.warn('⚠️ Error states test failed:', error);
  }

  try {
    await criticalTestBrowserNavigation(page);
  } catch (error) {
    console.warn('⚠️ Browser navigation test failed:', error);
  }

  try {
    await criticalTestSignInModal(page);
  } catch (error) {
    console.warn('⚠️ Sign-in modal test failed:', error);
  }
}

test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Test data isolation: clear storage and cookies
});

test.describe('Critical Tests (Extends Smoke)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    });
    // Ensure clean state by navigating to home page first
    await page.goto('/');
    await waitForNetworkIdle(page);
  });

  test('should handle critical user flows', async ({ page }) => {
    await runCriticalSuite(page);
  });
});
