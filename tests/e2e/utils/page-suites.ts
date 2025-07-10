import { test as baseTest, Page, TestType } from '@playwright/test';
import { runBasePageChecks } from './page-shared-checks';
import {
  checkSEOElements,
  checkResponsiveBehavior,
  safeGoto,
  waitForPageLoad,
  waitForNetworkIdle,
  clearTestData,
} from '@tests/e2e/utils/test-utils';
import { testSignInModal } from './auth-modal';

// Re-export waitForNetworkIdle and clearTestData for convenience
export { waitForNetworkIdle, clearTestData };

export function runBasePageTests(test: TestType<any, any>, path: string, pageName: string) {
  test.describe(`${pageName} - Base Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page); // Test data isolation: clear storage and cookies
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });
    runBasePageChecks(test, path);
  });
}

export function runContentPageTests(test: TestType<any, any>, path: string, pageName: string) {
  test.describe(`${pageName} - Content Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page); // Test data isolation: clear storage and cookies
      await safeGoto(page, path);
      await waitForPageLoad(page);
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });
    runBasePageChecks(test, path);
    // ...content-specific tests (add here as needed)...
  });
}

export function runInteractivePageTests(test: TestType<any, any>, path: string, pageName: string) {
  test.describe(`${pageName} - Interactive Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page); // Test data isolation: clear storage and cookies
      await safeGoto(page, path);
      await waitForPageLoad(page);
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });
    runBasePageChecks(test, path);
    // ...interactive-specific tests (add here as needed)...
  });
}

export function runComprehensivePageTests(
  test: TestType<any, any>,
  path: string,
  pageName: string
) {
  test.describe(`${pageName} - Comprehensive Tests`, () => {
    test.beforeEach(async ({ page }: { page: Page }) => {
      await clearTestData(page); // Test data isolation: clear storage and cookies
      await safeGoto(page, path);
      await waitForPageLoad(page);
      await page.addStyleTag({
        content: '* { transition: none !important; animation: none !important; }',
      });
    });
    runBasePageChecks(test, path);
    // ...comprehensive-specific tests (add here as needed)...
  });
}
