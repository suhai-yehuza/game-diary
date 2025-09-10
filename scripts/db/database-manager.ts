#!/usr/bin/env tsx
/**
 * @fileoverview Unified database management system - Refactored
 * Main CLI entry point for database operations
 */

import { loadEnvironmentVariables } from '@/lib/utils/env-loader';

// Load environment variables safely
loadEnvironmentVariables();

import { logger } from '@src/lib/utils/logger';
import { parseScriptArgs } from './cli/argument-parser';
import {
  handleResetCommand,
  handleSetupCommand,
  handleCopyMigrationsCommand,
  showHelp,
} from './cli/commands';

/**
 * Main CLI interface for database operations
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseScriptArgs();

  try {
    switch (command) {
      case 'reset':
        await handleResetCommand(args);
        break;

      case 'setup':
        await handleSetupCommand(args, options);
        break;

      case 'migrate':
        logger.info('🚧 Migration functionality will be implemented in migration modules');
        logger.info('💡 For now, use: pnpm db:reset --mode=drizzle --env=dev');
        break;

      case 'migrate-file':
        logger.info('🚧 Migration file functionality will be implemented in migration modules');
        break;

      case 'view':
        logger.info('🚧 View functionality will be implemented in migration modules');
        break;

      case 'validate':
        logger.info('🚧 Validation functionality will be implemented in migration modules');
        break;

      case 'validate-triggers':
        logger.info('🚧 Trigger validation functionality will be implemented in migration modules');
        break;

      case 'copy-migrations':
        await handleCopyMigrationsCommand();
        break;

      case 'truncate':
        logger.info('🚧 Truncate functionality will be implemented in table operations modules');
        break;

      case 'drop':
        logger.info('🚧 Drop functionality will be implemented in table operations modules');
        break;

      default:
        showHelp();
        break;
    }
  } catch (error) {
    logger.error(
      'Database operation failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('Database manager failed:', error);
    process.exit(1);
  });
}
