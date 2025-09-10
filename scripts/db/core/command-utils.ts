/**
 * @fileoverview Command execution utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@src/lib/utils/logger';
import { verifyTableCreation } from './table-operations';

const execAsync = promisify(exec);

/**
 * Run command with proper error handling
 */
export async function runCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);
  logger.info(`🔧 Executing: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stdout) {
      logger.info('📄 Command output:');
      logger.info(stdout);
    }

    if (stderr) {
      // Filter out common warnings that are not errors
      const filteredStderr = stderr
        .split('\n')
        .filter(
          line =>
            !line.includes('Warning') &&
            !line.includes('deprecat') &&
            !line.includes('NOTICE') &&
            line.trim() !== ''
        )
        .join('\n');

      if (filteredStderr.trim()) {
        logger.warn('⚠️  Command warnings:');
        logger.warn(filteredStderr);
      }
    }

    logger.info(`✅ ${description} completed successfully`);
  } catch (error: unknown) {
    logger.error(
      `❌ ${description} failed:`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Run interactive command with proper handling
 */
export async function runInteractiveCommand(command: string, description: string): Promise<void> {
  logger.info(`\n📌 ${description}...`);

  try {
    if (command.includes('drizzle-kit push --force')) {
      logger.info('🔧 Running drizzle-kit push --force...');
      const { stdout, stderr } = await execAsync(command);

      if (stdout) {
        logger.info('📄 Drizzle-kit output:');
        logger.info(stdout);
      }

      if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) {
        logger.warn('⚠️  Drizzle-kit warnings:');
        logger.warn(stderr);
      }

      logger.info('🔍 Verifying table creation...');
      await verifyTableCreation();
    } else {
      await runCommand(command, description);
    }

    logger.info(`✅ ${description} completed`);
  } catch (error: unknown) {
    logger.error(
      `❌ ${description} failed:`,
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}
