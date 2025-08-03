import type { Page } from '@playwright/test';

import {
  checkBasicPageStructure,
  checkPageTitle,
  checkAccessibilityBasics,
} from '@tests/e2e/utils/page-checks';
import { checkPerformanceMetrics, checkForConsoleErrors } from '@tests/e2e/utils/performance';

/**
 * Shared page checks for E2E tests
 * Provides common validation functions that can be reused across test suites
 */

/**
 * Run all basic page checks
 */
export async function runBasicPageChecks(page: Page): Promise<void> {
  await checkBasicPageStructure(page);
  await checkPageTitle(page);
  await checkAccessibilityBasics(page);
}

/**
 * Run all performance and error checks
 */
export async function runPerformanceAndErrorChecks(page: Page): Promise<void> {
  await checkPerformanceMetrics(page);
  await checkForConsoleErrors(page);
}

/**
 * Run comprehensive page validation
 */
export async function runComprehensivePageChecks(page: Page): Promise<void> {
  await runBasicPageChecks(page);
  await runPerformanceAndErrorChecks(page);
}
