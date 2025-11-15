#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load production environment variables
dotenv.config({ path: '.env.production' });

import { Redis } from '@upstash/redis';

/**
 * Production Redis Write/Read Test
 * Tests both write and read operations to verify Redis connectivity in production
 */
async function testProductionRedis() {
  console.log('🔍 Testing Production Redis Write/Read Operations...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  console.log('UPSTASH_REDIS_REST_URL:', redisUrl ? '✅ Set' : '❌ Missing');
  if (redisUrl) {
    // Show just the hostname part for debugging (not the full URL with token)
    try {
      const urlObj = new URL(redisUrl);
      console.log('   Hostname:', urlObj.hostname);
      console.log('   Protocol:', urlObj.protocol);
    } catch {
      console.log('   URL format:', redisUrl.substring(0, 50) + '...');
    }
  }
  console.log('UPSTASH_REDIS_REST_TOKEN:', redisToken ? '✅ Set (hidden)' : '❌ Missing');
  console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log();

  if (!redisUrl || !redisToken) {
    console.error('❌ Missing required Redis environment variables');
    console.error('Please ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set');
    process.exit(1);
  }

  try {
    // Initialize Redis connection
    console.log('🔌 Initializing Redis connection...');
    const redis = Redis.fromEnv();
    console.log('✅ Redis client initialized\n');

    // Generate unique test key
    const testKey = `test:prod:${Date.now()}`;
    const testValue = {
      message: 'Production Redis Test',
      timestamp: new Date().toISOString(),
      testId: Math.random().toString(36).substring(7),
    };

    console.log('📝 Test Details:');
    console.log(`   Key: ${testKey}`);
    console.log(`   Value: ${JSON.stringify(testValue, null, 2)}`);
    console.log();

    // Test 1: Write Operation
    console.log('✍️  Test 1: Write Operation');
    console.log('   Writing to Redis...');
    const writeStartTime = Date.now();
    let writeDuration = 0;

    try {
      await redis.set(testKey, JSON.stringify(testValue), { ex: 60 }); // 60 second TTL
      writeDuration = Date.now() - writeStartTime;
      console.log(`   ✅ Write successful (${writeDuration}ms)`);
    } catch (writeError) {
      console.error('   ❌ Write operation failed');
      if (writeError instanceof Error) {
        console.error(`   Error message: ${writeError.message}`);
        console.error(`   Error name: ${writeError.name}`);
        if ('cause' in writeError && writeError.cause) {
          console.error(`   Error cause: ${writeError.cause}`);
        }
      }
      throw writeError;
    }
    console.log();

    // Test 2: Read Operation
    console.log('📖 Test 2: Read Operation');
    console.log('   Reading from Redis...');
    const readStartTime = Date.now();

    const readResult = await redis.get(testKey);

    const readDuration = Date.now() - readStartTime;

    if (!readResult) {
      throw new Error('Read operation returned null - data was not found');
    }

    const parsedResult = typeof readResult === 'string' ? JSON.parse(readResult) : readResult;

    console.log(`   ✅ Read successful (${readDuration}ms)`);
    console.log(`   Retrieved value: ${JSON.stringify(parsedResult, null, 2)}`);
    console.log();

    // Test 3: Verify Data Integrity
    console.log('🔍 Test 3: Data Integrity Verification');
    const valuesMatch =
      parsedResult.message === testValue.message &&
      parsedResult.timestamp === testValue.timestamp &&
      parsedResult.testId === testValue.testId;

    if (valuesMatch) {
      console.log('   ✅ Data integrity verified - written and read values match');
    } else {
      throw new Error('Data integrity check failed - values do not match');
    }
    console.log();

    // Test 4: Cleanup
    console.log('🧹 Test 4: Cleanup');
    console.log('   Deleting test key...');
    const deleteStartTime = Date.now();

    await redis.del(testKey);

    const deleteDuration = Date.now() - deleteStartTime;
    console.log(`   ✅ Cleanup successful (${deleteDuration}ms)`);

    // Verify deletion
    const verifyResult = await redis.get(testKey);
    if (verifyResult === null) {
      console.log('   ✅ Deletion verified - key no longer exists');
    } else {
      console.warn('   ⚠️  Warning: Key still exists after deletion');
    }
    console.log();

    // Summary
    console.log('📊 Test Summary');
    console.log('================');
    console.log('✅ Write Operation: PASSED');
    console.log(`   Duration: ${writeDuration}ms`);
    console.log('✅ Read Operation: PASSED');
    console.log(`   Duration: ${readDuration}ms`);
    console.log('✅ Data Integrity: PASSED');
    console.log('✅ Cleanup: PASSED');
    console.log(`   Duration: ${deleteDuration}ms`);
    console.log();
    console.log('🎉 All production Redis tests passed successfully!');
    console.log('✅ Production Redis is working correctly');
  } catch (error) {
    console.error('\n❌ Production Redis test failed:');
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    } else {
      console.error(`   Error: ${String(error)}`);
    }
    process.exit(1);
  }
}

// Run the test
testProductionRedis().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
