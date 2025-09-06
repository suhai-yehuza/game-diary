/**
 * Centralized mock mode configuration
 * Consolidates API_MOCK_MODE and MOCK_MODE into a single MOCK_MODE variable
 */

// Import the extended window interface
import type { IExtendedWindow } from '@/types';

/**
 * Check if mock mode is enabled
 * Supports both the new MOCK_MODE and legacy API_MOCK_MODE/MOCK_MODE variables
 */
export function isMockModeEnabled(): boolean {
  // Check for the new consolidated MOCK_MODE variable first
  if (process.env.MOCK_MODE === 'true') {
    return true;
  }

  // Legacy support for backward compatibility
  if (process.env.MOCK_MODE === 'true') {
    return true;
  }

  // Check for client-side mock mode flags
  if (typeof window !== 'undefined') {
    const extendedWindow = window as IExtendedWindow;
    if (
      extendedWindow.__MOCK_MODE__ === true ||
      extendedWindow.__API_MOCK_MODE__ === true ||
      extendedWindow.__E2E_MOCK_MODE__ === true
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check if mock mode is explicitly disabled
 */
export function isMockModeDisabled(): boolean {
  return process.env.MOCK_MODE === 'false';
}

/**
 * Get the current mock mode status as a string
 */
export function getMockModeStatus(): string {
  if (isMockModeEnabled()) {
    return 'enabled';
  }
  if (isMockModeDisabled()) {
    return 'disabled';
  }
  return 'not-set';
}

/**
 * Set up mock mode environment for client-side
 */
export function setupMockModeEnvironment(): void {
  if (typeof window !== 'undefined' && isMockModeEnabled()) {
    const extendedWindow = window as IExtendedWindow;
    extendedWindow.__MOCK_MODE__ = true;

    // Legacy support - keep these for backward compatibility
    extendedWindow.__API_MOCK_MODE__ = true;
    extendedWindow.__E2E_MOCK_MODE__ = true;

    console.log('🔧 Mock Mode Environment Setup Complete');
    console.log('  __MOCK_MODE__:', extendedWindow.__MOCK_MODE__);
    console.log('  __API_MOCK_MODE__:', extendedWindow.__API_MOCK_MODE__);
    console.log('  __E2E_MOCK_MODE__:', extendedWindow.__E2E_MOCK_MODE__);
  }
}

/**
 * Check if we're in a test environment that should use mock data
 */
export function shouldUseMockData(): boolean {
  return (
    isMockModeEnabled() ||
    process.env.NODE_ENV === 'test' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    (typeof window !== 'undefined' && (window as IExtendedWindow).__PLAYWRIGHT_TEST__ === true)
  );
}

/**
 * Get mock mode configuration for debugging
 */
export function getMockModeConfig() {
  return {
    serverSide: {
      MOCK_MODE: process.env.MOCK_MODE,
      API_MOCK_MODE: process.env.API_MOCK_MODE,
      E2E_MOCK_MODE: process.env.E2E_MOCK_MODE,
      NODE_ENV: process.env.NODE_ENV,
      PLAYWRIGHT_TEST: process.env.PLAYWRIGHT_TEST,
    },
    clientSide:
      typeof window !== 'undefined'
        ? {
            __MOCK_MODE__: (window as IExtendedWindow).__MOCK_MODE__,
            __API_MOCK_MODE__: (window as IExtendedWindow).__API_MOCK_MODE__,
            __E2E_MOCK_MODE__: (window as IExtendedWindow).__E2E_MOCK_MODE__,
            __PLAYWRIGHT_TEST__: (window as IExtendedWindow).__PLAYWRIGHT_TEST__,
          }
        : null,
    status: getMockModeStatus(),
    enabled: isMockModeEnabled(),
    shouldUseMockData: shouldUseMockData(),
  };
}
