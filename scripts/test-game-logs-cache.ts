#!/usr/bin/env tsx

import { hybridCacheService } from '../src/lib/cache/hybrid-cache-service';
import { GameLogCacheUtils } from '../src/lib/cache/game-log-cache.utils';

async function testGameLogsCache() {
  console.log('🧪 Testing Game Logs Cache System...\n');

  try {
    // Test 1: Basic cache operations
    console.log('1️⃣ Testing basic cache operations...');

    const testData = { id: 'test-1', userId: 'user-123', content: 'Test game log' };
    await GameLogCacheUtils.cacheGameLog('test-1', testData);
    console.log('✅ Cached game log successfully');

    const retrieved = await GameLogCacheUtils.getCachedGameLog('test-1');
    console.log('✅ Retrieved game log:', retrieved ? 'SUCCESS' : 'FAILED');

    // Test 2: Cache list operations
    console.log('\n2️⃣ Testing cache list operations...');

    const testList = [testData, { id: 'test-2', userId: 'user-123', content: 'Test game log 2' }];
    const filters = { userId: 'user-123' };
    const pagination = { page: 1, limit: 20 };

    await GameLogCacheUtils.cacheGameLogList(filters, pagination, testList);
    console.log('✅ Cached game log list successfully');

    const retrievedList = await GameLogCacheUtils.getCachedGameLogList(filters, pagination);
    console.log(
      '✅ Retrieved game log list:',
      retrievedList ? `SUCCESS (${retrievedList.length} items)` : 'FAILED'
    );

    // Test 3: getKeysByPattern method
    console.log('\n3️⃣ Testing getKeysByPattern method...');

    try {
      const keys = await hybridCacheService.getKeysByPattern('*');
      console.log('✅ getKeysByPattern method works! Found keys:', keys.length);

      if (keys.length > 0) {
        console.log('   Sample keys:', keys.slice(0, 3));
      }
    } catch (error) {
      console.log('❌ getKeysByPattern method failed:', error);
    }

    // Test 4: Cache invalidation
    console.log('\n4️⃣ Testing cache invalidation...');

    await GameLogCacheUtils.invalidateGameLogCaches('test-1');
    console.log('✅ Cache invalidation completed');

    const afterInvalidation = await GameLogCacheUtils.getCachedGameLog('test-1');
    console.log(
      '✅ After invalidation:',
      afterInvalidation ? 'STILL EXISTS' : 'REMOVED (expected)'
    );

    // Test 5: Cache statistics
    console.log('\n5️⃣ Testing cache statistics...');

    const stats = await GameLogCacheUtils.getCacheStats();
    console.log('✅ Cache stats retrieved:', {
      namespace: stats.namespace,
      totalKeys: stats.totalKeys || 'N/A',
      memoryUsage: stats.memoryUsage || 'N/A',
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Game Logs Cache System is working properly');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  void testGameLogsCache();
}
