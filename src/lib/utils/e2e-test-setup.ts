/**
 * Check if the current environment is a CI environment
 */
export function isCI(): boolean {
  // CI should reflect build/test pipelines (e.g., GitHub Actions), not production runtimes.
  // Do NOT treat Vercel runtime as CI, or app code may skip critical initialization in prod.
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Extended Window interface for E2E test environment variables
 */
interface IExtendedWindow extends Window {
  __PLAYWRIGHT_TEST__?: boolean;
  __MOCK_MODE__?: boolean;
}

import { isMockModeEnabled, setupMockModeEnvironment } from './mock-mode';

/**
 * Check if the current environment is a test/CI environment
 */
export function isTestOrCIEnvironment(): boolean {
  // Check if we're in a browser environment and look for window variables
  if (typeof window !== 'undefined') {
    const extendedWindow = window as IExtendedWindow;
    // Check for Playwright test environment
    if (extendedWindow.__PLAYWRIGHT_TEST__ === true) {
      return true;
    }
    // Check for mock mode (consolidated)
    if (isMockModeEnabled()) {
      return true;
    }
  }

  // Server-side environment checks
  return (
    process.env.NODE_ENV === 'test' ||
    isMockModeEnabled() ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    isCI()
  );
}

/**
 * Set up E2E test environment variables in the browser
 */
export function setupE2ETestEnvironment(): void {
  if (typeof window !== 'undefined' && isTestOrCIEnvironment()) {
    const extendedWindow = window as IExtendedWindow;
    // Set test environment flags only when in test environment
    extendedWindow.__PLAYWRIGHT_TEST__ = true;

    // Set up mock mode environment (consolidated)
    setupMockModeEnvironment();
  }
}

/**
 * Check if E2E test environment is properly set up
 */
export function isE2ETestEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const extendedWindow = window as IExtendedWindow;
    return extendedWindow.__PLAYWRIGHT_TEST__ === true || isMockModeEnabled();
  }
  return false;
}
