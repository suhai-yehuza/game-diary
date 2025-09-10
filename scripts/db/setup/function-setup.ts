/**
 * @fileoverview Database function setup and management
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@src/lib/utils/logger';
import { runCommand } from '../core/command-utils';

/**
 * Setup database functions
 */
export async function setupFunctions(): Promise<void> {
  logger.info('🔧 Step 3: Applying database functions...');

  const migrationsDir = 'src/lib/db/migrations';
  if (existsSync(migrationsDir)) {
    const functionFiles = readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith('.sql') && f.includes('functions'))
      .sort();

    if (functionFiles.length > 0) {
      logger.info(`📊 Found ${functionFiles.length} function files`);
      for (const file of functionFiles) {
        const filePath = join(migrationsDir, file);
        logger.info(`📄 Running function: ${file}`);
        await runCommand(
          `psql "${process.env.DATABASE_URL}" -f "${filePath}"`,
          `Apply function ${file}`
        );
      }
    } else {
      logger.info('📊 No function files found');
    }
  } else {
    logger.info('📊 Migrations directory not found, skipping');
  }
}
