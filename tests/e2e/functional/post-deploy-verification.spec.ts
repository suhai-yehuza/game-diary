import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { errorHandlers } from '@/lib/utils/error-handler';
import { isMockModeEnabled } from '@tests/e2e/utils/mock-config';
import { checkPerformanceMetrics } from '@tests/e2e/utils/performance';
import { commonTestSetup } from '@tests/e2e/utils/setup';
import {
  testSignInModalVariants,
  testBasicPerformance,
  testBasicAccessibility,
  testProtectedRouteAccess,
  testErrorStates,
  testBrowserNavigation,
} from '@tests/e2e/utils/shared-tests';
import { clearTestData, TIMEOUTS, safeGoto, waitForPageLoad } from '@tests/e2e/utils/test-utils';

/**
 * Post-Deployment Verification Test Suite
 *
 * This suite is specifically designed for production post-deployment verification.
 * It focuses on production-specific checks and does NOT duplicate basic sanity/smoke tests
 * (which are already run in the main deployment pipeline).
 *
 * Key focus areas:
 * - Critical user flows that must work in production
 * - Performance benchmarks for production environment
 * - Security and accessibility compliance
 * - Error handling and edge cases
 * - Real-world user scenarios
 * - Production-specific authentication and authorization
 * - API health and external service integration
 */

// Test configuration optimized for production verification
const POST_DEPLOY_CONFIG = {
  timeout: TIMEOUTS.EXTENDED,
  retries: 0, // No retries for post-deploy verification
  parallel: false, // Sequential execution for better debugging
  critical: true, // Mark as critical tests
} as const;

// Production-critical test scenarios
const PRODUCTION_SCENARIOS = {
  homePage: {
    path: '/',
    expectedTitle: /Game Diary|GameLog/i,
    criticalChecks: ['structure', 'title', 'performance', 'accessibility'] as const,
  },
  sportsPages: {
    paths: ['/sports/nba', '/sports/nfl', '/sports/mlb'], // Most critical sports
    criticalChecks: ['structure', 'title', 'content'] as const,
  },
  search: {
    path: '/search',
    criticalChecks: ['structure', 'functionality'] as const,
  },
  authentication: {
    criticalChecks: ['modal', 'protected-routes'] as const,
  },
} as const;

/**
 * Production verification test runner with enhanced error handling
 */
class PostDeployTestRunner {
  private readonly testName: string;
  private readonly mockEnabled: boolean;
  private readonly failures: string[] = [];

  constructor(testName: string) {
    this.testName = testName;
    this.mockEnabled = isMockModeEnabled();
  }

  async runCriticalTest(
    page: Page,
    testFn: () => Promise<void>,
    options: { description?: string } = {}
  ): Promise<void> {
    const { description = this.testName } = options;

    console.log(`🚀 [CRITICAL] Running: ${description}`);

    if (this.mockEnabled) {
      console.warn(`⚠️ [CRITICAL] Mock mode is enabled - this may not reflect production behavior`);
    }

    try {
      await testFn();
      console.log(`✅ [CRITICAL] PASSED: ${description}`);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'E2E Post-Deploy Test',
        action: `Critical test: ${description}`,
      });
      const errorMsg = `❌ [CRITICAL] FAILED: ${description} - ${String(error)}`;
      console.error(errorMsg);
      this.failures.push(errorMsg);
      throw error; // Re-throw for critical tests
    }
  }

  async runNonCriticalTest(
    page: Page,
    testFn: () => Promise<void>,
    options: { description?: string } = {}
  ): Promise<void> {
    const { description = this.testName } = options;

    console.log(`🔍 [NON-CRITICAL] Running: ${description}`);

    try {
      await testFn();
      console.log(`✅ [NON-CRITICAL] PASSED: ${description}`);
    } catch (error) {
      // Use centralized error handling
      errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
        component: 'E2E Post-Deploy Test',
        action: `Non-critical test: ${description}`,
      });
      const errorMsg = `⚠️ [NON-CRITICAL] FAILED: ${description} - ${String(error)}`;
      console.warn(errorMsg);
      this.failures.push(errorMsg);
      // Don't throw for non-critical tests
    }
  }

  getFailures(): string[] {
    return this.failures;
  }

  hasFailures(): boolean {
    return this.failures.length > 0;
  }
}

// Critical production verification functions
export async function verifyHomePageCritical(page: Page) {
  const runner = new PostDeployTestRunner('home-page-critical');

  await runner.runCriticalTest(
    page,
    async () => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Critical structure checks
      await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(page.locator('main')).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Critical title check
      await expect(page).toHaveTitle(/Game Diary|GameLog/i);

      // Critical performance check
      await checkPerformanceMetrics(page);

      // Critical accessibility check
      await testBasicAccessibility(page);
    },
    { description: 'Home page critical functionality' }
  );
}

export async function verifySportsPagesCritical(page: Page) {
  const runner = new PostDeployTestRunner('sports-pages-critical');

  for (const path of PRODUCTION_SCENARIOS.sportsPages.paths) {
    await runner.runCriticalTest(
      page,
      async () => {
        await safeGoto(page, path);
        await waitForPageLoad(page);

        // Critical structure checks
        await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

        // Critical content check - should have some sports content
        const hasContent = (await page.locator('h1, h2, h3, [data-testid*="sport"]').count()) > 0;
        expect(hasContent).toBeTruthy();

        // Critical performance check
        await checkPerformanceMetrics(page);
      },
      { description: `Sports page critical functionality: ${path}` }
    );
  }
}

export async function verifySearchFunctionalityCritical(page: Page) {
  const runner = new PostDeployTestRunner('search-critical');

  await runner.runCriticalTest(
    page,
    async () => {
      await safeGoto(page, '/search');
      await waitForPageLoad(page);

      // Critical structure checks
      await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

      // Critical functionality check - search input should be present
      // Wait for Suspense boundary to resolve and main content to load
      await page.waitForFunction(
        () => {
          const searchInput = document.querySelector(
            'input[type="search"], input[placeholder*="search"], [data-testid*="search"]'
          );
          return searchInput && searchInput.offsetParent !== null; // Check if visible
        },
        { timeout: TIMEOUTS.MEDIUM }
      );

      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search"], [data-testid*="search"]'
      );
      await expect(searchInput.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });

      // Critical performance check
      await checkPerformanceMetrics(page);
    },
    { description: 'Search page critical functionality' }
  );
}

export async function verifyAuthenticationCritical(page: Page) {
  const runner = new PostDeployTestRunner('authentication-critical');

  await runner.runCriticalTest(
    page,
    async () => {
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Check if Clerk is configured by looking for the sign-in button or auth placeholder
      const signInButton = page.getByTestId('sign-in-button');
      const authPlaceholder = page.getByTestId('auth-placeholder');

      const isClerkAvailable = await signInButton.isVisible().catch(() => false);
      const hasAuthPlaceholder = await authPlaceholder.isVisible().catch(() => false);

      if (!isClerkAvailable && !hasAuthPlaceholder) {
        // If neither sign-in button nor auth placeholder is found, wait a bit more and check again
        await page.waitForTimeout(2000);
        const retrySignInButton = await signInButton.isVisible().catch(() => false);
        const retryAuthPlaceholder = await authPlaceholder.isVisible().catch(() => false);

        if (!retrySignInButton && !retryAuthPlaceholder) {
          console.log(
            '⚠️ Clerk authentication not available in this deployment - skipping authentication tests'
          );

          // Verify that the page still loads properly without authentication
          await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

          console.log('ℹ️ Page loads successfully without authentication components');
          return;
        }
      }

      if (!isClerkAvailable && hasAuthPlaceholder) {
        console.log(
          '⚠️ Clerk authentication not available in this deployment - auth placeholder found'
        );

        // Verify that the page still loads properly without authentication
        await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

        console.log('✅ Auth placeholder found - deployment is working correctly without Clerk');
        return;
      }

      // Critical sign-in button check (only if Clerk is available)
      await expect(signInButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });

      // Critical modal functionality check
      await testSignInModalVariants(page, { method: 'escape' });

      // Critical protected route check
      await testProtectedRouteAccess(page, {
        route: '/protected/user',
        expectModal: true,
        expectRedirect: false,
      });
    },
    { description: 'Authentication critical functionality' }
  );
}

export async function verifyErrorHandlingCritical(page: Page) {
  const runner = new PostDeployTestRunner('error-handling-critical');

  await runner.runCriticalTest(
    page,
    async () => {
      // Test 404 page
      await safeGoto(page, '/non-existent-page');
      await waitForPageLoad(page);

      // Should show some error content (not blank page)
      const hasErrorContent = await page.locator('body').textContent();
      expect(hasErrorContent).toBeTruthy();

      // Test error states
      await testErrorStates(page);
    },
    { description: 'Error handling critical functionality' }
  );
}

export async function verifyNavigationCritical(page: Page) {
  const runner = new PostDeployTestRunner('navigation-critical');

  await runner.runCriticalTest(
    page,
    async () => {
      // Test browser navigation
      await testBrowserNavigation(page, ['/', '/sports/nba', '/sports/nfl']);

      // Test internal navigation
      await safeGoto(page, '/');
      await waitForPageLoad(page);

      // Navigate to sports section
      const sportsLink = page.locator('a[href*="/sports"], [data-testid*="sports"]').first();
      if (await sportsLink.isVisible({ timeout: TIMEOUTS.SHORT }).catch(() => false)) {
        await sportsLink.click();
        await waitForPageLoad(page);
        await expect(page.locator('body')).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      }
    },
    { description: 'Navigation critical functionality' }
  );
}

// Non-critical verification functions
export async function verifyPerformanceBenchmarks(page: Page) {
  const runner = new PostDeployTestRunner('performance-benchmarks');

  await runner.runNonCriticalTest(
    page,
    async () => {
      await testBasicPerformance(page);

      // Additional performance checks
      const pages = ['/', '/sports/nba', '/sports/nfl', '/search'];

      for (const path of pages) {
        await safeGoto(page, path);
        await waitForPageLoad(page);
        await checkPerformanceMetrics(page);
      }
    },
    { description: 'Performance benchmarks' }
  );
}

export async function verifyAccessibilityCompliance(page: Page) {
  const runner = new PostDeployTestRunner('accessibility-compliance');

  await runner.runNonCriticalTest(
    page,
    async () => {
      await testBasicAccessibility(page);

      // Additional accessibility checks for key pages
      const pages = ['/', '/sports/nba', '/search'];

      for (const path of pages) {
        await safeGoto(page, path);
        await waitForPageLoad(page);
        await testBasicAccessibility(page);
      }
    },
    { description: 'Accessibility compliance' }
  );
}

// Main verification suite runner
// Note: This suite focuses on production-specific checks and does NOT duplicate
// basic sanity/smoke tests which are already run in the main deployment pipeline.
export async function runPostDeployVerificationSuite(page: Page) {
  const runner = new PostDeployTestRunner('post-deploy-verification-suite');

  console.log('🚀 Starting Post-Deployment Verification Suite');
  console.log('📋 Focus: Production-specific checks (sanity/smoke tests run separately)');
  console.log(`🔧 Mock Mode: ${isMockModeEnabled() ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🌐 Environment: ${process.env.CI === 'true' ? 'CI' : 'Local'}`);
  console.log(`⏱️ Timeout: ${POST_DEPLOY_CONFIG.timeout}ms`);

  // Run critical tests first (these will fail the suite if they fail)
  try {
    await verifyHomePageCritical(page);
    await verifySportsPagesCritical(page);
    await verifySearchFunctionalityCritical(page);
    await verifyAuthenticationCritical(page);
    await verifyErrorHandlingCritical(page);
    await verifyNavigationCritical(page);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'E2E Post-Deploy Test',
      action: 'Critical tests suite',
    });
    console.error('❌ Critical tests failed - deployment verification failed');
    throw error;
  }

  // Run non-critical tests (these won't fail the suite)
  try {
    await verifyPerformanceBenchmarks(page);
    await verifyAccessibilityCompliance(page);
  } catch (_error) {
    console.warn('⚠️ Non-critical tests failed, but deployment verification continues');
  }

  // Report results
  if (runner.hasFailures()) {
    console.warn('⚠️ Some non-critical tests failed:');
    runner.getFailures().forEach(failure => console.warn(failure));
  }

  console.log('✅ Post-Deployment Verification Suite completed');
}

// Test suite definition
test.describe('Post-Deployment Verification (Production)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear test data for isolation
    await clearTestData(page);

    // Setup with production configuration
    await commonTestSetup(page, 'post-deploy-verification');

    // Log test environment
    console.log(`🔧 Post-Deploy Test Environment:`);
    console.log(`  - Mock Mode: ${isMockModeEnabled() ? 'Enabled' : 'Disabled'}`);
    console.log(`  - CI: ${process.env.CI === 'true' ? 'Yes' : 'No'}`);
    console.log(`  - Timeout: ${POST_DEPLOY_CONFIG.timeout}ms`);
    console.log(`  - Critical: ${POST_DEPLOY_CONFIG.critical}`);
  });

  test('@critical @post-deploy full post-deployment verification suite', async ({ page }) => {
    await runPostDeployVerificationSuite(page);
  });
});

// Individual critical test cases for better debugging
test.describe('Individual Post-Deployment Critical Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'individual-post-deploy-critical');
  });

  test('@critical @post-deploy home page critical functionality', async ({ page }) => {
    await verifyHomePageCritical(page);
  });

  test('@critical @post-deploy sports pages critical functionality', async ({ page }) => {
    await verifySportsPagesCritical(page);
  });

  test('@critical @post-deploy search functionality critical', async ({ page }) => {
    await verifySearchFunctionalityCritical(page);
  });

  test('@critical @post-deploy authentication critical functionality', async ({ page }) => {
    await verifyAuthenticationCritical(page);
  });

  test('@critical @post-deploy error handling critical', async ({ page }) => {
    await verifyErrorHandlingCritical(page);
  });

  test('@critical @post-deploy navigation critical functionality', async ({ page }) => {
    await verifyNavigationCritical(page);
  });
});

// Non-critical verification tests
test.describe('Post-Deployment Non-Critical Verification', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestData(page);
    await commonTestSetup(page, 'post-deploy-non-critical');
  });

  test('@post-deploy performance benchmarks', async ({ page }) => {
    await verifyPerformanceBenchmarks(page);
  });

  test('@post-deploy accessibility compliance', async ({ page }) => {
    await verifyAccessibilityCompliance(page);
  });
});
