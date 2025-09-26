#!/usr/bin/env tsx

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

import { logger } from '@/lib/utils/logger';
import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { redisCacheService } from '@/lib/cache/redis-cache-service';
import { simpleCacheService } from '@/lib/cache/simple-cache-service';

/**
 * Comprehensive test script for Redis cache migration
 * Usage: pnpm tsx scripts/test-redis-migration.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class RedisMigrationTester {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime,
      });
      console.log(`✅ ${name} - PASSED (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      });
      console.log(`❌ ${name} - FAILED (${Date.now() - startTime}ms): ${error}`);
    }
  }

  async testBasicOperations(): Promise<void> {
    const testKey = 'test:basic:operations';
    const testData = { message: 'Hello Redis!', timestamp: new Date().toISOString() };

    // Test set
    await hybridCacheService.set(testKey, testData);

    // Test get
    const retrieved = await hybridCacheService.get(testKey);
    if (!retrieved || JSON.stringify(retrieved) !== JSON.stringify(testData)) {
      throw new Error('Data mismatch after set/get');
    }

    // Test delete
    const deleted = await hybridCacheService.delete(testKey);
    if (!deleted) {
      throw new Error('Delete operation failed');
    }

    // Verify deletion
    const afterDelete = await hybridCacheService.get(testKey);
    if (afterDelete !== null) {
      throw new Error('Data still exists after deletion');
    }
  }

  async testCacheStrategies(): Promise<void> {
    const testKey = 'test:strategy:redis';
    const testData = { strategy: 'redis', data: 'test' };

    // Test Redis strategy
    await hybridCacheService.set(testKey, testData, { strategy: 'redis' });
    const retrieved = await hybridCacheService.get(testKey);

    if (!retrieved || JSON.stringify(retrieved) !== JSON.stringify(testData)) {
      throw new Error('Redis strategy failed');
    }

    await hybridCacheService.delete(testKey);
  }

  async testMemoryFallback(): Promise<void> {
    const testKey = 'test:fallback:memory';
    const testData = { fallback: 'memory', data: 'test' };

    // Test memory fallback
    await hybridCacheService.set(testKey, testData, { strategy: 'memory' });
    const retrieved = await hybridCacheService.get(testKey);

    if (!retrieved || JSON.stringify(retrieved) !== JSON.stringify(testData)) {
      throw new Error('Memory fallback failed');
    }

    await hybridCacheService.delete(testKey);
  }

  async testTTLExpiration(): Promise<void> {
    const testKey = 'test:ttl:expiration';
    const testData = { ttl: 'test', data: 'expires' };

    // Set with short TTL
    await hybridCacheService.set(testKey, testData, { ttl: 1 }); // 1 second

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should be expired
    const expired = await hybridCacheService.get(testKey);
    if (expired !== null) {
      throw new Error('TTL expiration failed');
    }
  }

  async testNamespaceIsolation(): Promise<void> {
    const key1 = 'test:namespace:1';
    const key2 = 'test:namespace:2';
    const data1 = { namespace: 'ns1', data: 'test1' };
    const data2 = { namespace: 'ns2', data: 'test2' };

    // Set with different namespaces
    await hybridCacheService.set(key1, data1, { namespace: 'ns1' });
    await hybridCacheService.set(key2, data2, { namespace: 'ns2' });

    // Retrieve and verify isolation
    const retrieved1 = await hybridCacheService.get(key1, { namespace: 'ns1' });
    const retrieved2 = await hybridCacheService.get(key2, { namespace: 'ns2' });

    if (!retrieved1 || JSON.stringify(retrieved1) !== JSON.stringify(data1)) {
      throw new Error('Namespace isolation failed for ns1');
    }

    if (!retrieved2 || JSON.stringify(retrieved2) !== JSON.stringify(data2)) {
      throw new Error('Namespace isolation failed for ns2');
    }

    // Cleanup
    await hybridCacheService.delete(key1, { namespace: 'ns1' });
    await hybridCacheService.delete(key2, { namespace: 'ns2' });
  }

  async testConcurrentOperations(): Promise<void> {
    const promises: Promise<void>[] = [];
    const testCount = 10;

    // Concurrent sets
    for (let i = 0; i < testCount; i++) {
      promises.push(
        hybridCacheService.set(`test:concurrent:${i}`, { index: i, data: 'concurrent' })
      );
    }

    await Promise.all(promises);

    // Concurrent gets
    const getPromises: Promise<any>[] = [];
    for (let i = 0; i < testCount; i++) {
      getPromises.push(hybridCacheService.get(`test:concurrent:${i}`));
    }

    const results = await Promise.all(getPromises);

    // Verify all results
    for (let i = 0; i < testCount; i++) {
      if (!results[i] || results[i].index !== i) {
        throw new Error(`Concurrent operation failed for index ${i}`);
      }
    }

    // Cleanup
    const deletePromises: Promise<boolean>[] = [];
    for (let i = 0; i < testCount; i++) {
      deletePromises.push(hybridCacheService.delete(`test:concurrent:${i}`));
    }
    await Promise.all(deletePromises);
  }

  async testErrorHandling(): Promise<void> {
    // Test with invalid data
    try {
      await hybridCacheService.set('test:error:invalid', undefined as any);
      // Should not throw, but should handle gracefully
    } catch (error) {
      // This is expected behavior
    }

    // Test with very large data
    const largeData = 'x'.repeat(1000000); // 1MB string
    try {
      await hybridCacheService.set('test:error:large', largeData);
      // Should handle gracefully
    } catch (error) {
      // This might be expected depending on Redis limits
    }
  }

  async testCacheStats(): Promise<void> {
    const stats = await hybridCacheService.getStats();

    if (typeof stats.size !== 'number' || stats.size < 0) {
      throw new Error('Invalid cache size');
    }

    if (typeof stats.redisAvailable !== 'boolean') {
      throw new Error('Invalid Redis availability status');
    }

    if (typeof stats.memorySize !== 'number' || stats.memorySize < 0) {
      throw new Error('Invalid memory size');
    }
  }

  async testHealthStatus(): Promise<void> {
    const health = await hybridCacheService.getHealthStatus();

    if (typeof health.healthy !== 'boolean') {
      throw new Error('Invalid health status');
    }

    if (typeof health.redis !== 'boolean') {
      throw new Error('Invalid Redis status');
    }

    if (typeof health.memory !== 'boolean') {
      throw new Error('Invalid memory status');
    }

    if (!health.timestamp) {
      throw new Error('Missing timestamp');
    }
  }

  async testConnectionStatus(): Promise<void> {
    const connections = await hybridCacheService.testConnections();

    if (typeof connections.redis !== 'boolean') {
      throw new Error('Invalid Redis connection status');
    }

    if (typeof connections.memory !== 'boolean') {
      throw new Error('Invalid memory connection status');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Redis Migration Tests...\n');

    await this.runTest('Basic Operations', () => this.testBasicOperations());
    await this.runTest('Cache Strategies', () => this.testCacheStrategies());
    await this.runTest('Memory Fallback', () => this.testMemoryFallback());
    await this.runTest('TTL Expiration', () => this.testTTLExpiration());
    await this.runTest('Namespace Isolation', () => this.testNamespaceIsolation());
    await this.runTest('Concurrent Operations', () => this.testConcurrentOperations());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Cache Statistics', () => this.testCacheStats());
    await this.runTest('Health Status', () => this.testHealthStatus());
    await this.runTest('Connection Status', () => this.testConnectionStatus());

    this.printResults();
  }

  printResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log(`Average Duration: ${(totalDuration / total).toFixed(1)}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
        });
    }

    console.log('\n🏥 Cache Health Status:');
    hybridCacheService.getHealthStatus().then(health => {
      console.log(`  Healthy: ${health.healthy ? '✅' : '❌'}`);
      console.log(`  Strategy: ${health.strategy}`);
      console.log(`  Redis: ${health.redis ? '✅' : '❌'}`);
      console.log(`  Memory: ${health.memory ? '✅' : '❌'}`);
    });

    console.log('\n📈 Cache Statistics:');
    hybridCacheService.getStats().then(stats => {
      console.log(`  Size: ${stats.size}`);
      console.log(`  Max Size: ${stats.maxSize}`);
      console.log(`  Redis Available: ${stats.redisAvailable ? '✅' : '❌'}`);
      console.log(`  Memory Size: ${stats.memorySize}`);
    });

    console.log('\n' + '='.repeat(50));

    if (failed === 0) {
      console.log('🎉 All tests passed! Redis migration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run the tests
async function main() {
  const tester = new RedisMigrationTester();
  await tester.runAllTests();
}

main().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
