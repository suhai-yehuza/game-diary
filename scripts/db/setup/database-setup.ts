/**
 * @fileoverview Complete database setup orchestration
 */

import { logger } from '@src/lib/utils/logger';
import { ensureConnection } from '../core/connection';
import { SchemaConsistencyChecker } from '../core/schema-consistency';
import { cleanDatabase, checkTablesExist } from '../core/table-operations';
import { runCommand, runInteractiveCommand } from '../core/command-utils';
import { setupFunctions } from './function-setup';
import { setupTriggers } from './trigger-setup';
import { setupRLS } from './rls-setup';
import { setupData } from './data-setup';
import { runMigrationsInOrder, validateMigrationFiles } from './migration-runner';

/**
 * Setup database with complete schema, functions, triggers, and RLS
 */
export async function setupDatabase(
  mode: 'complete' | 'triggers-only' = 'complete',
  environment: string = 'development',
  skipSchemaCheck: boolean = false
): Promise<void> {
  logger.info(`🚀 Starting Database Setup (${mode}) for ${environment} environment...`);
  logger.info('================================================');

  try {
    // Ensure database connection
    await ensureConnection();
    logger.info('✅ Database connection verified');

    if (mode === 'complete') {
      await performCompleteSetup(environment, skipSchemaCheck);
    }

    // Apply migrations in correct order (for both modes)
    if (validateMigrationFiles()) {
      await runMigrationsInOrder();
    } else {
      logger.warn('⚠️  Migration validation failed, falling back to individual setup...');
      await setupFunctions();
      await setupTriggers();
      await setupRLS();
      await setupData();
    }

    logger.info('✅ Database setup completed successfully');
  } catch (error) {
    logger.error(
      '❌ Database setup failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Perform complete database setup
 */
async function performCompleteSetup(environment: string, skipSchemaCheck: boolean): Promise<void> {
  logger.info('🚀 Starting complete database setup...');
  logger.info('================================================');

  // Step 1: Clean existing database
  await cleanDatabase();

  // Step 2: Ensure schema exists
  logger.info('📋 Step 2: Ensuring database schema exists...');

  // Check schema consistency
  if (!skipSchemaCheck) {
    logger.info('🔍 Checking schema consistency...');
    const checker = new SchemaConsistencyChecker();
    const consistencyResult = await checker.check();

    if (!consistencyResult.success) {
      logger.warn('⚠️  Schema consistency issues detected:');
      consistencyResult.issues.forEach(issue => logger.warn(`  • ${issue}`));
      logger.info('🔄 Attempting to fix schema consistency issues...');
      try {
        await checker.generateQuickFix();
        logger.info('✅ Schema consistency issues resolved');
      } catch (fixError) {
        logger.warn(`⚠️  Could not auto-fix schema issues: ${fixError}`);
        throw new Error('Schema consistency issues must be resolved before setup');
      }
    } else {
      logger.info('✅ Schema consistency check passed');
    }
  }

  // Check if tables exist
  const { existingTables, missingTables, allTablesExist } = await checkTablesExist();

  if (!allTablesExist) {
    logger.info(`🔧 Missing tables detected: ${missingTables.join(', ')}`);
    logger.info('📋 Generating and applying migrations...');

    // Generate migrations
    await runCommand('pnpm db:generate:safe', 'Generate safe migrations');

    // Copy custom migrations
    await runCommand('pnpm db:copy-custom-migrations', 'Copy custom migrations');

    // Apply migrations using drizzle-kit push
    await runInteractiveCommand('pnpm exec drizzle-kit push --force', 'Apply schema to database');
  } else {
    logger.info('✅ Database schema already exists - all expected tables present');
  }
}
