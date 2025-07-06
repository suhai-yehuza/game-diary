import { test, expect } from '@playwright/test';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { testMultiplePages, testHomePage, testDashboardPage } from '@tests/e2e/utils/page-tests';
import { navigateToSection } from '@tests/e2e/utils/navigation';
import { SPORTS_PAGES } from '@tests/e2e/utils/constants';

// Fast tests are handled by the compound runner

test.describe.configure({ retries: 2 });

test.describe('Smoke Tests (Extends Sanity)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('@smoke should load all major sports pages', async ({ page }) => {
    await testMultiplePages(page, [...SPORTS_PAGES]);
  });

  test('@smoke should load dashboard page', async ({ page }) => {
    await testDashboardPage(page);
  });

  test('@smoke should show and close the sign in modal', async ({ page }) => {
    await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
    await testSignInModal(page, 'click-outside');
  });

  test('@smoke should have basic accessibility', async ({ page }) => {
    await testHomePage(page, { checkAccessibility: true, checkPerformance: false });
  });

  test('@smoke should have reasonable performance', async ({ page }) => {
    await testHomePage(page, { checkAccessibility: false, checkPerformance: true });
  });

  test('@smoke should handle navigation between major sections', async ({ page }) => {
    // Start at home
    await testHomePage(page, { checkAccessibility: false, checkPerformance: false });

    // Navigate to sports section
    await navigateToSection(page, '/sports/nba');

    // Navigate to dashboard
    await navigateToSection(page, '/dashboard');

    // Navigate back to home
    await navigateToSection(page, '/');
  });
});
