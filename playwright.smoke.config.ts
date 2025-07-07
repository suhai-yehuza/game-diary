import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke test configuration for post-deployment validation
 * Quick tests to ensure deployment was successful
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Very short timeout for quick feedback */
  timeout: 15000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* No retries for immediate feedback */
  retries: 0,
  /* Single worker for smoke tests */
  workers: 1,

  /* Configure projects for smoke testing */
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
  /* Simple reporter for smoke tests */
  reporter: 'list',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.DEPLOYMENT_URL || 'http://localhost:3000',

    /* No tracing for speed */
    trace: 'off',

    /* Screenshots only on failure */
    screenshot: 'only-on-failure',

    /* No video for speed */
    video: 'off',

    /* Very fast timeouts for smoke tests */
    actionTimeout: 5000,
    navigationTimeout: 10000,

    /* Optimized context options */
    launchOptions: {
      args: ['--disable-dev-shm-usage'],
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

  /* No web server for smoke tests - test against deployed URL */
});
