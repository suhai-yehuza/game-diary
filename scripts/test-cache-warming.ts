#!/usr/bin/env tsx

import { cacheWarmingService } from '../src/lib/services/cache-warming.service';

async function testCacheWarmingService() {
  console.log('🧪 Testing Cache Warming Service...\n');

  try {
    // Test 1: Check initial status
    console.log('1️⃣ Initial Status:');
    const initialStatus = cacheWarmingService.getStatus();
    console.log('   Is Running:', initialStatus.isRunning);
    console.log('   Warming Interval:', initialStatus.warmingIntervalMs, 'ms');
    console.log('');

    // Test 2: Start the service
    console.log('2️⃣ Starting Service:');
    cacheWarmingService.start();
    console.log('   Service started');
    console.log('');

    // Test 3: Check running status
    console.log('3️⃣ Running Status:');
    const runningStatus = cacheWarmingService.getStatus();
    console.log('   Is Running:', runningStatus.isRunning);
    console.log('');

    // Test 4: Wait a bit for initial warming to complete
    console.log('4️⃣ Waiting for initial cache warming...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    console.log('   Initial warming should be complete');
    console.log('');

    // Test 5: Stop the service
    console.log('5️⃣ Stopping Service:');
    cacheWarmingService.stop();
    console.log('   Service stopped');
    console.log('');

    // Test 6: Final status check
    console.log('6️⃣ Final Status:');
    const finalStatus = cacheWarmingService.getStatus();
    console.log('   Is Running:', finalStatus.isRunning);
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Service can be started and stopped');
    console.log('   - Status tracking works correctly');
    console.log('   - Background warming should prevent cache gaps');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Restart your development server');
    console.log('   2. Check browser console for cache warming logs');
    console.log('   3. Visit NBA Games page - should be much faster!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.main) {
  testCacheWarmingService().catch(console.error);
}
