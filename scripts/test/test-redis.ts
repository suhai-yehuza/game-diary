import { config } from 'dotenv-flow'; // Load env vars based on NODE_ENV

import { testRedisConnection, getCache } from '@src/lib/cache/index';
import { logger } from 'lib/core/logger';
config();

async function main() {
  // Explicitly initialize Redis and wait for it
  await getCache().initializeRedis();

  try {
    await testRedisConnection();
    logger.info('✅ Redis connection test passed!');
  } catch (error) {
    logger.error('❌ Redis connection test failed:', error);
    process.exit(1);
  }
}

main();
