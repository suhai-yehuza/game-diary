#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

import { Redis } from '@upstash/redis';
import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';

/**
 * Redis connection test for the Game Diary application
 * Tests both direct Redis connection and hybrid cache service
 */
async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection for Game Diary...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(
    'UPSTASH_REDIS_REST_URL:',
    process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Missing'
  );
  console.log(
    'UPSTASH_REDIS_REST_TOKEN:',
    process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Missing'
  );
  console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Missing');
  console.log('FORCE_REDIS_CACHE:', process.env.FORCE_REDIS_CACHE);
  console.log();

  try {
    // Test direct Redis connection
    console.log('🔌 Testing direct Redis connection...');
    const redis = Redis.fromEnv();
    await redis.set('test:connection', 'ping', { ex: 10 });
    const result = await redis.get('test:connection');

    if (result === 'ping') {
      await redis.del('test:connection');
      console.log('✅ Direct Redis connection successful');
    } else {
      throw new Error('Redis connection test failed');
    }

    // Test hybrid cache service
    console.log('\n🧪 Testing hybrid cache service...');
    const testKey = 'test:hybrid:' + Date.now();
    const testData = { message: 'Hello Hybrid Cache!', timestamp: new Date().toISOString() };

    await hybridCacheService.set(testKey, testData);
    const retrievedData = await hybridCacheService.get(testKey);

    if (retrievedData && JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✅ Hybrid cache service working correctly');
    } else {
      throw new Error('Hybrid cache service test failed');
    }

    // Test cache health
    console.log('\n🏥 Testing cache health...');
    const health = await hybridCacheService.getHealthStatus();
    console.log('Health status:', {
      healthy: health.healthy,
      redis: health.redis,
      memory: health.memory,
      strategy: health.strategy,
    });

    // Test cache stats
    const stats = await hybridCacheService.getStats();
    console.log('Cache stats:', {
      size: stats.size,
      redisAvailable: stats.redisAvailable,
      strategy: stats.strategy,
    });

    // Cleanup
    await hybridCacheService.delete(testKey);
    console.log('\n✅ All Redis tests completed successfully!');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRedisConnection().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
