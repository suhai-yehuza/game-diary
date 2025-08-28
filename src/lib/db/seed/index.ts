// Load environment variables from .env files
import { resolve } from 'path';

import { config } from 'dotenv';

import type { DistributionConfigPreset, ScenarioKey } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import {
  getConfigByEnvironment,
  getConfigByPreset,
} from '@src/lib/db/seed/distribution-config-examples';
import { seedExternalApiData } from '@src/lib/db/seed/external-api-seed';
import { getOptimizationConfig, PerformanceTracker } from '@src/lib/db/seed/optimization-config';
import { DISTRIBUTION_CONFIG_PRESETS } from '@src/lib/db/seed/statistical-distributions';
import { seedUserData, clearUserData } from '@src/lib/db/seed/user-data-seed';
import { formatDuration } from '@src/lib/utils/format-duration';

/**
 * Main seeding orchestrator for the Game Diary database
 *
 * This script provides functions to seed all database tables with mock data:
 *
 * External API Data (seasons, leagues, teams, nba_games, nba_players):
 * - Leagues: NBA
 * - Seasons: 2022, 2023, 2024
 * - Teams: Lakers, Celtics, Warriors, Heat, Bulls
 * - Players: LeBron James, Stephen Curry, Kevin Durant
 * - Games: 4 sample NBA games with different statuses
 *
 * User Data (users, friendships, game_logs, comments, reactions, notifications):
 * - Users: 4 sample users with different team preferences
 * - Friendships: Various friendship statuses (accepted, pending)
 * - Game Logs: Sample game logs with different classifications and settings
 * - Comments: Parent and child comments on game logs
 * - Reactions: Various emoji reactions on game logs and comments
 * - Notifications: Sample notifications for different events
 *
 * Game Ratings and Notifications are automatically populated by database triggers
 * when game logs are created.
 */

// Comprehensive helper function to generate all seeding configuration
function generateSeedingConfig(
  userCount: number,
  gameLogsMultiplier = 1,
  commentsMultiplier = 1,
  reactionsMultiplier = 1,
  friendshipsMultiplier = 1
) {
  const baseGameLogs = { min: 0, max: 10 };
  const baseComments = { min: 0, max: 10 };
  const baseFriendships = { min: 2, max: 8 };

  return {
    userCount,
    gameLogsPerUser: {
      min: Math.floor(baseGameLogs.min * gameLogsMultiplier),
      max: Math.floor(baseGameLogs.max * gameLogsMultiplier),
    },
    commentsPerGameLog: {
      min: Math.floor(baseComments.min * commentsMultiplier),
      max: Math.floor(baseComments.max * commentsMultiplier),
    },
    friendshipsPerUser: {
      min: Math.floor(baseFriendships.min * friendshipsMultiplier),
      max: Math.floor(baseFriendships.max * friendshipsMultiplier),
    },
    reactionsPerGameLog: {
      min: Math.floor(baseComments.min * commentsMultiplier * reactionsMultiplier),
      max: Math.floor(baseComments.max * commentsMultiplier * reactionsMultiplier),
    },
    reactionsPerComment: {
      min: Math.max(1, Math.floor(baseComments.min * commentsMultiplier)),
      max: Math.max(2, Math.floor(baseComments.max * commentsMultiplier)),
    },
    childCommentChance: 0.3, // 30% chance of child comments
  };
}

// Configuration for different data generation scenarios
const SEEDING_SCENARIOS = {
  SMALL: {
    description: 'Small dataset for development/testing',
    ...generateSeedingConfig(100, 0.5, 1, 1, 1),
  },
  MEDIUM: {
    description: 'Medium dataset for staging/demo (10x SMALL)',
    ...generateSeedingConfig(1000, 0.5, 1, 1, 1), // 10x users, same multipliers as SMALL
  },
  LARGE: {
    description: 'Large dataset for performance testing (100x SMALL)',
    ...generateSeedingConfig(10000, 0.5, 1, 1, 1), // 100x users, same multipliers as SMALL
  },
  'PARETO-DEMO': {
    description: 'Demonstrate Pareto distribution with many game logs per user',
    ...generateSeedingConfig(50, 20, 2, 3, 1), // 50 users, 20x more game logs per user
  },
  CUSTOM: {
    description: 'Custom dataset with specified parameters',
    ...generateSeedingConfig(0, 1.5, 1, 1.5, 1), // userCount will be overridden by command line
  },
} as const;

function loadEnvironmentConfig(environment?: string) {
  // Load the appropriate .env file based on environment
  const envFile = environment ? `.env.${environment}` : '.env';
  const envPath = resolve(process.cwd(), envFile);

  try {
    const result = config({ path: envPath });
    if (result.error) {
      logger.warn(`⚠️  Could not load ${envFile}, using default .env file`);
      // Fallback to default .env file
      config({ path: resolve(process.cwd(), '.env') });
    } else {
      logger.info(`📁 Loaded environment from: ${envFile}`);
    }
  } catch {
    logger.warn(`⚠️  Could not load ${envFile}, using default .env file`);
    // Fallback to default .env file
    config({ path: resolve(process.cwd(), '.env') });
  }
}

function showHelp() {
  const validPresets = Object.keys(DISTRIBUTION_CONFIG_PRESETS)
    .map(p => p.toLowerCase())
    .join(', ');
  logger.info(`
🌱 Database Seeding Script

Usage: pnpm run seed [options]

Options:
  --help, -h                    Show this help message
  --external, -e                Seed only external API data (NBA data)
  --internal, -i                Seed only internal app data (users, friendships, etc.)
  --all, -a                     Seed both external API and internal app data (default)
  --clear-user, -c              Clear all user data before seeding
  --scenario <scenario>         Use predefined seeding scenario
  --users <count>               Number of users to generate (for custom scenario)
  --distribution <preset>       Use predefined statistical distribution preset
  --env <environment>           Set environment (development, staging, production, test)
  --dry-run                     Show what would be seeded without actually seeding

  Note: Options with values can use --option=value or --option value format

Scenarios:
  small                         ${SEEDING_SCENARIOS.SMALL.description}
  medium                        ${SEEDING_SCENARIOS.MEDIUM.description}
  large                         ${SEEDING_SCENARIOS.LARGE.description}
  pareto-demo                   ${SEEDING_SCENARIOS['PARETO-DEMO'].description}
  custom                        ${SEEDING_SCENARIOS.CUSTOM.description}

Distribution Presets:
  ${validPresets}

Examples:
  pnpm run seed                                    # Seed all data with medium scenario
  pnpm run seed --scenario small                   # Seed with small dataset
  pnpm run seed --scenario large                   # Seed with large dataset
  pnpm run seed --users 50                         # Seed with 50 custom users
  pnpm run seed --distribution realistic           # Use realistic distribution patterns
  pnpm run seed --distribution=high-engagement     # Use high engagement patterns
  pnpm run seed --scenario=large --distribution=demo # Large dataset with demo patterns
  pnpm run seed --env=staging --scenario=medium    # Staging environment with medium dataset
  pnpm run seed --env=production --scenario=large --distribution=realistic # Production with realistic data
  pnpm run seed --external                         # Seed only NBA data
  pnpm run seed --internal                         # Seed only internal app data
  pnpm run seed --all                              # Seed both external and internal data
  pnpm run seed --clear-user                       # Clear user data before seeding
  pnpm run seed --dry-run                          # Show what would be seeded

Environment Variables:
  DATABASE_URL                  Database connection URL
  NEXT_PUBLIC_RAPID_API_KEY     RapidAPI key for NBA data
  NEXT_PUBLIC_RAPID_API_HOST    RapidAPI host (default: api-nba-v1.p.rapidapi.com)
`);
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options: {
    help?: boolean;
    external?: boolean;
    internal?: boolean;
    user?: boolean;
    all?: boolean;
    clearUser?: boolean;
    dryRun?: boolean;
    scenario?: ScenarioKey;
    userCount?: number;
    distribution?: DistributionConfigPreset;
    environment?: string;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Handle --foo=bar format
    if (arg.includes('=')) {
      const [option, value] = arg.split('=', 2);
      handleOptionWithValue(option, value, options);
      continue;
    }

    // Handle --foo bar format
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--external':
      case '-e':
        options.external = true;
        break;
      case '--internal':
      case '-i':
        options.internal = true;
        break;
      case '--user':
      case '-u':
        options.user = true;
        break;
      case '--all':
      case '-a':
        options.all = true;
        break;
      case '--clear-user':
      case '-c':
        options.clearUser = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--scenario':
        if (i + 1 < args.length) {
          const scenarioInput = args[++i];
          const scenario = scenarioInput.toUpperCase() as ScenarioKey;
          if (scenario in SEEDING_SCENARIOS) {
            options.scenario = scenario;
          } else {
            console.error(`❌ Unknown scenario: ${scenarioInput}`);
            console.log(
              'Available scenarios:',
              Object.keys(SEEDING_SCENARIOS)
                .map(s => s.toLowerCase())
                .join(', ')
            );
            process.exit(1);
          }
        }
        break;
      case '--users':
        if (i + 1 < args.length) {
          const count = parseInt(args[++i]);
          if (isNaN(count) || count <= 0) {
            console.error('❌ User count must be a positive number');
            process.exit(1);
          }
          options.userCount = count;
        }
        break;
      case '--distribution':
        if (i + 1 < args.length) {
          const distributionInput = args[++i];
          const distribution = distributionInput.toLowerCase();
          const validPresets = Object.keys(DISTRIBUTION_CONFIG_PRESETS).map(p => p.toLowerCase());
          const matchedIndex = validPresets.indexOf(distribution);
          if (matchedIndex !== -1) {
            options.distribution = Object.keys(DISTRIBUTION_CONFIG_PRESETS)[matchedIndex];
          } else {
            console.error(`❌ Unknown distribution preset: ${distributionInput}`);
            console.log('Available presets:', validPresets.join(', '));
            process.exit(1);
          }
        }
        break;
      case '--env':
        if (i + 1 < args.length) {
          const envInput = args[++i];
          const validEnvs = ['development', 'staging', 'production', 'test'];
          if (validEnvs.includes(envInput.toLowerCase())) {
            options.environment = envInput.toLowerCase();
          } else {
            console.error(`❌ Unknown environment: ${envInput}`);
            console.log('Available environments:', validEnvs.join(', '));
            process.exit(1);
          }
        }
        break;
      default:
        console.error(`❌ Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }

  return options;
}

function handleOptionWithValue(
  option: string,
  value: string,
  options: {
    help?: boolean;
    external?: boolean;
    internal?: boolean;
    user?: boolean;
    all?: boolean;
    clearUser?: boolean;
    dryRun?: boolean;
    scenario?: ScenarioKey;
    userCount?: number;
    distribution?: DistributionConfigPreset;
    environment?: string;
  }
) {
  switch (option) {
    case '--scenario': {
      const scenario = value.toUpperCase() as ScenarioKey;
      if (scenario in SEEDING_SCENARIOS) {
        options.scenario = scenario;
      } else {
        console.error(`❌ Unknown scenario: ${value}`);
        console.log(
          'Available scenarios:',
          Object.keys(SEEDING_SCENARIOS)
            .map(s => s.toLowerCase())
            .join(', ')
        );
        process.exit(1);
      }
      break;
    }
    case '--users': {
      const count = parseInt(value);
      if (isNaN(count) || count <= 0) {
        console.error('❌ User count must be a positive number');
        process.exit(1);
      }
      options.userCount = count;
      break;
    }
    case '--distribution': {
      const distribution = value.toLowerCase();
      const validPresets = Object.keys(DISTRIBUTION_CONFIG_PRESETS).map(p => p.toLowerCase());
      const matchedIndex = validPresets.indexOf(distribution);
      if (matchedIndex !== -1) {
        options.distribution = Object.keys(DISTRIBUTION_CONFIG_PRESETS)[matchedIndex];
      } else {
        console.error(`❌ Unknown distribution preset: ${value}`);
        console.log('Available presets:', validPresets.join(', '));
        process.exit(1);
      }
      break;
    }
    case '--env': {
      const validEnvs = ['development', 'staging', 'production', 'test'];
      if (validEnvs.includes(value.toLowerCase())) {
        options.environment = value.toLowerCase();
      } else {
        console.error(`❌ Unknown environment: ${value}`);
        console.log('Available environments:', validEnvs.join(', '));
        process.exit(1);
      }
      break;
    }
    default:
      console.error(`❌ Unknown option: ${option}`);
      showHelp();
      process.exit(1);
  }
}

function getScenarioConfig(scenario: ScenarioKey, userCount?: number) {
  const config = SEEDING_SCENARIOS[scenario];

  if (scenario === 'CUSTOM' && userCount) {
    return {
      ...config,
      userCount,
    };
  }

  return config;
}

function showDryRunInfo(
  scenario: ScenarioKey,
  userCount?: number,
  distribution?: DistributionConfigPreset,
  environment?: string
) {
  const config = getScenarioConfig(scenario, userCount);

  console.log('\n🔍 DRY RUN - What would be seeded:');
  if (environment) {
    console.log(`🌍 Environment: ${environment.toUpperCase()}`);
  }
  console.log(`📊 Scenario: ${scenario.toUpperCase()}`);
  console.log(`📝 Description: ${config.description}`);
  console.log(`👥 Users: ${config.userCount}`);
  console.log(`📝 Game Logs per User: ${config.gameLogsPerUser.min}-${config.gameLogsPerUser.max}`);
  console.log(
    `💬 Comments per Game Log: ${config.commentsPerGameLog.min}-${config.commentsPerGameLog.max}`
  );
  console.log(
    `👍 Reactions per Game Log: ${config.reactionsPerGameLog.min}-${config.reactionsPerGameLog.max}`
  );
  console.log(
    `👍 Reactions per Comment: ${config.reactionsPerComment.min}-${config.reactionsPerComment.max}`
  );
  console.log(
    `🤝 Friendships per User: ${config.friendshipsPerUser.min}-${config.friendshipsPerUser.max}`
  );
  if (distribution) {
    console.log(`📈 Distribution Preset: ${distribution.toUpperCase()}`);
  }

  // Calculate estimated totals
  const avgGameLogs = (config.gameLogsPerUser.min + config.gameLogsPerUser.max) / 2;
  const avgComments = (config.commentsPerGameLog.min + config.commentsPerGameLog.max) / 2;
  const avgReactionsPerGameLog =
    (config.reactionsPerGameLog.min + config.reactionsPerGameLog.max) / 2;
  const avgReactionsPerComment =
    (config.reactionsPerComment.min + config.reactionsPerComment.max) / 2;
  const avgFriendships = (config.friendshipsPerUser.min + config.friendshipsPerUser.max) / 2;
  const totalGameLogs = Math.floor(config.userCount * avgGameLogs);
  const totalComments = Math.floor(totalGameLogs * avgComments);
  const totalReactionsOnGameLogs = Math.floor(totalGameLogs * avgReactionsPerGameLog);
  const totalReactionsOnComments = Math.floor(totalComments * avgReactionsPerComment);
  const totalReactions = totalReactionsOnGameLogs + totalReactionsOnComments;
  const totalFriendships = Math.floor(config.userCount * avgFriendships);
  const totalNotifications = Math.floor(config.userCount * 10); // Rough estimate

  console.log('\n📈 Estimated Totals:');
  console.log(`   Game Logs: ~${totalGameLogs}`);
  console.log(`   Comments: ~${totalComments}`);
  console.log(`   Reactions on Game Logs: ~${totalReactionsOnGameLogs}`);
  console.log(`   Reactions on Comments: ~${totalReactionsOnComments}`);
  console.log(`   Total Reactions: ~${totalReactions}`);
  console.log(`   Friendships: ~${totalFriendships}`);
  console.log(`   Notifications: ~${totalNotifications}`);
}

async function main() {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  // Load environment-specific configuration
  const environment = options.environment ?? process.env.NODE_ENV ?? 'development';
  loadEnvironmentConfig(environment);

  // Initialize performance tracking and optimization config
  const performanceTracker = new PerformanceTracker();
  const optimizationConfig = getOptimizationConfig(environment);

  console.log('⚡ Performance optimization enabled');
  console.log(
    `🔧 Concurrency: ${optimizationConfig.concurrency.database} DB ops, ${optimizationConfig.concurrency.external_api} API calls`
  );
  console.log(
    `📦 Batch sizes: ${optimizationConfig.batch_sizes.medium} (medium), ${optimizationConfig.batch_sizes.large} (large)`
  );

  // Determine what to seed
  const seedExternal = options.external ?? options.all ?? (!options.internal && !options.user);
  const seedInternal = options.internal ?? options.all ?? (!options.external && !options.user);

  // Determine scenario
  const scenario: ScenarioKey = options.scenario ?? 'SMALL';
  const userCount = options.userCount;

  if (options.dryRun) {
    showDryRunInfo(scenario, userCount, options.distribution, environment);
    return;
  }

  performanceTracker.startTimer('total_seeding');
  console.log('🌱 Starting database seeding...');
  console.log(`🌍 Environment: ${environment.toUpperCase()}`);
  console.log(`📊 Scenario: ${scenario.toUpperCase()}`);

  if (userCount) {
    console.log(`👥 Custom user count: ${userCount}`);
  }

  try {
    // Seed external API data if requested
    if (seedExternal) {
      performanceTracker.startTimer('external_api_seeding');
      console.log('\n🏀 Seeding external API data (NBA)...');
      await seedExternalApiData(optimizationConfig);
      const externalTime = performanceTracker.endTimer('external_api_seeding');
      console.log(`✅ External API seeding completed in ${formatDuration(externalTime)}`);
    }

    // Clear user data if requested
    if (options.clearUser) {
      performanceTracker.startTimer('clear_user_data');
      console.log('\n🧹 Clearing existing user data...');
      await clearUserData();
      const clearTime = performanceTracker.endTimer('clear_user_data');
      console.log(`✅ User data cleared in ${formatDuration(clearTime)}`);
    }

    // Seed internal app data if requested
    if (seedInternal) {
      // Validate that external data exists before proceeding with internal seeding
      if (!seedExternal) {
        console.log('\n🔍 Validating external data exists before internal seeding...');
        const { neon } = await import('@neondatabase/serverless');
        const { drizzle } = await import('drizzle-orm/neon-http');
        const { nba_games } = await import('@src/lib/db/schema');

        const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
        if (!databaseUrl) {
          throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
        }

        const sql = neon(databaseUrl);
        const db = drizzle(sql);

        const validGames = await db.select({ id: nba_games.id }).from(nba_games);
        if (validGames.length === 0) {
          throw new Error(
            '❌ No external data found. Please run external seeding first or use --all to seed both external and internal data.'
          );
        }
        console.log(
          `✅ Found ${validGames.length} external games - proceeding with internal seeding`
        );
      }

      performanceTracker.startTimer('internal_data_seeding');
      console.log('\n👥 Seeding internal app data...');

      // Get distribution configuration
      const distributionConfig = options.distribution
        ? getConfigByPreset(options.distribution)
        : getConfigByEnvironment(environment);

      // Pass scenario configuration and optimization config to seedUserData
      const config = getScenarioConfig(scenario, userCount);
      await seedUserData(config, optimizationConfig, distributionConfig);
      const internalTime = performanceTracker.endTimer('internal_data_seeding');
      console.log(`✅ Internal app data seeding completed in ${formatDuration(internalTime)}`);
    }

    const totalTime = performanceTracker.endTimer('total_seeding');
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`⏱️  Total time: ${formatDuration(totalTime)}`);

    // Show performance metrics
    const metrics = performanceTracker.getMetrics();
    console.log('\n📊 Performance Summary:');
    Object.entries(metrics).forEach(([operation, stats]) => {
      const performance = performanceTracker.checkThresholds(operation);
      const emoji = performance === 'good' ? '🟢' : performance === 'acceptable' ? '🟡' : '🔴';
      console.log(
        `${emoji} ${operation}: ${formatDuration(stats.avg)} avg (${stats.count} operations)`
      );
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Seeding',
      action: 'Main seeding process',
    });
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
