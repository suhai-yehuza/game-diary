/**
 * @fileoverview Table operations and management utilities
 */

import { sql } from 'drizzle-orm';
import { logger } from '@src/lib/utils/logger';
import { sqlClient } from './connection';
import { getExpectedTableNames } from './schema-consistency';

/**
 * Verify table creation after migration
 */
export async function verifyTableCreation(): Promise<void> {
  try {
    const expectedTables = await getExpectedTableNames();
    logger.info(`🔍 Verifying creation of ${expectedTables.length} expected tables...`);

    const existingTables = await sqlClient()`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name
    `;
    const existingTableNames = (existingTables as any).map((t: any) => t.table_name);

    logger.info(
      `📊 Found ${existingTableNames.length} tables in database: ${existingTableNames.join(', ')}`
    );

    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    const extraTables = existingTableNames.filter(
      (table: string) => !expectedTables.includes(table)
    );

    if (missingTables.length > 0) {
      logger.warn(`⚠️  Missing expected tables: ${missingTables.join(', ')}`);
    }

    if (extraTables.length > 0) {
      logger.info(`ℹ️  Extra tables found: ${extraTables.join(', ')}`);
    }

    // Check for critical tables
    const coreTables = [
      'users',
      'basketball_teams',
      'basketball_players',
      'basketball_games',
      'game_logs',
    ];
    const missingCoreTables = coreTables.filter(table => !existingTableNames.includes(table));

    if (missingCoreTables.length > 0) {
      throw new Error(`Critical tables missing: ${missingCoreTables.join(', ')}`);
    }

    logger.info('✅ Table verification completed successfully');
  } catch (error) {
    logger.error(
      '❌ Table verification failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Clean existing database (drop all tables and types)
 */
export async function cleanDatabase(): Promise<void> {
  logger.info('📦 Cleaning existing database...');
  try {
    await sqlClient()`
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
    `;
    logger.info('✅ Database cleaned successfully');
  } catch (error) {
    logger.warn('⚠️  Database might be already clean or error during cleanup');
    logger.error('Cleanup error:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Check if tables exist in database
 */
export async function checkTablesExist(): Promise<{
  existingTables: string[];
  missingTables: string[];
  allTablesExist: boolean;
}> {
  const expectedTables = await getExpectedTableNames();

  const existingTables = await sqlClient()`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name
  `;
  const existingTableNames = (existingTables as any).map((t: any) => t.table_name);

  const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));

  return {
    existingTables: existingTableNames,
    missingTables,
    allTablesExist: missingTables.length === 0,
  };
}
