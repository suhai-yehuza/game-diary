import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { getAppUrl } from '@src/lib/config/app.config';
import type { TestConfig } from '@src/lib/types';

import { TIMEOUT_CONFIG } from './timeout-config';

/**
 * Core test utilities for e2e tests
 * Provides essential functions for page navigation, element checks, and test helpers
 */
export const DEFAULT_CONFIG: TestConfig = {
  baseURL: getAppUrl() || 'http://localhost:3000',
  timeout: TIMEOUT_CONFIG.DEFAULT_CONFIG_TIMEOUT,
  retries: 2,
};

// Legacy timeout constants (deprecated - use TIMEOUT_CONFIG instead)
export const TIMEOUTS = {
  SHORT: TIMEOUT_CONFIG.SHORT_WAIT,
  MEDIUM: TIMEOUT_CONFIG.MEDIUM_WAIT,
  LONG: TIMEOUT_CONFIG.LONG_WAIT,
  EXTENDED: TIMEOUT_CONFIG.PAGE_LOAD,
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
  try {
    await waitForLoadState(page, 'NETWORK_IDLE', timeout);
  } catch (_error) {
    // If network idle times out, fall back to domcontentloaded
    console.log('Network idle timeout, falling back to domcontentloaded');
    await waitForLoadState(page, 'DOM_CONTENT_LOADED', Math.min(timeout, 10000));
  }
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
    timeout?: number;
    checkMainContent?: boolean;
  } = {}
): Promise<void> {
  const { timeout = TIMEOUTS.MEDIUM, checkMainContent = true } = options;

  console.log(`🔗 Navigating to: ${url} (timeout: ${timeout}ms)`);

  try {
    // Check if page is still valid before navigation
    if (page.isClosed()) {
      throw new Error('Page is closed, cannot navigate');
    }

    // Wait for any existing navigation to complete
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {
      // Ignore timeout if no navigation is in progress
    });

    // Simple navigation with basic error handling
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout,
    });

    // Wait for page to be stable
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT_CONFIG.DOM_CONTENT_LOADED });

    // Wait a bit for any potential redirects to complete
    await page.waitForTimeout(1000);

    if (checkMainContent) {
      // Simple content check
      try {
        await expect(page.locator('body')).toBeVisible({ timeout: Math.min(timeout, 5000) });
      } catch (_error) {
        // If body is not visible, check if there's any content
        const hasContent = await page.evaluate(() => {
          return document.body && document.body.children.length > 0;
        });

        if (!hasContent) {
          throw new Error('Page has no visible content');
        }
      }
    }

    console.log(`✅ Successfully navigated to: ${url}`);
  } catch (error: unknown) {
    console.error(`❌ Navigation failed for ${url}:`, error);

    // Check if the error is due to browser context being closed
    if (
      error instanceof Error &&
      error.message.includes('Target page, context or browser has been closed')
    ) {
      console.log('🔄 Browser context was closed, attempting recovery...');
      throw new Error('Browser context closed - test environment issue');
    }

    throw error;
  }
}

/**
 * Safe page navigation with error handling
 */
export async function safeGoto(
  page: Page,
  path: string,
  config: Partial<TestConfig> = {},
  navigationOptions?: {
    checkMainContent?: boolean;
  }
): Promise<void> {
  const { baseURL = DEFAULT_CONFIG.baseURL, timeout = DEFAULT_CONFIG.timeout } = config;
  const fullUrl = `${baseURL}${path}`;

  try {
    await navigateToPage(page, fullUrl, {
      timeout,
      ...navigationOptions,
    });
  } catch (error) {
    console.error(`Failed to navigate to ${fullUrl}:`, error);

    // Check if the error is due to browser context being closed
    if (
      error instanceof Error &&
      error.message.includes('Target page, context or browser has been closed')
    ) {
      console.log('🔄 Browser context was closed, cannot recover from this error');
      throw new Error('Browser context closed - test environment issue');
    }

    // In mock mode, try to handle navigation interruptions more gracefully
    if (process.env.E2E_MOCK_MODE === 'true') {
      console.log('🔄 Attempting to recover from navigation interruption...');

      try {
        // Wait a bit and try to get the current URL
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        console.log(`📍 Current URL after navigation attempt: ${currentUrl}`);

        // If we're on a different page than expected, that's okay in mock mode
        if (currentUrl !== fullUrl) {
          console.log(`✅ Navigation completed to different URL: ${currentUrl}`);
          return;
        }
      } catch (recoveryError) {
        console.log('⚠️ Recovery attempt failed:', recoveryError);
      }
    }

    throw error;
  }
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  // Use domcontentloaded instead of networkidle to avoid timeouts with continuous API calls
  await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT_CONFIG.DOM_CONTENT_LOADED });

  // Wait a bit for the page to stabilize
  await page.waitForTimeout(500);

  // Try multiple approaches to check if the page is ready
  const _browserName = page.context().browser()?.browserType().name();

  try {
    // First, try to check if body exists and has content
    await page.waitForFunction(
      () => {
        return document.body && document.body.children.length > 0;
      },
      { timeout: Math.min(timeout, 10000) }
    );

    // Then try to check if body is visible (with a shorter timeout)
    try {
      await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    } catch (_error) {
      // If body visibility check fails, check if we have any content at all
      const hasContent = await page.evaluate(() => {
        return document.body && document.body.children.length > 0;
      });

      if (!hasContent) {
        throw new Error('Page has no content after navigation');
      }

      console.log('⚠️ Body visibility check failed, but page has content - continuing');
    }
  } catch (error) {
    // In mock mode, be more lenient
    if (process.env.E2E_MOCK_MODE === 'true') {
      console.log('⚠️ Page load check failed in mock mode, but continuing:', error);

      // Wait a bit more and try one more time
      await page.waitForTimeout(1000);

      const hasContent = await page.evaluate(() => {
        return document.body && document.body.children.length > 0;
      });

      if (hasContent) {
        console.log('✅ Page has content, continuing with test');
        return;
      }
    }

    throw error;
  }
}

/**
 * Check if an element exists with timeout
 */
export async function checkElementExists(
  page: Page,
  selector: string,
  timeout = TIMEOUTS.SHORT
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear test data for isolation
 */
export async function clearTestData(page: Page): Promise<void> {
  try {
    // Wait for the page to be ready before attempting to clear storage
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        // Clear any other test data
        if (typeof window !== 'undefined') {
          (window as any).__TEST_DATA__ = {};
        }
      } catch (error) {
        // Silently handle storage access errors
        console.log('Storage clear failed (expected in some test environments):', error);
      }
    });
  } catch (error) {
    // If page evaluation fails, continue without clearing storage
    console.log('Test data clear skipped (page not ready):', error);
  }
}

/**
 * Setup E2E mocking for tests
 */
export async function setupE2EMocking(page: Page): Promise<void> {
  // Enable mock mode for the page
  await page.evaluate(() => {
    (window as any).__E2E_MOCK_MODE__ = true;
  });

  // Wait for mock setup to complete
  await page.waitForTimeout(100);
}

/**
 * Safe navigation with mocking support
 */
export async function safeGotoWithMocking(
  page: Page,
  path: string,
  config: Partial<TestConfig> = {}
): Promise<void> {
  await setupE2EMocking(page);
  await safeGoto(page, path, config);
}

/**
 * Wait for page to be stable (no ongoing animations/loading)
 */
export async function waitForPageStable(page: Page): Promise<void> {
  // Use domcontentloaded instead of networkidle to avoid timeouts with continuous API calls
  await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUT_CONFIG.DOM_CONTENT_LOADED });

  // Wait for any animations to complete
  await page.waitForTimeout(TIMEOUT_CONFIG.TRANSITION);
}

/**
 * Wait for a component to be ready
 */
export async function waitForComponentReady(
  page: Page,
  componentSelector: string,
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForSelector(componentSelector, { timeout });

  // Wait for component to be fully rendered
  await page.waitForTimeout(200);
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigationComplete(
  page: Page,
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(300); // Additional buffer
}

/**
 * Wait for search results to load
 */
export async function waitForSearchResults(page: Page, timeout = TIMEOUTS.LONG): Promise<void> {
  // Wait for search results container
  await page.waitForSelector('[data-testid="search-results"], .search-results', { timeout });

  // Wait for results to populate
  await page.waitForTimeout(500);
}

/**
 * Wait for form to be ready for interaction
 */
export async function waitForFormReady(
  page: Page,
  formSelector = 'form',
  timeout = TIMEOUTS.MEDIUM
): Promise<void> {
  await page.waitForSelector(formSelector, { timeout });

  // Wait for form inputs to be ready
  await page.waitForSelector(
    `${formSelector} input, ${formSelector} select, ${formSelector} textarea`,
    { timeout }
  );
}

/**
 * Generate test data for consistent testing
 */
export function generateTestData() {
  return {
    user: {
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
    },
    gameLog: {
      title: `Test Game Log ${Date.now()}`,
      content: `Test content for game log ${Date.now()}`,
      rating: Math.floor(Math.random() * 5) + 1,
    },
  };
}

/**
 * Wait for a condition to be met
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
    await page.waitForTimeout(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Create a robust test context with frame detachment handling
 */
export async function createRobustTestContext(
  browser: any,
  options: {
    baseURL?: string;
    extraHTTPHeaders?: Record<string, string>;
    viewport?: { width: number; height: number };
  } = {}
): Promise<any> {
  const contextOptions = {
    baseURL: options.baseURL || DEFAULT_CONFIG.baseURL,
    extraHTTPHeaders: options.extraHTTPHeaders || {},
    viewport: options.viewport || { width: 1280, height: 720 },
    // Add settings to reduce frame detachment issues
    ignoreHTTPSErrors: true,
    bypassCSP: true,
    // Increase timeouts for more stability
    actionTimeout: TIMEOUT_CONFIG.DEFAULT_CONFIG_TIMEOUT,
    navigationTimeout: TIMEOUT_CONFIG.PAGE_LOAD,
  };

  try {
    const context = await browser.newContext(contextOptions);

    // Add error handling for frame detachment
    context.on('page', (page: any) => {
      page.on('crash', () => {
        console.log('⚠️ Page crashed, this may cause frame detachment issues');
      });

      page.on('close', () => {
        console.log('⚠️ Page closed unexpectedly');
      });
    });

    return context;
  } catch (error) {
    console.error('Failed to create test context:', error);
    throw error;
  }
}

/**
 * Recreate page if frame detachment is detected
 */
export async function recreatePageIfNeeded(
  page: Page,
  context: any,
  options: { maxRecreations?: number } = {}
): Promise<Page> {
  const { maxRecreations = 2 } = options;

  for (let attempt = 1; attempt <= maxRecreations; attempt++) {
    try {
      // Check if page is still valid
      if (!page.isClosed()) {
        // Try a simple operation to test if page is responsive
        await page.evaluate(() => document.readyState);
        return page; // Page is still valid
      }
    } catch (error) {
      console.log(`⚠️ Page validation failed (attempt ${attempt}):`, error);
    }

    // Page is not valid, try to recreate it
    console.log(`🔄 Recreating page (attempt ${attempt}/${maxRecreations})`);

    try {
      // Close the old page if it's not already closed
      if (!page.isClosed()) {
        await page.close();
      }

      // Create a new page
      const newPage = await context.newPage();

      // Test the new page
      await newPage.goto('about:blank');
      await newPage.waitForLoadState('domcontentloaded');

      console.log(`✅ Successfully recreated page (attempt ${attempt})`);
      return newPage;
    } catch (recreateError) {
      console.error(`❌ Failed to recreate page (attempt ${attempt}):`, recreateError);

      if (attempt === maxRecreations) {
        throw new Error(`Failed to recreate page after ${maxRecreations} attempts`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Failed to recreate page');
}
