import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { navigateToSection } from '@tests/e2e/utils/navigation';
import { testHomePage, testSportsPage } from '@tests/e2e/utils/page-tests';
import { commonTestSetup } from '@tests/e2e/utils/setup';

// Atomic test functions
export async function sanityTestHomePage(page: Page) {
  await testHomePage(page);
}

export async function sanityTestSignInModal(page: Page) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
  await testSignInModal(page, 'escape');
}

export async function sanityTestSportsPage(page: Page) {
  // Increase timeout for sports page since it includes API calls
  await testSportsPage(page, 'nba');
}

export async function sanityTestBasicNavigation(page: Page) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
  await navigateToSection(page, '/sports/nba');
  await navigateToSection(page, '/');
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
    // Removed mobile skip logic
    await commonTestSetup(page);
  });

  test('should pass basic sanity checks', async ({ page }) => {
    await runSanitySuite(page);
  });

  test('@sanity should test sports page', async ({ page }) => {
    await testSportsPage(page, 'nba');
  });
});
