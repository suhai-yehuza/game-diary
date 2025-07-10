import { defineConfig, devices } from '@playwright/test';
import { APP_CONFIG, getAppUrl, isLocalhostTarget, getPort } from './lib/config/app.config';

/**
 * Simplified Playwright configuration
 *
 * Usage:
 * - Default: pnpm playwright test
 * - Specific file: pnpm playwright test path/to/test.spec.ts
 * - Specific directory: pnpm playwright test tests/e2e/functional/
 */

// Common browser launch arguments for Chromium-based browsers
const chromiumArgs = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-gpu',
  '--disable-web-security',
  '--disable-features=VizDisplayCompositor',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
];

// Common browser launch arguments for mobile Chromium devices
const mobileChromiumArgs = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-gpu',
  '--disable-web-security',
];

// WebKit-specific arguments (minimal, as WebKit doesn't support many Chrome flags)
const webkitArgs = ['--no-sandbox', '--disable-web-security'];

const baseURL = getAppUrl();
const port = getPort();

// Web server configuration
const webServerConfig = {
  command: `NODE_ENV=development pnpm dev -p ${port}`,
  url: `http://localhost:${port}`,
  reuseExistingServer: !process.env.CI, // Reuse existing server in development, not in CI
  timeout: APP_CONFIG.DEV_SERVER_TIMEOUT,
  stdout: 'pipe' as const,
  stderr: 'pipe' as const,
};

// Debug logging for CI environments
if (process.env.CI) {
  console.log('🔍 Playwright Configuration Debug:');
  console.log('  CI Environment:', process.env.CI);
  console.log('  DEPLOYMENT_URL:', process.env.DEPLOYMENT_URL);
  console.log('  VERCEL_URL:', process.env.VERCEL_URL);
  console.log('  VERCEL_PRODUCTION_URL:', process.env.VERCEL_PRODUCTION_URL);
  console.log('  Selected baseURL:', baseURL);
  console.log('  Will start web server:', isLocalhostTarget());
}

export default defineConfig({
  // Test discovery
  testDir: './tests/e2e',

  // Timeouts and retries
  timeout: APP_CONFIG.TEST_TIMEOUT,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 2,

  // Web server configuration
  webServer: isLocalhostTarget() ? webServerConfig : undefined,

  // Browser projects
  projects: [
    // Primary browser for most tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: chromiumArgs },
      },
    },
    // Additional browsers for comprehensive testing
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: { args: webkitArgs },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: { args: mobileChromiumArgs },
      },
    },
    {
      name: 'iPhone',
      use: {
        ...devices['iPhone 12'],
        launchOptions: { args: webkitArgs },
      },
    },
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

  // Shared use settings
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    actionTimeout: APP_CONFIG.TEST_ACTION_TIMEOUT,
    navigationTimeout: APP_CONFIG.TEST_NAVIGATION_TIMEOUT,
    launchOptions: {
      args: [],
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

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [['list'], ['html'], ['json', { outputFile: 'test-results/results.json' }]],
});
