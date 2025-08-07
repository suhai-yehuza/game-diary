/**
 * E2E Test Environment Setup and Detection
 * Consolidated utilities for E2E test environment management
 */

/**
 * Check if the current environment is a CI environment
 */
export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.VERCEL === 'true' ||
    process.env.VERCEL === '1' // Added for consistency with scripts
  );
}

/**
 * Extended Window interface for E2E test environment variables
 */
interface IExtendedWindow extends Window {
  __PLAYWRIGHT_TEST__?: boolean;
  __E2E_MOCK_MODE__?: boolean;
  __API_MOCK_MODE__?: boolean;
}

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
    // Check for E2E mock mode
    if (extendedWindow.__E2E_MOCK_MODE__ === true) {
      return true;
    }
    // Check for API mock mode
    if (extendedWindow.__API_MOCK_MODE__ === true) {
      return true;
    }
  }

  // Server-side environment checks
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development' ||
    process.env.API_MOCK_MODE === 'true' ||
    process.env.E2E_MOCK_MODE === 'true' ||
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
    extendedWindow.__E2E_MOCK_MODE__ = true;
    extendedWindow.__API_MOCK_MODE__ = true;

    console.log('🔧 E2E Test Environment Setup Complete');
    console.log('  __PLAYWRIGHT_TEST__:', extendedWindow.__PLAYWRIGHT_TEST__);
    console.log('  __E2E_MOCK_MODE__:', extendedWindow.__E2E_MOCK_MODE__);
    console.log('  __API_MOCK_MODE__:', extendedWindow.__API_MOCK_MODE__);
  }
}

/**
 * Check if E2E test environment is properly set up
 */
export function isE2ETestEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const extendedWindow = window as IExtendedWindow;
    return (
      extendedWindow.__PLAYWRIGHT_TEST__ === true ||
      extendedWindow.__E2E_MOCK_MODE__ === true ||
      extendedWindow.__API_MOCK_MODE__ === true
    );
  }
  return false;
}

/**
 * Check if the current environment is production
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' && !isTestOrCIEnvironment();
}
