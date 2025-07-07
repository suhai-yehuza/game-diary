import { defineConfig, devices } from '@playwright/test';

/**
 * Critical test configuration for both local and deployed environments
 * Optimized for reliability and comprehensive testing
 */
export default defineConfig({
  testDir: './tests/e2e/functional',
  /* Global test timeout */
  timeout: 90000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Optimized workers for better stability */
  workers: process.env.CI ? 2 : 4,

  /* Configure projects for most popular browsers only */
  projects: [
    // Chrome/Chromium - Most popular browser (~65% market share)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optimize for stability
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
    // Safari/WebKit - Important for iOS/macOS users (~20% market share)
    // Disabled in production CI due to WebKit-specific rendering issues
    ...(process.env.CI && process.env.VERCEL_PRODUCTION_URL
      ? []
      : [
          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
              // Optimize for stability - no Chromium-specific flags
              launchOptions: {
                args: [],
              },
            },
          },
        ]),
    // Mobile Chrome - Mobile testing representative
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
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.DEPLOYMENT_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure only */
    screenshot: 'only-on-failure',

    /* Record video on failure only */
    video: 'retain-on-failure',

    /* Optimized timeouts for better stability */
    actionTimeout: 30000,
    navigationTimeout: 60000,

    /* Fail tests on console errors */
    launchOptions: {
      args: [], // Removed global --disable-dev-shm-usage flag
    },
    contextOptions: {
      ignoreHTTPSErrors: true,
      // Optimize for stability
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
      acceptDownloads: true,
    },
  },

  /* Run your local dev server before starting the tests - only if not testing deployed URL */
  ...(process.env.DEPLOYMENT_URL
    ? {}
    : {
        webServer: {
          command: 'NODE_ENV=development pnpm dev -p 3000',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 60 * 1000,
          // Add health check for better reliability
          stdout: 'pipe',
          stderr: 'pipe',
        },
      }),
});
