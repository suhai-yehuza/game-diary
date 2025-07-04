#!/usr/bin/env tsx

/**
 * Test Script for Configurable Statistical Distributions
 *
 * This script demonstrates how to use different distribution configurations
 * for various seeding scenarios.
 */

import {
  getDistributionConfig,
  createCustomDistributionConfig,
  mergeDistributionConfig,
  generateValue,
  type IStatisticalSeedingConfig,
  type DistributionConfigPreset,
} from '@src/lib/db/seed/statistical-distributions';

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test a specific configuration
 */
function testConfiguration(name: string, config: IStatisticalSeedingConfig) {
  console.log(`\n=== Testing ${name} Configuration ===`);

  // Test user engagement
  const userEngagements = [];
  for (let i = 0; i < 100; i++) {
    userEngagements.push(generateValue(config.userEngagement));
  }

  // Test game ratings
  const gameRatings = [];
  for (let i = 0; i < 100; i++) {
    gameRatings.push(generateValue(config.gameRating));
  }

  // Test comment counts
  const commentCounts = [];
  for (let i = 0; i < 100; i++) {
    commentCounts.push(generateValue(config.commentCount));
  }

  // Test reaction counts
  const reactionCounts = [];
  for (let i = 0; i < 100; i++) {
    reactionCounts.push(generateValue(config.reactionCount));
  }

  // Calculate statistics
  const userEngagementStats = calculateStats(userEngagements);
  const gameRatingStats = calculateStats(gameRatings);
  const commentCountStats = calculateStats(commentCounts);
  const reactionCountStats = calculateStats(reactionCounts);

  console.log(`\nUser Engagement:`);
  console.log(`  Mean: ${userEngagementStats.mean.toFixed(2)}`);
  console.log(`  Min: ${userEngagementStats.min.toFixed(2)}`);
  console.log(`  Max: ${userEngagementStats.max.toFixed(2)}`);

  console.log(`\nGame Ratings:`);
  console.log(`  Mean: ${gameRatingStats.mean.toFixed(2)}`);
  console.log(`  Min: ${gameRatingStats.min.toFixed(2)}`);
  console.log(`  Max: ${gameRatingStats.max.toFixed(2)}`);

  console.log(`\nComment Counts:`);
  console.log(`  Mean: ${commentCountStats.mean.toFixed(2)}`);
  console.log(`  Min: ${commentCountStats.min.toFixed(2)}`);
  console.log(`  Max: ${commentCountStats.max.toFixed(2)}`);

  console.log(`\nReaction Counts:`);
  console.log(`  Mean: ${reactionCountStats.mean.toFixed(2)}`);
  console.log(`  Min: ${reactionCountStats.min.toFixed(2)}`);
  console.log(`  Max: ${reactionCountStats.max.toFixed(2)}`);

  console.log(`\nConfiguration Settings:`);
  console.log(`  Realistic Patterns: ${config.enableRealisticPatterns}`);
  console.log(`  Viral Content: ${config.enableViralContent}`);
  console.log(`  Power Users: ${config.enablePowerUsers}`);
  console.log(`  Time Decay: ${config.enableTimeDecay}`);

  return {
    name,
    userEngagementStats,
    gameRatingStats,
    commentCountStats,
    reactionCountStats,
    settings: {
      enableRealisticPatterns: config.enableRealisticPatterns,
      enableViralContent: config.enableViralContent,
      enablePowerUsers: config.enablePowerUsers,
      enableTimeDecay: config.enableTimeDecay,
    },
  };
}

/**
 * Calculate basic statistics
 */
function calculateStats(data: number[]) {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, x) => sum + x, 0) / n;
  const min = sorted[0];
  const max = sorted[n - 1];

  return { mean, min, max, count: n };
}

/**
 * Compare configurations
 */
function compareConfigurations() {
  console.log('🔧 Configurable Statistical Distributions Test');
  console.log('==============================================\n');

  const presets: DistributionConfigPreset[] = [
    'REALISTIC',
    'UNIFORM',
    'HIGH_ENGAGEMENT',
    'LOW_ENGAGEMENT',
    'PERFORMANCE',
  ];

  const results = [];

  for (const preset of presets) {
    try {
      const config = getDistributionConfig(preset);
      const result = testConfiguration(preset, config);
      results.push(result);
    } catch (error) {
      console.error(`Error testing ${preset}:`, error);
    }
  }

  // Summary comparison
  console.log('\n📊 Configuration Comparison Summary');
  console.log('====================================');

  results.forEach(result => {
    console.log(`\n${result.name}:`);
    console.log(
      `  User Engagement: ${result.userEngagementStats.mean.toFixed(2)} (${result.userEngagementStats.min.toFixed(2)}-${result.userEngagementStats.max.toFixed(2)})`
    );
    console.log(
      `  Game Ratings: ${result.gameRatingStats.mean.toFixed(2)} (${result.gameRatingStats.min.toFixed(2)}-${result.gameRatingStats.max.toFixed(2)})`
    );
    console.log(
      `  Comment Counts: ${result.commentCountStats.mean.toFixed(2)} (${result.commentCountStats.min.toFixed(2)}-${result.commentCountStats.max.toFixed(2)})`
    );
    console.log(
      `  Reaction Counts: ${result.reactionCountStats.mean.toFixed(2)} (${result.reactionCountStats.min.toFixed(2)}-${result.reactionCountStats.max.toFixed(2)})`
    );
    console.log(
      `  Settings: RP=${result.settings.enableRealisticPatterns}, VC=${result.settings.enableViralContent}, PU=${result.settings.enablePowerUsers}, TD=${result.settings.enableTimeDecay}`
    );
  });

  return results;
}

/**
 * Test custom configuration
 */
function testCustomConfiguration() {
  console.log('\n=== Testing Custom Configuration ===');

  // Create custom configuration with 30% power users
  const customConfig = createCustomDistributionConfig({
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
    enableViralContent: true,
  });

  return testConfiguration('CUSTOM', customConfig);
}

/**
 * Test configuration merging
 */
function testConfigurationMerging() {
  console.log('\n=== Testing Configuration Merging ===');

  // Start with realistic configuration
  const baseConfig = getDistributionConfig('REALISTIC');

  // Override specific settings
  const mergedConfig = mergeDistributionConfig(baseConfig, {
    userEngagement: { type: 'uniform', parameters: { min: 0.5, max: 1.0 } },
    gameRating: { type: 'uniform', parameters: { min: 6, max: 9 } },
    enableRealisticPatterns: false,
  });

  return testConfiguration('MERGED', mergedConfig);
}

/**
 * Test environment-based configuration
 */
function testEnvironmentConfiguration() {
  console.log('\n=== Testing Environment-Based Configuration ===');

  const environments = ['development', 'testing', 'performance', 'demo'];

  environments.forEach(env => {
    console.log(`\nEnvironment: ${env.toUpperCase()}`);

    // Simulate environment-based configuration selection
    let config: IStatisticalSeedingConfig;

    switch (env) {
      case 'development':
        config = getDistributionConfig('UNIFORM');
        break;
      case 'testing':
        config = getDistributionConfig('REALISTIC');
        break;
      case 'performance':
        config = getDistributionConfig('PERFORMANCE');
        break;
      case 'demo':
        config = getDistributionConfig('HIGH_ENGAGEMENT');
        break;
      default:
        config = getDistributionConfig('REALISTIC');
    }

    console.log(
      `  Configuration: ${config.enableRealisticPatterns ? 'Realistic' : 'Uniform'} patterns`
    );
    console.log(`  Viral Content: ${config.enableViralContent ? 'Enabled' : 'Disabled'}`);
    console.log(`  Power Users: ${config.enablePowerUsers ? 'Enabled' : 'Disabled'}`);
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    // Test predefined configurations
    const presetResults = compareConfigurations();

    // Test custom configuration
    const customResult = testCustomConfiguration();

    // Test configuration merging
    const mergedResult = testConfigurationMerging();

    // Test environment-based configuration
    testEnvironmentConfiguration();

    console.log('\n✅ All configuration tests completed successfully!');
    console.log(
      '\n📈 The configurable system provides flexibility for different seeding scenarios:'
    );
    console.log('   - REALISTIC: Production-like patterns');
    console.log('   - UNIFORM: Fast, predictable data');
    console.log('   - HIGH_ENGAGEMENT: Demo environments');
    console.log('   - LOW_ENGAGEMENT: Edge case testing');
    console.log('   - PERFORMANCE: High-volume testing');
    console.log('   - CUSTOM: Tailored distributions');
    console.log('   - MERGED: Combined configurations');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main().catch(console.error);
