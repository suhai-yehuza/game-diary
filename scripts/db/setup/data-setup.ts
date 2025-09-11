/**
 * @fileoverview Reference data setup and management
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@src/lib/utils/logger';
import { runCommand } from '../core/command-utils';

/**
 * Setup reference data
 */
export async function setupData(): Promise<void> {
  logger.info('🔧 Step 6: Applying reference data...');

  const migrationsDir = 'src/lib/db/migrations';
  if (existsSync(migrationsDir)) {
    const dataFiles = readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql') && f.includes('reaction_emojis'))
      .sort();

    if (dataFiles.length > 0) {
      logger.info(`📊 Found ${dataFiles.length} data files`);
      for (const file of dataFiles) {
        const filePath = join(migrationsDir, file);
        logger.info(`📄 Running data: ${file}`);
        await runCommand(
          `psql "${process.env.DATABASE_URL}" -f "${filePath}"`,
          `Apply data ${file}`
        );
      }
    } else {
      logger.info('📊 No data files found');
    }
  } else {
    logger.info('📊 Migrations directory not found, skipping');
  }
}
