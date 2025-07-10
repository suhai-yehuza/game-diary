/**
 * Centralized application configuration
 * This file contains all app-related constants to eliminate duplication
 */

export const APP_CONFIG = {
  // Default URLs
  DEFAULT_LOCALHOST_URL: 'http://localhost:3000',
  DEFAULT_PORT: 3000,

  // Environment-specific URLs
  getLocalhostUrl: (port?: number) => `http://localhost:${port || APP_CONFIG.DEFAULT_PORT}`,

  // Health check endpoints
  HEALTH_CHECK_PATH: '/api/health',

  // Development settings
  DEV_SERVER_TIMEOUT: 60 * 1000, // 60 seconds

  // Test settings
  TEST_TIMEOUT: 120 * 1000, // 120 seconds
  TEST_ACTION_TIMEOUT: 15000, // 15 seconds
  TEST_NAVIGATION_TIMEOUT: 30000, // 30 seconds
} as const;

// Helper function to get the appropriate URL based on environment
export const getAppUrl = (): string => {
  // In CI, prioritize deployment URL, then Vercel URL, then localhost
  if (process.env.CI) {
    return (
      process.env.DEPLOYMENT_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_PRODUCTION_URL ||
      APP_CONFIG.DEFAULT_LOCALHOST_URL
    );
  }
  // In development, use localhost
  return process.env.DEPLOYMENT_URL ?? APP_CONFIG.DEFAULT_LOCALHOST_URL;
};

// Helper function to check if we're targeting localhost
export const isLocalhostTarget = (): boolean => {
  const targetURL = getAppUrl();
  return targetURL.includes('localhost:3000');
};
