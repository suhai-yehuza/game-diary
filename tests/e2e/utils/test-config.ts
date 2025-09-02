import { TIMEOUTS } from './test-utils';

/**
 * Centralized test configuration for E2E tests
 * Provides consistent configuration across all test suites
 */

// Test environment configuration
export const TEST_ENV_CONFIG = {
  // Timeout configurations
  timeouts: {
    short: TIMEOUTS.SHORT,
    medium: TIMEOUTS.MEDIUM,
    long: TIMEOUTS.LONG,
    extended: TIMEOUTS.EXTENDED,
  },

  // Retry configurations
  retries: {
    smoke: 1,
    critical: 2,
    full: 3,
  },

  // Parallel execution settings
  parallel: {
    smoke: false, // Run smoke tests sequentially
    critical: false, // Run critical tests sequentially
    full: true, // Allow parallel execution for full tests
  },

  // Viewport configurations
  viewports: {
    desktop: { width: 1280, height: 720 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },

  // Performance thresholds
  performance: {
    maxLoadTime: {
      ci: 15000, // 15s in CI
      local: 8000, // 8s locally
    },
    maxDomTime: {
      ci: 10000, // 10s in CI
      local: 5000, // 5s locally
    },
  },
} as const;

// Test data configurations
export const TEST_DATA_CONFIG = {
  // User test data
  users: {
    test: {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPassword123!',
    },
    admin: {
      email: 'admin@example.com',
      username: 'admin',
      password: 'AdminPassword123!',
    },
  },

  // Game log test data
  gameLogs: {
    valid: {
      title: 'Test Game Log',
      content: 'Test content for game log',
      rating: 4,
    },
    invalid: {
      title: '',
      content: '',
      rating: 6, // Invalid rating
    },
  },

  // Search test data
  search: {
    valid: ['NBA', 'Basketball', 'Game'],
    invalid: ['', '   ', 'x'.repeat(1000)], // Very long search
  },
} as const;

// Mock server configurations
export const MOCK_SERVER_CONFIG = {
  // Base URL
  baseUrl: '/api/mock-server',

  // Endpoint configurations
  endpoints: {
    health: '?action=health',
    externalApi: '?action=external-api',
    database: '?action=database',
    mockData: '?action=mock-data',
    stats: '?action=stats',
  },

  // API endpoints to test
  apiEndpoints: ['games', 'teams', 'players', 'standings', 'seasons', 'leagues', 'statistics'],

  // Database tables to test
  databaseTables: ['users', 'game_logs', 'friendships', 'comments', 'game_ratings'],

  // Mock data types
  mockDataTypes: ['live-games', 'nba-games', 'nba-teams', 'nba-players', 'nba-standings'],

  // Response patterns for validation
  responsePatterns: {
    success: {
      status: 200,
      hasData: true,
      hasTimestamp: true,
    },
    health: {
      status: 'healthy',
      hasConfig: true,
    },
    externalApi: {
      hasLatency: true,
      hasData: true,
    },
    database: {
      hasData: true,
      isArray: true,
    },
  },
} as const;

// Page test configurations
export const PAGE_TEST_CONFIG = {
  // Home page
  home: {
    path: '/',
    expectedTitle: /Game Diary|GameLog/i,
    checks: ['structure', 'title', 'performance'] as const,
  },

  // Sports pages
  sports: {
    paths: ['/sports/nba', '/sports/all-sports', '/sports/live'],
    timeout: TIMEOUTS.EXTENDED,
    checks: ['structure', 'title'] as const,
  },

  // Dashboard page
  dashboard: {
    path: '/protected/user',
    expectedTitle: /Dashboard|User/i,
    checks: ['structure', 'title'] as const,
  },

  // Search page
  search: {
    path: '/search',
    expectedTitle: /Search/i,
    checks: ['structure', 'title'] as const,
  },

  // Admin pages
  admin: {
    database: {
      path: '/protected/admin/database',
      expectedTitle: /Database/i,
      checks: ['structure', 'title'] as const,
    },
    experimental: {
      path: '/protected/admin/experimental',
      expectedTitle: /Experimental/i,
      checks: ['structure', 'title'] as const,
    },
  },
} as const;

// Test scenario configurations
export const TEST_SCENARIOS = {
  // Smoke test scenarios
  smoke: {
    name: 'smoke-test',
    timeout: TIMEOUTS.EXTENDED,
    retries: TEST_ENV_CONFIG.retries.smoke,
    parallel: TEST_ENV_CONFIG.parallel.smoke,
    pages: ['home', 'sports', 'dashboard'],
    checks: ['structure', 'title', 'basic-functionality'],
  },

  // Critical test scenarios
  critical: {
    name: 'critical-test',
    timeout: TIMEOUTS.EXTENDED,
    retries: TEST_ENV_CONFIG.retries.critical,
    parallel: TEST_ENV_CONFIG.parallel.critical,
    pages: ['home', 'sports', 'dashboard', 'search'],
    checks: ['structure', 'title', 'accessibility', 'performance'],
  },

  // Full test scenarios
  full: {
    name: 'full-test',
    timeout: TIMEOUTS.EXTENDED,
    retries: TEST_ENV_CONFIG.retries.full,
    parallel: TEST_ENV_CONFIG.parallel.full,
    pages: ['home', 'sports', 'dashboard', 'search', 'admin'],
    checks: ['structure', 'title', 'accessibility', 'performance', 'security'],
  },

  // Mock server test scenarios
  mockServer: {
    name: 'mock-server-test',
    timeout: TIMEOUTS.MEDIUM,
    retries: 1,
    parallel: false,
    endpoints: MOCK_SERVER_CONFIG.apiEndpoints,
    databaseTables: MOCK_SERVER_CONFIG.databaseTables,
    checks: ['health', 'external-api', 'database', 'performance'],
  },
} as const;

// Error handling configurations
export const ERROR_HANDLING_CONFIG = {
  // Console error filters
  consoleErrors: {
    // Ignore these error patterns
    ignorePatterns: [
      'favicon',
      'manifest',
      'fonts.googleapis.com',
      'analytics',
      'adblock',
      'Failed to load resource: the server responded with a status of 400',
      'Failed to load resource: the server responded with a status of 403',
      'Failed to load resource: the server responded with a status of 429',
      'Access-Control-Allow-Origin',
      'Status code: 429',
      'too many requests',
      'rate limit',
      'ChunkLoadError',
      'Loading chunk',
      'Uncaught (in promise)',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection',
      'Script error',
      'Error: Network Error',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NAME_NOT_RESOLVED',
      'net::ERR_FAILED',
      // Clerk-related errors
      'useSession can only be used within the <ClerkProvider /> component',
      'Clerk component error caught',
      'useAssertWrappedByClerkProvider',
      'ClerkErrorBoundary',
      'SignIn',
      'SignUp',
      '@clerk/nextjs',
      '@clerk/shared',
      'Clerk: Failed to load Clerk',
      // Google Sign-In errors
      '[GSI_LOGGER]',
      'FedCM get() rejects with NetworkError',
      'Error retrieving a token',
    ],

    // Additional benign error patterns
    benignPatterns: [
      'Content Security Policy',
      'Module',
      'HMR update',
      'accounts.google.com',
      'frame-ancestors',
    ],
  },

  // Network error filters
  networkErrors: {
    // Ignore these failure patterns
    ignorePatterns: ['analytics', 'tracking', 'external-service'],
  },

  // Rate limiting detection
  rateLimiting: {
    indicators: [
      'too_many_requests',
      'Too many requests',
      'rate_limit_exceeded',
      'Rate limit exceeded',
    ],
  },
} as const;

// Accessibility configurations
export const ACCESSIBILITY_CONFIG = {
  // Touch target minimum size (in pixels)
  touchTargetMinSize: 44,

  // Maximum number of elements to check for accessibility
  maxElementsToCheck: {
    images: 5,
    inputs: 3,
    headings: 10,
  },

  // Required ARIA attributes
  requiredAriaAttributes: ['aria-label', 'aria-labelledby', 'aria-describedby'],
} as const;

// Performance configurations
export const PERFORMANCE_CONFIG = {
  // Metrics to collect
  metrics: ['loadTime', 'domContentLoaded', 'firstPaint', 'firstContentfulPaint'],

  // Performance budgets
  budgets: {
    loadTime: {
      ci: 15000,
      local: 8000,
    },
    domContentLoaded: {
      ci: 10000,
      local: 5000,
    },
  },
} as const;

// Test utility configurations
export const UTILITY_CONFIG = {
  // Screenshot configurations
  screenshots: {
    path: 'test-results-e2e',
    format: 'png',
    fullPage: true,
  },

  // Debug configurations
  debug: {
    enabled: process.env.DEBUG === 'true',
    logLevel: 'info',
    takeScreenshots: true,
  },

  // Mock configurations
  mock: {
    enabled: process.env.MOCK_MODE === 'true',
    dataTypes: MOCK_SERVER_CONFIG.mockDataTypes,
    endpoints: MOCK_SERVER_CONFIG.apiEndpoints,
  },
} as const;
