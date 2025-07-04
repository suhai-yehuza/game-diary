/**
 * Distribution Configuration Examples
 *
 * This file demonstrates how to use the configurable statistical distributions
 * for different seeding scenarios.
 */

import {
  getDistributionConfig,
  createCustomDistributionConfig,
  mergeDistributionConfig,
  DEFAULT_DISTRIBUTION_CONFIG,
} from '@src/lib/db/seed/statistical-distributions';
import type {
  IStatisticalSeedingConfig,
  DistributionConfigPreset,
} from '@src/lib/types/seeding-types';

// ============================================================================
// EXAMPLE CONFIGURATIONS
// ============================================================================

/**
 * Example 1: Development Environment
 * - Fast seeding with uniform distributions
 * - Minimal data for quick iteration
 */
export const DEVELOPMENT_CONFIG: IStatisticalSeedingConfig = {
  ...DEFAULT_DISTRIBUTION_CONFIG,
  // Use uniform distributions for predictable results
  userEngagement: { type: 'uniform', parameters: { min: 0.3, max: 0.7 } },
  gameRating: { type: 'uniform', parameters: { min: 5, max: 8 } },
  commentCount: { type: 'uniform', parameters: { min: 0, max: 5 } },
  reactionCount: { type: 'uniform', parameters: { min: 0, max: 10 } },
  // Disable realistic patterns for faster generation
  enableRealisticPatterns: false,
  enableViralContent: false,
  enablePowerUsers: false,
  enableTimeDecay: false,
};

/**
 * Example 2: Testing Environment
 * - Comprehensive data with realistic patterns
 * - Edge cases and normal scenarios
 */
export const TESTING_CONFIG: IStatisticalSeedingConfig = {
  ...DEFAULT_DISTRIBUTION_CONFIG,
  // Enable all realistic patterns
  enableRealisticPatterns: true,
  enableViralContent: true,
  enablePowerUsers: true,
  enableTimeDecay: true,
  // Increase data volume for thorough testing
  gameLogsPerUser: {
    type: 'normal',
    parameters: { mean: 15, stdDev: 8, min: 5, max: 30 },
  },
  commentCount: {
    type: 'poisson',
    parameters: { lambda: 5 },
  },
  reactionCount: {
    type: 'pareto',
    parameters: { min: 0, max: 100, alpha: 1.0 },
  },
};

/**
 * Example 3: Performance Testing
 * - High volume data for performance testing
 * - Simplified distributions for speed
 */
export const PERFORMANCE_CONFIG: IStatisticalSeedingConfig = {
  ...DEFAULT_DISTRIBUTION_CONFIG,
  // High volume settings
  userEngagement: { type: 'uniform', parameters: { min: 0.5, max: 1.0 } },
  gameLogsPerUser: {
    type: 'normal',
    parameters: { mean: 50, stdDev: 20, min: 20, max: 100 },
  },
  commentCount: {
    type: 'poisson',
    parameters: { lambda: 10 },
  },
  reactionCount: {
    type: 'poisson',
    parameters: { lambda: 20 },
  },
  // Disable complex patterns for speed
  enableRealisticPatterns: false,
  enableViralContent: false,
  enablePowerUsers: false,
  enableTimeDecay: false,
};

/**
 * Example 4: Demo Environment
 * - Showcase realistic social media patterns
 * - Engaging data for demonstrations
 */
export const DEMO_CONFIG: IStatisticalSeedingConfig = {
  ...DEFAULT_DISTRIBUTION_CONFIG,
  // High engagement patterns
  userEngagement: {
    type: 'normal',
    parameters: { mean: 0.7, stdDev: 0.2, min: 0.3, max: 1.0 },
  },
  commentCount: {
    type: 'poisson',
    parameters: { lambda: 8 },
  },
  reactionCount: {
    type: 'pareto',
    parameters: { min: 5, max: 200, alpha: 1.0 },
  },
  gameRating: {
    type: 'beta',
    parameters: { alpha: 3.0, beta: 2.0, min: 1, max: 10 },
  },
  // Enable viral content for demo impact
  enableRealisticPatterns: true,
  enableViralContent: true,
  enablePowerUsers: true,
  enableTimeDecay: true,
};

/**
 * Example 5: Custom Configuration
 * - Tailored for specific use case
 * - Mix of different distribution types
 */

export const CUSTOM_CONFIG: IStatisticalSeedingConfig = createCustomDistributionConfig({
  // Custom user engagement: 30% power users
  userEngagement: {
    type: 'custom',
    parameters: {},
    customFunction: () => {
      const isPowerUser = Math.random() < 0.3; // 30% power users
      return isPowerUser
        ? Math.random() * 0.3 + 0.7 // 0.7-1.0
        : Math.random() * 0.4 + 0.1; // 0.1-0.5
    },
  },
  // Custom game rating: bimodal distribution
  gameRating: {
    type: 'custom',
    parameters: {},
    customFunction: () => {
      const isHighRated = Math.random() < 0.2; // 20% highly rated
      return isHighRated
        ? Math.floor(Math.random() * 3) + 8 // 8-10
        : Math.floor(Math.random() * 5) + 1; // 1-5
    },
  },
  // High viral content ratio for testing
  enableViralContent: true,
});

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Get configuration by environment
 */
export function getConfigByEnvironment(environment: string): IStatisticalSeedingConfig {
  switch (environment.toLowerCase()) {
    case 'development':
    case 'dev':
      return DEVELOPMENT_CONFIG;
    case 'testing':
    case 'test':
      return TESTING_CONFIG;
    case 'performance':
    case 'perf':
      return PERFORMANCE_CONFIG;
    case 'demo':
    case 'presentation':
      return DEMO_CONFIG;
    case 'custom':
      return CUSTOM_CONFIG;
    default:
      return DEFAULT_DISTRIBUTION_CONFIG;
  }
}

/**
 * Get configuration by preset name
 */

export function getConfigByPreset(preset: DistributionConfigPreset): IStatisticalSeedingConfig {
  return getDistributionConfig(preset);
}

/**
 * Create configuration with overrides
 */

export function createConfigWithOverrides(
  baseConfig: IStatisticalSeedingConfig,
  overrides: Partial<IStatisticalSeedingConfig>
): IStatisticalSeedingConfig {
  return mergeDistributionConfig(baseConfig, overrides);
}

/**
 * Validate configuration for specific use case
 */
export function validateConfigForUseCase(
  config: IStatisticalSeedingConfig,
  useCase: 'development' | 'testing' | 'performance' | 'demo'
): boolean {
  switch (useCase) {
    case 'development':
      return !config.enableRealisticPatterns && !config.enableViralContent;

    case 'testing':
      return config.enableRealisticPatterns && config.enableViralContent;

    case 'performance':
      return !config.enableRealisticPatterns && config.gameLogsPerUser.parameters.mean > 20;

    case 'demo':
      return config.enableViralContent && config.userEngagement.parameters.mean > 0.5;

    default:
      return true;
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example usage in seeding script
 */
export function exampleUsage() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const config = getConfigByEnvironment(process.env.NODE_ENV || 'development');

  // Validate configuration
  const isValid = validateConfigForUseCase(config, 'development');

  console.log('Configuration loaded:', {
    environment: process.env.NODE_ENV,
    enableRealisticPatterns: config.enableRealisticPatterns,
    enableViralContent: config.enableViralContent,
    isValid,
  });

  return config;
}

/**
 * Example of using configuration in seeding functions
 */
export function exampleSeedingWithConfig(config: IStatisticalSeedingConfig) {
  // Generate data using configuration
  const userEngagement =
    config.userEngagement.type === 'custom' && config.userEngagement.customFunction
      ? config.userEngagement.customFunction()
      : Math.random() *
          (config.userEngagement.parameters.max - config.userEngagement.parameters.min) +
        config.userEngagement.parameters.min;

  const gameRating =
    config.gameRating.type === 'custom' && config.gameRating.customFunction
      ? config.gameRating.customFunction()
      : Math.floor(
          Math.random() * (config.gameRating.parameters.max - config.gameRating.parameters.min + 1)
        ) + config.gameRating.parameters.min;

  return {
    userEngagement,
    gameRating,
    enableRealisticPatterns: config.enableRealisticPatterns,
  };
}

// ============================================================================
// CONFIGURATION COMPARISON
// ============================================================================

/**
 * Compare different configurations
 */
export function compareConfigurations() {
  const configs = {
    development: DEVELOPMENT_CONFIG,
    testing: TESTING_CONFIG,
    performance: PERFORMANCE_CONFIG,
    demo: DEMO_CONFIG,
    custom: CUSTOM_CONFIG,
  };

  const comparison = Object.entries(configs).map(([name, config]) => ({
    name,
    enableRealisticPatterns: config.enableRealisticPatterns,
    enableViralContent: config.enableViralContent,
    enablePowerUsers: config.enablePowerUsers,
    enableTimeDecay: config.enableTimeDecay,
    userEngagementType: config.userEngagement.type,
    gameRatingType: config.gameRating.type,
    commentCountType: config.commentCount.type,
    reactionCountType: config.reactionCount.type,
  }));

  return comparison;
}

export default {
  DEVELOPMENT_CONFIG,
  TESTING_CONFIG,
  PERFORMANCE_CONFIG,
  DEMO_CONFIG,
  CUSTOM_CONFIG,
  getConfigByEnvironment,
  getConfigByPreset,
  createConfigWithOverrides,
  validateConfigForUseCase,
  exampleUsage,
  exampleSeedingWithConfig,
  compareConfigurations,
};
