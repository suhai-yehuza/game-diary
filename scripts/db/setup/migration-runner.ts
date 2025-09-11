/**
 * @fileoverview Migration runner with guaranteed correct order execution
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@src/lib/utils/logger';
import { runCommand } from '../core/command-utils';

/**
 * Migration file configuration
 */
interface MigrationConfig {
  file: string;
  order: number;
  description: string;
  required: boolean;
}

/**
 * Define migration order and configuration
 */
const MIGRATION_CONFIG: MigrationConfig[] = [
  {
    file: '000_base_schema.sql',
    order: 0,
    description: 'Base tables and essential indexes',
    required: true,
  },
  {
    file: '001_consolidated_functions.sql',
    order: 1,
    description: 'All optimized database functions',
    required: true,
  },
  {
    file: '002_consolidated_indexes.sql',
    order: 2,
    description: 'All performance indexes',
    required: true,
  },
  {
    file: '003_consolidated_triggers.sql',
    order: 3,
    description: 'All database triggers',
    required: true,
  },
  {
    file: '004_performance_monitoring.sql',
    order: 4,
    description: 'Performance monitoring and version control',
    required: true,
  },
  {
    file: '005_rls_policies.sql',
    order: 5,
    description: 'Row-level security policies',
    required: true,
  },
  {
    file: '006_reaction_emojis.sql',
    order: 6,
    description: 'Reference data (reaction emojis)',
    required: true,
  },
];

/**
 * Run all migrations in correct order
 */
export async function runMigrationsInOrder(): Promise<void> {
  logger.info('🚀 Starting migration execution in correct order...');
  logger.info('================================================');

  const migrationsDir = 'src/lib/db/migrations';

  if (!existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  // Get all SQL files in migrations directory
  const availableFiles = readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();

  logger.info(`📊 Found ${availableFiles.length} migration files in directory`);

  // Execute migrations in defined order
  for (const config of MIGRATION_CONFIG) {
    const filePath = join(migrationsDir, config.file);

    if (existsSync(filePath)) {
      logger.info(`📄 [${config.order}] Running: ${config.file}`);
      logger.info(`   Description: ${config.description}`);

      try {
        await runCommand(
          `psql "${process.env.DATABASE_URL}" -f "${filePath}"`,
          `Apply migration ${config.file}`
        );
        logger.info(`✅ [${config.order}] Successfully applied: ${config.file}`);
      } catch (error) {
        logger.error(`❌ [${config.order}] Failed to apply: ${config.file}`);
        if (config.required) {
          throw new Error(`Required migration failed: ${config.file}`);
        } else {
          logger.warn(`⚠️  [${config.order}] Skipping optional migration: ${config.file}`);
        }
      }
    } else {
      if (config.required) {
        throw new Error(`Required migration file not found: ${config.file}`);
      } else {
        logger.warn(`⚠️  [${config.order}] Optional migration file not found: ${config.file}`);
      }
    }
  }

  // Check for any extra files not in our configuration
  const configuredFiles = MIGRATION_CONFIG.map(c => c.file);
  const extraFiles = availableFiles.filter(f => !configuredFiles.includes(f));

  if (extraFiles.length > 0) {
    logger.warn(`⚠️  Found extra migration files not in configuration: ${extraFiles.join(', ')}`);
    logger.warn('   These files will not be executed automatically');
  }

  logger.info('✅ All migrations completed successfully');
}

/**
 * Validate migration files exist and are in correct order
 */
export function validateMigrationFiles(): boolean {
  logger.info('🔍 Validating migration files...');

  const migrationsDir = 'src/lib/db/migrations';

  if (!existsSync(migrationsDir)) {
    logger.error(`❌ Migrations directory not found: ${migrationsDir}`);
    return false;
  }

  const availableFiles = readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();

  let allValid = true;

  for (const config of MIGRATION_CONFIG) {
    const filePath = join(migrationsDir, config.file);

    if (existsSync(filePath)) {
      logger.info(`✅ Found: ${config.file}`);
    } else {
      if (config.required) {
        logger.error(`❌ Missing required file: ${config.file}`);
        allValid = false;
      } else {
        logger.warn(`⚠️  Missing optional file: ${config.file}`);
      }
    }
  }

  if (allValid) {
    logger.info('✅ All required migration files are present');
  } else {
    logger.error('❌ Some required migration files are missing');
  }

  return allValid;
}

/**
 * Get migration status
 */
export function getMigrationStatus(): {
  total: number;
  available: number;
  missing: string[];
  extra: string[];
} {
  const migrationsDir = 'src/lib/db/migrations';

  if (!existsSync(migrationsDir)) {
    return {
      total: MIGRATION_CONFIG.length,
      available: 0,
      missing: MIGRATION_CONFIG.map(c => c.file),
      extra: [],
    };
  }

  const availableFiles = readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();

  const configuredFiles = MIGRATION_CONFIG.map(c => c.file);
  const missing = configuredFiles.filter(f => !availableFiles.includes(f));
  const extra = availableFiles.filter(f => !configuredFiles.includes(f));

  return {
    total: MIGRATION_CONFIG.length,
    available: availableFiles.length,
    missing,
    extra,
  };
}
