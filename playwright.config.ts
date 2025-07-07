import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Global test timeout - reduced from 120s to 60s */
  timeout: 60000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Increased workers for better parallelism */
  // workers: 1,
  workers: process.env.CI ? 2 : 6,

  /* Configure projects for major browsers with mobile optimizations */
  projects: [
    // Desktop browsers - reduced from 6 to 3 core browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile Chrome - single mobile representative
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
          ],
        },
      },
    },
    // iPhone - single iOS representative
    {
      name: 'iPhone',
      use: {
        ...devices['iPhone 12'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
          ],
        },
      },
    },
    // Tablet - single tablet representative
    {
      name: 'Tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 1,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure only */
    screenshot: 'only-on-failure',

    /* Record video on failure only */
    video: 'retain-on-failure',

    /* Reduced timeouts for faster execution */
    actionTimeout: 10000, // Reduced from 15000
    navigationTimeout: 20000, // Reduced from 30000

    /* Fail tests on console errors */
    launchOptions: {
      args: [], // Removed global --disable-dev-shm-usage flag
    },
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'NODE_ENV=development pnpm dev -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
