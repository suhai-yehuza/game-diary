#!/usr/bin/env tsx

import 'dotenv-flow/config';

import { logger } from '@/lib/utils/logger';
import { cleanupTestData } from './test-all-triggers';

// Parse command line arguments
let environment = 'development';

for (const arg of process.argv) {
  if (arg.startsWith('--env=')) {
    environment = arg.split('=')[1];
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
🧹 NBA Test Data Cleanup Script

This script removes all test data created by trigger tests and other test scripts.

Usage:
  pnpm tsx scripts/tests/cleanup-test-data.ts [options]

Options:
  --env=<environment>     Database environment (default: development)
  --help, -h            Show this help message

Examples:
  # Cleanup test data from development database
  pnpm tsx scripts/tests/cleanup-test-data.ts

  # Cleanup test data from production database
  pnpm tsx scripts/tests/cleanup-test-data.ts --env=production

⚠️  WARNING: This will permanently delete test data from the specified database!
        `);
    process.exit(0);
  }
}

// Safety check for production
if (environment === 'production') {
  logger.warn('⚠️  WARNING: You are about to run cleanup on PRODUCTION database!');
  logger.warn('   This will delete test data. Are you sure? (y/N)');
  logger.warn('   Proceeding with cleanup in 5 seconds...');

  // Give user time to cancel
  await new Promise(resolve => setTimeout(resolve, 5000));
}

// Run cleanup
try {
  logger.info(`🧹 Starting test data cleanup for ${environment} environment...`);
  await cleanupTestData(environment);
  logger.info('✅ Test data cleanup completed successfully');
} catch (error) {
  logger.error(
    '❌ Test data cleanup failed:',
    error instanceof Error ? error : new Error(String(error))
  );
  process.exit(1);
}
