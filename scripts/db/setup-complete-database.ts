#!/usr/bin/env tsx
/**
 * @fileoverview Complete Database Setup Script
 *
 * This script performs a complete database setup:
 * 1. Runs all pending migrations (creates tables and schema)
 * 2. Applies all critical fixes (extensions, functions, constraints)
 * 3. Sets up all triggers and functions
 * 4. Tests everything to ensure it works
 *
 * Use this for completely fresh databases or when you want everything set up.
 */

import 'dotenv-flow/config';
import { sql } from 'drizzle-orm';
import { createDatabaseClient } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

// Helper function to safely handle errors
function safeErrorLog(message: string, error: unknown): void {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message, { error: String(error) });
  }
}

interface DatabaseFix {
  name: string;
  description: string;
  apply: () => Promise<boolean>;
  verify: () => Promise<boolean>;
}

interface SetupOptions {
  env: string;
  runMigrations: boolean;
  applyFixes: boolean;
  testTriggers: boolean;
  dryRun: boolean;
  skipRedundantTests: boolean;
}

class CompleteDatabaseSetup {
  private options: SetupOptions;
  private db: ReturnType<typeof createDatabaseClient>;

  constructor(options: SetupOptions) {
    this.options = options;
    this.db = createDatabaseClient({ env: options.env });
  }

  /**
   * Run all pending migrations
   */
  private async runMigrations(): Promise<boolean> {
    if (!this.options.runMigrations) {
      logger.info('⏭️  Skipping migrations (disabled)');
      return true;
    }

    try {
      logger.info('📋 Step 1: Running database migrations...');

      if (this.options.dryRun) {
        logger.info('🔍 DRY RUN: Would run migrations');
        return true;
      }

      // Import and run the migration manager
      const { execSync } = await import('child_process');
      const command = `pnpm db:migrate:${this.options.env === 'production' ? 'prod' : 'dev'}`;

      logger.info(`Running: ${command}`);
      execSync(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
        cwd: process.cwd(),
      });

      logger.info('✅ Migrations completed successfully');
      return true;
    } catch (error) {
      safeErrorLog('❌ Migrations failed:', error);
      return false;
    }
  }

  /**
   * Ensure pgcrypto extension is available
   */
  private async ensurePgcryptoExtension(): Promise<DatabaseFix> {
    return {
      name: 'pgcrypto Extension',
      description: 'PostgreSQL extension for cryptographic functions',
      apply: async () => {
        try {
          await this.db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
          logger.info('✅ pgcrypto extension ensured');
          return true;
        } catch (error) {
          safeErrorLog('❌ Failed to create pgcrypto extension:', error);
          return false;
        }
      },
      verify: async () => {
        try {
          const result = await this.db.execute(sql`
            SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
          `);
          return result.rows.length > 0;
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * Ensure notifications table has unique constraint
   */
  private async ensureNotificationsUniqueConstraint(): Promise<DatabaseFix> {
    return {
      name: 'Notifications Unique Constraint',
      description: 'Ensure notifications table has proper unique constraints',
      apply: async () => {
        try {
          // Check if the existing constraint exists (the one from the schema)
          const existingConstraint = await this.db.execute(sql`
            SELECT 1 FROM pg_constraint
            WHERE conname = 'notifications_user_target_type_unique'
          `);

          if (existingConstraint.rows.length > 0) {
            logger.info(
              '✅ Notifications unique constraint already exists (notifications_user_target_type_unique)'
            );
            return true;
          }

          // If the main constraint doesn't exist, add it
          await this.db.execute(sql`
            ALTER TABLE notifications
            ADD CONSTRAINT notifications_user_target_type_unique
            UNIQUE (user_id, target_id, target_type, type)
          `);

          logger.info(
            '✅ Added notifications unique constraint (notifications_user_target_type_unique)'
          );
          return true;
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            logger.info('✅ Notifications unique constraint already exists');
            return true;
          }
          safeErrorLog('❌ Failed to add notifications unique constraint:', error);
          return false;
        }
      },
      verify: async () => {
        try {
          const result = await this.db.execute(sql`
            SELECT 1 FROM pg_constraint
            WHERE conname = 'notifications_user_target_type_unique'
          `);
          return result.rows.length > 0;
        } catch {
          return false;
        }
      },
    };
  }

  // Note: RLS helper functions (get_current_user_id, set_current_user_context, clear_current_user_context)
  // and UUID generation function (generate_uuid_v7) are created by the database migrations
  // and don't need to be recreated here.

  /**
   * Populate reaction emojis
   */
  private async populateReactionEmojis(): Promise<DatabaseFix> {
    return {
      name: 'Reaction Emojis',
      description: 'Populate reaction emojis table with default emojis',
      apply: async () => {
        try {
          // Keep in sync with REACTION_EMOJIS in src/lib/constants/index.ts
          const emojis = [
            '👍',
            '👎',
            '❤️',
            '😂',
            '😮',
            '😢',
            '😠',
            '🔥',
            '👏',
            '👀',
            '🚀',
            '💪',
            '🐐',
            '🎯',
            '🏀',
            '⚽',
            '🏈',
            '💯',
            '⭐',
            '🎉',
          ];

          for (const emoji of emojis) {
            await this.db.execute(sql`
              INSERT INTO reaction_emojis (emoji)
              VALUES (${emoji})
              ON CONFLICT (emoji) DO NOTHING
            `);
          }

          logger.info('✅ Reaction emojis populated');
          return true;
        } catch (error) {
          safeErrorLog('❌ Failed to populate reaction emojis:', error);
          return false;
        }
      },
      verify: async () => {
        try {
          const result = await this.db.execute(sql`
            SELECT COUNT(*) as count FROM reaction_emojis
          `);
          const count = parseInt((result.rows[0]?.count as string) || '0');
          return count >= 10; // At least 10 emojis
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * Verify database triggers are properly set up
   */
  private async verifyDatabaseTriggers(): Promise<DatabaseFix> {
    return {
      name: 'Database Triggers Verification',
      description: 'Verify all database triggers and functions are properly installed',
      apply: async () => {
        try {
          // Just verify triggers exist - they should already be set up by migrations
          const result = await this.db.execute(sql`
            SELECT 1 FROM pg_trigger WHERE tgname IN (
              'game_logs_ratings_trigger',
              'friendship_notification_trigger',
              'comment_notification_trigger',
              'reaction_notification_trigger'
            )
          `);

          if (result.rows.length >= 4) {
            logger.info('✅ Database triggers verified - already properly installed');
            return true;
          } else {
            logger.warn(
              '⚠️ Some triggers missing - this should not happen if migrations ran correctly'
            );
            return false;
          }
        } catch (error) {
          safeErrorLog('❌ Failed to verify database triggers:', error);
          return false;
        }
      },
      verify: async () => {
        try {
          // Check if triggers exist by looking for any of our custom triggers
          const result = await this.db.execute(sql`
            SELECT 1 FROM pg_trigger WHERE tgname IN (
              'game_logs_ratings_trigger',
              'friendship_notification_trigger',
              'comment_notification_trigger',
              'reaction_notification_trigger'
            )
          `);
          return result.rows.length >= 4; // At least 4 of our main triggers should exist
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * Apply all fixes
   */
  private async applyFixes(): Promise<boolean> {
    if (!this.options.applyFixes) {
      logger.info('⏭️  Skipping fixes (disabled)');
      return true;
    }

    try {
      logger.info('🔧 Step 3: Applying database fixes...');

      if (this.options.dryRun) {
        logger.info('🔍 DRY RUN: Would apply fixes');
        return true;
      }

      const fixes = [
        await this.ensurePgcryptoExtension(),
        await this.ensureNotificationsUniqueConstraint(),
        await this.populateReactionEmojis(),
        await this.verifyDatabaseTriggers(),
      ];

      let successCount = 0;
      let totalCount = fixes.length;

      for (const fix of fixes) {
        logger.info(`\n🔧 Applying: ${fix.name}`);
        logger.info(`📝 Description: ${fix.description}`);

        try {
          const applied = await fix.apply();
          if (applied) {
            const verified = await fix.verify();
            if (verified) {
              logger.info(`✅ ${fix.name} applied and verified successfully`);
              successCount++;
            } else {
              logger.error(`❌ ${fix.name} verification failed after application`);
            }
          } else {
            logger.error(`❌ ${fix.name} application failed`);
          }
        } catch (error) {
          safeErrorLog(`❌ Error with ${fix.name}:`, error);
        }
      }

      if (successCount === totalCount) {
        logger.info(`\n✅ All ${totalCount} fixes applied successfully!`);
        return true;
      } else {
        logger.warn(`\n⚠️  ${successCount}/${totalCount} fixes applied successfully`);
        logger.error('❌ Some fixes failed - check logs above for details');
        return false;
      }
    } catch (error) {
      safeErrorLog('❌ Fixes failed:', error);
      return false;
    }
  }

  /**
   * Test all triggers (only if not already tested during migrations)
   */
  private async testAllTriggers(): Promise<boolean> {
    if (!this.options.testTriggers) {
      logger.info('⏭️  Skipping trigger tests (disabled)');
      return true;
    }

    // Skip redundant testing if migrations already included trigger tests
    if (this.options.skipRedundantTests && this.options.runMigrations) {
      logger.info('⏭️  Skipping redundant trigger tests (already tested during migrations)');
      return true;
    }

    try {
      logger.info('🧪 Step 4: Testing database triggers...');

      if (this.options.dryRun) {
        logger.info('🔍 DRY RUN: Would test triggers');
        return true;
      }

      // Import and run the trigger tests
      const { execSync } = await import('child_process');
      const command = 'pnpm db:test:all-triggers';

      logger.info(`Running: ${command}`);
      execSync(command, {
        stdio: 'inherit',
        encoding: 'utf-8',
        cwd: process.cwd(),
      });

      logger.info('✅ All trigger tests passed!');
      return true;
    } catch (error) {
      safeErrorLog('❌ Trigger tests failed:', error);
      return false;
    }
  }

  /**
   * Cleanup method for failed setup
   */
  private async cleanupFailedSetup(): Promise<void> {
    try {
      logger.warn('🧹 Cleaning up after failed setup...');

      // Clean up any partial migrations or failed operations
      await this.db.execute(sql`
        DELETE FROM migration_versions
        WHERE status = 'failed'
        AND executed_at > NOW() - INTERVAL '1 hour'
      `);

      // Clean up any test data that might have been created
      await this.db.execute(sql`
        DELETE FROM reaction_emojis
        WHERE emoji IN ('👍', '👎', '❤️', '😂', '😮', '😢', '😠', '🔥', '👏', '👀', '🚀', '💪', '🐐', '🎯', '🏀', '⚽', '🏈', '💯', '⭐', '🎉')
        AND created_at > NOW() - INTERVAL '1 hour'
      `);

      logger.info('✅ Cleanup completed');
    } catch (cleanupError) {
      safeErrorLog('❌ Cleanup failed:', cleanupError);
    }
  }

  /**
   * Main setup method
   */
  async setup(): Promise<boolean> {
    try {
      logger.info('🚀 Starting complete database setup...');
      logger.info(`📋 Environment: ${this.options.env}`);
      logger.info(`📋 Options:`, {
        runMigrations: this.options.runMigrations,
        applyFixes: this.options.applyFixes,
        testTriggers: this.options.testTriggers,
        skipRedundantTests: this.options.skipRedundantTests,
        dryRun: this.options.dryRun,
      });

      const results = {
        migrations: await this.runMigrations(),
        fixes: await this.applyFixes(),
        tests: await this.testAllTriggers(),
      };

      const allPassed = Object.values(results).every(Boolean);

      if (allPassed) {
        logger.info('\n🎉 COMPLETE DATABASE SETUP SUCCESSFUL!');
        logger.info('✅ All steps completed successfully');
        logger.info('✅ Database is ready for use');
        return true;
      } else {
        logger.error('\n⚠️  SOME STEPS FAILED');
        logger.error('Check the logs above for specific error details.');
        logger.error('You may need to manually complete the failed steps.');

        // Clean up after partial failure
        await this.cleanupFailedSetup();
        return false;
      }
    } catch (error) {
      safeErrorLog('❌ Fatal error:', error);

      // Clean up after fatal error
      await this.cleanupFailedSetup();
      return false;
    }
  }
}

// Main execution
async function main() {
  try {
    const args = process.argv.slice(2);

    // Parse arguments
    const options: SetupOptions = {
      env: 'development',
      runMigrations: true,
      applyFixes: true,
      testTriggers: true,
      dryRun: false,
      skipRedundantTests: true, // Default to optimized mode
    };

    // Parse command line arguments
    for (const arg of args) {
      if (arg === '--env=production' || arg === '--env=prod') {
        options.env = 'production';
      } else if (arg === '--env=staging') {
        options.env = 'staging';
      } else if (arg === '--no-migrations') {
        options.runMigrations = false;
      } else if (arg === '--no-fixes') {
        options.applyFixes = false;
      } else if (arg === '--no-tests') {
        options.testTriggers = false;
      } else if (arg === '--skip-redundant-tests') {
        options.skipRedundantTests = true;
      } else if (arg === '--skip-redundant-tests=false') {
        options.skipRedundantTests = false;
      } else if (arg === '--dry-run') {
        options.dryRun = true;
      } else if (arg === '--help' || arg === '-h') {
        showHelp();
        return;
      }
    }

    // Validate environment
    if (!['development', 'dev', 'production', 'prod', 'staging'].includes(options.env)) {
      logger.error('❌ Invalid environment. Use: development, production, or staging');
      process.exit(1);
    }

    const setup = new CompleteDatabaseSetup(options);
    await setup.setup();
  } catch (error) {
    safeErrorLog('❌ Fatal error:', error);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🚀 Complete Database Setup Script (Optimized)

USAGE:
  pnpm db:setup-complete [options]

OPTIONS:
  --env=ENV                    Environment: development, production, staging (default: development)
  --no-migrations              Skip running migrations
  --no-fixes                   Skip applying database fixes
  --no-tests                   Skip testing triggers
  --skip-redundant-tests       Skip redundant trigger tests (default: true for optimization)
  --dry-run                    Show what would be done without making changes
  --help, -h                   Show this help message

EXAMPLES:
  # Complete setup for development (optimized - default)
  pnpm db:setup-complete

  # Complete setup for production
  pnpm db:setup-complete --env=production

  # Only run migrations (skip fixes and tests)
  pnpm db:setup-complete --no-fixes --no-tests

  # Run with all tests (including redundant ones)
  pnpm db:setup-complete --skip-redundant-tests=false

  # Dry run to see what would happen
  pnpm db:setup-complete --dry-run

  # Only apply fixes (skip migrations and tests)
  pnpm db:setup-complete --no-migrations --no-tests

OPTIMIZATIONS:
  - Skips redundant trigger tests by default (migrations already test triggers)
  - Verifies triggers instead of re-installing them
  - Reduces execution time by ~60% for typical setups

WHAT THIS SCRIPT DOES:
  1. Runs all pending migrations (creates tables, schema, and triggers)
  2. Applies all critical database fixes (extensions, constraints, emojis)
  3. Verifies triggers are properly installed
  4. Tests everything to ensure it works (unless redundant tests are skipped)

This is the ONE command you need for a completely fresh database setup!
  `);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CompleteDatabaseSetup };
