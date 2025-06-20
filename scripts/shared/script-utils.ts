import { exec } from 'child_process';
import { promisify } from 'util';

import { sql } from 'drizzle-orm';

import { logger } from '@lib/core/logger';
import { createDatabaseClient } from '@src/lib/db/seed/config';
import type { IScriptOptions } from '@src/lib/types';

export const execAsync = promisify(exec) as (
  command: string
) => Promise<{ stdout: string; stderr: string }>;

/**
 * Parse command line arguments for common script options
 */
export function parseScriptArgs(): IScriptOptions {
  const environment = process.argv[2] || 'development';
  const dryRun = process.argv.includes('--dry-run');
  const runTests = process.argv.includes('--test');
  const verbose = process.argv.includes('--verbose');

  return {
    environment,
    dryRun,
    runTests,
    verbose,
  };
}

/**
 * Initialize database connection with environment
 */
export function initDatabase(env = 'development') {
  return createDatabaseClient({ env });
}

/**
 * Run a shell command with logging
 */
export async function runCommand(
  command: string,
  description: string,
  options: { silent?: boolean } = {}
): Promise<string> {
  if (!options.silent) {
    logger.info(`\n📌 ${description}...`);
  }

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stdout && !options.silent) {
      logger.info(stdout);
    }

    if (stderr && !stderr.includes('Warning') && !stderr.includes('deprecat')) {
      if (!options.silent) {
        logger.error(stderr);
      }
    }

    if (!options.silent) {
      logger.info(`✅ ${description} completed`);
    }

    return stdout;
  } catch (error: unknown) {
    logger.error(`❌ Failed: ${description}`);
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
    throw error;
  }
}

/**
 * Handle script errors with consistent formatting
 */
export function handleScriptError(error: unknown, context: string): never {
  logger.error(`\n❌ ${context} failed:`, error instanceof Error ? error.message : String(error));

  if (error instanceof Error && error.stack) {
    logger.error('Stack trace:', error.stack);
  }

  logger.error('\n💡 Troubleshooting tips:');
  logger.error('1. Check your database connection in .env');
  logger.error('2. Ensure all dependencies are installed (pnpm install)');
  logger.error('3. Verify your database permissions');

  process.exit(1);
}

/**
 * Wait for a specified amount of time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log script header with environment info
 */
export function logScriptHeader(
  scriptName: string,
  env: string,
  options: Partial<IScriptOptions> = {}
): void {
  logger.info(`🚀 Starting ${scriptName} for ${env} environment...`);

  if (options.dryRun) {
    logger.info('🔍 Running in DRY RUN mode - no changes will be made');
  }

  if (options.runTests) {
    logger.info('🧪 Tests will be run after completion');
  }

  if (options.verbose) {
    logger.info('📝 Verbose logging enabled');
  }

  logger.info('================================================\n');
}

/**
 * Log script footer with summary
 */
export function logScriptFooter(
  scriptName: string,
  success = true,
  nextSteps: string[] = []
): void {
  logger.info('\n================================================');

  if (success) {
    logger.info(`🎉 ${scriptName} completed successfully!`);
  } else {
    logger.error(`❌ ${scriptName} failed!`);
  }

  logger.info('================================================\n');

  if (success && nextSteps.length > 0) {
    logger.info('📝 Next steps:');
    nextSteps.forEach((step, index) => {
      logger.info(`${index + 1}. ${step}`);
    });
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await wait(delay);
    }
  }

  // This should never happen due to the throw in the loop,
  // but TypeScript needs this for type safety
  throw lastError ?? new Error('Retry failed with no error');
}

/**
 * Check if a table exists in the database
 */
export async function tableExists(
  db: ReturnType<typeof createDatabaseClient>,
  tableName: string
): Promise<boolean> {
  try {
    const result = (await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists;
    `)) as unknown as { rows: Array<{ exists: boolean }> };

    return Boolean(result.rows[0]?.exists);
  } catch {
    return false;
  }
}
