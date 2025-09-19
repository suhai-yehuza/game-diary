#!/usr/bin/env tsx
/**
 * @fileoverview Optimized reseed script that consolidates reset and seeding operations
 * This script eliminates redundant environment loading and database connections
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { resetWithEnvironmentOptimized } from './reset-with-env-optimized';
import { seedOptimized, loadEnvironmentOptimized } from './seed-optimized';

interface ReseedOptions {
  env: string;
  skipSchemaCheck?: boolean;
  skipIfClean?: boolean;
  checkTimestamps?: boolean;
  dryRun?: boolean;
  external?: boolean;
  user?: boolean;
  scenario?: string;
  preset?: string;
}

async function reseedOptimized(options: ReseedOptions) {
  const {
    env,
    skipSchemaCheck = false,
    skipIfClean = false,
    checkTimestamps = true,
    dryRun = false,
    external = true,
    user = false,
    scenario = 'SMALL',
    preset = 'REALISTIC',
  } = options;

  console.log(`🚀 Starting optimized reseed process...`);
  console.log(`🌍 Environment: ${env}`);
  console.log(`🔍 Dry run: ${dryRun}`);

  // Load environment once at the beginning
  const targetEnv = loadEnvironmentOptimized(env, true);

  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.error(`❌ No DATABASE_URL found for ${env} environment`);
    process.exit(1);
  }

  console.log(`📊 Database URL: ${databaseUrl.substring(0, 20)}...`);

  try {
    // Step 1: Reset database
    console.log(`\n📋 Step 1: Resetting database...`);
    const resetResult = await resetWithEnvironmentOptimized({
      env: targetEnv,
      skipSchemaCheck,
      skipIfClean,
      checkTimestamps,
      dryRun,
    });

    if (resetResult.skipped) {
      console.log(`⏭️  Database reset skipped (already clean)`);
    } else if (resetResult.dryRun) {
      console.log(`🔍 Database reset dry run completed`);
    } else {
      console.log(`✅ Database reset completed successfully`);
    }

    // Step 2: Seed data (only if not dry run and reset was successful)
    if (!dryRun && resetResult.success) {
      console.log(`\n📋 Step 2: Seeding data...`);
      const seedResult = await seedOptimized({
        env: targetEnv,
        external,
        user,
        scenario: scenario as any,
        preset: preset as any,
        dryRun: false,
        reuseEnv: true, // Reuse the environment we already loaded
      });

      if (seedResult.success) {
        console.log(`✅ Data seeding completed successfully`);
      } else {
        throw new Error('Data seeding failed');
      }
    } else if (dryRun) {
      console.log(`\n📋 Step 2: Seeding data (dry run)...`);
      const seedResult = await seedOptimized({
        env: targetEnv,
        external,
        user,
        scenario: scenario as any,
        preset: preset as any,
        dryRun: true,
        reuseEnv: true,
      });

      if (seedResult.success) {
        console.log(`🔍 Data seeding dry run completed`);
      }
    }

    // Final summary
    console.log(`\n🎉 Optimized reseed process completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   Environment: ${targetEnv}`);
    console.log(`   Database reset: ${resetResult.skipped ? 'skipped' : 'completed'}`);
    console.log(`   Data seeding: ${dryRun ? 'dry run' : 'completed'}`);
    console.log(`   External data: ${external ? 'yes' : 'no'}`);
    console.log(`   User data: ${user ? 'yes' : 'no'}`);

    return { success: true };
  } catch (error) {
    console.error(`❌ Optimized reseed process failed:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const env = args[0] || 'dev';

  const options: ReseedOptions = {
    env,
    skipSchemaCheck: args.includes('--skip-schema-check'),
    skipIfClean: args.includes('--skip-if-clean'),
    checkTimestamps: !args.includes('--no-timestamp-check'),
    dryRun: args.includes('--dry-run'),
    external: !args.includes('--no-external'),
    user: args.includes('--user'),
    scenario: args.find(arg => arg.startsWith('--scenario='))?.split('=')[1] || 'SMALL',
    preset: args.find(arg => arg.startsWith('--preset='))?.split('=')[1] || 'REALISTIC',
  };

  try {
    await reseedOptimized(options);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Reseed failed:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { reseedOptimized };
