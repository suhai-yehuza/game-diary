import { test, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkResponsiveBehavior,
} from '@tests/e2e/utils/test-utils';
import { runNavigationSuite } from './navigation.spec';

// Atomic responsive-level test function
export async function responsiveTestAllViewports(page: any) {
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    { name: 'Samsung Galaxy S20', width: 360, height: 800 },
    { name: 'Samsung Galaxy S21', width: 384, height: 854 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Samsung Galaxy Tab', width: 800, height: 1280 },
    { name: 'Small Desktop', width: 1024, height: 768 },
    { name: 'Medium Desktop', width: 1366, height: 768 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
    { name: 'Ultra Wide', width: 2560, height: 1440 },
  ];
  const testPages = [
    '/',
    '/sports/nba',
    '/sports/nfl',
    '/sports/mlb',
    '/sports/nhl',
    '/sports/mls',
    '/sports/all-sports',
    '/sports/live',
    '/dashboard',
  ];
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const url of testPages) {
      await safeGoto(page, url);
      await waitForPageLoad(page);
      await checkBasicPageStructure(page);
      await checkResponsiveBehavior(page, viewport);
      await expect(page.locator('main')).toBeVisible();
    }
  }
}

// Suite runner for responsive
export async function runResponsiveSuite(page: any) {
  await runNavigationSuite(page);
  await responsiveTestAllViewports(page);
}

test.describe.configure({ retries: 3 });

test.describe('Responsive Tests (Extends Navigation)', () => {
  test('@responsive full responsive suite', async ({ page }) => {
    await runResponsiveSuite(page);
  });
});
