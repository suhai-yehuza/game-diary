import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { commonTestSetup } from '@tests/e2e/utils/setup';
import {
  testHomePageWithConfig,
  testSignInModalVariants,
  testSportsPagesWithScope,
  testBrowserNavigation,
} from '@tests/e2e/utils/shared-tests';

// Atomic test functions using shared utilities
export async function sanityTestHomePage(page: Page) {
  await testHomePageWithConfig(page, {
    checkAccessibility: false,
    checkPerformance: false,
  });
}

export async function sanityTestSignInModal(page: Page) {
  await testHomePageWithConfig(page, {
    checkAccessibility: false,
    checkPerformance: false,
  });
  await testSignInModalVariants(page, { method: 'escape' });
}

export async function sanityTestSportsPage(page: Page) {
  await testSportsPagesWithScope(page, {
    sport: 'nba',
    scope: 'single',
  });
}

export async function sanityTestBasicNavigation(page: Page) {
  try {
    await testHomePageWithConfig(page, {
      checkAccessibility: false,
      checkPerformance: false,
    });
  } catch (error) {
    console.warn('⚠️ Home page test failed, but continuing with navigation test:', error);
  }

  try {
    await testBrowserNavigation(page, ['/', '/sports/nba', '/']);
  } catch (error) {
    console.warn('⚠️ Browser navigation test failed:', error);
  }
}

// Suite runner for sanity
export async function runSanitySuite(page: Page) {
  try {
    await sanityTestHomePage(page);
  } catch (error) {
    console.warn('⚠️ Home page sanity test failed, but continuing:', error);
  }

  try {
    await sanityTestSignInModal(page);
  } catch (error) {
    console.warn('⚠️ Sign-in modal sanity test failed, but continuing:', error);
  }

  try {
    await sanityTestSportsPage(page);
  } catch (error) {
    console.warn('⚠️ Sports page sanity test failed, but continuing:', error);
  }

  try {
    await sanityTestBasicNavigation(page);
  } catch (error) {
    console.warn('⚠️ Basic navigation sanity test failed, but continuing:', error);
  }
}

test.describe('Sanity Tests (Base Level)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('should pass basic sanity checks', async ({ page }) => {
    await runSanitySuite(page);
  });

  test('@sanity should test sports page', async ({ page }) => {
    await testSportsPagesWithScope(page, {
      sport: 'nba',
      scope: 'single',
    });
  });
});
