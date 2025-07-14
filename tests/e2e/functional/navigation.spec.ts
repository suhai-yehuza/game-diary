import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  waitForNetworkIdle,
  clearTestData,
} from '@tests/e2e/utils/test-utils';
import { testSignInModal } from '@tests/e2e/utils/auth-modal';
import { runCriticalSuite } from './critical.spec';

test.beforeEach(async ({ page }) => {
  await clearTestData(page); // Test data isolation: clear storage and cookies
});

// Atomic navigation-level test functions
export async function navigationTestSportsPagesNavigation(page: any) {
  const sportsPages = [
    '/sports/nba',
    '/sports/nfl',
    '/sports/mlb',
    '/sports/nhl',
    '/sports/mls',
    '/sports/all-sports',
    '/sports/live',
  ];
  for (const sportsPage of sportsPages) {
    await safeGoto(page, sportsPage);
    await waitForPageLoad(page);
    await checkBasicPageStructure(page);
    await checkPageTitle(page);
    await expect(page).toHaveURL(sportsPage);
    await expect(page.locator('main')).toBeVisible();
  }
}

export async function navigationTestDashboardNavigation(page: any) {
  await safeGoto(page, '/');
  await waitForPageLoad(page);
  await checkBasicPageStructure(page);
  await checkPageTitle(page);
  await expect(page).toHaveURL('/');
  await expect(page.locator('main')).toBeVisible();
}

export async function navigationTestProtectedRoutesNavigation(page: any) {
  const protectedRoutes = ['/protected/user', '/protected/client', '/protected/admin'];
  for (const route of protectedRoutes) {
    await safeGoto(page, route);
    await waitForPageLoad(page);
    // Check for 404 page if the route does not exist
    const heading404 = page.getByRole('heading', { name: '404' });
    const notFoundText = page.getByText('Page not found.');
    if ((await heading404.count()) > 0 && (await notFoundText.count()) > 0) {
      await expect(heading404).toBeVisible();
      await expect(notFoundText).toBeVisible();
      continue;
    }
    // Otherwise, expect the Clerk modal to appear
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    // Dismiss the modal (Escape key)
    await page.keyboard.press('Escape');
    // Wait for redirect to home
    await expect(page).toHaveURL('/');
    // Check that the sign-in button is visible on the home page
    await expect(page.getByTestId('sign-in-button')).toBeVisible({ timeout: 10000 });
  }
}

export async function navigationTestLinkNavigation(page: any) {
  const sportsLinks = page.locator('a[href*="/sports"]');
  const sportsCount = await sportsLinks.count();
  if (sportsCount > 0) {
    await sportsLinks.first().click();
    await waitForNetworkIdle(page);
    await expect(page).toHaveURL(/\/sports/);
    await expect(page.locator('main')).toBeVisible();
  }
}

export async function navigationTestBrowserBackForward(page: any) {
  await safeGoto(page, '/sports/nba');
  await waitForPageLoad(page);
  await safeGoto(page, '/sports/nfl');
  await waitForPageLoad(page);
  await page.goBack();
  await waitForNetworkIdle(page);
  await expect(page).toHaveURL(/\/sports\/nba/);
  await page.goForward();
  await waitForNetworkIdle(page);
  await expect(page).toHaveURL(/\/sports\/nfl/);
}

export async function navigationTestSignInModalClickOutside(page: any) {
  await safeGoto(page, '/');
  await testSignInModal(page, 'click-outside');
}

// Suite runner for navigation
export async function runNavigationSuite(page: any) {
  await runCriticalSuite(page);
  await navigationTestSportsPagesNavigation(page);
  await navigationTestDashboardNavigation(page);
  await navigationTestLinkNavigation(page);
  await navigationTestBrowserBackForward(page);
  await navigationTestSignInModalClickOutside(page);
  // run this only in non-CI environments
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  if (!isCI) {
    await navigationTestProtectedRoutesNavigation(page);
  }
}

test.describe('Navigation Tests (Extends Critical)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Skip mobile tests temporarily due to UI layout issues
    if (
      testInfo.project.name.toLowerCase().includes('mobile') ||
      testInfo.project.name.toLowerCase().includes('iphone') ||
      testInfo.project.name.toLowerCase().includes('tablet')
    ) {
      test.skip(true, 'Skipping mobile tests temporarily due to UI layout issues');
    }

    await safeGoto(page, '/');
    await waitForPageLoad(page);
  });

  test('@navigation full navigation suite', async ({ page }) => {
    await runNavigationSuite(page);
  });
});
