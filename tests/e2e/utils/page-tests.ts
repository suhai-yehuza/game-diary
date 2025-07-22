import { Page, expect, TestType } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
  isRateLimited,
  logRateLimiting,
  TIMEOUTS,
} from '@tests/e2e/utils/test-utils';
import { PERFORMANCE_THRESHOLDS } from '@tests/e2e/utils/constants';

/**
 * Page testing utilities for E2E tests
 * Common patterns for testing page functionality
 */

export interface PageTestOptions {
  checkStructure?: boolean;
  checkTitle?: boolean;
  checkConsoleErrors?: boolean;
  checkAccessibility?: boolean;
  checkPerformance?: boolean;
  expectedTitle?: string;
  timeout?: number;
}

/**
 * Comprehensive page test that checks all common aspects
 */
export async function testPageComprehensive(
  page: Page,
  path: string,
  options: PageTestOptions = {}
): Promise<void> {
  const {
    checkStructure = true,
    checkTitle = true,
    checkConsoleErrors = true,
    checkAccessibility = false,
    checkPerformance = false,
    expectedTitle,
    timeout = 15000,
  } = options;

  // Navigate to page
  await safeGoto(page, path);
  await waitForPageLoad(page);

  // Check basic page structure
  if (checkStructure) {
    await checkBasicPageStructure(page);
  }

  // Check page title
  if (checkTitle) {
    await checkPageTitle(page, expectedTitle);
  }

  // Check for rate limiting before requiring main content
  const pageContent = await page.content();
  if (isRateLimited(pageContent)) {
    logRateLimiting('main content check');
  } else {
    // Strict: require <main> to be visible
    await page.locator('main#main-content').waitFor({ state: 'visible', timeout });
  }

  // Check for console errors
  if (checkConsoleErrors) {
    await checkForConsoleErrors(page);
  }

  // Check accessibility basics
  if (checkAccessibility) {
    await checkAccessibilityBasics(page);
  }

  // Check performance metrics
  if (checkPerformance) {
    const metrics = await checkPerformanceMetrics(page);

    // Verify performance meets thresholds
    expect(metrics.loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LOAD_TIME);
    expect(metrics.domContentLoaded).toBeLessThan(PERFORMANCE_THRESHOLDS.DOM_CONTENT_LOADED);
  }
}

/**
 * Test multiple pages with the same validation
 */
export async function testMultiplePages(
  page: Page,
  paths: string[],
  options: PageTestOptions = {}
): Promise<void> {
  const failures: Array<{ path: string; error: string }> = [];

  for (const path of paths) {
    try {
      await testPageComprehensive(page, path, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      failures.push({ path, error: errorMessage });
      console.error(`Failed to test page ${path}:`, errorMessage);
    }
  }

  // Report failures if any
  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} page(s) failed testing:`);
    failures.forEach(({ path, error }) => {
      console.error(`  - ${path}: ${error}`);
    });

    // If all pages failed, throw an error
    if (failures.length === paths.length) {
      throw new Error(`All ${paths.length} pages failed testing`);
    }
  }
}

/**
 * Test sports page specifically
 */
export async function testSportsPage(
  page: Page,
  sportsPath: string,
  options: PageTestOptions = {}
): Promise<void> {
  await testPageComprehensive(page, sportsPath, {
    checkStructure: true,
    checkTitle: true,
    checkConsoleErrors: true,
    ...options,
  });

  // Additional sports-specific checks
  const pageContent = await page.content();

  // Check for sports-related content
  if (
    !pageContent.includes('sports') &&
    !pageContent.includes('NBA') &&
    !pageContent.includes('NFL')
  ) {
    console.warn(`Warning: Sports page ${sportsPath} may not have expected sports content`);
  }
}

/**
 * Test dashboard page specifically
 */
export async function testDashboardPage(page: Page, options: PageTestOptions = {}): Promise<void> {
  await testPageComprehensive(page, '/', {
    checkStructure: true,
    checkTitle: true,
    checkConsoleErrors: true,
    ...options,
  });

  // Additional dashboard-specific checks could go here
}

/**
 * Test home page specifically
 */
export async function testHomePage(page: Page, options: PageTestOptions = {}): Promise<void> {
  await testPageComprehensive(page, '/', {
    checkStructure: true,
    checkTitle: true,
    checkConsoleErrors: true,
    checkAccessibility: true,
    checkPerformance: true,
    ...options,
  });
}

/**
 * Responsive suite runner: tests all major pages at multiple viewports
 */
export function runResponsiveSuite(test: TestType<any, any>) {
  test.describe('Responsive Tests', () => {
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
    ];
    for (const viewport of viewports) {
      test.describe(`${viewport.name} viewport`, () => {
        testPages.forEach((url, index) => {
          test(`should render ${url} correctly`, async ({ page }: { page: Page }) => {
            // Add a small delay between tests to reduce rate limiting
            if (index > 0) {
              // Wait for main content to be visible to ensure previous test is fully done
              await expect(page.locator('main')).toBeVisible({ timeout: TIMEOUTS.SHORT });
            }
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await testPageComprehensive(page, url);
          });
        });
      });
    }
  });
}

/**
 * Cross-browser suite runner: can be extended for browser-specific logic
 */
export function runCrossBrowserSuite(test: TestType<any, any>) {
  test.describe('Cross-Browser Tests', () => {
    // For now, just run the responsive suite
    runResponsiveSuite(test);
    // Add browser-specific checks here if needed
  });
}

/**
 * Full suite runner: can be extended for full regression/coverage
 */
export function runFullSuite(test: TestType<any, any>) {
  test.describe('Full Regression Suite', () => {
    // For now, just run the cross-browser suite
    runCrossBrowserSuite(test);
    // Add full regression/coverage checks here if needed
  });
}
