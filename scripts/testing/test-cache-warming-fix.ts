#!/usr/bin/env tsx

/**
 * Test script to verify the cache warming service fix
 * Tests the updated cache warming logic with proper error handling
 */

import { logger } from '../src/lib/utils/logger';

interface TestResult {
  season: string;
  status: string;
  success: boolean;
  count: number;
  error?: string;
}

class CacheWarmingTester {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async testSeasonAvailability(): Promise<void> {
    console.log('🔍 Testing Season Availability\n');

    const seasons = ['2020', '2021', '2022', '2023', '2024', 'all'];
    const statuses = ['finished', 'live', 'scheduled', 'all'];

    const results: TestResult[] = [];

    for (const season of seasons) {
      for (const status of statuses) {
        const result = await this.testSeasonStatus(season, status);
        results.push(result);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Results Summary:');
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${results.length}`);

    // Group by season
    const seasonResults = seasons.map(season => {
      const seasonTests = results.filter(r => r.season === season);
      const successCount = seasonTests.filter(r => r.success).length;
      const totalCount = seasonTests.length;
      const totalGames = seasonTests.reduce((sum, r) => sum + r.count, 0);

      return {
        season,
        successRate: (successCount / totalCount) * 100,
        totalGames,
        hasData: totalGames > 0,
      };
    });

    console.log('\n📅 Season Analysis:');
    seasonResults.forEach(({ season, successRate, totalGames, hasData }) => {
      const status = hasData ? '✅' : '❌';
      console.log(
        `   ${status} ${season}: ${successRate.toFixed(1)}% success, ${totalGames} games`
      );
    });

    // Recommend seasons to use
    const availableSeasons = seasonResults
      .filter(s => s.hasData && s.season !== 'all')
      .map(s => s.season);

    console.log('\n💡 Recommended seasons for cache warming:');
    console.log(`   ${availableSeasons.join(', ')}`);

    if (availableSeasons.length === 0) {
      console.log('   ⚠️  No seasons with data found. Check database seeding.');
    }
  }

  async testSeasonStatus(season: string, status: string): Promise<TestResult> {
    try {
      const url = `${this.baseUrl}/api/games?season=${season}&status=${status}&page=1&limit=50`;

      const response = await fetch(url);

      if (!response.ok) {
        return {
          season,
          status,
          success: false,
          count: 0,
          error: `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      const count = data.data?.length || data.response?.length || 0;

      return {
        season,
        status,
        success: true,
        count,
      };
    } catch (error) {
      return {
        season,
        status,
        success: false,
        count: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async testCacheWarmingService(): Promise<void> {
    console.log('\n🔥 Testing Cache Warming Service\n');

    try {
      // Test the cache warming endpoint
      const response = await fetch(`${this.baseUrl}/api/cache/warm-all`);

      if (!response.ok) {
        console.log(`❌ Cache warming service failed: HTTP ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log('✅ Cache warming service response:');
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`❌ Cache warming service error: ${error}`);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Cache Warming Fix Tests\n');

    await this.testSeasonAvailability();
    await this.testCacheWarmingService();

    console.log('\n🎉 Testing Complete!');
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const tester = new CacheWarmingTester(baseUrl);

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

export { CacheWarmingTester };
