#!/usr/bin/env tsx
/**
 * @fileoverview Optimized seeding script that reuses environment variables
 * This script avoids redundant environment loading and database connections
 */

import { resolve } from 'path';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import type { DistributionConfigPreset, ScenarioKey } from '@/types';
import { runSeedingWithNotificationBypass } from '@scripts/seeding-notification-bypass';
import {
  getConfigByEnvironment,
  getConfigByPreset,
} from '@src/lib/db/seed/distribution-config-examples';
import { seedExternalApiData } from '@src/lib/db/seed/external-api-seed';
import { getOptimizationConfig, PerformanceTracker } from '@src/lib/db/seed/optimization-config';
import { DISTRIBUTION_CONFIG_PRESETS } from '@src/lib/db/seed/statistical-distributions';
import { seedUserData, clearUserData } from '@src/lib/db/seed/user-data-seed';
import { formatDuration } from '@src/lib/utils/format-duration';

interface SeedOptions {
  env?: string;
  external?: boolean;
  user?: boolean;
  scenario?: ScenarioKey;
  preset?: DistributionConfigPreset;
  dryRun?: boolean;
  reuseEnv?: boolean;
}

// Global environment cache
let environmentLoaded = false;
let cachedEnv: string | null = null;

function loadEnvironmentOptimized(env?: string, reuseEnv = true): string {
  // If we're reusing environment and it's already loaded, return cached env
  if (reuseEnv && environmentLoaded && cachedEnv) {
    console.log(`♻️  Reusing cached environment: ${cachedEnv}`);
    return cachedEnv;
  }

  const targetEnv = env || process.env.NODE_ENV || 'development';
  console.log(`🔄 Loading environment configuration for: ${targetEnv}`);

  // Determine which .env file to load
  let mainEnvFile = '.env';
  if (targetEnv === 'development' && existsSync('.env.development')) {
    mainEnvFile = '.env.development';
  } else if (targetEnv === 'staging' && existsSync('.env.staging')) {
    mainEnvFile = '.env.staging';
  } else if (
    (targetEnv === 'production' || targetEnv === 'prod') &&
    existsSync('.env.production')
  ) {
    mainEnvFile = '.env.production';
  } else if (existsSync('.env')) {
    mainEnvFile = '.env';
  }

  // Load the environment-specific configuration
  config({ path: mainEnvFile });

  // For development, also load .env.development if it exists (as override)
  if (targetEnv === 'development' && existsSync('.env.development')) {
    config({ path: '.env.development', override: true });
  }

  // Cache the environment
  environmentLoaded = true;
  cachedEnv = targetEnv;

  console.log(`✅ Environment loaded: ${targetEnv}`);
  return targetEnv;
}

// Comprehensive helper function to generate all seeding configuration
function generateSeedingConfig(
  userCount: number,
  gameLogsMultiplier = 1,
  commentsMultiplier = 1,
  reactionsMultiplier = 1,
  friendshipsMultiplier = 1
) {
  return {
    users: {
      count: userCount,
    },
    gameLogs: {
      count: Math.floor(userCount * 2 * gameLogsMultiplier), // 2 game logs per user by default
    },
    comments: {
      count: Math.floor(userCount * 3 * commentsMultiplier), // 3 comments per user by default
    },
    reactions: {
      count: Math.floor(userCount * 5 * reactionsMultiplier), // 5 reactions per user by default
    },
    friendships: {
      count: Math.floor(userCount * 1.5 * friendshipsMultiplier), // 1.5 friendships per user by default
    },
  };
}

async function seedOptimized(options: SeedOptions = {}) {
  const {
    env,
    external = false,
    user = false,
    scenario = 'SMALL',
    preset = 'REALISTIC',
    dryRun = false,
    reuseEnv = true,
  } = options;

  // Load environment (with caching)
  const targetEnv = loadEnvironmentOptimized(env, reuseEnv);

  if (dryRun) {
    console.log(`🔍 DRY RUN: Would execute seeding operations`);
    console.log(`📊 Target environment: ${targetEnv}`);
    console.log(`📊 External seeding: ${external}`);
    console.log(`📊 User seeding: ${user}`);
    console.log(`📊 Scenario: ${scenario}`);
    console.log(`📊 Preset: ${preset}`);
    return { success: true, dryRun: true };
  }

  // Performance optimization
  const optimizationConfig = getOptimizationConfig(targetEnv);
  const performanceTracker = new PerformanceTracker();

  console.log(`⚡ Performance optimization enabled`);
  console.log(
    `🔧 Concurrency: ${optimizationConfig.concurrency.db} DB ops, ${optimizationConfig.concurrency.api} API calls`
  );
  console.log(
    `📦 Batch sizes: ${optimizationConfig.batchSizes.medium} (medium), ${optimizationConfig.batchSizes.large} (large)`
  );

  console.log(`🌱 Starting database seeding...`);
  console.log(`🌍 Environment: ${targetEnv.toUpperCase()}`);
  console.log(`📊 Scenario: ${scenario}`);

  try {
    // External API data seeding
    if (external) {
      console.log(`🏀 Seeding external API data (NBA)...`);
      const externalStartTime = performance.now();

      await seedExternalApiData({
        environment: targetEnv,
        optimization: optimizationConfig,
        performanceTracker,
      });

      const externalDuration = performance.now() - externalStartTime;
      console.log(`✅ External API data seeding completed in ${formatDuration(externalDuration)}`);
    }

    // User data seeding
    if (user) {
      console.log(`👥 Seeding user data...`);
      const userStartTime = performance.now();

      // Get configuration based on scenario and preset
      const scenarioConfig = getConfigByEnvironment(targetEnv, scenario);
      const presetConfig = getConfigByPreset(preset);

      // Generate seeding configuration
      const seedingConfig = generateSeedingConfig(
        scenarioConfig.users.count,
        scenarioConfig.gameLogs.multiplier,
        scenarioConfig.comments.multiplier,
        scenarioConfig.reactions.multiplier,
        scenarioConfig.friendships.multiplier
      );

      console.log(`📊 Seeding configuration:`, seedingConfig);

      // Clear existing user data first
      await clearUserData();

      // Seed user data with notification bypass
      await runSeedingWithNotificationBypass(async () => {
        await seedUserData({
          config: seedingConfig,
          distributionPreset: presetConfig,
          optimization: optimizationConfig,
          performanceTracker,
        });
      });

      const userDuration = performance.now() - userStartTime;
      console.log(`✅ User data seeding completed in ${formatDuration(userDuration)}`);
    }

    // Performance summary
    const totalDuration = performanceTracker.getTotalDuration();
    console.log(`📊 Performance Summary:`);
    console.log(`   Total time: ${formatDuration(totalDuration)}`);
    console.log(`   Database operations: ${performanceTracker.getDbOperationCount()}`);
    console.log(`   API calls: ${performanceTracker.getApiCallCount()}`);

    console.log(`🎉 Database seeding completed successfully!`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`❌ Database seeding failed:`, error);
    errorHandlers.handleError(error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  const options: SeedOptions = {
    external: args.includes('--external'),
    user: args.includes('--user'),
    scenario:
      (args.find(arg => arg.startsWith('--scenario='))?.split('=')[1] as ScenarioKey) || 'SMALL',
    preset:
      (args.find(arg => arg.startsWith('--preset='))?.split('=')[1] as DistributionConfigPreset) ||
      'REALISTIC',
    dryRun: args.includes('--dry-run'),
    reuseEnv: !args.includes('--no-reuse-env'),
  };

  // Extract environment from --env flag
  const envArg = args.find(arg => arg.startsWith('--env='));
  if (envArg) {
    options.env = envArg.split('=')[1];
  }

  // If no specific seeding type is specified, default to external
  if (!options.external && !options.user) {
    options.external = true;
  }

  try {
    const result = await seedOptimized(options);

    if (result.dryRun) {
      console.log(`🔍 Dry run completed successfully`);
      process.exit(0);
    }

    console.log(`🎉 Seeding completed successfully!`);
  } catch (error) {
    console.error(`❌ Seeding failed:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { seedOptimized, loadEnvironmentOptimized };
