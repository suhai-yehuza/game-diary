import type { MockServerConfig } from '@src/lib/types';

// Default configuration
export const DEFAULT_MOCK_SERVER_CONFIG: MockServerConfig = {
  port: 3001,
  latency: {
    min: 50, // 50ms minimum latency
    max: 300, // 300ms maximum latency
  },
  errorRate: 0.05, // 5% error rate for realistic testing
  enableLogging: true,
};

// Development configuration
export const DEV_MOCK_SERVER_CONFIG: MockServerConfig = {
  ...DEFAULT_MOCK_SERVER_CONFIG,
  latency: {
    min: 20, // Faster for development
    max: 150,
  },
  errorRate: 0.02, // Lower error rate for development
  enableLogging: true,
};

// Testing configuration
export const TEST_MOCK_SERVER_CONFIG: MockServerConfig = {
  ...DEFAULT_MOCK_SERVER_CONFIG,
  latency: {
    min: 10, // Very fast for testing
    max: 50,
  },
  errorRate: 0.01, // Very low error rate for testing
  enableLogging: false, // Disable logging for cleaner test output
};

// Production-like configuration
export const PROD_MOCK_SERVER_CONFIG: MockServerConfig = {
  ...DEFAULT_MOCK_SERVER_CONFIG,
  latency: {
    min: 100, // More realistic latency
    max: 500,
  },
  errorRate: 0.1, // Higher error rate for stress testing
  enableLogging: true,
};

// E2E testing configuration
export const E2E_MOCK_SERVER_CONFIG: MockServerConfig = {
  ...DEFAULT_MOCK_SERVER_CONFIG,
  latency: {
    min: 30, // Balanced for E2E tests
    max: 200,
  },
  errorRate: 0.05, // Realistic error rate
  enableLogging: true,
};

// Get configuration based on environment
export function getMockServerConfig(environment?: string): MockServerConfig {
  switch (environment) {
    case 'development':
    case 'dev':
      return DEV_MOCK_SERVER_CONFIG;
    case 'test':
    case 'testing':
      return TEST_MOCK_SERVER_CONFIG;
    case 'production':
    case 'prod':
      return PROD_MOCK_SERVER_CONFIG;
    case 'e2e':
      return E2E_MOCK_SERVER_CONFIG;
    default:
      return DEFAULT_MOCK_SERVER_CONFIG;
  }
}

// Environment-specific configurations
export const MOCK_SERVER_CONFIGS = {
  default: DEFAULT_MOCK_SERVER_CONFIG,
  development: DEV_MOCK_SERVER_CONFIG,
  test: TEST_MOCK_SERVER_CONFIG,
  production: PROD_MOCK_SERVER_CONFIG,
  e2e: E2E_MOCK_SERVER_CONFIG,
} as const;

// Configuration validation
export function validateMockServerConfig(config: Partial<MockServerConfig>): boolean {
  if (config.port && (config.port < 1 || config.port > 65535)) {
    return false;
  }

  if (config.latency) {
    if (config.latency.min < 0 || config.latency.max < 0) {
      return false;
    }
    if (config.latency.min > config.latency.max) {
      return false;
    }
  }

  if (config.errorRate && (config.errorRate < 0 || config.errorRate > 1)) {
    return false;
  }

  return true;
}

// Configuration utilities
export function mergeMockServerConfig(
  baseConfig: MockServerConfig,
  overrides: Partial<MockServerConfig>
): MockServerConfig {
  return {
    ...baseConfig,
    ...overrides,
    latency: {
      ...baseConfig.latency,
      ...overrides.latency,
    },
  };
}
