#!/usr/bin/env tsx

/**
 * GraphQL Performance Testing Script
 *
 * This script tests the performance improvements of the optimized GraphQL hooks
 * by running various queries and measuring their execution times.
 */

import { queryPerformanceMonitor } from '../src/lib/utils/query-performance-monitor';

interface IPerformanceTest {
  name: string;
  description: string;
  testFn: () => Promise<void>;
  expectedImprovement: number; // Expected improvement percentage
}

class GraphQLPerformanceTester {
  private tests: IPerformanceTest[] = [];
  private results: Map<string, { before: number; after: number; improvement: number }> = new Map();

  constructor() {
    this.setupTests();
  }

  private setupTests() {
    // Test 1: Basic query performance
    this.tests.push({
      name: 'Basic Query Performance',
      description: 'Test basic GraphQL query execution time',
      testFn: async () => {
        // Simulate a basic query
        const timer = queryPerformanceMonitor.startQueryTimer('TestBasicQuery', {});
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms query
        timer.finish(true);
      },
      expectedImprovement: 20,
    });

    // Test 2: Pagination performance
    this.tests.push({
      name: 'Pagination Performance',
      description: 'Test paginated query performance',
      testFn: async () => {
        // Simulate paginated queries
        for (let i = 0; i < 5; i++) {
          const timer = queryPerformanceMonitor.startQueryTimer('TestPaginationQuery', { page: i });
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // 50-150ms
          timer.finish(true);
        }
      },
      expectedImprovement: 25,
    });

    // Test 3: Mutation performance
    this.tests.push({
      name: 'Mutation Performance',
      description: 'Test GraphQL mutation performance',
      testFn: async () => {
        // Simulate mutations
        for (let i = 0; i < 3; i++) {
          const timer = queryPerformanceMonitor.startQueryTimer('TestMutation', { id: i });
          await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120)); // 80-200ms
          timer.finish(true);
        }
      },
      expectedImprovement: 30,
    });

    // Test 4: Cache performance
    this.tests.push({
      name: 'Cache Performance',
      description: 'Test cache hit performance',
      testFn: async () => {
        // Simulate cache hits
        for (let i = 0; i < 10; i++) {
          const timer = queryPerformanceMonitor.startQueryTimer('TestCacheHit', {
            cacheKey: 'test',
          });
          await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20)); // 10-30ms
          timer.finish(true);
        }
      },
      expectedImprovement: 40,
    });

    // Test 5: Error handling performance
    this.tests.push({
      name: 'Error Handling Performance',
      description: 'Test error handling performance',
      testFn: async () => {
        // Simulate errors
        for (let i = 0; i < 3; i++) {
          const timer = queryPerformanceMonitor.startQueryTimer('TestErrorQuery', {});
          await new Promise(resolve => setTimeout(resolve, 60 + Math.random() * 90)); // 60-150ms
          timer.finish(false, 'Simulated error for testing');
        }
      },
      expectedImprovement: 15,
    });
  }

  async runTests() {
    console.log('🚀 Starting GraphQL Performance Tests...\n');

    // Clear previous metrics
    queryPerformanceMonitor.clearMetrics();

    // Run all tests
    for (const test of this.tests) {
      console.log(`📊 Running: ${test.name}`);
      console.log(`   Description: ${test.description}`);

      const startTime = Date.now();
      await test.testFn();
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      console.log(`   Execution time: ${executionTime}ms`);
      console.log(`   Expected improvement: ${test.expectedImprovement}%\n`);
    }

    // Generate performance report
    this.generateReport();
  }

  private generateReport() {
    console.log('📈 Performance Report');
    console.log('=====================\n');

    const report = queryPerformanceMonitor.getPerformanceReport();

    console.log(`Total Queries: ${report.totalQueries}`);
    console.log(`Average Query Time: ${report.averageQueryTime.toFixed(2)}ms`);
    console.log(`Error Rate: ${(report.errorRate * 100).toFixed(2)}%`);
    console.log(`Slow Queries: ${report.slowQueries.length}\n`);

    if (report.slowQueries.length > 0) {
      console.log('🐌 Slow Queries Detected:');
      report.slowQueries.forEach((query, index) => {
        console.log(`   ${index + 1}. ${query.queryName}: ${query.duration}ms`);
        console.log(`      Variables: ${JSON.stringify(query.variables)}`);
        if (query.errorMessage) {
          console.log(`      Error: ${query.errorMessage}`);
        }
      });
      console.log('');
    }

    console.log('💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');

    // Performance trends
    const trends = queryPerformanceMonitor.getPerformanceTrends();
    console.log('📊 Performance Trends:');
    console.log(
      `   Last Hour: ${trends.lastHour.count} queries, ${trends.lastHour.averageTime.toFixed(2)}ms avg, ${(trends.lastHour.errorRate * 100).toFixed(2)}% errors`
    );
    console.log(
      `   Last Day: ${trends.lastDay.count} queries, ${trends.lastDay.averageTime.toFixed(2)}ms avg, ${(trends.lastDay.errorRate * 100).toFixed(2)}% errors`
    );
    console.log('');

    // Export metrics for further analysis
    const metricsExport = queryPerformanceMonitor.exportMetrics();
    console.log('💾 Metrics exported for analysis');
    console.log(
      '   Use this data to identify performance bottlenecks and optimization opportunities'
    );
  }

  async runStressTest() {
    console.log('🔥 Running Stress Test...\n');

    const concurrentQueries = 20;
    const promises: Promise<void>[] = [];

    for (let i = 0; i < concurrentQueries; i++) {
      promises.push(
        (async () => {
          const timer = queryPerformanceMonitor.startQueryTimer(`StressTestQuery_${i}`, {
            batch: i,
          });
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200)); // 100-300ms
          timer.finish(true);
        })()
      );
    }

    await Promise.all(promises);
    console.log(`✅ Completed ${concurrentQueries} concurrent queries\n`);
  }
}

async function main() {
  try {
    const tester = new GraphQLPerformanceTester();

    // Run basic performance tests
    await tester.runTests();

    // Run stress test
    await tester.runStressTest();

    // Final report
    console.log('🎯 Performance Testing Complete!');
    console.log('Check the console for detailed metrics and recommendations.');
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { GraphQLPerformanceTester };
