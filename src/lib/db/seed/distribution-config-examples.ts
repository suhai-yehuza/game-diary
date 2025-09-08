/**
 * Distribution Configuration Examples
 *
 * This file demonstrates how to use the configurable statistical distributions
 * for different seeding scenarios.
 */

import type { IStatisticalSeedingConfig, DistributionConfigPreset } from '@/types';
import {
  getDistributionConfig,
  createCustomDistributionConfig,
  mergeDistributionConfig,
  DEFAULT_DISTRIBUTION_CONFIG,
} from '@src/lib/db/seed/statistical-distributions';

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
  gameRating: { type: 'uniform', parameters: { min: 1, max: 5 } },
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
 * - Engaging data for demonstrations and presentations
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
    parameters: { alpha: 3.0, beta: 2.0, min: 1, max: 5 },
  },
  // Enable viral content for demo and presentation impact
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
        ? 5 // Clamp to 5
        : Math.floor(Math.random() * 5) + 1; // 1-5
    },
  },
  // High viral content ratio for testing
  enableViralContent: true,
});

export const PARETO_DEMO_CONFIG: IStatisticalSeedingConfig = {
  // User-related distributions
  userEngagement: {
    type: 'pareto',
    parameters: {
      alpha: 1.16, // 80/20 rule
      min: 0.1,
      max: 2.0,
    },
  },
  userActivityFrequency: {
    type: 'exponential',
    parameters: {
      lambda: 0.3,
      min: 1,
      max: 30,
    },
  },
  userFriendCount: {
    type: 'power-law',
    parameters: {
      alpha: 2.0,
      min: 0,
      max: 200,
    },
  },
  userContentQuality: {
    type: 'normal',
    parameters: {
      mean: 0.6,
      stdDev: 0.2,
      min: 0.1,
      max: 1.0,
    },
  },
  userActivityAge: {
    type: 'exponential',
    parameters: {
      lambda: 0.1,
      min: 0,
      max: 365,
    },
  },

  // Content-related distributions
  gameRating: {
    type: 'normal',
    parameters: {
      mean: 3.5,
      stdDev: 0.8,
      min: 1,
      max: 5,
    },
  },
  commentCount: {
    type: 'pareto',
    parameters: {
      alpha: 1.5,
      min: 0,
      max: 100,
    },
  },
  reactionCount: {
    type: 'pareto',
    parameters: {
      alpha: 1.3,
      min: 0,
      max: 200,
    },
  },
  contentViralProbability: {
    type: 'uniform',
    parameters: {
      min: 0,
      max: 1,
    },
  },

  // Time-related distributions
  activityAge: {
    type: 'exponential',
    parameters: {
      lambda: 0.1,
      min: 0,
      max: 365,
    },
  },
  responseTime: {
    type: 'exponential',
    parameters: {
      lambda: 0.1,
      min: 0,
      max: 24,
    },
  },
  sessionDuration: {
    type: 'normal',
    parameters: {
      mean: 30,
      stdDev: 15,
      min: 5,
      max: 120,
    },
  },

  // Game log distributions
  gameLogsPerUser: {
    type: 'pareto',
    parameters: {
      alpha: 1.16,
      min: 50,
      max: 200,
    },
  },
  gameLogClassification: {
    type: 'uniform',
    parameters: {
      min: 0,
      max: 1,
    },
  },
  gameLogTags: {
    type: 'uniform',
    parameters: {
      min: 1,
      max: 4,
    },
  },

  // Social distributions
  friendshipStatus: {
    type: 'uniform',
    parameters: {
      min: 0,
      max: 1,
    },
  },
  notificationFrequency: {
    type: 'exponential',
    parameters: {
      lambda: 0.5,
      min: 0,
      max: 10,
    },
  },

  // Advanced settings
  enableRealisticPatterns: true,
  enableViralContent: true,
  enablePowerUsers: true,
  enableTimeDecay: true,

  // Pareto distribution probabilities
  commentReactionProbability: 0.4,
  gameLogReactionProbability: 0.6,
  userGameLogProbability: 0.5,
  userFriendshipProbability: 0.7,
  gameLogGameProbability: 0.4,
};

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
    case 'showcase':
      return DEMO_CONFIG;
    case 'custom':
      return CUSTOM_CONFIG;
    case 'pareto-demo':
      return PARETO_DEMO_CONFIG;
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
  useCase: 'development' | 'testing' | 'performance' | 'demo' | 'presentation' | 'pareto-demo'
): boolean {
  switch (useCase) {
    case 'development':
      return !(config.enableRealisticPatterns ?? false) && !(config.enableViralContent ?? false);

    case 'testing':
      return (config.enableRealisticPatterns ?? false) && (config.enableViralContent ?? false);

    case 'performance':
      return (
        !(config.enableRealisticPatterns ?? false) &&
        (config.gameLogsPerUser?.parameters.mean ?? 0) > 20
      );

    case 'demo':
    case 'presentation':
      return (
        (config.enableViralContent ?? false) && (config.userEngagement?.parameters.mean ?? 0) > 0.5
      );

    case 'pareto-demo':
      return !!(
        config.userEngagement &&
        config.gameRating &&
        config.commentCount &&
        config.reactionCount &&
        config.activityAge
      );

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
    config.userEngagement?.type === 'custom' && config.userEngagement?.customFunction
      ? config.userEngagement.customFunction(config.userEngagement)
      : Math.random() *
          ((config.userEngagement?.parameters.max ?? 1) -
            (config.userEngagement?.parameters.min ?? 0)) +
        (config.userEngagement?.parameters.min ?? 0);

  const gameRating =
    config.gameRating?.type === 'custom' && config.gameRating?.customFunction
      ? config.gameRating.customFunction(config.gameRating)
      : Math.floor(
          Math.random() *
            ((config.gameRating?.parameters.max ?? 10) -
              (config.gameRating?.parameters.min ?? 1) +
              1)
        ) + (config.gameRating?.parameters.min ?? 1);

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
    paretoDemo: PARETO_DEMO_CONFIG,
  };

  const comparison = Object.entries(configs).map(([name, config]) => ({
    name,
    enableRealisticPatterns: config.enableRealisticPatterns ?? false,
    enableViralContent: config.enableViralContent ?? false,
    enablePowerUsers: config.enablePowerUsers ?? false,
    enableTimeDecay: config.enableTimeDecay ?? false,
    userEngagementType: config.userEngagement?.type ?? 'uniform',
    gameRatingType: config.gameRating?.type ?? 'uniform',
    commentCountType: config.commentCount?.type ?? 'uniform',
    reactionCountType: config.reactionCount?.type ?? 'uniform',
  }));

  return comparison;
}
