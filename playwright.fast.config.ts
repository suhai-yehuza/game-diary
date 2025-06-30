import { defineConfig, devices } from '@playwright/test';

/**
 * Fast Playwright configuration for development testing
 * Uses only Chromium with minimal overhead for quick feedback
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Only run the fast test file */
  testMatch: '**/fast.spec.ts',
  /* Reduced timeout for faster feedback */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries for faster execution */
  retries: 0,
  /* Multiple workers for parallel execution */
  workers: 4,

  /* Single project - Chromium only */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'list', // Simple list reporter for faster output

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8080',

    /* Minimal tracing for speed */
    trace: 'off',

    /* No screenshots for speed */
    screenshot: 'off',

    /* No video recording for speed */
    video: 'off',

    /* Aggressive timeouts for faster failure detection */
    actionTimeout: 5000,
    navigationTimeout: 10000,

    /* Fail tests on console errors */
    launchOptions: {
      args: ['--disable-dev-shm-usage'],
    },
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev -p 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 seconds for Next.js to start
  },
});
