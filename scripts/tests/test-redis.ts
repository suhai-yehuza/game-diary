#!/usr/bin/env tsx

import { config } from 'dotenv-flow'; // Load env vars based on NODE_ENV

import { logger } from '@/lib/utils/logger';
import { getCache, testRedisConnection } from '@/lib/cache/index';
import { errorHandlers } from '@/lib/utils/error-handler';

import { parseScriptArgs } from '../utils/script-utils';

// Load environment variables
config();

async function testRedis() {
  const options = parseScriptArgs();
  const env = options.environment ?? 'development';

  logger.info(`\n🧪 Testing Redis connection (${env} environment)...`);
  logger.info('================================================');

  try {
    logger.info('🔌 Testing Redis connection...');

    const cache = getCache();
    if (!cache) {
      logger.warn('⚠️  Cache object is null (placeholder implementation)');
    }

    // Test the connection using the placeholder function
    const isConnected = testRedisConnection();

    if (isConnected) {
      logger.info('✅ Redis connection test passed (placeholder)');
    } else {
      logger.error('❌ Redis connection test failed');
      process.exit(1);
    }
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Redis Test',
      action: 'Redis connection test',
    });
    logger.error(
      '❌ Redis connection test failed:',
      error instanceof Error ? error : new Error(String(error))
    );
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error);
    }
    process.exit(1);
  }
}

testRedis();
