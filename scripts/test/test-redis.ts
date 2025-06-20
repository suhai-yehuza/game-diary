import { config } from 'dotenv-flow'; // Load env vars based on NODE_ENV

import { logger } from '@lib/core/logger';
import { testRedisConnection, getCache } from '@src/lib/cache/index';

import { parseScriptArgs } from '../shared/script-utils';

// Load environment variables
config();

async function main() {
  const options = parseScriptArgs();
  logger.info(`🔌 Testing Redis connection for ${options.environment} environment...`);

  try {
    // Explicitly initialize Redis and wait for it
    await getCache().initializeRedis();

    await testRedisConnection();
    logger.info('✅ Redis connection test passed!');
  } catch (error) {
    logger.error(
      '❌ Redis connection test failed:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
