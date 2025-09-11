/**
 * @fileoverview RLS (Row Level Security) setup and management
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@src/lib/utils/logger';
import { runCommand } from '../core/command-utils';

/**
 * Setup RLS policies
 */
export async function setupRLS(): Promise<void> {
  logger.info('🔧 Step 5: Applying RLS policies...');

  const migrationsDir = 'src/lib/db/migrations';
  if (existsSync(migrationsDir)) {
    const rlsFiles = readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql') && f.includes('rls'))
      .sort();

    if (rlsFiles.length > 0) {
      logger.info(`📊 Found ${rlsFiles.length} RLS policy files`);
      for (const file of rlsFiles) {
        const filePath = join(migrationsDir, file);
        logger.info(`📄 Running RLS: ${file}`);
        await runCommand(
          `psql "${process.env.DATABASE_URL}" -f "${filePath}"`,
          `Apply RLS ${file}`
        );
      }
    } else {
      logger.info('📊 No RLS policy files found');
    }
  } else {
    logger.info('📊 Migrations directory not found, skipping');
  }
}
