import { config } from 'dotenv-flow'; // Load env vars based on NODE_ENV

import { testRedisConnection, getCache } from '../src/lib/cache/index';

config();

async function main() {
  // Explicitly initialize Redis and wait for it
  await getCache().initializeRedis();

  try {
    await testRedisConnection();
    console.log('✅ Redis connection test passed!');
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    process.exit(1);
  }
}

main();
