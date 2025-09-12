#!/usr/bin/env tsx
/**
 * @fileoverview Safe migration runner that preserves data
 * This module handles database migrations without truncating existing data
 */

import { logger } from '@src/lib/utils/logger';
import { sqlClient } from './connection';
import { execAsync } from './command-utils';
import { checkTablesExist } from './table-operations';

export interface MigrationResult {
  success: boolean;
  appliedMigrations: string[];
  errors: string[];
  dataPreserved: boolean;
}

/**
 * Apply all pending migrations safely without data loss
 */
export async function applyAllMigrations(
  environment: string = 'development',
  dryRun: boolean = false,
  preserveData: boolean = true
): Promise<MigrationResult> {
  logger.info(`🔄 Starting safe migration process for ${environment} environment...`);

  const result: MigrationResult = {
    success: false,
    appliedMigrations: [],
    errors: [],
    dataPreserved: true,
  };

  try {
    // Check if database has existing data
    const hasExistingData = await checkForExistingData();

    if (hasExistingData && preserveData) {
      logger.info('📊 Existing data detected - using safe migration approach');
      await performSafeMigration(dryRun, result);
    } else if (hasExistingData && !preserveData) {
      logger.warn(
        '⚠️  Existing data detected but preserve-data is false - using standard migration approach'
      );
      logger.warn('⚠️  This may result in data loss!');
      await performStandardMigration(dryRun, result);
    } else {
      logger.info('📊 No existing data - using standard migration approach');
      await performStandardMigration(dryRun, result);
    }

    result.success = result.errors.length === 0;
    logger.info(
      `✅ Migration completed successfully. Applied: ${result.appliedMigrations.length} migrations`
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('❌ Migration failed:', errorMsg);
    result.errors.push(errorMsg);
    result.success = false;
  }

  return result;
}

/**
 * Check if database has existing data that needs to be preserved
 */
async function checkForExistingData(): Promise<boolean> {
  try {
    const { existingTables } = await checkTablesExist();

    if (existingTables.length === 0) {
      return false;
    }

    // Check if any tables have data
    for (const table of existingTables) {
      const countResult = await sqlClient()`
        SELECT COUNT(*) as count FROM ${sqlClient.raw(table)}
      `;

      if (countResult[0]?.count > 0) {
        logger.info(`📊 Found data in table: ${table} (${countResult[0].count} rows)`);
        return true;
      }
    }

    return false;
  } catch (error) {
    logger.warn('⚠️  Could not check for existing data, assuming no data exists');
    return false;
  }
}

/**
 * Perform safe migration that preserves existing data
 */
async function performSafeMigration(dryRun: boolean, result: MigrationResult): Promise<void> {
  logger.info('🛡️  Using safe migration approach to preserve data...');

  if (dryRun) {
    logger.info('🔍 DRY RUN: Would apply migrations safely');
    result.appliedMigrations.push('dry-run-safe-migration');
    return;
  }

  // Step 1: Generate migrations without applying them
  logger.info('📋 Generating migration files...');
  await execAsync('pnpm db:generate:dev');
  result.appliedMigrations.push('generate-migrations');

  // Step 2: Copy custom migrations
  logger.info('📋 Copying custom migrations...');
  await execAsync('pnpm db:copy-custom-migrations');
  result.appliedMigrations.push('copy-custom-migrations');

  // Step 3: Apply migrations using drizzle-kit migrate (safe method)
  logger.info('📋 Applying migrations using drizzle-kit migrate...');
  try {
    await execAsync('pnpm exec drizzle-kit migrate');
    result.appliedMigrations.push('drizzle-migrate');
  } catch (error) {
    // If drizzle-kit migrate fails, provide helpful error message
    logger.error('❌ drizzle-kit migrate failed - this is the safe migration method');
    logger.error('❌ Please check your migration files and schema for issues');
    logger.error('❌ Migration files should be in the drizzle/ directory');
    throw new Error(
      `Safe migration failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Perform standard migration for empty databases
 */
async function performStandardMigration(dryRun: boolean, result: MigrationResult): Promise<void> {
  logger.info('🚀 Using standard migration approach...');

  if (dryRun) {
    logger.info('🔍 DRY RUN: Would apply migrations');
    result.appliedMigrations.push('dry-run-standard-migration');
    return;
  }

  // Generate migrations
  await execAsync('pnpm db:generate:dev');
  result.appliedMigrations.push('generate-migrations');

  // Copy custom migrations
  await execAsync('pnpm db:copy-custom-migrations');
  result.appliedMigrations.push('copy-custom-migrations');

  // Apply migrations using migrate (safe method)
  await execAsync('pnpm exec drizzle-kit migrate');
  result.appliedMigrations.push('drizzle-migrate');
}

/**
 * Run migrations in correct order (for setup)
 */
export async function runMigrationsInOrder(): Promise<void> {
  logger.info('📋 Running migrations in correct order...');

  try {
    // This function is called during setup, so we can use the standard approach
    await performStandardMigration(false, {
      success: false,
      appliedMigrations: [],
      errors: [],
      dataPreserved: true,
    });
  } catch (error) {
    logger.error('❌ Failed to run migrations in order:', error);
    throw error;
  }
}

/**
 * Validate migration files exist and are valid
 */
export function validateMigrationFiles(): boolean {
  try {
    const { existsSync } = require('fs');
    const { readdirSync } = require('fs');
    const { join } = require('path');

    const drizzleDir = 'drizzle';
    if (!existsSync(drizzleDir)) {
      logger.warn('⚠️  Drizzle directory not found');
      return false;
    }

    const migrationFiles = readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      logger.warn('⚠️  No migration files found in drizzle directory');
      return false;
    }

    logger.info(`✅ Found ${migrationFiles.length} migration files`);
    return true;
  } catch (error) {
    logger.error('❌ Failed to validate migration files:', error);
    return false;
  }
}
