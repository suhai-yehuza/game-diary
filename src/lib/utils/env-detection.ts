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
 * Check if the current environment is a test/CI environment
 */
export function isTestOrCIEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.API_MOCK_MODE === 'true' ||
    process.env.E2E_MOCK_MODE === 'true' ||
    process.env.PLAYWRIGHT_TEST === 'true' ||
    isCI()
  );
}
