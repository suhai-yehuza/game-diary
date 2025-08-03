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
  await testHomePageWithConfig(page, {
    checkAccessibility: false,
    checkPerformance: false,
  });
  await testBrowserNavigation(page, ['/', '/sports/nba', '/']);
}

// Suite runner for sanity
export async function runSanitySuite(page: Page) {
  await sanityTestHomePage(page);
  await sanityTestSignInModal(page);
  await sanityTestSportsPage(page);
  await sanityTestBasicNavigation(page);
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
