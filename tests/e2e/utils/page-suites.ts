import type { Page, TestType } from '@playwright/test';

import { runBasicPageChecks } from './page-shared-checks';
import { testHomePage, testDashboardPage, testMultiplePages } from './page-tests';
import { commonTestSetup } from './setup';
import { clearTestData, waitForNetworkIdle } from './test-utils';

/**
 * Page suite utilities for E2E tests
 * Provides functions to run comprehensive test suites
 */

/**
 * Run basic page suite
 */
export async function runBasicPageSuite(page: Page): Promise<void> {
  await clearTestData(page);
  await commonTestSetup(page, 'basic-page-suite');

  await testHomePage(page);
  await testDashboardPage(page);
}

/**
 * Run comprehensive page suite
 */
export async function runComprehensivePageSuite(page: Page): Promise<void> {
  await clearTestData(page);
  await commonTestSetup(page, 'comprehensive-page-suite');

  // Test all major pages
  const pages = ['/', '/sports/nba', '/sports/nfl', '/protected/user'];
  await testMultiplePages(page, pages);

  // Run additional checks
  await runBasicPageChecks(page);
}

// Legacy functions for backward compatibility
export function runComprehensivePageTests(
  test: TestType<any, any>,
  path: string,
  pageName: string
) {
  test.describe(`${pageName} - Comprehensive Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page);
      await commonTestSetup(page, 'comprehensive-page-tests');
    });

    test('should load page successfully', async ({ page }: { page: Page }) => {
      await page.goto(path);
      await waitForNetworkIdle(page);
      await runBasicPageChecks(page);
    });
  });
}

export function runContentPageTests(test: TestType<any, any>, path: string, pageName: string) {
  test.describe(`${pageName} - Content Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page);
      await commonTestSetup(page, 'content-page-tests');
    });

    test('should load content page successfully', async ({ page }: { page: Page }) => {
      await page.goto(path);
      await waitForNetworkIdle(page);
      await runBasicPageChecks(page);
    });
  });
}

export function runInteractivePageTests(test: TestType<any, any>, path: string, pageName: string) {
  test.describe(`${pageName} - Interactive Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page);
      await commonTestSetup(page, 'interactive-page-tests');
    });

    test('should handle interactions successfully', async ({ page }: { page: Page }) => {
      await page.goto(path);
      await waitForNetworkIdle(page);
      await runBasicPageChecks(page);
    });
  });
}

// Export utilities for convenience
export { clearTestData, waitForNetworkIdle };
