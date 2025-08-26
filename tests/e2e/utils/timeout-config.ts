/**
 * Centralized timeout configuration for E2E tests
 *
 * This replaces hard-coded timeouts throughout the codebase with a single
 * source of truth that can be easily adjusted based on environment and context.
 */

const SECONDS = 1000;

// Environment-specific timeout multipliers
const TIMEOUT_MULTIPLIERS = {
  CI: 1.5, // CI environments are slower (reduced from 2.0 since base timeouts are longer)
  LOCAL: 1.0, // Local development
  DEBUG: 2.0, // Debug mode for troubleshooting (reduced from 3.0)
} as const;

// Base timeout values (in milliseconds)
const BASE_TIMEOUTS = {
  // Navigation timeouts
  PAGE_LOAD: 180 * SECONDS, // 3 minutes to match Playwright config
  DOM_CONTENT_LOADED: 30 * SECONDS,
  NETWORK_IDLE: 60 * SECONDS,

  // Element interaction timeouts
  ELEMENT_VISIBLE: 5 * SECONDS,
  ELEMENT_CLICKABLE: 3 * SECONDS,
  ELEMENT_ATTRIBUTE: 2 * SECONDS,
  ELEMENT_COUNT: 3 * SECONDS,

  // Action timeouts
  CLICK: 2 * SECONDS,
  TYPE: 1 * SECONDS,
  SCROLL: 1 * SECONDS,

  // Wait timeouts
  SHORT_WAIT: 500,
  MEDIUM_WAIT: 1000,
  LONG_WAIT: 2000,

  // Animation/transition timeouts
  ANIMATION: 1 * SECONDS,
  TRANSITION: 500,

  // API/network timeouts
  API_RESPONSE: 10 * SECONDS,
  GRAPHQL_QUERY: 15 * SECONDS,

  // Accessibility check timeouts
  ACCESSIBILITY_CHECK: 3 * SECONDS,
  IMAGE_LOAD: 5 * SECONDS,

  // Test-specific timeouts
  AUTH_MODAL: 5 * SECONDS,
  SEARCH_RESULTS: 10 * SECONDS,
  GAME_LOG_LOAD: 15 * SECONDS,

  // DEFAULT_CONFIG_TIMEOUT
  DEFAULT_CONFIG_TIMEOUT: 300 * SECONDS, // 5 minutes to match Playwright config
} as const;

/**
 * Get the current environment multiplier
 */
function getEnvironmentMultiplier(): number {
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    return TIMEOUT_MULTIPLIERS.CI;
  }
  if (process.env.DEBUG || process.env.PLAYWRIGHT_DEBUG) {
    return TIMEOUT_MULTIPLIERS.DEBUG;
  }
  return TIMEOUT_MULTIPLIERS.LOCAL;
}

/**
 * Calculate timeout value with environment multiplier
 */
function calculateTimeout(baseTimeout: number, customMultiplier?: number): number {
  const multiplier = customMultiplier ?? getEnvironmentMultiplier();
  return Math.round(baseTimeout * multiplier);
}

/**
 * Centralized timeout configuration
 */
export const TIMEOUT_CONFIG = {
  get DEFAULT_CONFIG_TIMEOUT() {
    return calculateTimeout(BASE_TIMEOUTS.DEFAULT_CONFIG_TIMEOUT);
  },
  // Navigation timeouts
  get PAGE_LOAD() {
    return calculateTimeout(BASE_TIMEOUTS.PAGE_LOAD);
  },
  get DOM_CONTENT_LOADED() {
    return calculateTimeout(BASE_TIMEOUTS.DOM_CONTENT_LOADED);
  },
  get NETWORK_IDLE() {
    return calculateTimeout(BASE_TIMEOUTS.NETWORK_IDLE);
  },

  // Element interaction timeouts
  get ELEMENT_VISIBLE() {
    return calculateTimeout(BASE_TIMEOUTS.ELEMENT_VISIBLE);
  },
  get ELEMENT_CLICKABLE() {
    return calculateTimeout(BASE_TIMEOUTS.ELEMENT_CLICKABLE);
  },
  get ELEMENT_ATTRIBUTE() {
    return calculateTimeout(BASE_TIMEOUTS.ELEMENT_ATTRIBUTE);
  },
  get ELEMENT_COUNT() {
    return calculateTimeout(BASE_TIMEOUTS.ELEMENT_COUNT);
  },

  // Action timeouts
  get CLICK() {
    return calculateTimeout(BASE_TIMEOUTS.CLICK);
  },
  get TYPE() {
    return calculateTimeout(BASE_TIMEOUTS.TYPE);
  },
  get SCROLL() {
    return calculateTimeout(BASE_TIMEOUTS.SCROLL);
  },

  // Wait timeouts
  get SHORT_WAIT() {
    return calculateTimeout(BASE_TIMEOUTS.SHORT_WAIT);
  },
  get MEDIUM_WAIT() {
    return calculateTimeout(BASE_TIMEOUTS.MEDIUM_WAIT);
  },
  get LONG_WAIT() {
    return calculateTimeout(BASE_TIMEOUTS.LONG_WAIT);
  },

  // Animation/transition timeouts
  get ANIMATION() {
    return calculateTimeout(BASE_TIMEOUTS.ANIMATION);
  },
  get TRANSITION() {
    return calculateTimeout(BASE_TIMEOUTS.TRANSITION);
  },

  // API/network timeouts
  get API_RESPONSE() {
    return calculateTimeout(BASE_TIMEOUTS.API_RESPONSE);
  },
  get GRAPHQL_QUERY() {
    return calculateTimeout(BASE_TIMEOUTS.GRAPHQL_QUERY);
  },

  // Accessibility check timeouts
  get ACCESSIBILITY_CHECK() {
    return calculateTimeout(BASE_TIMEOUTS.ACCESSIBILITY_CHECK);
  },
  get IMAGE_LOAD() {
    return calculateTimeout(BASE_TIMEOUTS.IMAGE_LOAD);
  },

  // Test-specific timeouts
  get AUTH_MODAL() {
    return calculateTimeout(BASE_TIMEOUTS.AUTH_MODAL);
  },
  get SEARCH_RESULTS() {
    return calculateTimeout(BASE_TIMEOUTS.SEARCH_RESULTS);
  },
  get GAME_LOG_LOAD() {
    return calculateTimeout(BASE_TIMEOUTS.GAME_LOG_LOAD);
  },

  // Utility methods
  getEnvironmentMultiplier,
  calculateTimeout,

  // Debug information
  get debugInfo() {
    return {
      environment: process.env.CI ? 'CI' : process.env.DEBUG ? 'DEBUG' : 'LOCAL',
      multiplier: getEnvironmentMultiplier(),
      baseTimeouts: BASE_TIMEOUTS,
    };
  },
} as const;

/**
 * Helper function to get timeout with custom multiplier
 */
export function getTimeout(baseTimeout: keyof typeof BASE_TIMEOUTS, multiplier?: number): number {
  return calculateTimeout(BASE_TIMEOUTS[baseTimeout], multiplier);
}

/**
 * Helper function to create timeout options for Playwright
 */
export function createTimeoutOptions(timeoutKey: keyof typeof BASE_TIMEOUTS, multiplier?: number) {
  return { timeout: getTimeout(timeoutKey, multiplier) };
}

/**
 * Helper function to create wait options for Playwright
 */
export function createWaitOptions(timeoutKey: keyof typeof BASE_TIMEOUTS, multiplier?: number) {
  return { timeout: getTimeout(timeoutKey, multiplier) };
}

// Log timeout configuration on import (only in debug mode)
if (process.env.DEBUG || process.env.PLAYWRIGHT_DEBUG) {
  console.log('🔧 E2E Timeout Configuration:', TIMEOUT_CONFIG.debugInfo);
}
