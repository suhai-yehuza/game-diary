#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// CLI argument handling
const args = process.argv.slice(2);
const env = args[0] || 'dev';

// Determine which .env file to load
let mainEnvFile = '.env';
if (env === 'dev' && fs.existsSync('.env.development')) {
  mainEnvFile = '.env.development';
} else if (env === 'staging' && fs.existsSync('.env.staging')) {
  mainEnvFile = '.env.staging';
} else if ((env === 'prod' || env === 'production') && fs.existsSync('.env.production')) {
  mainEnvFile = '.env.production';
} else if (fs.existsSync('.env')) {
  mainEnvFile = '.env';
}

// Load main environment variables
config({ path: mainEnvFile });
// Optionally load .env.local for overrides
if (fs.existsSync('.env.local')) {
  config({ path: '.env.local', override: true });
}

interface EnvironmentConfig {
  name: string;
  databaseUrl: string;
  nodeEnv: string;
}

const environments: Record<string, EnvironmentConfig> = {
  dev: {
    name: 'Development',
    databaseUrl: process.env.DATABASE_URL || '',
    nodeEnv: 'development',
  },
  staging: {
    name: 'Staging',
    databaseUrl: process.env.DATABASE_URL || '',
    nodeEnv: 'staging',
  },
  prod: {
    name: 'Production',
    databaseUrl: process.env.DATABASE_URL || '',
    nodeEnv: 'production',
  },
};

function validateEnvironment(env: string): EnvironmentConfig {
  const config = environments[env];
  if (!config) {
    console.error(`❌ Invalid environment: ${env}`);
    console.error(`Available environments: ${Object.keys(environments).join(', ')}`);
    process.exit(1);
  }

  if (!config.databaseUrl) {
    console.error(`❌ No DATABASE_URL found for ${env} environment`);
    console.error(
      `Please set DATABASE_URL in your ${mainEnvFile} or .env.local file or as an environment variable`
    );
    process.exit(1);
  }

  return config;
}

function runFullReset(env: string) {
  const config = validateEnvironment(env);

  console.log(`🚀 Starting full schema reset for ${config.name} environment...`);
  console.log(`📊 Database: ${config.databaseUrl.split('@')[1] || '***'}`);
  console.log(`🌍 Node Environment: ${config.nodeEnv}`);
  console.log('');

  // Set environment variables
  process.env.NODE_ENV = config.nodeEnv;
  process.env.DATABASE_URL = config.databaseUrl;

  const migrationFile = path.join(process.cwd(), 'src/lib/db/migrations/000_full_schema_reset.sql');

  try {
    // Check if migration file exists
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migrationFile}`);
    }

    console.log(`📄 Running migration: ${migrationFile}`);
    console.log('⏳ This may take a moment...');
    console.log('');

    // Run the migration using psql
    const command = `psql "${config.databaseUrl}" -f "${migrationFile}"`;
    execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
    });

    console.log('');
    console.log('✅ Full schema reset completed successfully!');
    console.log(`🎉 ${config.name} database is now ready.`);
  } catch (error) {
    console.error('');
    console.error('❌ Full schema reset failed:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: pnpm db:full-reset [environment]

Environments:
  dev       Development (default, uses .env.development if present)
  staging   Staging (uses .env.staging if present)
  prod      Production (uses .env.production if present)

Behavior:
  - Loads the appropriate .env file for the environment
  - Then loads .env.local (if present) for overrides
  - Uses DATABASE_URL from the loaded envs

Examples:
  pnpm db:full-reset          # Reset development database
  pnpm db:full-reset staging  # Reset staging database
  pnpm db:full-reset prod     # Reset production database

Environment Variables Required:
  DATABASE_URL in the selected .env file or .env.local
`);
  process.exit(0);
}

runFullReset(env);
