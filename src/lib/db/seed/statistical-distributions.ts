/**
 * Statistical Distributions for Realistic Data Generation
 *
 * This module provides various statistical distributions to mimic real-world data patterns:
 * - Pareto Principle (80/20 rule) for user engagement, game popularity
 * - Normal Distribution for ratings, completion times
 * - Exponential Distribution for time-based events
 * - Power Law for social media engagement
 * - Poisson Distribution for rare events
 */

import type {
  IDistributionConfig,
  IStatisticalSeedingConfig,
  DistributionConfigPreset,
} from '@src/lib/types/seeding-types';

// No external imports needed for statistical distributions

// ============================================================================
// CORE DISTRIBUTION FUNCTIONS
// ============================================================================

/**
 * Pareto Distribution (80/20 rule)
 * Used for: User engagement, game popularity, content virality
 */
export function paretoDistribution(
  min: number,
  max: number,
  alpha = 1.16 // 80/20 rule parameter
): number {
  const u = Math.random();
  const paretoValue = Math.pow(1 - u, -1 / alpha);

  // Scale to desired range
  const scaledValue = min + ((max - min) * (paretoValue - 1)) / (Math.pow(0.8, -1 / alpha) - 1);
  return Math.max(min, Math.min(max, scaledValue));
}

/**
 * Normal Distribution (Bell Curve)
 * Used for: Ratings, completion times, user behavior metrics
 */
export function normalDistribution(mean: number, stdDev: number, min: number, max: number): number {
  // Box-Muller transform for normal distribution
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const value = mean + z * stdDev;

  return Math.max(min, Math.min(max, value));
}

/**
 * Exponential Distribution
 * Used for: Time between events, decay patterns
 */
export function exponentialDistribution(lambda: number, min: number, max: number): number {
  const u = Math.random();
  const value = -Math.log(1 - u) / lambda;
  return Math.max(min, Math.min(max, value));
}

/**
 * Power Law Distribution
 * Used for: Social media engagement, content popularity
 */
export function powerLawDistribution(min: number, max: number, alpha = 2.5): number {
  const u = Math.random();
  const value = Math.pow(u, -1 / alpha);

  // Scale to desired range
  const scaledValue = min + ((max - min) * (value - 1)) / (Math.pow(0.99, -1 / alpha) - 1);
  return Math.max(min, Math.min(max, scaledValue));
}

/**
 * Poisson Distribution
 * Used for: Rare events, comment counts, reaction counts
 */
export function poissonDistribution(lambda: number): number {
  let k = 0;
  let p = 1;
  const L = Math.exp(-lambda);

  do {
    k++;
    p *= Math.random();
  } while (p > L);

  return k - 1;
}

/**
 * Beta Distribution (for bounded values like ratings)
 * Used for: Ratings, percentages, bounded metrics
 */
export function betaDistribution(alpha: number, beta: number, min: number, max: number): number {
  // Simplified beta distribution using gamma approximation
  const u1 = Math.random();
  const u2 = Math.random();

  const gamma1 = Math.pow(u1, 1 / alpha);
  const gamma2 = Math.pow(u2, 1 / beta);

  const value = gamma1 / (gamma1 + gamma2);
  return min + (max - min) * value;
}

// ============================================================================
// REAL-WORLD DATA PATTERNS
// ============================================================================

/**
 * User Engagement Pattern (Pareto + Normal)
 * - 20% of users are highly engaged (80% of activity)
 * - 80% of users are moderately engaged
 */
export function generateUserEngagement(): number {
  const isPowerUser = Math.random() < 0.2; // 20% power users

  if (isPowerUser) {
    // Power users: high engagement (Pareto distribution)
    return paretoDistribution(0.7, 1.0, 1.5);
  } else {
    // Regular users: moderate engagement (Normal distribution)
    return normalDistribution(0.4, 0.15, 0.1, 0.7);
  }
}

/**
 * Game Rating Distribution (Beta distribution)
 * - Most games get average ratings
 * - Few games get very high or very low ratings
 * - Mimics real rating patterns
 */
export function generateGameRating(): number {
  // Beta distribution with parameters that create realistic rating patterns
  const rating = betaDistribution(2.5, 2.5, 1, 10);
  return Math.round(rating);
}

/**
 * Comment Count Distribution (Poisson + Power Law)
 * - Most game logs get few comments
 * - Some get many comments (viral content)
 */
export function generateCommentCount(): number {
  const isViral = Math.random() < 0.05; // 5% viral content

  if (isViral) {
    // Viral content: many comments (Power Law)
    return Math.round(powerLawDistribution(10, 100, 2.0));
  } else {
    // Regular content: few comments (Poisson)
    return poissonDistribution(3);
  }
}

/**
 * Reaction Count Distribution (Pareto)
 * - Most content gets few reactions
 * - Popular content gets many reactions
 */
export function generateReactionCount(): number {
  return Math.round(paretoDistribution(0, 50, 1.2));
}

/**
 * User Activity Frequency (Exponential)
 * - Most users are active occasionally
 * - Few users are very active
 */
export function generateActivityFrequency(): number {
  return exponentialDistribution(0.3, 1, 30); // Days between activities
}

/**
 * Content Quality Distribution (Normal)
 * - Most content is average quality
 * - Few pieces are exceptional or poor
 */
export function generateContentQuality(): number {
  return normalDistribution(0.6, 0.2, 0.1, 1.0);
}

/**
 * Social Network Growth (Power Law)
 * - Most users have few friends
 * - Few users have many friends
 */
export function generateFriendCount(): number {
  return Math.round(powerLawDistribution(0, 200, 2.0));
}

/**
 * Time-based Patterns (Exponential + Normal)
 * - Most activities happen recently
 * - Some activities are older
 */
export function generateActivityAge(): number {
  const isRecent = Math.random() < 0.7; // 70% recent activity

  if (isRecent) {
    // Recent activity: exponential distribution
    return Math.round(exponentialDistribution(0.5, 0, 30));
  } else {
    // Older activity: normal distribution
    return Math.round(normalDistribution(60, 30, 31, 365));
  }
}

// ============================================================================
// SPECIALIZED GENERATORS
// ============================================================================

/**
 * Generate realistic user behavior patterns
 */
export function generateUserBehavior() {
  return {
    engagement: generateUserEngagement(),
    activityFrequency: generateActivityFrequency(),
    friendCount: generateFriendCount(),
    contentQuality: generateContentQuality(),
    lastActivityAge: generateActivityAge(),
  };
}

/**
 * Generate realistic content engagement patterns
 */
export function generateContentEngagement() {
  return {
    commentCount: generateCommentCount(),
    reactionCount: generateReactionCount(),
    rating: generateGameRating(),
    viralProbability: Math.random() < 0.05, // 5% chance of going viral
  };
}

/**
 * Generate realistic time patterns
 */
export function generateTimePatterns() {
  return {
    activityAge: generateActivityAge(),
    responseTime: exponentialDistribution(0.1, 0, 24), // Hours
    sessionDuration: normalDistribution(30, 15, 5, 120), // Minutes
  };
}

// ============================================================================
// DISTRIBUTION ANALYSIS TOOLS
// ============================================================================

/**
 * Analyze distribution of generated data
 */
export function analyzeDistribution(data: number[]): {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: { [key: string]: number };
} {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = sorted.reduce((sum, x) => sum + x, 0) / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const variance = sorted.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    percentiles: {
      '10%': sorted[Math.floor(n * 0.1)],
      '25%': sorted[Math.floor(n * 0.25)],
      '50%': median,
      '75%': sorted[Math.floor(n * 0.75)],
      '90%': sorted[Math.floor(n * 0.9)],
      '95%': sorted[Math.floor(n * 0.95)],
      '99%': sorted[Math.floor(n * 0.99)],
    },
  };
}

/**
 * Validate distribution against expected patterns
 */
export function validateDistribution(
  data: number[],
  expectedPattern: 'pareto' | 'normal' | 'exponential' | 'power-law'
): boolean {
  const analysis = analyzeDistribution(data);

  switch (expectedPattern) {
    case 'pareto':
      // Pareto: mean > median, high variance
      return analysis.mean > analysis.median && analysis.stdDev > analysis.mean * 0.5;

    case 'normal':
      // Normal: mean ≈ median, moderate variance
      return Math.abs(analysis.mean - analysis.median) < analysis.stdDev * 0.1;

    case 'exponential':
      // Exponential: mean ≈ stdDev, right-skewed
      return Math.abs(analysis.mean - analysis.stdDev) < analysis.mean * 0.2;

    case 'power-law':
      // Power law: high variance, long tail
      return analysis.stdDev > analysis.mean * 0.8;

    default:
      return true;
  }
}

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

export const DISTRIBUTION_PRESETS = {
  // User engagement patterns
  USER_ENGAGEMENT: {
    powerUserRatio: 0.2,
    engagementParetoAlpha: 1.5,
    engagementNormalMean: 0.4,
    engagementNormalStdDev: 0.15,
  },

  // Content popularity patterns
  CONTENT_POPULARITY: {
    viralContentRatio: 0.05,
    commentPoissonLambda: 3,
    reactionParetoAlpha: 1.2,
    ratingBetaAlpha: 2.5,
    ratingBetaBeta: 2.5,
  },

  // Social network patterns
  SOCIAL_NETWORK: {
    friendCountPowerLawAlpha: 2.0,
    activityFrequencyLambda: 0.3,
    responseTimeLambda: 0.1,
  },

  // Time-based patterns
  TIME_PATTERNS: {
    recentActivityRatio: 0.7,
    activityAgeExponentialLambda: 0.5,
    activityAgeNormalMean: 60,
    activityAgeNormalStdDev: 30,
  },
} as const;

// Type definitions are now imported from seeding-types

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_DISTRIBUTION_CONFIG: IStatisticalSeedingConfig = {
  // User-related distributions
  userEngagement: {
    type: 'pareto',
    parameters: { min: 0.1, max: 1.0, alpha: 1.5 },
  },
  userActivityFrequency: {
    type: 'exponential',
    parameters: { lambda: 0.3, min: 1, max: 30 },
  },
  userFriendCount: {
    type: 'power-law',
    parameters: { min: 0, max: 200, alpha: 2.0 },
  },
  userContentQuality: {
    type: 'normal',
    parameters: { mean: 0.6, stdDev: 0.2, min: 0.1, max: 1.0 },
  },
  userActivityAge: {
    type: 'exponential',
    parameters: { lambda: 0.5, min: 0, max: 365 },
  },

  // Content-related distributions
  gameRating: {
    type: 'beta',
    parameters: { alpha: 2.5, beta: 2.5, min: 1, max: 10 },
  },
  commentCount: {
    type: 'poisson',
    parameters: { lambda: 3 },
  },
  reactionCount: {
    type: 'pareto',
    parameters: { min: 0, max: 50, alpha: 1.2 },
  },
  contentViralProbability: {
    type: 'uniform',
    parameters: { min: 0, max: 1 },
  },

  // Time-related distributions
  activityAge: {
    type: 'exponential',
    parameters: { lambda: 0.5, min: 0, max: 365 },
  },
  responseTime: {
    type: 'exponential',
    parameters: { lambda: 0.1, min: 0, max: 24 },
  },
  sessionDuration: {
    type: 'normal',
    parameters: { mean: 30, stdDev: 15, min: 5, max: 120 },
  },

  // Game log distributions
  gameLogsPerUser: {
    type: 'normal',
    parameters: { mean: 8, stdDev: 4, min: 3, max: 15 },
  },
  gameLogClassification: {
    type: 'uniform',
    parameters: { min: 0, max: 1 },
  },
  gameLogTags: {
    type: 'poisson',
    parameters: { lambda: 2 },
  },

  // Social distributions
  friendshipStatus: {
    type: 'uniform',
    parameters: { min: 0, max: 1 },
  },
  notificationFrequency: {
    type: 'poisson',
    parameters: { lambda: 0.5 },
  },

  // Advanced settings
  enableRealisticPatterns: true,
  enableViralContent: true,
  enablePowerUsers: true,
  enableTimeDecay: true,
};

// ============================================================================
// CONFIGURATION PRESETS
// ============================================================================

export const DISTRIBUTION_CONFIG_PRESETS = {
  // Realistic social media patterns
  REALISTIC: {
    ...DEFAULT_DISTRIBUTION_CONFIG,
    enableRealisticPatterns: true,
    enableViralContent: true,
    enablePowerUsers: true,
    enableTimeDecay: true,
  },

  // Uniform distribution for testing
  UNIFORM: {
    userEngagement: { type: 'uniform', parameters: { min: 0.1, max: 1.0 } },
    userActivityFrequency: { type: 'uniform', parameters: { min: 1, max: 30 } },
    userFriendCount: { type: 'uniform', parameters: { min: 0, max: 200 } },
    userContentQuality: { type: 'uniform', parameters: { min: 0.1, max: 1.0 } },
    userActivityAge: { type: 'uniform', parameters: { min: 0, max: 365 } },
    gameRating: { type: 'uniform', parameters: { min: 1, max: 10 } },
    commentCount: { type: 'uniform', parameters: { min: 0, max: 20 } },
    reactionCount: { type: 'uniform', parameters: { min: 0, max: 50 } },
    contentViralProbability: { type: 'uniform', parameters: { min: 0, max: 1 } },
    activityAge: { type: 'uniform', parameters: { min: 0, max: 365 } },
    responseTime: { type: 'uniform', parameters: { min: 0, max: 24 } },
    sessionDuration: { type: 'uniform', parameters: { min: 5, max: 120 } },
    gameLogsPerUser: { type: 'uniform', parameters: { min: 3, max: 15 } },
    gameLogClassification: { type: 'uniform', parameters: { min: 0, max: 1 } },
    gameLogTags: { type: 'uniform', parameters: { min: 1, max: 5 } },
    friendshipStatus: { type: 'uniform', parameters: { min: 0, max: 1 } },
    notificationFrequency: { type: 'uniform', parameters: { min: 0, max: 10 } },
    enableRealisticPatterns: false,
    enableViralContent: false,
    enablePowerUsers: false,
    enableTimeDecay: false,
  },

  // High engagement patterns
  HIGH_ENGAGEMENT: {
    ...DEFAULT_DISTRIBUTION_CONFIG,
    userEngagement: {
      type: 'normal',
      parameters: { mean: 0.8, stdDev: 0.15, min: 0.5, max: 1.0 },
    },
    commentCount: {
      type: 'poisson',
      parameters: { lambda: 8 },
    },
    reactionCount: {
      type: 'pareto',
      parameters: { min: 10, max: 100, alpha: 1.0 },
    },
    enableViralContent: true,
  },

  // Low engagement patterns
  LOW_ENGAGEMENT: {
    ...DEFAULT_DISTRIBUTION_CONFIG,
    userEngagement: {
      type: 'normal',
      parameters: { mean: 0.2, stdDev: 0.1, min: 0.1, max: 0.5 },
    },
    commentCount: {
      type: 'poisson',
      parameters: { lambda: 1 },
    },
    reactionCount: {
      type: 'poisson',
      parameters: { lambda: 2 },
    },
    enableViralContent: false,
  },

  // Performance testing patterns
  PERFORMANCE: {
    ...DEFAULT_DISTRIBUTION_CONFIG,
    userEngagement: { type: 'uniform', parameters: { min: 0.5, max: 1.0 } },
    gameLogsPerUser: {
      type: 'normal',
      parameters: { mean: 20, stdDev: 10, min: 10, max: 50 },
    },
    commentCount: {
      type: 'poisson',
      parameters: { lambda: 5 },
    },
    reactionCount: {
      type: 'poisson',
      parameters: { lambda: 10 },
    },
    enableRealisticPatterns: false,
  },
} as const;

// DistributionConfigPreset type is now imported from seeding-types

// ============================================================================
// CONFIGURATION-BASED GENERATORS
// ============================================================================

/**
 * Generate a value based on distribution configuration
 */
export function generateValue(config: IDistributionConfig): number {
  const { type, parameters, customFunction } = config;

  if (customFunction) {
    return customFunction();
  }

  switch (type) {
    case 'pareto':
      return paretoDistribution(
        parameters.min || 0,
        parameters.max || 100,
        parameters.alpha || 1.16
      );

    case 'normal':
      return normalDistribution(
        parameters.mean || 50,
        parameters.stdDev || 15,
        parameters.min || 0,
        parameters.max || 100
      );

    case 'exponential':
      return exponentialDistribution(
        parameters.lambda || 0.1,
        parameters.min || 0,
        parameters.max || 100
      );

    case 'power-law':
      return powerLawDistribution(
        parameters.min || 0,
        parameters.max || 100,
        parameters.alpha || 2.5
      );

    case 'poisson':
      return poissonDistribution(parameters.lambda || 3);

    case 'beta':
      return betaDistribution(
        parameters.alpha || 2.5,
        parameters.beta || 2.5,
        parameters.min || 0,
        parameters.max || 1
      );

    case 'uniform':
      return Math.random() * (parameters.max - parameters.min) + parameters.min;

    default:
      return Math.random() * 100;
  }
}

/**
 * Generate user engagement based on configuration
 */
export function generateUserEngagementWithConfig(config: IStatisticalSeedingConfig): number {
  if (!config.enableRealisticPatterns) {
    return generateValue(config.userEngagement);
  }

  // Use realistic pattern: 20% power users, 80% regular users
  const isPowerUser = Math.random() < 0.2;

  if (isPowerUser && config.enablePowerUsers) {
    return paretoDistribution(0.7, 1.0, 1.5);
  } else {
    return normalDistribution(0.4, 0.15, 0.1, 0.7);
  }
}

/**
 * Generate game rating based on configuration
 */
export function generateGameRatingWithConfig(config: IStatisticalSeedingConfig): number {
  if (!config.enableRealisticPatterns) {
    return generateValue(config.gameRating);
  }

  // Use beta distribution for realistic rating patterns
  const rating = betaDistribution(2.5, 2.5, 1, 10);
  return Math.round(rating);
}

/**
 * Generate comment count based on configuration
 */
export function generateCommentCountWithConfig(config: IStatisticalSeedingConfig): number {
  if (!config.enableViralContent) {
    return generateValue(config.commentCount);
  }

  // Use realistic pattern: 5% viral content, 95% regular content
  const isViral = Math.random() < 0.05;

  if (isViral) {
    return Math.round(powerLawDistribution(10, 100, 2.0));
  } else {
    return poissonDistribution(3);
  }
}

/**
 * Generate reaction count based on configuration
 */
export function generateReactionCountWithConfig(config: IStatisticalSeedingConfig): number {
  if (!config.enableRealisticPatterns) {
    return generateValue(config.reactionCount);
  }

  return Math.round(paretoDistribution(0, 50, 1.2));
}

/**
 * Generate activity age based on configuration
 */
export function generateActivityAgeWithConfig(config: IStatisticalSeedingConfig): number {
  if (!config.enableTimeDecay) {
    return generateValue(config.activityAge);
  }

  // Use realistic pattern: 70% recent activity, 30% older activity
  const isRecent = Math.random() < 0.7;

  if (isRecent) {
    return Math.round(exponentialDistribution(0.5, 0, 30));
  } else {
    return Math.round(normalDistribution(60, 30, 31, 365));
  }
}

/**
 * Generate user behavior with configuration
 */
export function generateUserBehaviorWithConfig(config: IStatisticalSeedingConfig) {
  return {
    engagement: generateUserEngagementWithConfig(config),
    activityFrequency: generateValue(config.userActivityFrequency),
    friendCount: generateValue(config.userFriendCount),
    contentQuality: generateValue(config.userContentQuality),
    lastActivityAge: generateValue(config.userActivityAge),
  };
}

/**
 * Generate content engagement with configuration
 */
export function generateContentEngagementWithConfig(config: IStatisticalSeedingConfig) {
  return {
    commentCount: generateCommentCountWithConfig(config),
    reactionCount: generateReactionCountWithConfig(config),
    rating: generateGameRatingWithConfig(config),
    viralProbability: Math.random() < 0.05 && config.enableViralContent,
  };
}

/**
 * Generate time patterns with configuration
 */
export function generateTimePatternsWithConfig(config: IStatisticalSeedingConfig) {
  return {
    activityAge: generateActivityAgeWithConfig(config),
    responseTime: generateValue(config.responseTime),
    sessionDuration: generateValue(config.sessionDuration),
  };
}

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Get configuration preset by name
 */
export function getDistributionConfig(preset: DistributionConfigPreset): IStatisticalSeedingConfig {
  return DISTRIBUTION_CONFIG_PRESETS[preset as keyof typeof DISTRIBUTION_CONFIG_PRESETS];
}

/**
 * Merge configurations
 */
export function mergeDistributionConfig(
  base: IStatisticalSeedingConfig,
  overrides: Partial<IStatisticalSeedingConfig>
): IStatisticalSeedingConfig {
  return { ...base, ...overrides };
}

/**
 * Validate configuration
 */
export function validateDistributionConfig(config: IStatisticalSeedingConfig): boolean {
  // Basic validation - ensure all required fields are present
  const requiredFields = [
    'userEngagement',
    'gameRating',
    'commentCount',
    'reactionCount',
    'activityAge',
    'enableRealisticPatterns',
    'enableViralContent',
  ];

  return requiredFields.every(field => field in config);
}

/**
 * Create custom configuration
 */
export function createCustomDistributionConfig(
  overrides: Partial<IStatisticalSeedingConfig>
): IStatisticalSeedingConfig {
  return mergeDistributionConfig(DEFAULT_DISTRIBUTION_CONFIG, overrides);
}
