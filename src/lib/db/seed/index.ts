// Load environment variables from .env files
import { resolve } from 'path';

import { config } from 'dotenv';

import {
  getConfigByEnvironment,
  getConfigByPreset,
} from '@src/lib/db/seed/distribution-config-examples';
import { seedExternalApiData } from '@src/lib/db/seed/external-api-seed';
import { getOptimizationConfig, PerformanceTracker } from '@src/lib/db/seed/optimization-config';
import { seedUserData, clearUserData } from '@src/lib/db/seed/user-data-seed';
import type { DistributionConfigPreset, ScenarioKey } from '@src/lib/types/seeding-types';

/**
 * Main seeding orchestrator for the Game Diary database
 *
 * This script provides functions to seed all database tables with mock data:
 *
 * External API Data (seasons, leagues, teams, nba_games, nba_players):
 * - Leagues: NBA, WNBA
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

// Configuration for different data generation scenarios
const SEEDING_SCENARIOS = {
  SMALL: {
    description: 'Small dataset for development/testing',
    userCount: 20,
    gameLogsPerUser: { min: 2, max: 5 },
    commentsPerGameLog: { min: 1, max: 3 },
  },
  MEDIUM: {
    description: 'Medium dataset for staging/demo',
    userCount: 100,
    gameLogsPerUser: { min: 3, max: 10 },
    commentsPerGameLog: { min: 1, max: 5 },
  },
  LARGE: {
    description: 'Large dataset for performance testing',
    userCount: 500,
    gameLogsPerUser: { min: 5, max: 20 },
    commentsPerGameLog: { min: 2, max: 8 },
  },
  CUSTOM: {
    description: 'Custom dataset with specified parameters',
    userCount: 0, // Will be set via command line
    gameLogsPerUser: { min: 3, max: 15 },
    commentsPerGameLog: { min: 1, max: 5 },
  },
} as const;

function loadEnvironmentConfig(environment?: string) {
  // Load the appropriate .env file based on environment
  const envFile = environment ? `.env.${environment}` : '.env';
  const envPath = resolve(process.cwd(), envFile);

  try {
    const result = config({ path: envPath });
    if (result.error) {
      console.warn(`⚠️  Could not load ${envFile}, using default .env file`);
      // Fallback to default .env file
      config({ path: resolve(process.cwd(), '.env') });
    } else {
      console.log(`📁 Loaded environment from: ${envFile}`);
    }
  } catch {
    console.warn(`⚠️  Could not load ${envFile}, using default .env file`);
    // Fallback to default .env file
    config({ path: resolve(process.cwd(), '.env') });
  }
}

function showHelp() {
  console.log(`
🌱 Database Seeding Script

Usage: npm run seed [options]

Options:
  --help, -h                    Show this help message
  --external, -e                Seed only external API data (NBA data)
  --user, -u                    Seed only user data
  --all, -a                     Seed both external API and user data (default)
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
  custom                        ${SEEDING_SCENARIOS.CUSTOM.description}

Distribution Presets:
  realistic                     Realistic social media patterns (Pareto, Power Law)
  uniform                       Uniform random distribution (for testing)
  high-engagement               High user engagement patterns
  low-engagement                Low user engagement patterns
  performance                   Optimized for performance testing
  development                   Development-friendly patterns
  testing                       Testing-optimized patterns
  demo                          Demo-optimized patterns

Examples:
  npm run seed                                    # Seed all data with medium scenario
  npm run seed --scenario small                   # Seed with small dataset
  npm run seed --scenario large                   # Seed with large dataset
  npm run seed --users 50                         # Seed with 50 custom users
  npm run seed --distribution realistic           # Use realistic distribution patterns
  npm run seed --distribution=high-engagement     # Use high engagement patterns
  npm run seed --scenario=large --distribution=demo # Large dataset with demo patterns
  npm run seed --env=staging --scenario=medium    # Staging environment with medium dataset
  npm run seed --env=production --scenario=large --distribution=realistic # Production with realistic data
  npm run seed --external                         # Seed only NBA data
  npm run seed --user                             # Seed only user data
  npm run seed --clear-user                       # Clear user data before seeding
  npm run seed --dry-run                          # Show what would be seeded

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
          const validPresets = [
            'realistic',
            'uniform',
            'high-engagement',
            'low-engagement',
            'performance',
            'development',
            'testing',
            'demo',
          ];
          if (validPresets.includes(distribution)) {
            options.distribution = distribution;
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
      const validPresets = [
        'realistic',
        'uniform',
        'high-engagement',
        'low-engagement',
        'performance',
        'development',
        'testing',
        'demo',
      ];
      if (validPresets.includes(distribution)) {
        options.distribution = distribution;
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
  if (distribution) {
    console.log(`📈 Distribution Preset: ${distribution.toUpperCase()}`);
  }

  // Calculate estimated totals
  const avgGameLogs = (config.gameLogsPerUser.min + config.gameLogsPerUser.max) / 2;
  const avgComments = (config.commentsPerGameLog.min + config.commentsPerGameLog.max) / 2;
  const totalGameLogs = Math.floor(config.userCount * avgGameLogs);
  const totalComments = Math.floor(totalGameLogs * avgComments);
  const totalReactions = Math.floor(totalGameLogs * 3 + totalComments * 1.5); // Rough estimate
  const totalNotifications = Math.floor(config.userCount * 10); // Rough estimate

  console.log('\n📈 Estimated Totals:');
  console.log(`   Game Logs: ~${totalGameLogs}`);
  console.log(`   Comments: ~${totalComments}`);
  console.log(`   Reactions: ~${totalReactions}`);
  console.log(`   Notifications: ~${totalNotifications}`);
  console.log(`   Friendships: ~${Math.floor(config.userCount * 5)}`); // Rough estimate
}

async function main() {
  const options = parseArguments();

  if (options.help) {
    showHelp();
    return;
  }

  // Load environment-specific configuration
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  const seedExternal = options.external ?? options.all ?? !options.user;
  const seedUser = options.user ?? options.all ?? !options.user;

  // Determine scenario
  const scenario: ScenarioKey = options.scenario ?? 'MEDIUM';
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
      console.log(`✅ External API seeding completed in ${externalTime.toFixed(2)}ms`);
    }

    // Clear user data if requested
    if (options.clearUser) {
      performanceTracker.startTimer('clear_user_data');
      console.log('\n🧹 Clearing existing user data...');
      await clearUserData();
      const clearTime = performanceTracker.endTimer('clear_user_data');
      console.log(`✅ User data cleared in ${clearTime.toFixed(2)}ms`);
    }

    // Seed user data if requested
    if (seedUser) {
      performanceTracker.startTimer('user_data_seeding');
      console.log('\n👥 Seeding user data...');

      // Get distribution configuration
      const distributionConfig = options.distribution
        ? getConfigByPreset(options.distribution)
        : getConfigByEnvironment(environment);

      // Pass scenario configuration and optimization config to seedUserData
      const config = getScenarioConfig(scenario, userCount);
      await seedUserData(config, optimizationConfig, distributionConfig);
      const userTime = performanceTracker.endTimer('user_data_seeding');
      console.log(`✅ User data seeding completed in ${userTime.toFixed(2)}ms`);
    }

    const totalTime = performanceTracker.endTimer('total_seeding');
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`⏱️  Total time: ${totalTime.toFixed(2)}ms`);

    // Show performance metrics
    const metrics = performanceTracker.getMetrics();
    console.log('\n📊 Performance Summary:');
    Object.entries(metrics).forEach(([operation, stats]) => {
      const performance = performanceTracker.checkThresholds(operation);
      const emoji = performance === 'good' ? '🟢' : performance === 'acceptable' ? '🟡' : '🔴';
      console.log(
        `${emoji} ${operation}: ${stats.avg.toFixed(2)}ms avg (${stats.count} operations)`
      );
    });
  } catch (error) {
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

export { main as seedDatabase };
