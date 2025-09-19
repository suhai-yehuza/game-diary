#!/usr/bin/env tsx
/**
 * @fileoverview Migration recording system for custom migrations
 * Ensures that custom migrations are properly recorded in the migration_versions table
 */

import { logger } from '@src/lib/utils/logger';
import { sqlClient } from './connection';

export interface MigrationRecord {
  file_name: string;
  version: string;
  checksum: string;
  rollback_sql?: string;
}

/**
 * Record a custom migration in the migration_versions table (idempotent)
 */
export async function recordCustomMigration(
  migration: MigrationRecord,
  environment: string = 'development'
): Promise<'recorded' | 'skipped' | 'error'> {
  try {
    const client = sqlClient();

    // Check if migration already exists
    const existing = (await client`
      SELECT id, version, checksum FROM migration_versions
      WHERE file_name = ${migration.file_name}
    `) as Array<{ id: number; version: string; checksum: string }>;

    if (existing.length > 0) {
      const existingRecord = existing[0];

      // Check if the existing record matches what we want to record
      if (
        existingRecord.version === migration.version &&
        existingRecord.checksum === migration.checksum
      ) {
        logger.info(
          `📋 Migration ${migration.file_name} already recorded with matching version and checksum`
        );
        return 'skipped';
      } else {
        logger.warn(
          `⚠️  Migration ${migration.file_name} exists but with different version/checksum:`
        );
        logger.warn(
          `   Existing: version=${existingRecord.version}, checksum=${existingRecord.checksum}`
        );
        logger.warn(`   New: version=${migration.version}, checksum=${migration.checksum}`);
        logger.warn(`   Skipping to avoid conflicts`);
        return 'skipped';
      }
    }

    // Insert the migration record using ON CONFLICT to make it idempotent
    await client`
      INSERT INTO migration_versions (file_name, version, checksum, rollback_sql)
      VALUES (${migration.file_name}, ${migration.version}, ${migration.checksum}, ${migration.rollback_sql || undefined})
      ON CONFLICT (file_name) DO UPDATE SET
        version = EXCLUDED.version,
        checksum = EXCLUDED.checksum,
        rollback_sql = EXCLUDED.rollback_sql,
        applied_at = NOW()
    `;

    logger.info(`✅ Recorded custom migration: ${migration.file_name} (${migration.version})`);
    return 'recorded';
  } catch (error) {
    logger.error(`❌ Failed to record migration ${migration.file_name}:`, error);
    return 'error';
  }
}

/**
 * Record multiple custom migrations (idempotent)
 */
export async function recordCustomMigrations(
  migrations: MigrationRecord[],
  environment: string = 'development'
): Promise<void> {
  logger.info(
    `📋 Recording ${migrations.length} custom migrations for ${environment} environment...`
  );

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const migration of migrations) {
    const result = await recordCustomMigration(migration, environment);
    switch (result) {
      case 'recorded':
        successCount++;
        break;
      case 'skipped':
        skipCount++;
        break;
      case 'error':
        errorCount++;
        break;
    }
  }

  logger.info(`✅ Migration recording completed:`);
  logger.info(`   ✅ Recorded: ${successCount}`);
  logger.info(`   ⏭️  Skipped (already exists): ${skipCount}`);
  if (errorCount > 0) {
    logger.warn(`   ❌ Errors: ${errorCount}`);
  }
}

/**
 * Get the next version number for a custom migration
 */
export async function getNextMigrationVersion(): Promise<string> {
  try {
    const client = sqlClient();

    // Get the highest version number
    const result = (await client`
      SELECT version FROM migration_versions
      WHERE version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'
      ORDER BY
        CAST(SPLIT_PART(version, '.', 1) AS INTEGER) DESC,
        CAST(SPLIT_PART(version, '.', 2) AS INTEGER) DESC,
        CAST(SPLIT_PART(version, '.', 3) AS INTEGER) DESC
      LIMIT 1
    `) as Array<{ version: string }>;

    if (result.length === 0) {
      return '0.0.1';
    }

    const [major, minor, patch] = result[0].version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  } catch (error) {
    logger.warn('⚠️  Could not determine next version, using 0.0.1');
    return '0.0.1';
  }
}

/**
 * Generate a checksum for a migration file
 */
export async function generateMigrationChecksum(filePath: string): Promise<string> {
  try {
    const { createHash } = await import('crypto');
    const { readFileSync } = await import('fs');

    const content = readFileSync(filePath, 'utf8');
    const hash = createHash('sha256').update(content).digest('hex');
    return hash.substring(0, 16); // Use first 16 characters for brevity
  } catch (error) {
    logger.warn(`⚠️  Could not generate checksum for ${filePath}, using filename`);
    return filePath.split('/').pop()?.replace('.sql', '') || 'unknown';
  }
}

/**
 * Define the standard custom migrations with their metadata
 */
export const CUSTOM_MIGRATIONS: Record<string, Omit<MigrationRecord, 'version'>> = {
  '000_base_schema.sql': {
    file_name: '000_base_schema.sql',
    checksum: 'base_schema_initial',
    rollback_sql: undefined,
  },
  '001_consolidated_functions.sql': {
    file_name: '001_consolidated_functions.sql',
    checksum: 'consolidated_functions',
    rollback_sql: undefined,
  },
  '002_consolidated_indexes.sql': {
    file_name: '002_consolidated_indexes.sql',
    checksum: 'consolidated_indexes',
    rollback_sql: undefined,
  },
  '003_consolidated_triggers.sql': {
    file_name: '003_consolidated_triggers.sql',
    checksum: 'consolidated_triggers',
    rollback_sql: undefined,
  },
  '004_performance_monitoring.sql': {
    file_name: '004_performance_monitoring.sql',
    checksum: 'initial_performance_monitoring_setup',
    rollback_sql: undefined,
  },
  '005_rls_policies.sql': {
    file_name: '005_rls_policies.sql',
    checksum: 'rls_policies',
    rollback_sql: undefined,
  },
  '006_reaction_emojis.sql': {
    file_name: '006_reaction_emojis.sql',
    checksum: 'reaction_emojis',
    rollback_sql: undefined,
  },
};

/**
 * Record all standard custom migrations (idempotent)
 */
export async function recordStandardCustomMigrations(
  environment: string = 'development'
): Promise<void> {
  try {
    const migrations: MigrationRecord[] = [];
    let versionCounter = 1;

    for (const [filename, migration] of Object.entries(CUSTOM_MIGRATIONS)) {
      migrations.push({
        ...migration,
        version: `0.0.${versionCounter}`,
      });
      versionCounter++;
    }

    await recordCustomMigrations(migrations, environment);
  } catch (error) {
    logger.error('❌ Failed to record standard custom migrations:', error);
    throw error;
  }
}
