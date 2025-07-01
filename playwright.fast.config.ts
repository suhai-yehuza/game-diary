import { defineConfig, devices } from '@playwright/test';

/**
 * Fast test configuration for development
 * Minimal browser coverage for quick feedback
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Reduced timeout for faster feedback */
  timeout: 30000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries for faster feedback */
  retries: 0,
  /* Single worker for development */
  workers: 1,

  /* Configure projects for fast development testing */
  projects: [
    // Only Chromium for fastest execution
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
    },
  ],
  /* Simple reporter for development */
  reporter: 'list',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8081',

    /* Minimal tracing for speed */
    trace: 'off',

    /* Screenshots only on failure */
    screenshot: 'only-on-failure',

    /* No video for speed */
    video: 'off',

    /* Faster timeouts for development */
    actionTimeout: 10000,
    navigationTimeout: 20000,

    /* Optimized context options */
    launchOptions: {
      args: [], // Removed global --disable-dev-shm-usage flag
    },
    contextOptions: {
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
      acceptDownloads: true,
    },
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev -p 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 60 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
