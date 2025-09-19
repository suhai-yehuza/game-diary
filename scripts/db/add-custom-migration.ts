#!/usr/bin/env tsx
/**
 * @fileoverview Script to add new custom migrations
 * This script helps create new custom migrations and ensures they're properly recorded
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';

// Load environment variables safely
loadEnvironmentVariables();

import { logger } from '@src/lib/utils/logger';
import {
  recordCustomMigration,
  getNextMigrationVersion,
  generateMigrationChecksum,
} from './core/migration-recorder';
import { parseScriptArgs } from './cli/argument-parser';

/**
 * Add a new custom migration
 */
async function addCustomMigration(
  filename: string,
  description: string,
  environment: string = 'development'
): Promise<void> {
  try {
    logger.info(`📋 Adding new custom migration: ${filename}`);

    // Get the next version number
    const version = await getNextMigrationVersion();

    // Generate checksum for the migration file
    const migrationPath = `drizzle/${filename}`;
    const checksum = await generateMigrationChecksum(migrationPath);

    // Record the migration
    const result = await recordCustomMigration(
      {
        file_name: filename,
        version,
        checksum,
        rollback_sql: undefined,
      },
      environment
    );

    if (result === 'recorded') {
      logger.info(`✅ Custom migration ${filename} recorded successfully`);
      logger.info(`   Version: ${version}`);
      logger.info(`   Checksum: ${checksum}`);
      logger.info(`   Description: ${description}`);
    } else if (result === 'skipped') {
      logger.info(`⏭️  Custom migration ${filename} already exists, skipping`);
    } else {
      throw new Error(`Failed to record migration ${filename}`);
    }
  } catch (error) {
    logger.error(`❌ Failed to add custom migration ${filename}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseScriptArgs();

  if (args.length < 2) {
    logger.error('❌ Usage: tsx scripts/db/add-custom-migration.ts <filename> <description>');
    logger.error(
      '   Example: tsx scripts/db/add-custom-migration.ts 007_new_feature.sql "Add new feature"'
    );
    process.exit(1);
  }

  const filename = args[0];
  const description = args.slice(1).join(' ');

  if (!filename.endsWith('.sql')) {
    logger.error('❌ Migration filename must end with .sql');
    process.exit(1);
  }

  // Check if migration file exists
  const { existsSync } = await import('fs');
  const migrationPath = `drizzle/${filename}`;

  if (!existsSync(migrationPath)) {
    logger.error(`❌ Migration file not found: ${migrationPath}`);
    logger.error('   Please create the migration file first in the drizzle/ directory');
    process.exit(1);
  }

  await addCustomMigration(filename, description, options.environment);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Add custom migration failed:', error);
    process.exit(1);
  });
}
