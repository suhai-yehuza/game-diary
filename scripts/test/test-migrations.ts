import fs from 'fs';
import path from 'path';

import { logger } from '../../lib/core/logger';

import { parseScriptArgs } from '../shared/script-utils';

// List migration files that would be executed
async function listMigrations() {
  const options = parseScriptArgs();
  logger.info(`🔍 Checking migrations for ${options.environment} environment...`);

  try {
    const migrationsDir = path.resolve(process.cwd(), 'drizzle');

    // Check if directory exists
    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      logger.warn('⚠️ No migration files found in drizzle directory');
      return;
    }

    logger.info('📋 Migration files that would be executed (in order):');
    files.forEach((file, index) => {
      logger.info(`${index + 1}. ${file}`);
    });
  } catch (error) {
    logger.error(
      '❌ Error checking migrations:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the function
listMigrations();
