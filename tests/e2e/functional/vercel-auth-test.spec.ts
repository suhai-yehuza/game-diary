import { test } from '@playwright/test';

import {
  testVercelAuthAccess,
  testAuthDependentFunctionality,
  testNavigationElements,
  cleanupAuthTests,
} from '@tests/e2e/utils/shared-auth-tests';
import { setupE2EMocking } from '@tests/e2e/utils/test-utils';

test.describe('Vercel Authentication Test', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocking(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupAuthTests(page);
  });

  test('should access deployment without Vercel authentication redirect', async ({ page }) => {
    await testVercelAuthAccess(page, {
      expectNoVercelRedirect: true,
      expectAppDomain: true,
    });
  });

  test('should be able to navigate to protected routes', async ({ page }) => {
    await testAuthDependentFunctionality(page);
  });

  test('should find navigation elements on the page', async ({ page }) => {
    await testNavigationElements(page);
  });
});
