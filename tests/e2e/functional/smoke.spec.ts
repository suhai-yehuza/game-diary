import { test } from '@playwright/test';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { testMultiplePages, testHomePage, testDashboardPage } from '@tests/e2e/utils/page-tests';
import { navigateToSection } from '@tests/e2e/utils/navigation';
import { SPORTS_PAGES } from '@tests/e2e/utils/constants';
import { runSanitySuite } from './sanity.spec';

// Atomic smoke-level test functions
export async function smokeTestAllSportsPages(page: any) {
  await testMultiplePages(page, [...SPORTS_PAGES]);
}

export async function smokeTestDashboardPage(page: any) {
  await testDashboardPage(page);
}

export async function smokeTestSignInModalClickOutside(page: any) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
  await testSignInModal(page, 'click-outside');
}

export async function smokeTestBasicAccessibility(page: any) {
  await testHomePage(page, { checkAccessibility: true, checkPerformance: false });
}

export async function smokeTestBasicPerformance(page: any) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: true });
}

export async function smokeTestMajorSectionNavigation(page: any) {
  await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
  await navigateToSection(page, '/sports/nba');
  await navigateToSection(page, '/dashboard');
  await navigateToSection(page, '/');
}

// Suite runner for smoke
export async function runSmokeSuite(page: any) {
  await runSanitySuite(page);
  await smokeTestAllSportsPages(page);
  await smokeTestDashboardPage(page);
  await smokeTestSignInModalClickOutside(page);
  await smokeTestBasicAccessibility(page);
  await smokeTestBasicPerformance(page);
  await smokeTestMajorSectionNavigation(page);
}

test.describe.configure({ retries: 2 });

test.describe('Smoke Tests (Extends Sanity)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('@smoke full smoke suite', async ({ page }) => {
    await runSmokeSuite(page);
  });
});
