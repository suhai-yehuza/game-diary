import { readdir } from 'fs/promises';
import { join } from 'path';
import { import { logger } from '@/lib/logger'; } from '@/lib/logger';
/**
 * Validates that required migration files are present in src/lib/db/migrations
 */
async function validateMigrations() {
  logger.info('🔍 Validating migration files in src/lib/db/migrations...');

  const migrationsDir = join(process.cwd(), 'src/lib/db/migrations');

  try {
    const sqlFiles = (await readdir(migrationsDir, { recursive: true })).filter(file =>
      file.endsWith('.sql')
    );

    if (sqlFiles.length === 0) {
      logger.error('❌ No migration .sql files found in src/lib/db/migrations.');
      process.exit(1);
    }

    logger.info('✅ Found the following migration files:');
    sqlFiles.forEach(f => logger.info(`   - ${f}`));
    logger.info('✅ All required migration files are present in src/lib/db/migrations');
  } catch (error) {
    logger.error('❌ Error validating migrations:', error);
    process.exit(1);
  }
}

// Run validation
validateMigrations();
