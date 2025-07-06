import { test, expect } from '@playwright/test';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import { testHomePage, testSportsPage } from '@tests/e2e/utils/page-tests';
import { navigateToSection } from '@tests/e2e/utils/navigation';

// Mock verification is handled by the compound runner

test.describe.configure({ retries: 2 }); // TEMP: Retry flaky tests while stabilizing

test.describe('Sanity Development Tests (Base Level)', () => {
  test.beforeEach(async ({ page }) => {
    await commonTestSetup(page);
  });

  test('@sanity should load home page successfully', async ({ page }) => {
    await testHomePage(page);
  });

  test('@sanity should show and close the sign in modal', async ({ page }) => {
    await testHomePage(page, { checkAccessibility: false, checkPerformance: false });
    await testSignInModal(page, 'escape');
  });

  test('@sanity should load NBA sports page', async ({ page }) => {
    await testSportsPage(page, '/sports/nba');
  });

  test('@sanity should handle basic navigation', async ({ page }) => {
    // Start at home
    await testHomePage(page, { checkAccessibility: false, checkPerformance: false });

    // Navigate to sports section
    await navigateToSection(page, '/sports/nba');

    // Navigate back to home
    await navigateToSection(page, '/');
  });
});
