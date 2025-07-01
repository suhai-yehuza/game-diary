import { Page, expect, Locator } from '@playwright/test';
import { TestConfig } from '@src/lib/types/e2e-test-types';

/**
 * Test utilities for e2e tests
 * Provides common functions for page navigation, element checks, and test helpers
 */

export const DEFAULT_CONFIG: TestConfig = {
  baseUrl: 'http://localhost:8081',
  timeout: 30000,
  retries: 2,
};

/**
 * Safely navigate to a page with proper error handling
 */
export async function safeGoto(
  page: Page,
  path: string,
  config: Partial<TestConfig> = {}
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const url = `${finalConfig.baseUrl}${path}`;

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: finalConfig.timeout,
    });
  } catch (error) {
    console.error(`Failed to navigate to ${url}:`, error);
    throw error;
  }
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('domcontentloaded', { timeout });
}

/**
 * Check if element exists and is visible
 */
export async function checkElementExists(
  page: Page,
  selector: string,
  timeout = 5000
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
  // Check for header (optional - some pages might not have one)
  const header = page.locator('header, [role="banner"]');
  if ((await header.count()) > 0) {
    await expect(header.first()).toBeVisible();
  }

  // Check for main content - now only one <main> per page
  const main = page.locator('main');
  if ((await main.count()) === 0) {
    // Debug output for missing <main>
    console.log('DEBUG: <main> not found! Dumping page HTML...');
    console.log(await page.content());
    await page.screenshot({ path: 'debug-main-not-found.png', fullPage: true });
  }
  await expect(main).toBeVisible({ timeout: 10000 });

  // Check for footer (optional) - use first() to avoid strict mode violations
  const footer = page.locator('footer, [role="contentinfo"]');
  if ((await footer.count()) > 0) {
    await expect(footer.first()).toBeVisible();
  }
}

/**
 * Check if page has proper title
 */
export async function checkPageTitle(page: Page, expectedTitle?: string): Promise<void> {
  if (expectedTitle) {
    await expect(page).toHaveTitle(expectedTitle);
  } else {
    // Just check that title exists and is not empty
    const title = await page.title();
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
  await page.waitForTimeout(1000); // Wait for layout to adjust

  // Check that page is still functional
  await expect(page.locator('body')).toBeVisible();

  // Check that navigation is accessible
  const nav = page.locator('nav, [role="navigation"]');
  if ((await nav.count()) > 0) {
    await expect(nav).toBeVisible();
  }
}

/**
 * Check accessibility basics
 */
export async function checkAccessibilityBasics(page: Page): Promise<void> {
  // Check for proper heading structure
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  if ((await headings.count()) > 0) {
    await expect(headings.first()).toBeVisible();
  }

  // Check for proper alt text on images
  const images = page.locator('img');
  const imageCount = await images.count();
  if (imageCount > 0) {
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt text should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  }

  // Check for proper form labels
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  if (inputCount > 0) {
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Should have either a label, aria-label, or aria-labelledby
        expect((await label.count()) > 0 || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  }
}

/**
 * Check performance metrics
 */
export async function checkPerformanceMetrics(page: Page): Promise<any> {
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

  // Basic performance checks
  expect(metrics.loadTime).toBeLessThan(5000); // 5 seconds
  expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds

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

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait a bit for any console errors to appear
  await page.waitForTimeout(2000);

  // Filter out common non-critical errors
  const criticalErrors = errors.filter(
    error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('fonts.googleapis.com') &&
      !error.includes('analytics') &&
      !error.includes('adblock') &&
      !error.includes('Failed to load resource: the server responded with a status of 400') &&
      !error.includes('Access-Control-Allow-Origin') &&
      !error.includes('Status code: 429') &&
      !error.includes('too many requests')
  );

  expect(criticalErrors).toHaveLength(0);
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
  await page.waitForTimeout(2000);

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
  timeout = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });

  // Wait for any animations to complete
  await page.waitForTimeout(1000);
}

/**
 * Check if page is accessible via keyboard
 */
export async function checkKeyboardNavigation(page: Page): Promise<void> {
  // Focus should be visible
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // Check that focus indicator is visible
  const focusedElement = page.locator(':focus');
  if ((await focusedElement.count()) > 0) {
    await expect(focusedElement).toBeVisible();
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
 * Clean up test data
 */
export async function cleanupTestData(page: Page): Promise<void> {
  // This would typically involve cleaning up any test data created during tests
  // For now, we'll just wait a bit to ensure any async operations complete
  await page.waitForTimeout(1000);
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
  timeout = 10000,
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
