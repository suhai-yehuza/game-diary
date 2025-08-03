import { test } from '@playwright/test';

import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { SPORTS_PAGES } from '@tests/e2e/utils/constants';
import { isMockModeEnabled, getMockData } from '@tests/e2e/utils/mock-config';
import { navigateToSection } from '@tests/e2e/utils/navigation';
import { testMultiplePages, testHomePage, testDashboardPage } from '@tests/e2e/utils/page-tests';
import { commonTestSetup, enhancedTestSetup } from '@tests/e2e/utils/setup';
import { clearTestData, TIMEOUTS } from '@tests/e2e/utils/test-utils';

import { runSanitySuite } from './sanity.spec';

// Utility to detect mobile devices for temporary skipping due to UI layout issues
const _isMobileDevice = (projectName: string): boolean => {
  const name = projectName.toLowerCase();
  return name.includes('mobile') || name.includes('iphone') || name.includes('tablet');
};

// Atomic smoke-level test functions
export async function smokeTestAllSportsPages(page: any) {
  // Increase timeout for sports pages since they include API calls
  await testMultiplePages(page, [...SPORTS_PAGES], { timeout: TIMEOUTS.EXTENDED });
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
  await navigateToSection(page, '/');
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

test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Test data isolation: clear storage and cookies
});

test.describe('Smoke Tests (Extends Sanity)', () => {
  test.beforeEach(async ({ page }) => {
    // Removed mobile skip logic
    await commonTestSetup(page, 'smoke-test');

    // Log mock data status for debugging
    if (isMockModeEnabled()) {
      const mockData = getMockData();
      console.log('🔧 Mock data available for smoke test:', Object.keys(mockData));
    }
  });

  test('@smoke full smoke suite', async ({ page }) => {
    await runSmokeSuite(page);
  });
});

// Enhanced smoke tests with mock data support
test.describe('Enhanced Smoke Tests with Mock Data', () => {
  test.beforeEach(async ({ page }) => {
    await enhancedTestSetup(page, {
      testName: 'enhanced-smoke-test',
      enableMockData: true,
      mockScenario: 'smoke-test-scenario',
    });
  });

  test('@smoke enhanced smoke suite with mock data', async ({ page }) => {
    // Verify mock mode is working
    if (isMockModeEnabled()) {
      console.log('✅ Mock data is enabled for enhanced smoke test');
    }

    await runSmokeSuite(page);
  });
});
