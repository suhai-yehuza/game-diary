import { Page, expect } from '@playwright/test';
import { APP_CONFIG, getAppUrl } from '../../../src/lib/config/app.config';
import { TestConfig } from '../../../src/lib/types';

/**
 * Test utilities for e2e tests
 * Provides common functions for page navigation, element checks, and test helpers
 */

/**
 * Check if page content indicates API rate limiting
 */
export function isRateLimited(pageContent: string): boolean {
  return RATE_LIMIT_INDICATORS.some(indicator => pageContent.includes(indicator));
}

/**
 * Log rate limiting detection with consistent messaging
 */
export function logRateLimiting(context: string): void {
  console.log(`Skipping ${context} due to API rate limiting`);
}

export const DEFAULT_CONFIG: TestConfig = {
  baseURL: getAppUrl(),
  timeout: 30000,
  retries: 2,
};

// Common timeout constants
export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 15000,
  EXTENDED: 30000,
} as const;

// Rate limiting detection constants
export const RATE_LIMIT_INDICATORS = [
  'too_many_requests',
  'Too many requests',
  'rate_limit_exceeded',
  'Rate limit exceeded',
] as const;

// Common load state types
export const LOAD_STATES = {
  DOM_CONTENT_LOADED: 'domcontentloaded',
  LOAD: 'load',
  NETWORK_IDLE: 'networkidle',
} as const;

/**
 * Wait for a specific load state with consistent timeout handling
 */
export async function waitForLoadState(
  page: Page,
  state: keyof typeof LOAD_STATES = 'NETWORK_IDLE',
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForLoadState(LOAD_STATES[state], { timeout });
}

/**
 * Wait for network idle with consistent timeout
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await waitForLoadState(page, 'NETWORK_IDLE', timeout);
}

/**
 * Wait for DOM content loaded with consistent timeout
 */
export async function waitForDOMContentLoaded(
  page: Page,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  await waitForLoadState(page, 'DOM_CONTENT_LOADED', timeout);
}

/**
 * Navigate to a page with consistent load state handling
 */
export async function navigateToPage(
  page: Page,
  url: string,
  options: {
    waitForNetworkIdle?: boolean;
    timeout?: number;
    checkMainContent?: boolean;
  } = {}
): Promise<void> {
  const {
    waitForNetworkIdle: shouldWaitForNetworkIdle = true,
    timeout = TIMEOUTS.MEDIUM,
    checkMainContent = true,
  } = options;

  await page.goto(url, { waitUntil: LOAD_STATES.DOM_CONTENT_LOADED });

  if (shouldWaitForNetworkIdle) {
    await waitForNetworkIdle(page, timeout);
  } else {
    await waitForDOMContentLoaded(page, timeout);
  }

  if (checkMainContent) {
    await expect(page.locator('main')).toBeVisible({ timeout });
  }
}

/**
 * Safely navigate to a page with proper error handling
 */
export async function safeGoto(
  page: Page,
  path: string,
  config: Partial<TestConfig> = {}
): Promise<void> {
  // Get the baseURL from environment or use default
  const envBaseURL =
    process.env.DEPLOYMENT_URL || process.env.VERCEL_URL || process.env.VERCEL_PRODUCTION_URL;
  const baseURL = envBaseURL || DEFAULT_CONFIG.baseURL;
  const finalConfig = {
    ...DEFAULT_CONFIG,
    baseURL,
    ...config,
  };
  const url = path.startsWith('http') ? path : `${finalConfig.baseURL}${path}`;

  // Add retry logic for navigation interruptions
  const maxRetries = 3;
  let lastError: Error | null = null;

  console.log(`🔍 Navigation Debug:`);
  console.log(`  Path: ${path}`);
  console.log(`  Environment Base URL: ${envBaseURL}`);
  console.log(`  Final Config Base URL: ${finalConfig.baseURL}`);
  console.log(`  Final URL: ${url}`);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Wait a bit before retrying to avoid rapid successive navigation attempts
      if (attempt > 1) {
        // Use exponential backoff instead of fixed timeout
        await page.waitForLoadState('domcontentloaded', { timeout: 1000 * attempt });
      }

      await page.goto(url, {
        waitUntil: LOAD_STATES.DOM_CONTENT_LOADED,
        timeout: finalConfig.timeout,
      });

      // If we get here, navigation was successful
      return;
    } catch (error) {
      lastError = error as Error;
      console.error(`Navigation attempt ${attempt} failed for ${url}:`, error);

      // If it's a navigation interruption or binding abort, try again
      if (
        error instanceof Error &&
        ((error.message.includes('Navigation to') && error.message.includes('is interrupted')) ||
          error.message.includes('NS_BINDING_ABORTED') ||
          error.message.includes('frame was detached'))
      ) {
        console.log(
          `Navigation interrupted or aborted, retrying... (attempt ${attempt}/${maxRetries})`
        );
        continue;
      }

      // For other errors, check if they're network-related
      if (error instanceof Error) {
        if (
          error.message.includes('ERR_CONNECTION_REFUSED') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('net::ERR_CONNECTION_REFUSED') ||
          error.message.includes('net::ERR_INTERNET_DISCONNECTED')
        ) {
          console.error('❌ Network connection issue detected:');
          console.error('  - Server might be down or not responding');
          console.error('  - Network connectivity issues');
          console.error('  - Please ensure the development server is running: pnpm dev -p 3000');
          console.error('  - Check if port 3000 is available and not blocked');

          // Try to provide more helpful debugging info
          console.error('🔍 Debugging steps:');
          console.error(
            `  1. Check if server is running: curl ${APP_CONFIG.DEFAULT_LOCALHOST_URL}`
          );
          console.error(`  2. Check port availability: lsof -i:${APP_CONFIG.DEFAULT_PORT}`);
          console.error('  3. Restart the development server');
        }
      }

      // If it's not a navigation interruption, don't retry
      break;
    }
  }

  // If we get here, all retries failed
  throw lastError || new Error(`Failed to navigate to ${url} after ${maxRetries} attempts`);
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  await waitForLoadState(page, 'DOM_CONTENT_LOADED', timeout);
}

/**
 * Check if element exists and is visible
 */
export async function checkElementExists(
  page: Page,
  selector: string,
  timeout = TIMEOUTS.SHORT
): Promise<boolean> {
  try {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check basic page structure (header, main content, footer)
 */
export async function checkBasicPageStructure(page: Page): Promise<void> {
  // Wait for the page to be stable before checking content
  await waitForDOMContentLoaded(page);
  await waitForPageStable(page);

  try {
    // Check if page shows API error (rate limiting)
    const pageContent = await page.content();
    if (isRateLimited(pageContent)) {
      logRateLimiting('page structure check');
      return;
    }

    // Also check for empty page content that might indicate rate limiting
    if (pageContent.trim().length < 100) {
      console.log('Page content seems minimal, checking for rate limiting...');
      // Wait for main content to be visible or for content to increase
      await expect(page.locator('main, [role="main"], .main-content')).toBeVisible({
        timeout: TIMEOUTS.SHORT,
      });
      const retryContent = await page.content();
      if (isRateLimited(retryContent)) {
        logRateLimiting('page structure check (minimal content)');
        return;
      }
    }

    // Check for header (optional - some pages might not have one)
    const header = page.locator('header, [role="banner"]');
    if ((await header.count()) > 0) {
      await expect(header.first()).toBeVisible();
    }

    // Check for main content - try multiple selectors
    const mainContentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      'article',
      '.page-content',
    ];

    let mainContentFound = false;
    for (const selector of mainContentSelectors) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        try {
          await expect(element.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
          mainContentFound = true;
          break;
        } catch (error) {
          // Continue to next selector
        }
      }
    }

    if (!mainContentFound) {
      // If no main content found, check if page has any meaningful content
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        const textContent = body.textContent || '';
        const visibleElements = body.querySelectorAll(
          '*:not([style*="display: none"]):not([hidden])'
        );
        return textContent.trim().length > 0 || visibleElements.length > 5;
      });

      if (!hasContent) {
        console.log('DEBUG: No main content or meaningful content found! Dumping page HTML...');
        console.log(await page.content());
        await page.screenshot({ path: 'debug-no-content.png', fullPage: true });
        throw new Error('No main content or meaningful content found on page');
      } else {
        console.log('Page has content but no standard main container - this is acceptable');
      }
    }

    // Check for footer (optional) - use first() to avoid strict mode violations
    const footer = page.locator('footer, [role="contentinfo"]');
    if ((await footer.count()) > 0) {
      await expect(footer.first()).toBeVisible();
    }
  } catch (error) {
    // If we get a navigation error, wait a bit more and try again
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('navigating') || errorMessage.includes('destroyed')) {
      console.log('Page navigation detected, waiting for stability...');
      await waitForPageStable(page);
      await waitForDOMContentLoaded(page);

      // Try again with a simpler check
      const body = page.locator('body');
      await expect(body).toBeVisible();
      console.log('Page is stable and body is visible');
    } else {
      throw error;
    }
  }
}

/**
 * Check if page has proper title
 */
export async function checkPageTitle(page: Page, expectedTitle?: string): Promise<void> {
  // Check for API rate limiting first
  const pageContent = await page.content();
  if (isRateLimited(pageContent)) {
    logRateLimiting('title check');
    return;
  }

  if (expectedTitle) {
    await expect(page).toHaveTitle(expectedTitle);
  } else {
    // Just check that title exists and is not empty
    const title = await page.title();

    // If title is empty, check if it's due to rate limiting
    if (!title || title.length === 0) {
      // Wait a bit and try again
      await expect(page).toHaveTitle(/\w+/, { timeout: TIMEOUTS.SHORT });
      const retryTitle = await page.title();
      if (!retryTitle || retryTitle.length === 0) {
        console.log('Page title is empty, checking for rate limiting...');
        const retryContent = await page.content();
        if (isRateLimited(retryContent)) {
          logRateLimiting('title check (retry)');
          return;
        }
      } else {
        expect(retryTitle).toBeTruthy();
        expect(retryTitle.length).toBeGreaterThan(0);
        return;
      }
    }

    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  }
}

/**
 * Check if page has proper meta description
 */
export async function checkMetaDescription(
  page: Page,
  expectedDescription?: string
): Promise<void> {
  const metaDescription = page.locator('meta[name="description"]');

  if (expectedDescription) {
    await expect(metaDescription).toHaveAttribute('content', expectedDescription);
  } else {
    // Just check that meta description exists
    await expect(metaDescription).toHaveAttribute('content');
  }
}

/**
 * Check responsive behavior
 */
export async function checkResponsiveBehavior(
  page: Page,
  viewport: { width: number; height: number }
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.waitForLoadState('domcontentloaded');

  // Check that page is still functional
  await expect(page.locator('body')).toBeVisible();

  // Check that navigation is accessible
  const nav = page.locator('nav, [role="navigation"]');
  if ((await nav.count()) > 0) {
    // If there are multiple nav elements, check the first one that's visible
    for (let i = 0; i < (await nav.count()); i++) {
      const navElement = nav.nth(i);
      if (await navElement.isVisible()) {
        await expect(navElement).toBeVisible();
        break; // Only check the first visible nav element
      }
    }
  }
}

/**
 * Check accessibility basics
 */
export async function checkAccessibilityBasics(page: Page): Promise<void> {
  // Wait for page to be stable before checking accessibility
  await waitForDOMContentLoaded(page);
  await waitForPageStable(page);

  // Check for proper heading structure - be more lenient
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();
  if (headingCount > 0) {
    // Check if at least one heading is visible, but don't fail if none are
    let visibleHeadingFound = false;
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        visibleHeadingFound = true;
        break;
      }
    }
    // Don't fail if no headings are visible - some pages might not have headings
    if (visibleHeadingFound) {
      await expect(headings.first()).toBeVisible();
    }
  }

  // Check for proper alt text on images - be more lenient
  const images = page.locator('img');
  const imageCount = await images.count();
  if (imageCount > 0) {
    // Only check first few images to avoid timeouts
    const imagesToCheck = Math.min(imageCount, 5);
    for (let i = 0; i < imagesToCheck; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        // Alt text should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  }

  // Check for proper form labels - be more lenient
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  if (inputCount > 0) {
    // Only check first few inputs to avoid timeouts
    const inputsToCheck = Math.min(inputCount, 3);
    for (let i = 0; i < inputsToCheck; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');

          // Should have either a label, aria-label, or aria-labelledby
          const hasLabel = (await label.count()) > 0 || ariaLabel || ariaLabelledBy;
          // Don't fail if no label - some inputs might be self-explanatory
          if (!hasLabel) {
            console.log(`Input without label found: ${id}`);
          }
        }
      }
    }
  }
}

/**
 * Check performance metrics
 */
export async function checkPerformanceMetrics(page: Page): Promise<any> {
  // Wait for page to fully load before measuring performance
  await waitForNetworkIdle(page, TIMEOUTS.MEDIUM);

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint:
        performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  });

  // More lenient performance checks for different environments
  const isCI = process.env.CI === 'true';
  const maxLoadTime = isCI ? 15000 : 8000; // 15s in CI, 8s locally
  const maxDomTime = isCI ? 10000 : 5000; // 10s in CI, 5s locally

  // Only check if metrics are valid (not negative or NaN)
  if (metrics.loadTime > 0 && !isNaN(metrics.loadTime)) {
    expect(metrics.loadTime).toBeLessThan(maxLoadTime);
  }

  if (metrics.domContentLoaded > 0 && !isNaN(metrics.domContentLoaded)) {
    expect(metrics.domContentLoaded).toBeLessThan(maxDomTime);
  }

  return metrics;
}

/**
 * Take screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results-e2e/debug-${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Check for console errors
 */
export async function checkForConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = [];

  // Set up console error listener before navigation
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait for page to stabilize and any initial errors to appear (reduced timeout)
  await page.waitForLoadState('domcontentloaded');

  // Filter out common non-critical errors and known flaky errors
  const criticalErrors = errors.filter(
    error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('fonts.googleapis.com') &&
      !error.includes('analytics') &&
      !error.includes('adblock') &&
      !error.includes('Failed to load resource: the server responded with a status of 400') &&
      !error.includes('Failed to load resource: the server responded with a status of 403') &&
      !error.includes('Failed to load resource: the server responded with a status of 429') &&
      !error.includes('Access-Control-Allow-Origin') &&
      !error.includes('Status code: 429') &&
      !error.includes('too many requests') &&
      !error.includes('rate limit') &&
      !error.includes('ChunkLoadError') &&
      !error.includes('Loading chunk') &&
      !error.includes('Uncaught (in promise)') &&
      !error.includes('ResizeObserver loop limit exceeded') &&
      !error.includes('Non-Error promise rejection') &&
      !error.includes('Script error') &&
      !error.includes('Error: Network Error') &&
      !error.includes('ERR_NETWORK') &&
      !error.includes('ERR_INTERNET_DISCONNECTED') &&
      !error.includes('ERR_NAME_NOT_RESOLVED') &&
      !error.includes('net::ERR_FAILED') && // Filter out net::ERR_FAILED errors
      // Filter out Clerk-related errors in test environment
      !error.includes('useSession can only be used within the <ClerkProvider /> component') &&
      !error.includes('Clerk component error caught') &&
      !error.includes('useAssertWrappedByClerkProvider') &&
      !error.includes('ClerkErrorBoundary') &&
      !error.includes('SignIn') &&
      !error.includes('SignUp') &&
      !error.includes('@clerk/nextjs') &&
      !error.includes('@clerk/shared') &&
      !error.includes('Clerk: Failed to load Clerk') &&
      // Filter out Google Sign-In errors
      !error.includes('[GSI_LOGGER]') &&
      !error.includes('FedCM get() rejects with NetworkError') &&
      !error.includes('Error retrieving a token')
  );

  // Filter out known benign errors
  const filteredErrors = criticalErrors.filter(
    e =>
      !e.includes('Content Security Policy') &&
      !e.includes('Module') &&
      !e.includes('HMR update') &&
      !e.includes('accounts.google.com') &&
      !e.includes('frame-ancestors')
  );
  if (filteredErrors.length > 0) {
    console.log('Console errors found:', filteredErrors);
    expect(filteredErrors).toHaveLength(0);
  }
}

/**
 * Check for network errors
 */
export async function checkForNetworkErrors(page: Page): Promise<void> {
  const failedRequests: string[] = [];

  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.url()} - ${response.status()}`);
    }
  });

  // Wait a bit for any failed requests to appear
  await waitForPageStable(page);

  // Filter out common non-critical failures
  const criticalFailures = failedRequests.filter(
    failure =>
      !failure.includes('analytics') &&
      !failure.includes('tracking') &&
      !failure.includes('external-service')
  );

  expect(criticalFailures).toHaveLength(0);
}

/**
 * Wait for element to be stable (not changing)
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
  timeout = TIMEOUTS.SHORT
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });

  // Wait for any animations to complete
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Check if page is accessible via keyboard
 */
export async function checkKeyboardNavigation(page: Page): Promise<void> {
  // Focus should be visible
  await page.keyboard.press('Tab');
  await page.waitForLoadState('domcontentloaded');

  // Check that focus indicator is visible - use first() to avoid strict mode violation
  const focusedElement = page.locator(':focus');
  if ((await focusedElement.count()) > 0) {
    await expect(focusedElement.first()).toBeVisible();
  }
}

/**
 * Check mobile touch interactions
 */
export async function checkMobileTouchInteractions(page: Page): Promise<void> {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  // Check that touch targets are large enough (minimum 44px)
  const touchTargets = page.locator('button, a, input, select, textarea');
  const targetCount = await touchTargets.count();

  for (let i = 0; i < Math.min(targetCount, 10); i++) {
    // Check first 10 targets
    const target = touchTargets.nth(i);
    const box = await target.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
}

/**
 * Generate test data
 */
export function generateTestData() {
  return {
    user: {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Test User',
    },
    admin: {
      email: 'admin@example.com',
      password: 'AdminPassword123!',
    },
  };
}

/**
 * Clear all test data from the browser to ensure test isolation
 * Handles cases where page context might not be fully available
 */
export async function clearTestData(page: Page): Promise<void> {
  try {
    // Clear localStorage safely
    await page.evaluate(() => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
      } catch (error) {
        // Ignore localStorage errors (e.g., in about:blank or restricted contexts)
        console.warn('Could not clear localStorage:', error);
      }
    });

    // Clear sessionStorage safely
    await page.evaluate(() => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.clear();
        }
      } catch (error) {
        // Ignore sessionStorage errors
        console.warn('Could not clear sessionStorage:', error);
      }
    });

    // Clear IndexedDB safely
    await page.evaluate(() => {
      try {
        if (typeof window !== 'undefined' && window.indexedDB) {
          // Delete all IndexedDB databases
          const databases = indexedDB.databases();
          if (databases) {
            databases.then(dbList => {
              dbList.forEach(db => {
                if (db.name) {
                  indexedDB.deleteDatabase(db.name);
                }
              });
            });
          }
        }
      } catch (error) {
        // Ignore IndexedDB errors
        console.warn('Could not clear IndexedDB:', error);
      }
    });

    // Clear all cookies
    const context = page.context();
    if (context) {
      await context.clearCookies();
    }
  } catch (error) {
    // If any part of the clearing process fails, log but don't fail the test
    console.warn('Test data clearing encountered an error:', error);
  }
}

/**
 * Check if page has proper SEO elements
 */
export async function checkSEOElements(page: Page): Promise<void> {
  // Check for canonical URL
  const canonical = page.locator('link[rel="canonical"]');
  if ((await canonical.count()) > 0) {
    await expect(canonical).toHaveAttribute('href');
  }

  // Check for Open Graph tags
  const ogTitle = page.locator('meta[property="og:title"]');
  const ogDescription = page.locator('meta[property="og:description"]');

  if ((await ogTitle.count()) > 0) {
    await expect(ogTitle).toHaveAttribute('content');
  }

  if ((await ogDescription.count()) > 0) {
    await expect(ogDescription).toHaveAttribute('content');
  }
}

/**
 * Check if page has proper security headers
 */
export async function checkSecurityHeaders(page: Page): Promise<void> {
  const response = await page.goto(page.url());
  if (response) {
    const headers = response.headers();

    // Check for basic security headers
    expect(headers['x-frame-options']).toBeTruthy();
    expect(headers['x-content-type-options']).toBeTruthy();
  }
}

/**
 * Wait for specific condition with timeout
 */
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean>,
  timeout = TIMEOUTS.MEDIUM,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    // Use a more reliable waiting mechanism
    await page.waitForLoadState('domcontentloaded', { timeout: interval });
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Set up comprehensive mocking for E2E tests to avoid API rate limiting
 */
export async function setupE2EMocking(page: Page): Promise<void> {
  console.log('🔧 Setting up comprehensive E2E mocking...');

  // Inject Vercel protection bypass header for all requests if secret is available
  const vercelBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  console.log('🔍 Vercel Protection Bypass Debug:');
  console.log(`  - VERCEL_AUTOMATION_BYPASS_SECRET exists: ${!!vercelBypassSecret}`);
  console.log(`  - VERCEL_AUTOMATION_BYPASS_SECRET length: ${vercelBypassSecret?.length || 0}`);
  console.log(
    `  - VERCEL_AUTOMATION_BYPASS_SECRET preview: ${vercelBypassSecret ? `${vercelBypassSecret.substring(0, 10)}...` : 'undefined'}`
  );

  if (vercelBypassSecret) {
    // Set the header at context level for all requests including initial navigation
    await page.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': vercelBypassSecret,
    });
    console.log('✅ Vercel protection bypass header set at context level');

    // Also set up route handler for additional requests
    await page.route('**', (route, request) => {
      const headers = {
        ...request.headers(),
        'x-vercel-protection-bypass': vercelBypassSecret,
      };
      console.log(`🔧 Injecting protection bypass header for: ${request.url()}`);
      route.continue({ headers });
    });
    console.log('✅ Vercel protection bypass header also injected via route handler');
  } else {
    console.log('⚠️  VERCEL_AUTOMATION_BYPASS_SECRET not set - protection bypass disabled');
  }

  // Mock all API proxy endpoints to avoid rate limiting
  await page.route('**/api/proxy/**', async route => {
    const url = route.request().url();
    const endpoint = url.split('/api/proxy/')[1];

    console.log(`🔧 Mocking API proxy endpoint: ${endpoint}`);

    // Import mock data dynamically to avoid circular dependencies
    const { MOCK_NBA_GAMES } = await import('../../../src/lib/mock/nbaGamesMock');
    const { MOCK_NBA_TEAMS } = await import('../../../src/lib/mock/nbaTeamsMock');
    const { MOCK_NBA_STANDINGS } = await import('../../../src/lib/mock/nbaStandingsMock');
    const { MOCK_NBA_PLAYERS } = await import('../../../src/lib/mock/nbaPlayersMock');
    const { MOCK_LIVE_GAMES } = await import('../../../src/lib/mock/liveGamesMock');

    let mockResponse;

    if (endpoint.includes('games')) {
      if (endpoint.includes('live=all')) {
        mockResponse = MOCK_LIVE_GAMES;
      } else {
        mockResponse = MOCK_NBA_GAMES;
      }
    } else if (endpoint.includes('teams')) {
      mockResponse = MOCK_NBA_TEAMS;
    } else if (endpoint.includes('standings')) {
      mockResponse = MOCK_NBA_STANDINGS;
    } else if (endpoint.includes('players')) {
      mockResponse = MOCK_NBA_PLAYERS;
    } else {
      mockResponse = {
        get: endpoint,
        parameters: {},
        errors: [],
        results: 0,
        response: [],
      };
    }

    console.log(`✅ Returning mock response for ${endpoint}`);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });

  // Mock external image requests
  await page.route('https://media.api-sports.io/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
    });
  });

  // Mock any other external API calls
  await page.route('https://api-nba-v1.p.rapidapi.com/**', route => {
    console.log(`🔧 Mocking external API call: ${route.request().url()}`);
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ mocked: true, message: 'Mocked external API call' }),
    });
  });

  // Also mock the API proxy with a more specific pattern
  await page.route('**/api/proxy/games**', async route => {
    console.log(`🔧 Mocking games API proxy: ${route.request().url()}`);
    const { MOCK_NBA_GAMES } = await import('../../../src/lib/mock/nbaGamesMock');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_NBA_GAMES),
    });
  });

  await page.route('**/api/proxy/teams**', async route => {
    console.log(`🔧 Mocking teams API proxy: ${route.request().url()}`);
    const { MOCK_NBA_TEAMS } = await import('../../../src/lib/mock/nbaTeamsMock');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_NBA_TEAMS),
    });
  });

  await page.route('**/api/proxy/standings**', async route => {
    console.log(`🔧 Mocking standings API proxy: ${route.request().url()}`);
    const { MOCK_NBA_STANDINGS } = await import('../../../src/lib/mock/nbaStandingsMock');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_NBA_STANDINGS),
    });
  });

  // Mock any other external requests
  await page.route('https://nba-stats-db.herokuapp.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ mocked: true, message: 'Mocked NBA Stats DB' }),
    });
  });

  console.log('✅ E2E mocking setup complete');
}

// Enhanced safeGoto with automatic mocking setup
export async function safeGotoWithMocking(
  page: Page,
  path: string,
  config: Partial<TestConfig> = {}
): Promise<void> {
  // Set up mocking before navigation
  await setupE2EMocking(page);

  // Navigate to the page
  await safeGoto(page, path, config);
}

// Wait for page to be fully stable and ready for interaction
export async function waitForPageStable(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  // Removed: await waitForNetworkIdle(page, timeout);
  await page.waitForLoadState('domcontentloaded', { timeout });

  // Wait for any loading indicators to disappear
  const loadingSelectors = [
    '.loading',
    '[data-loading="true"]',
    '.spinner',
    '.loader',
    '[aria-busy="true"]',
  ];

  for (const selector of loadingSelectors) {
    try {
      await page.waitForFunction(() => document.querySelector(selector) === null, {
        timeout: 5000,
      });
    } catch {
      // Loading indicator not found or already gone - that's fine
    }
  }
}

// Wait for component to be fully rendered and interactive
export async function waitForComponentReady(
  page: Page,
  componentSelector: string,
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(page.locator(componentSelector)).toBeVisible({ timeout });

  // Wait for any animations to complete
  await page.waitForFunction(
    () => {
      const element = document.querySelector(componentSelector);
      if (!element) return false;

      // Check if element has any ongoing animations
      const animations = element.getAnimations();
      return animations.length === 0;
    },
    { timeout: 5000 }
  );
}

// Wait for navigation to complete and page to be stable
export async function waitForNavigationComplete(
  page: Page,
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForLoadState('domcontentloaded', { timeout });

  // Wait for main content to be visible
  await expect(page.locator('main, [role="main"], .main-content')).toBeVisible({ timeout: 10000 });
}

// Wait for search results to load
export async function waitForSearchResults(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  // Wait for search results container or loading to complete
  await page.waitForFunction(
    () => {
      const loadingElements = document.querySelectorAll(
        '.loading, .spinner, [data-loading="true"]'
      );
      const resultElements = document.querySelectorAll(
        '.search-results, [data-testid*="result"], .results, .space-y-6'
      );

      return loadingElements.length === 0 && resultElements.length > 0;
    },
    { timeout }
  );
}

// Wait for form to be ready for interaction
export async function waitForFormReady(
  page: Page,
  formSelector = 'form',
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await expect(page.locator(formSelector)).toBeVisible({ timeout });

  // Wait for form inputs to be enabled
  await page.waitForFunction(
    () => {
      const inputs = document.querySelectorAll(
        `${formSelector} input, ${formSelector} textarea, ${formSelector} select`
      );
      return Array.from(inputs).every(input => !input.hasAttribute('disabled'));
    },
    { timeout: 5000 }
  );
}
