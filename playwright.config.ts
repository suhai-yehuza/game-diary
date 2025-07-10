import { defineConfig, devices } from '@playwright/test';

/**
 * Consolidated Playwright configuration supporting multiple modes
 *
 * Usage:
 * - Default (comprehensive): pnpm playwright test
 * - Smoke: PW_MODE=smoke pnpm playwright test
 * - Sanity: PW_MODE=sanity pnpm playwright test
 * - Critical: PW_MODE=critical pnpm playwright test
 * - Popular: PW_MODE=popular pnpm playwright test
 * - Pages: PW_MODE=pages pnpm playwright test
 */

// Determine mode from environment variable or default to comprehensive
const mode = process.env.PW_MODE ?? 'comprehensive';

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

// Common browser launch arguments for mobile devices
const mobileArgs = [
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-gpu',
  '--disable-web-security',
];

// Common web server configuration
const webServerConfig = {
  command: 'NODE_ENV=development pnpm dev -p 3000',
  url: 'http://localhost:3000',
  reuseExistingServer: true,
  timeout: 60 * 1000,
  stdout: 'pipe',
  stderr: 'pipe',
};

// Reporter configurations
const reporters = {
  list: ['list'],
  html: ['html'],
  ci: process.env.CI
    ? [
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ],
  development: process.env.CI
    ? [
        ['list'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [['list'], ['json', { outputFile: 'test-results/results.json' }]],
};

// Browser configurations
const browsers = {
  chromium: {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      launchOptions: { args: chromiumArgs },
    },
  },
  webkit: {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
      launchOptions: { args: [] },
    },
  },
  firefox: {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
  mobileChrome: {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
      launchOptions: { args: chromiumArgs },
    },
  },
  iphone: {
    name: 'iPhone',
    use: {
      ...devices['iPhone 12'],
      launchOptions: { args: mobileArgs },
    },
  },
  tablet: {
    name: 'Tablet',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1024, height: 768 },
      deviceScaleFactor: 1,
      userAgent:
        'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    },
  },
};

// Mode-specific configurations
const modeConfigs = {
  smoke: {
    testDir: './tests/e2e',
    projects: [browsers.chromium],
    reporter: reporters.list,
    use: {
      baseURL: process.env.DEPLOYMENT_URL ?? 'http://localhost:3000',
      trace: 'off',
      video: 'off',
      actionTimeout: 5000,
      navigationTimeout: 10000,
    },
    webServer: undefined, // No web server for smoke tests
  },

  sanity: {
    testDir: './tests/e2e/functional',
    projects: [browsers.chromium],
    reporter: reporters.development,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'off',
      video: 'off',
      actionTimeout: 10000,
      navigationTimeout: 20000,
    },
    webServer: webServerConfig,
  },

  critical: {
    testDir: './tests/e2e/functional',
    projects: [
      browsers.chromium,
      // Safari/WebKit - conditional in CI
      ...(process.env.CI && process.env.VERCEL_PRODUCTION_URL ? [] : [browsers.webkit]),
    ],
    reporter: reporters.ci,
    use: {
      baseURL: process.env.DEPLOYMENT_URL ?? 'http://localhost:3000',
      trace: 'on-first-retry',
      video: 'retain-on-failure',
      actionTimeout: 30000,
      navigationTimeout: 60000,
    },
    webServer: process.env.DEPLOYMENT_URL ? undefined : webServerConfig,
  },

  popular: {
    testDir: './tests/e2e/functional',
    shard: process.env.SHARD
      ? { total: parseInt(process.env.SHARD_TOTAL ?? '1'), current: parseInt(process.env.SHARD) }
      : undefined,
    projects: [browsers.chromium, browsers.webkit, browsers.mobileChrome],
    reporter: reporters.ci,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      video: 'retain-on-failure',
      actionTimeout: 30000,
      navigationTimeout: 60000,
    },
    webServer: webServerConfig,
  },

  pages: {
    testDir: './tests/e2e',
    projects: [browsers.chromium, browsers.webkit, browsers.mobileChrome],
    reporter: reporters.ci,
    use: {
      baseURL: 'http://localhost:3000',
      trace: 'on-first-retry',
      video: 'retain-on-failure',
      actionTimeout: 30000,
      navigationTimeout: 60000,
    },
    webServer: webServerConfig,
  },

  comprehensive: {
    testDir: './tests/e2e',
    projects: [
      browsers.chromium,
      browsers.firefox,
      browsers.webkit,
      browsers.mobileChrome,
      browsers.iphone,
      browsers.tablet,
    ],
    reporter: reporters.html,
    use: {
      baseURL: process.env.DEPLOYMENT_URL ?? 'http://localhost:3000',
      trace: 'on-first-retry',
      video: 'retain-on-failure',
      actionTimeout: 15000,
      navigationTimeout: 20000,
    },
    webServer: webServerConfig,
  },
};

// Get the configuration for the current mode
const currentConfig = modeConfigs[mode as keyof typeof modeConfigs] || modeConfigs.comprehensive;

export default defineConfig({
  // Shared settings across all modes
  timeout: 120000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 2,

  // Mode-specific settings
  ...currentConfig,

  // Shared use settings that can be overridden by mode
  use: {
    // Default shared settings
    screenshot: 'only-on-failure',
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
    // Override with mode-specific settings
    ...(currentConfig.use as any),
  },
} as any);
