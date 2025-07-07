import { Page, expect } from '@playwright/test';
import {
  safeGoto,
  waitForPageLoad,
  checkBasicPageStructure,
  checkPageTitle,
  checkForConsoleErrors,
  checkAccessibilityBasics,
  checkPerformanceMetrics,
} from './test-utils';
import { PERFORMANCE_THRESHOLDS } from './constants';

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

  // Strict: require <main> to be visible
  await page.locator('main').waitFor({ state: 'visible', timeout });

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
  await testPageComprehensive(page, '/dashboard', {
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
