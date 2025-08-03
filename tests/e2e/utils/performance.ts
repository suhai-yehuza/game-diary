import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import { TIMEOUTS } from './test-utils';

/**
 * Performance and error checking utilities for E2E tests
 * Provides functions to check performance metrics, console errors, and network errors
 */

/**
 * Check performance metrics
 */
export async function checkPerformanceMetrics(page: Page): Promise<any> {
  // Wait for page to fully load before measuring performance
  await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM });

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

  // Wait for page to stabilize and any initial errors to appear
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
      !error.includes('net::ERR_FAILED') &&
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
  await page.waitForLoadState('networkidle');

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
 * Check for rate limiting indicators
 */
export function isRateLimited(pageContent: string): boolean {
  const rateLimitIndicators = [
    'too_many_requests',
    'Too many requests',
    'rate_limit_exceeded',
    'Rate limit exceeded',
  ];

  return rateLimitIndicators.some(indicator => pageContent.includes(indicator));
}

/**
 * Log rate limiting detection with consistent messaging
 */
export function logRateLimiting(context: string): void {
  console.log(`Skipping ${context} due to API rate limiting`);
}
