#!/usr/bin/env tsx

/**
 * Test script for the new paginated games caching strategy
 * Tests various scenarios and validates cache performance
 */

import { logger } from '../src/lib/utils/logger';

interface TestResult {
  test: string;
  success: boolean;
  duration: number;
  cacheHit?: boolean;
  dataCount?: number;
  error?: string;
}

class GamesCachingTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async runTest(testName: string, url: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      console.log(`🧪 Running test: ${testName}`);
      console.log(`   URL: ${url}`);

      const response = await fetch(url);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const cacheHit = data.cacheInfo?.hit || false;
      const dataCount = data.data?.length || data.response?.length || 0;

      const result: TestResult = {
        test: testName,
        success: true,
        duration,
        cacheHit,
        dataCount,
      };

      console.log(
        `   ✅ Success: ${dataCount} games, ${duration}ms, cache: ${cacheHit ? 'HIT' : 'MISS'}`
      );
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: TestResult = {
        test: testName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };

      console.log(`   ❌ Failed: ${result.error}`);
      return result;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Games Caching Tests\n');

    const tests = [
      // Basic pagination tests
      {
        name: 'Basic Pagination - Page 1',
        url: `${this.baseUrl}/api/games?page=1&limit=10`,
      },
      {
        name: 'Basic Pagination - Page 2',
        url: `${this.baseUrl}/api/games?page=2&limit=10`,
      },

      // Season filtering tests
      {
        name: 'Season 2024 - Page 1',
        url: `${this.baseUrl}/api/games?season=2024&page=1&limit=20`,
      },
      {
        name: 'All Seasons - Page 1',
        url: `${this.baseUrl}/api/games?season=all&page=1&limit=50`,
      },

      // Status filtering tests
      {
        name: 'Finished Games - Page 1',
        url: `${this.baseUrl}/api/games?status=finished&page=1&limit=25`,
      },
      {
        name: 'Live Games - Page 1',
        url: `${this.baseUrl}/api/games?status=live&page=1&limit=10`,
      },
      {
        name: 'Scheduled Games - Page 1',
        url: `${this.baseUrl}/api/games?status=scheduled&page=1&limit=15`,
      },

      // Cache performance tests
      {
        name: 'Cache Hit Test - Same Query',
        url: `${this.baseUrl}/api/games?season=2024&page=1&limit=20`,
      },
      {
        name: 'Cache Bypass Test',
        url: `${this.baseUrl}/api/games?season=2024&page=1&limit=20&bypass-cache=true`,
      },

      // Edge cases
      {
        name: 'Large Limit Test',
        url: `${this.baseUrl}/api/games?page=1&limit=100`,
      },
      {
        name: 'High Page Number Test',
        url: `${this.baseUrl}/api/games?page=10&limit=10`,
      },
    ];

    // Run all tests
    for (const test of tests) {
      const result = await this.runTest(test.name, test.url);
      this.results.push(result);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Run cache performance comparison
    await this.runCachePerformanceTest();

    // Generate report
    this.generateReport();
  }

  async runCachePerformanceTest(): Promise<void> {
    console.log('\n📊 Running Cache Performance Test\n');

    const testUrl = `${this.baseUrl}/api/games?season=2024&page=1&limit=50`;

    // First request (should be cache miss)
    console.log('🔄 First request (expected cache miss)...');
    const firstResult = await this.runTest('Cache Miss Test', testUrl);
    this.results.push(firstResult);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));

    // Second request (should be cache hit)
    console.log('🔄 Second request (expected cache hit)...');
    const secondResult = await this.runTest('Cache Hit Test', testUrl);
    this.results.push(secondResult);

    // Calculate performance improvement
    if (firstResult.success && secondResult.success) {
      const improvement =
        ((firstResult.duration - secondResult.duration) / firstResult.duration) * 100;
      console.log(`\n⚡ Cache Performance: ${improvement.toFixed(1)}% faster with cache hit`);
    }
  }

  generateReport(): void {
    console.log('\n📋 Test Results Summary');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (successful.length > 0) {
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
      const cacheHits = successful.filter(r => r.cacheHit).length;
      const cacheHitRate = (cacheHits / successful.length) * 100;

      console.log(`⏱️  Average Duration: ${avgDuration.toFixed(1)}ms`);
      console.log(`🎯 Cache Hit Rate: ${cacheHitRate.toFixed(1)}%`);
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`   - ${result.test}: ${result.error}`);
      });
    }

    // Cache TTL analysis
    console.log('\n🕒 Cache TTL Analysis:');
    console.log('   - Finished Games: 24 hours (86400s)');
    console.log('   - Live Games: 5 minutes (300s)');
    console.log('   - Scheduled Games: 1 hour (3600s)');
    console.log('   - Mixed Status: 2 hours (7200s)');

    console.log('\n🎉 Testing Complete!');
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const tester = new GamesCachingTester(baseUrl);

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { GamesCachingTester };
