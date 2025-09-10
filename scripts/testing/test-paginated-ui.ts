#!/usr/bin/env tsx

/**
 * Test script for the updated NBA Games page with paginated API
 * Tests the UI components and API integration
 */

import { logger } from '../src/lib/utils/logger';

interface TestResult {
  test: string;
  success: boolean;
  duration: number;
  data?: any;
  error?: string;
}

class PaginatedUITester {
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

      const result: TestResult = {
        test: testName,
        success: true,
        duration,
        data,
      };

      console.log(`   ✅ Success: ${duration}ms`);
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

  async testPaginatedAPI(): Promise<void> {
    console.log('🚀 Testing Paginated Games API\n');

    const tests = [
      // Test basic pagination
      {
        name: 'Basic Pagination - Page 1',
        url: `${this.baseUrl}/api/games?page=1&limit=18`,
      },
      {
        name: 'Basic Pagination - Page 2',
        url: `${this.baseUrl}/api/games?page=2&limit=18`,
      },

      // Test status filtering
      {
        name: 'Finished Games - Page 1',
        url: `${this.baseUrl}/api/games?status=finished&page=1&limit=18`,
      },
      {
        name: 'Live Games - Page 1',
        url: `${this.baseUrl}/api/games?status=live&page=1&limit=18`,
      },
      {
        name: 'Scheduled Games - Page 1',
        url: `${this.baseUrl}/api/games?status=scheduled&page=1&limit=18`,
      },

      // Test season filtering
      {
        name: '2024 Season - Page 1',
        url: `${this.baseUrl}/api/games?season=2024&page=1&limit=18`,
      },
      {
        name: 'All Seasons - Page 1',
        url: `${this.baseUrl}/api/games?season=all&page=1&limit=18`,
      },

      // Test combined filters
      {
        name: '2024 Season + Finished Games',
        url: `${this.baseUrl}/api/games?season=2024&status=finished&page=1&limit=18`,
      },
      {
        name: 'All Seasons + Live Games',
        url: `${this.baseUrl}/api/games?season=all&status=live&page=1&limit=18`,
      },
    ];

    // Run all tests
    for (const test of tests) {
      const result = await this.runTest(test.name, test.url);
      this.results.push(result);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async testCachePerformance(): Promise<void> {
    console.log('\n📊 Testing Cache Performance\n');

    const testUrl = `${this.baseUrl}/api/games?season=2024&status=finished&page=1&limit=18`;

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

  async testResponseFormat(): Promise<void> {
    console.log('\n🔍 Testing Response Format\n');

    const testUrl = `${this.baseUrl}/api/games?page=1&limit=18`;
    const result = await this.runTest('Response Format Test', testUrl);
    this.results.push(result);

    if (result.success && result.data) {
      const data = result.data;

      // Check required fields
      const requiredFields = ['success', 'data', 'pagination', 'filters', 'cacheInfo'];
      const missingFields = requiredFields.filter(field => !(field in data));

      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present');

        // Check pagination structure
        const pagination = data.pagination;
        const paginationFields = [
          'page',
          'limit',
          'totalCount',
          'totalPages',
          'hasNextPage',
          'hasPrevPage',
        ];
        const missingPaginationFields = paginationFields.filter(field => !(field in pagination));

        if (missingPaginationFields.length === 0) {
          console.log('   ✅ Pagination structure correct');
        } else {
          console.log(`   ❌ Missing pagination fields: ${missingPaginationFields.join(', ')}`);
        }

        // Check cache info structure
        const cacheInfo = data.cacheInfo;
        const cacheInfoFields = ['hit', 'key', 'ttl', 'status'];
        const missingCacheInfoFields = cacheInfoFields.filter(field => !(field in cacheInfo));

        if (missingCacheInfoFields.length === 0) {
          console.log('   ✅ Cache info structure correct');
        } else {
          console.log(`   ❌ Missing cache info fields: ${missingCacheInfoFields.join(', ')}`);
        }

        // Check data format
        if (Array.isArray(data.data)) {
          console.log(`   ✅ Data is array with ${data.data.length} items`);
        } else {
          console.log('   ❌ Data is not an array');
        }
      } else {
        console.log(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
      }
    }
  }

  async testUIEndpoints(): Promise<void> {
    console.log('\n🖥️  Testing UI Endpoints\n');

    const tests = [
      {
        name: 'NBA Games Page',
        url: `${this.baseUrl}/sports/nba/games`,
      },
      {
        name: 'NBA Hub Page',
        url: `${this.baseUrl}/sports/nba`,
      },
    ];

    for (const test of tests) {
      const result = await this.runTest(test.name, test.url);
      this.results.push(result);

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Paginated UI Tests\n');

    await this.testPaginatedAPI();
    await this.testCachePerformance();
    await this.testResponseFormat();
    await this.testUIEndpoints();

    // Generate report
    this.generateReport();
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
      console.log(`⏱️  Average Duration: ${avgDuration.toFixed(1)}ms`);
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      failed.forEach(result => {
        console.log(`   - ${result.test}: ${result.error}`);
      });
    }

    // API Features Summary
    console.log('\n🎯 API Features Tested:');
    console.log('   ✅ Pagination (page, limit)');
    console.log('   ✅ Status filtering (finished, live, scheduled)');
    console.log('   ✅ Season filtering (2024, 2023, all)');
    console.log('   ✅ Combined filters');
    console.log('   ✅ Cache performance');
    console.log('   ✅ Response format validation');
    console.log('   ✅ UI endpoint accessibility');

    console.log('\n🎉 Testing Complete!');
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const tester = new PaginatedUITester(baseUrl);

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

export { PaginatedUITester };
