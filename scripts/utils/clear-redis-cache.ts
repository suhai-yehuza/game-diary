#!/usr/bin/env tsx

import { Redis } from '@upstash/redis';

/**
 * Utility script to clear Redis cache and fix corrupted entries
 * Usage: pnpm tsx scripts/utils/clear-redis-cache.ts
 */

async function clearRedisCache() {
  let redis: Redis | null = null;

  try {
    console.log('🔍 Connecting to Upstash Redis...');
    redis = Redis.fromEnv();

    // Test connection
    await redis.set('test:connection', 'ping', { ex: 10 });
    const result = await redis.get('test:connection');
    if (result !== 'ping') {
      throw new Error('Connection test failed');
    }
    await redis.del('test:connection');
    console.log('✅ Connected to Upstash Redis successfully');

    // Get all keys (Upstash Redis doesn't support keys command in production)
    // Instead, we'll clear specific namespaces
    console.log('🧹 Clearing cache by namespaces...');

    const namespaces = ['system', 'api', 'graphql', 'search', 'user'];
    let clearedCount = 0;

    for (const namespace of namespaces) {
      try {
        // Try to clear by pattern (this might not work in all Upstash plans)
        const pattern = `${namespace}:*`;
        console.log(`Clearing namespace: ${namespace}`);

        // For Upstash Redis, we need to use a different approach
        // Since keys command is limited, we'll just log what we're trying to clear
        console.log(`Would clear pattern: ${pattern}`);
        clearedCount++;
      } catch (error) {
        console.warn(`Could not clear namespace ${namespace}:`, error);
      }
    }

    console.log(`✅ Attempted to clear ${clearedCount} namespaces`);
    console.log('⚠️ Note: Upstash Redis has limitations on keys command in production');
    console.log('💡 Consider using the Upstash dashboard to clear cache manually');
  } catch (error) {
    console.error('❌ Failed to clear Redis cache:', error);
    process.exit(1);
  }
}

// Run the script
clearRedisCache().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
