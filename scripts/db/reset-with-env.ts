#!/usr/bin/env tsx
/**
 * @fileoverview Environment-aware database reset script
 * This script ensures the correct environment configuration is loaded before resetting the database
 */

import 'dotenv-flow/config';
import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

async function resetWithEnvironment(env: string) {
  console.log(`🔄 Loading environment configuration for: ${env}`);

  // Set NODE_ENV based on env argument
  if (env === 'prod') process.env.NODE_ENV = 'production';
  else if (env === 'dev') process.env.NODE_ENV = 'development';
  else process.env.NODE_ENV = env;

  // Determine which .env file to load
  let mainEnvFile = '.env';
  if (env === 'dev' && existsSync('.env.development')) {
    mainEnvFile = '.env.development';
  } else if (env === 'staging' && existsSync('.env.staging')) {
    mainEnvFile = '.env.staging';
  } else if ((env === 'prod' || env === 'production') && existsSync('.env.production')) {
    mainEnvFile = '.env.production';
  } else if (existsSync('.env')) {
    mainEnvFile = '.env';
  }

  // Load the environment-specific configuration
  dotenvConfig({ path: mainEnvFile });
  // For development, also load .env.development if it exists (as override)
  if ((env === 'dev' || env === 'development') && existsSync('.env.development')) {
    dotenvConfig({ path: '.env.development', override: true });
  }

  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.error(`❌ No DATABASE_URL found for ${env} environment`);
    process.exit(1);
  }

  console.log(`✅ Environment loaded: ${env}`);
  console.log(`📊 Database URL: ${databaseUrl.substring(0, 20)}...`);

  // Now run the canonical reset
  const migrationFile = 'src/lib/db/migrations/000_full_schema_reset.sql';
  if (!existsSync(migrationFile)) {
    throw new Error(`Migration file not found: ${migrationFile}`);
  }

  console.log(`📄 Running canonical migration: ${migrationFile}`);
  const command = `psql "${databaseUrl}" -f "${migrationFile}"`;
  execSync(command, { stdio: 'inherit', encoding: 'utf8' });
  console.log('✅ Canonical schema reset completed successfully!');
}

async function main() {
  const args = process.argv.slice(2);
  const env = args[0] || 'dev';

  if (!['dev', 'staging', 'prod', 'production'].includes(env)) {
    console.error('Usage: tsx scripts/db/reset-with-env.ts <env>');
    console.error('Environment must be: dev, staging, prod, or production');
    process.exit(1);
  }

  try {
    await resetWithEnvironment(env);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
