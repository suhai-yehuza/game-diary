import { defineConfig, devices } from '@playwright/test';
import { APP_CONFIG, getAppUrl, isLocalhostTarget, getPort } from '@src/lib/config/app.config';

/**
 * Optimized Playwright configuration for maximum speed
 *
 * Usage:
 * - Default: pnpm playwright test
 * - Specific file: pnpm playwright test path/to/test.spec.ts
 * - Specific directory: pnpm playwright test tests/e2e/functional/
 */

// Optimized browser launch arguments for maximum speed
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
  '--disable-extensions',
  '--disable-logging',
  '--disable-notifications',
  '--disable-permissions-api',
  '--disable-background-networking',
  '--disable-component-extensions-with-background-pages',
  '--disable-client-side-phishing-detection',
  '--disable-hang-monitor',
  '--disable-prompt-on-repost',
  '--disable-domain-reliability',
  '--disable-features=TranslateUI',
  '--disable-ipc-flooding-protection',
  '--memory-pressure-off',
  '--max_old_space_size=4096',
];

// Optimized mobile Chromium arguments
const mobileChromiumArgs = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-gpu',
  '--disable-web-security',
  '--disable-extensions',
  '--disable-logging',
  '--disable-notifications',
  '--disable-permissions-api',
  '--disable-background-networking',
  '--disable-component-extensions-with-background-pages',
  '--disable-client-side-phishing-detection',
  '--disable-hang-monitor',
  '--disable-prompt-on-repost',
  '--disable-domain-reliability',
  '--disable-features=TranslateUI',
  '--disable-ipc-flooding-protection',
  '--memory-pressure-off',
  '--max_old_space_size=4096',
];

// Optimized WebKit arguments - WebKit has different supported flags than Chromium
const webkitArgs = [
  // WebKit-specific arguments that are actually supported
  '--no-startup-window',
];

const baseURL = getAppUrl();
const port = getPort();

// Optimized web server configuration
const webServerConfig = {
  command: `NODE_ENV=development pnpm dev:mock -p ${port}`,
  url: `http://localhost:${port}`,
  reuseExistingServer: !process.env.CI, // Don't reuse in CI to avoid conflicts
  timeout: APP_CONFIG.DEV_SERVER_TIMEOUT,
  stdout: 'pipe' as const,
  stderr: 'pipe' as const,
};

// Debug logging for CI environments
if (process.env.CI) {
  console.log('🔍 Optimized Playwright Configuration Debug:');
  console.log('  CI Environment:', process.env.CI);
  console.log('  DEPLOYMENT_URL:', process.env.DEPLOYMENT_URL);
  console.log('  VERCEL_URL:', process.env.VERCEL_URL);
  console.log('  VERCEL_PRODUCTION_URL:', process.env.VERCEL_PRODUCTION_URL);
  console.log('  Selected baseURL:', baseURL);
  console.log('  getAppUrl():', getAppUrl());
  console.log('  isLocalhostTarget():', isLocalhostTarget());
  console.log('  Will start web server:', isLocalhostTarget() && !process.env.CI);
  console.log(
    '  VERCEL_AUTOMATION_BYPASS_SECRET:',
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET ? 'SET' : 'NOT SET'
  );
}

export default defineConfig({
  // Test discovery
  testDir: './tests/e2e',

  // Optimized timeouts and retries for speed
  timeout: APP_CONFIG.TEST_TIMEOUT, // Standardized 10-minute timeout - no overrides needed in CI
  fullyParallel: true, // Enable full parallelism for maximum speed
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 4,

  // Web server configuration
  // In CI, don't start a web server if we're targeting localhost (server is started manually)
  webServer: isLocalhostTarget() && !process.env.CI ? webServerConfig : undefined,

  // Browser projects
  projects: [
    // Primary browser for most tests
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: chromiumArgs,
          headless: true, // Ensure headless for CI speed
        },
      },
    },
    // Additional browsers for comprehensive testing
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        launchOptions: {
          args: webkitArgs,
          headless: true, // Ensure headless for CI speed
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          headless: true, // Ensure headless for CI speed
        },
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: mobileChromiumArgs,
          headless: true, // Ensure headless for CI speed
        },
      },
    },
    {
      name: 'iPhone',
      use: {
        ...devices['iPhone 12'],
        launchOptions: {
          args: webkitArgs,
          headless: true, // Ensure headless for CI speed
        },
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
        launchOptions: {
          args: chromiumArgs,
          headless: true, // Ensure headless for CI speed
        },
      },
    },
  ],

  // Optimized shared use settings
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    actionTimeout: APP_CONFIG.TEST_ACTION_TIMEOUT, // Use consistent timeout across environments
    navigationTimeout: APP_CONFIG.TEST_NAVIGATION_TIMEOUT, // Use consistent timeout across environments
    launchOptions: {
      args: [],
    },
    // Add Vercel protection bypass header if secret is available
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        }
      : {},
    contextOptions: {
      ignoreHTTPSErrors: true,
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
      acceptDownloads: true,
      // Optimize context for speed
      bypassCSP: true,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
  },

  // Optimized reporter configuration
  reporter: process.env.CI
    ? [
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['html', { open: 'never' }], // Always generate HTML report in CI
      ]
    : [
        ['list'],
        ['html', { open: 'never' }], // Never auto-open HTML report
        ['json', { outputFile: 'test-results/results.json' }],
      ],

  // Coverage configuration for E2E tests
  ...(process.env.CI && {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        'coverage/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vitest.setup.ts',
        '**/next.config.js',
        '**/tailwind.config.ts',
        '**/postcss.config.mjs',
        '**/drizzle.config.ts',
        '**/codegen.ts',
        '**/playwright.config.ts',
        'src/lib/graphql/**',
        'src/lib/mock/**',
        'src/lib/types/**',
        'src/app/api/webhook/clerk-example-events/**',
        'src/app/styles/**',
        'src/middleware.ts',
      ],
    },
  }),
});
