/**
 * @fileoverview CLI command handlers
 */

import { logger } from '@src/lib/utils/logger';
import { setupDatabase } from '../setup/database-setup';
import { parseScriptArgs, parseResetArgs } from './argument-parser';
import { runCommand } from '../core/command-utils';
import { applyAllMigrations } from '../core/migration-runner';
import { recordStandardCustomMigrations } from '../core/migration-recorder';

/**
 * Run canonical reset using the reset-with-env.ts script
 */
export async function runCanonicalReset(environment: string): Promise<void> {
  logger.info(`🔄 Running canonical reset for ${environment} environment...`);

  try {
    const { execSync } = await import('child_process');
    execSync(`tsx scripts/db/reset-with-env.ts ${environment}`, {
      stdio: 'inherit',
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: environment },
    });
    logger.info('✅ Canonical reset completed successfully');
  } catch (error) {
    logger.error(
      '❌ Canonical reset failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Handle reset command
 */
export async function handleResetCommand(args: string[]): Promise<void> {
  const { mode, environment } = parseResetArgs(args);

  if (!['canonical', 'drizzle'].includes(mode)) {
    throw new Error('Invalid reset mode. Must be: canonical|drizzle');
  }

  logger.info(`🔄 Starting database reset in ${mode} mode for ${environment} environment...`);

  if (mode === 'canonical') {
    await runCanonicalReset(environment);
  } else {
    // Use drizzle-based reset
    logger.info('🔧 Performing drizzle-based reset...');
    await setupDatabase('complete', environment, false);
  }

  logger.info('✅ Database reset completed successfully');
}

/**
 * Handle setup command
 */
export async function handleSetupCommand(
  args: string[],
  options: ReturnType<typeof parseScriptArgs>
): Promise<void> {
  const mode = (args[1] as 'complete' | 'triggers-only') || 'complete';

  logger.info(`🚀 Starting Database Setup (${mode}) for ${options.environment} environment...`);
  await setupDatabase(mode, options.environment, options.skipSchemaCheck);
  logger.info('✅ Database setup completed successfully');
}

/**
 * Handle migrate command
 */
export async function handleMigrateCommand(
  args: string[],
  options: ReturnType<typeof parseScriptArgs>
): Promise<void> {
  const dryRun = args.includes('--dry-run');
  const preserveData = args.includes('--preserve-data');

  logger.info(`🔄 Starting migration for ${options.environment} environment...`);
  if (dryRun) {
    logger.info('🔍 DRY RUN MODE - No changes will be made');
  }
  if (preserveData) {
    logger.info('🛡️  DATA PRESERVATION MODE - Will attempt to preserve existing data');
  }

  try {
    const result = await applyAllMigrations(options.environment, dryRun, preserveData);

    if (result.success) {
      logger.info('✅ Migration completed successfully');
      logger.info(`📊 Applied migrations: ${result.appliedMigrations.join(', ')}`);

      if (!result.dataPreserved) {
        logger.warn('⚠️  WARNING: Data may have been lost during migration');
        logger.warn('⚠️  This should not happen with the safe migration system');
      } else {
        logger.info('✅ Data was preserved during migration');
      }
    } else {
      logger.error('❌ Migration failed');
      result.errors.forEach(error => logger.error(`  • ${error}`));
      throw new Error('Migration failed');
    }
  } catch (error) {
    logger.error(
      '❌ Migration command failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Handle copy migrations command
 */
export async function handleCopyMigrationsCommand(): Promise<void> {
  logger.info('📋 Copying custom migrations to drizzle directory...');

  try {
    // Copy custom migration files from src/lib/db/migrations to drizzle directory
    const { execSync } = await import('child_process');

    // Ensure drizzle directory exists
    execSync('mkdir -p drizzle', { stdio: 'inherit' });

    // Copy custom migration files (flattened structure)
    const customMigrations = [
      'src/lib/db/migrations/001_consolidated_functions.sql',
      'src/lib/db/migrations/002_consolidated_indexes.sql',
      'src/lib/db/migrations/003_consolidated_triggers.sql',
      'src/lib/db/migrations/004_performance_monitoring.sql',
      'src/lib/db/migrations/005_rls_policies.sql',
      'src/lib/db/migrations/006_reaction_emojis.sql',
    ];

    const { existsSync } = await import('fs');

    for (const migration of customMigrations) {
      if (existsSync(migration)) {
        const filename = migration.split('/').pop();
        execSync(`cp "${migration}" "drizzle/${filename}"`, { stdio: 'inherit' });
        logger.info(`✅ Copied ${filename}`);
      } else {
        logger.warn(`⚠️  Migration file not found: ${migration}`);
      }
    }

    logger.info('✅ Custom migrations copied successfully');

    // Record the custom migrations in the migration_versions table
    logger.info('📋 Recording custom migrations in migration_versions table...');
    await recordStandardCustomMigrations(process.env.NODE_ENV || 'development');
  } catch (error) {
    logger.error(
      '❌ Failed to copy custom migrations:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Show help information
 */
export function showHelp(): void {
  logger.info(`
Database Manager - Unified database operations

Usage: tsx scripts/db/database-manager.ts <command> [options]

Commands:
  migrate [--dry-run] [--preserve-data] Apply all pending migrations safely
  migrate-file <path> [--dry-run] Apply a specific migration file
  view                         View migration history
  validate                     Validate migration files
  validate-triggers            Validate triggers and functions in database
  setup [complete|triggers-only] Setup database (default: complete)
  copy-migrations              Copy custom migrations to drizzle directory
  truncate --scope=<scope>     Truncate tables (scope: internal|external|all) [preserves users with isAdmin = true]
  drop --scope=<scope>         Drop tables (scope: internal|external|all)
  reset --mode=canonical|drizzle --env=dev|staging|prod Reset database to canonical schema or setup drizzle

Options:
  --env=<environment>          Environment (default: development)
  --test                      Run tests after setup
  --dry-run                   Show what would be done without making changes
  --preserve-data             Explicitly preserve existing data during migration

Examples:
  tsx scripts/db/database-manager.ts migrate --preserve-data
  tsx scripts/db/database-manager.ts migrate --dry-run
  tsx scripts/db/database-manager.ts migrate-file drizzle/000_schema_with_cascade.sql
  tsx scripts/db/database-manager.ts setup complete
  tsx scripts/db/database-manager.ts truncate --scope=internal
  tsx scripts/db/database-manager.ts drop --scope=external
  tsx scripts/db/database-manager.ts reset --mode=canonical --env=dev
  tsx scripts/db/database-manager.ts reset --mode=drizzle --env=staging
  `);
}
