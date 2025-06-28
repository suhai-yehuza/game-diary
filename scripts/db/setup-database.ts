#!/usr/bin/env tsx

import 'dotenv-flow/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { sql } from 'drizzle-orm';

import { logger } from '@lib/core/logger';
import { createDatabaseClient } from '@src/lib/db';
import { setupAllTriggers } from '@shared/database-triggers';
import {
  parseScriptArgs,
  logScriptHeader,
  logScriptFooter,
  handleScriptError,
} from '@shared/script-utils';

const execAsync = promisify(exec);

async function runCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) logger.info(stdout);
    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) logger.error(stderr);
    logger.info(`✅ ${description} completed`);
  } catch (error: unknown) {
    logger.error(`❌ Failed: ${description}`);
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    throw error;
  }
}

async function setupDatabase() {
  const options = parseScriptArgs();
  const env = options.environment ?? 'development';
  const mode = options.mode ?? 'complete'; // 'triggers-only' | 'complete'
  const runTests = options.test ?? false;

  logScriptHeader(`Database Setup (${mode})`, env);

  try {
    const db = createDatabaseClient({ env });

    if (mode === 'complete') {
      // Full database setup
      logger.info('🚀 Starting complete database setup...');
      logger.info('================================================\n');

      // Step 1: Clean existing database
      logger.info('📦 Step 1: Cleaning existing database...');
      try {
        await db.execute(sql`
          DO $$
          DECLARE
            r RECORD;
          BEGIN
            -- Drop all tables
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;

            -- Drop all custom types
            FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = 'public'::regnamespace) LOOP
              EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
            END LOOP;
          END $$;
        `);
        logger.info('✅ Database cleaned successfully');
      } catch (error) {
        logger.error(JSON.stringify(error, null, 2));
        logger.info('⚠️  Database might be already clean or error during cleanup');
      }

      // Step 2: Generate Drizzle migrations
      await runCommand('pnpm db:generate', 'Generating Drizzle migrations');

      // Step 3: Copy custom migrations
      await runCommand('pnpm db:copy-custom-migrations', 'Copying custom migrations');

      // Step 4: Push schema to database with --force flag
      await runCommand('drizzle-kit push --force', 'Creating database tables (force mode)');

      // Step 5: Wait for tables to be ready
      logger.info('\n⏳ Waiting for tables to be ready...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 6: Create migration tracking table
      logger.info('\n📋 Step 6: Creating migration tracking table...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS migration_versions (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          checksum VARCHAR(64) NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INTEGER,
          status VARCHAR(20) NOT NULL DEFAULT 'success',
          error_message TEXT,
          rollback_script TEXT,
          rollback_executed BOOLEAN DEFAULT false
        );
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_migration_versions_name ON migration_versions(name);
      `);
      logger.info('✅ Migration tracking table created');

      // Step 7: Run tests if requested
      if (runTests) {
        await runCommand('npx tsx src/lib/db/seed/test-trigger.ts', 'Testing triggers');
      }

      logScriptFooter('Complete Database Setup', true, [
        'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
        'Run "pnpm db:seed:dev" to seed the database with sample data',
      ]);
    }

    // Always set up triggers (for both modes)
    logger.info('\n⚡ Setting up database triggers...');
    await setupAllTriggers(db, { dropExisting: true });

    if (mode === 'triggers-only') {
      logScriptFooter('Database Triggers Setup', true, [
        'Run "npx tsx src/lib/db/seed/test-trigger.ts" to test the triggers',
        'Use your application - triggers will automatically update ratings',
      ]);
    }

    process.exit(0);
  } catch (error) {
    handleScriptError(error, `Database setup (${mode})`);
  }
}

// Run the setup
setupDatabase();
