#!/usr/bin/env tsx

/**
 * Memory Optimization Test Script
 *
 * This script tests the memory optimizations made to the seeding process
 * by running the seeding with different configurations and monitoring memory usage.
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

interface MemoryTestResult {
  testName: string;
  memoryUsage: {
    start: number;
    peak: number;
    end: number;
    increase: number;
  };
  duration: number;
  success: boolean;
  error?: string;
}

class MemoryTestRunner {
  private results: MemoryTestResult[] = [];

  async runTest(
    testName: string,
    command: string[],
    env: Record<string, string> = {}
  ): Promise<MemoryTestResult> {
    console.log(`\n🧪 Running test: ${testName}`);
    console.log(`📝 Command: ${command.join(' ')}`);

    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    let peakMemory = startMemory;

    return new Promise(resolve => {
      const child = spawn(command[0], command.slice(1), {
        env: { ...process.env, ...env },
        stdio: 'pipe',
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', data => {
        const text = data.toString();
        output += text;
        console.log(text.trim());

        // Update peak memory
        const currentMemory = process.memoryUsage().heapUsed;
        if (currentMemory > peakMemory) {
          peakMemory = currentMemory;
        }
      });

      child.stderr?.on('data', data => {
        const text = data.toString();
        errorOutput += text;
        console.error(text.trim());
      });

      child.on('close', code => {
        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - startTime;

        const result: MemoryTestResult = {
          testName,
          memoryUsage: {
            start: Math.round(startMemory / 1024 / 1024), // MB
            peak: Math.round(peakMemory / 1024 / 1024), // MB
            end: Math.round(endMemory / 1024 / 1024), // MB
            increase: Math.round((endMemory - startMemory) / 1024 / 1024), // MB
          },
          duration: Math.round(duration),
          success: code === 0,
          error: code !== 0 ? errorOutput : undefined,
        };

        this.results.push(result);
        resolve(result);
      });
    });
  }

  printResults(): void {
    console.log('\n📊 Memory Optimization Test Results');
    console.log('=====================================');

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.testName}`);
      console.log(`   Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log(`   Memory Usage:`);
      console.log(`     Start: ${result.memoryUsage.start}MB`);
      console.log(`     Peak: ${result.memoryUsage.peak}MB`);
      console.log(`     End: ${result.memoryUsage.end}MB`);
      console.log(`     Increase: ${result.memoryUsage.increase}MB`);

      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Summary
    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);

    console.log('\n📈 Summary');
    console.log('==========');
    console.log(`Total tests: ${this.results.length}`);
    console.log(`Successful: ${successfulTests.length}`);
    console.log(`Failed: ${failedTests.length}`);

    if (successfulTests.length > 0) {
      const avgMemoryIncrease =
        successfulTests.reduce((sum, r) => sum + r.memoryUsage.increase, 0) /
        successfulTests.length;
      const maxMemoryIncrease = Math.max(...successfulTests.map(r => r.memoryUsage.increase));
      const avgDuration =
        successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;

      console.log(`Average memory increase: ${Math.round(avgMemoryIncrease)}MB`);
      console.log(`Maximum memory increase: ${maxMemoryIncrease}MB`);
      console.log(`Average duration: ${Math.round(avgDuration)}ms`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Memory Optimization Tests');
  console.log('=====================================');

  const runner = new MemoryTestRunner();

  // Test 1: Small dataset with optimized settings
  await runner.runTest('Small Dataset (100 users) - Optimized', [
    'pnpm',
    'seed:user-data',
    '--scenario',
    'small',
    '--env',
    'development',
  ]);

  // Test 2: Medium dataset with optimized settings
  await runner.runTest('Medium Dataset (1000 users) - Optimized', [
    'pnpm',
    'seed:user-data',
    '--scenario',
    'medium',
    '--env',
    'development',
  ]);

  // Test 3: Large dataset with optimized settings
  await runner.runTest('Large Dataset (10000 users) - Optimized', [
    'pnpm',
    'seed:user-data',
    '--scenario',
    'large',
    '--env',
    'development',
  ]);

  // Test 4: Pareto distribution (memory intensive)
  await runner.runTest('Pareto Distribution - Optimized', [
    'pnpm',
    'seed:user-data',
    '--distribution',
    'pareto',
    '--env',
    'development',
  ]);

  // Test 5: Production settings (smallest batches)
  await runner.runTest(
    'Production Settings - Optimized',
    ['pnpm', 'seed:user-data', '--scenario', 'medium', '--env', 'production'],
    { ALLOW_ACCESS_TO_PRODUCTION_DB: 'true' }
  );

  runner.printResults();

  console.log('\n✅ Memory optimization tests completed!');
  console.log('\n💡 Recommendations:');
  console.log('- If memory usage is still high, consider further reducing batch sizes');
  console.log('- Monitor the garbage collection logs to ensure GC is working');
  console.log('- Consider running with --expose-gc flag for better GC control');
  console.log('- For very large datasets, consider running in smaller chunks');
}

// Check if this script is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MemoryTestRunner };
