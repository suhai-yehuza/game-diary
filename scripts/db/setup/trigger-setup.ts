/**
 * @fileoverview Database trigger setup and management
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@src/lib/utils/logger';
import { runCommand } from '../core/command-utils';

/**
 * Setup database triggers
 */
export async function setupTriggers(): Promise<void> {
  logger.info('🔧 Step 4: Applying database triggers...');

  const migrationsDir = 'src/lib/db/migrations';
  if (existsSync(migrationsDir)) {
    const triggerFiles = readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql') && f.includes('triggers'))
      .sort();

    if (triggerFiles.length > 0) {
      logger.info(`📊 Found ${triggerFiles.length} trigger files`);
      for (const file of triggerFiles) {
        const filePath = join(migrationsDir, file);
        logger.info(`📄 Running trigger: ${file}`);
        await runCommand(
          `psql "${process.env.DATABASE_URL}" -f "${filePath}"`,
          `Apply trigger ${file}`
        );
      }
    } else {
      logger.info('📊 No trigger files found');
    }
  } else {
    logger.info('📊 Migrations directory not found, skipping');
  }
}
