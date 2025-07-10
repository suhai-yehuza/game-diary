import { Page, test } from '@playwright/test';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { testHomePage, testSportsPage } from '@tests/e2e/utils/page-tests';
import { navigateToSection } from '@tests/e2e/utils/navigation';

// Atomic test functions
export async function sanityTestHomePage(page: Page) {
  await testHomePage(page);
}

export async function sanityTestSignInModal(page: Page) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
  await testSignInModal(page, 'escape');
}

export async function sanityTestSportsPage(page: Page) {
  await testSportsPage(page, '/sports/nba');
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

test.describe.configure({ retries: 2 });

test.describe('Sanity Tests (Base Level)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('@sanity full sanity suite', async ({ page }) => {
    await runSanitySuite(page);
  });
});
