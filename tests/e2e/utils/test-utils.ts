import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { getAppUrl } from '@src/lib/config/app.config';
import type { TestConfig } from '@src/lib/types';

/**
 * Core test utilities for e2e tests
 * Provides essential functions for page navigation, element checks, and test helpers
 */

export const DEFAULT_CONFIG: TestConfig = {
  baseURL: getAppUrl() || 'http://localhost:3000',
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

  try {
    // Wait for any ongoing navigation to complete first
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

    // Navigate to the page
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });

    // Wait a bit for any client-side routing to settle
    await page.waitForTimeout(500);

    if (shouldWaitForNetworkIdle) {
      await waitForNetworkIdle(page, timeout);
    }

    if (checkMainContent) {
      await expect(page.locator('main, [role="main"], #main')).toBeVisible({ timeout });
    }
  } catch (error: unknown) {
    // If navigation is interrupted, try again once
    if (error instanceof Error && error.message.includes('interrupted')) {
      console.log(`Navigation interrupted, retrying: ${url}`);
      await page.waitForTimeout(1000);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
      await page.waitForTimeout(500);

      if (shouldWaitForNetworkIdle) {
        await waitForNetworkIdle(page, timeout);
      }

      if (checkMainContent) {
        await expect(page.locator('main, [role="main"], #main')).toBeVisible({ timeout });
      }
    } else {
      throw error;
    }
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
    waitForNetworkIdle?: boolean;
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
    throw error;
  }
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  await waitForNetworkIdle(page, timeout);
  await expect(page.locator('body')).toBeVisible({ timeout });
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
export async function waitForPageStable(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });

  // Wait for any animations to complete
  await page.waitForTimeout(500);
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
export async function waitForSearchResults(page: Page, timeout = TIMEOUTS.MEDIUM): Promise<void> {
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
