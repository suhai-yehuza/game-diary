#!/usr/bin/env tsx

/**
 * Cache warming script for games caching strategy
 * Pre-populates cache with commonly requested data
 */

import { logger } from '../src/lib/utils/logger';

interface WarmupQuery {
  name: string;
  season: string;
  status: string;
  page: number;
  limit: number;
  priority: 'high' | 'medium' | 'low';
}

interface WarmupResult {
  query: WarmupQuery;
  success: boolean;
  duration: number;
  dataCount: number;
  error?: string;
}

class GamesCacheWarmer {
  private baseUrl: string;
  private results: WarmupResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async warmQuery(query: WarmupQuery): Promise<WarmupResult> {
    const startTime = Date.now();

    try {
      const url = `${this.baseUrl}/api/games?season=${query.season}&status=${query.status}&page=${query.page}&limit=${query.limit}`;

      console.log(`🔥 Warming: ${query.name} (${query.priority})`);

      const response = await fetch(url);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const dataCount = data.data?.length || data.response?.length || 0;

      const result: WarmupResult = {
        query,
        success: true,
        duration,
        dataCount,
      };

      console.log(`   ✅ Success: ${dataCount} games, ${duration}ms`);
      return result;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result: WarmupResult = {
        query,
        success: false,
        duration,
        dataCount: 0,
        error: error instanceof Error ? error.message : String(error),
      };

      console.log(`   ❌ Failed: ${result.error}`);
      return result;
    }
  }

  getWarmupQueries(): WarmupQuery[] {
    return [
      // High priority - most commonly requested
      {
        name: 'Current Season - Finished Games - Page 1',
        season: '2024',
        status: 'finished',
        page: 1,
        limit: 50,
        priority: 'high',
      },
      {
        name: 'Current Season - All Games - Page 1',
        season: '2024',
        status: 'all',
        page: 1,
        limit: 50,
        priority: 'high',
      },
      {
        name: 'Current Season - Live Games - Page 1',
        season: '2024',
        status: 'live',
        page: 1,
        limit: 20,
        priority: 'high',
      },

      // Medium priority - frequently requested
      {
        name: 'Current Season - Finished Games - Page 2',
        season: '2024',
        status: 'finished',
        page: 2,
        limit: 50,
        priority: 'medium',
      },
      {
        name: 'Current Season - Scheduled Games - Page 1',
        season: '2024',
        status: 'scheduled',
        page: 1,
        limit: 30,
        priority: 'medium',
      },
      {
        name: 'All Seasons - Finished Games - Page 1',
        season: 'all',
        status: 'finished',
        page: 1,
        limit: 100,
        priority: 'medium',
      },

      // Low priority - less frequently requested
      {
        name: 'Current Season - All Games - Page 2',
        season: '2024',
        status: 'all',
        page: 2,
        limit: 50,
        priority: 'low',
      },
      {
        name: 'Current Season - Finished Games - Page 3',
        season: '2024',
        status: 'finished',
        page: 3,
        limit: 50,
        priority: 'low',
      },
      {
        name: 'All Seasons - All Games - Page 1',
        season: 'all',
        status: 'all',
        page: 1,
        limit: 100,
        priority: 'low',
      },
    ];
  }

  async warmupByPriority(priority: 'high' | 'medium' | 'low'): Promise<void> {
    const queries = this.getWarmupQueries().filter(q => q.priority === priority);

    console.log(`\n🔥 Warming ${priority} priority queries (${queries.length} queries)`);
    console.log('='.repeat(50));

    for (const query of queries) {
      const result = await this.warmQuery(query);
      this.results.push(result);

      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async warmupAll(): Promise<void> {
    console.log('🚀 Starting Games Cache Warmup');
    console.log('='.repeat(50));

    // Warm up by priority
    await this.warmupByPriority('high');
    await this.warmupByPriority('medium');
    await this.warmupByPriority('low');

    // Generate report
    this.generateReport();
  }

  async warmupSelective(seasons: string[], statuses: string[]): Promise<void> {
    console.log('🎯 Starting Selective Cache Warmup');
    console.log('='.repeat(50));

    const queries: WarmupQuery[] = [];

    seasons.forEach(season => {
      statuses.forEach(status => {
        queries.push({
          name: `${season} - ${status} - Page 1`,
          season,
          status,
          page: 1,
          limit: 50,
          priority: 'medium',
        });
      });
    });

    for (const query of queries) {
      const result = await this.warmQuery(query);
      this.results.push(result);

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.generateReport();
  }

  generateReport(): void {
    console.log('\n📋 Cache Warmup Report');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (successful.length > 0) {
      const totalGames = successful.reduce((sum, r) => sum + r.dataCount, 0);
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;

      console.log(`🎮 Total Games Cached: ${totalGames}`);
      console.log(`⏱️  Average Duration: ${avgDuration.toFixed(1)}ms`);
    }

    // Priority breakdown
    const priorityStats = this.results.reduce(
      (acc, result) => {
        const priority = result.query.priority;
        if (!acc[priority]) {
          acc[priority] = { total: 0, successful: 0, failed: 0 };
        }
        acc[priority].total++;
        if (result.success) {
          acc[priority].successful++;
        } else {
          acc[priority].failed++;
        }
        return acc;
      },
      {} as Record<string, { total: number; successful: number; failed: number }>
    );

    console.log('\n📊 Priority Breakdown:');
    Object.entries(priorityStats).forEach(([priority, stats]) => {
      const successRate = (stats.successful / stats.total) * 100;
      console.log(
        `   ${priority}: ${stats.successful}/${stats.total} (${successRate.toFixed(1)}%)`
      );
    });

    if (failed.length > 0) {
      console.log('\n❌ Failed Queries:');
      failed.forEach(result => {
        console.log(`   - ${result.query.name}: ${result.error}`);
      });
    }

    console.log('\n🎉 Cache warmup complete!');
  }

  async validateCache(): Promise<void> {
    console.log('\n🔍 Validating Cache State');
    console.log('='.repeat(50));

    try {
      const response = await fetch(`${this.baseUrl}/api/games/cache`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const gamesCache = data.gamesCache;

      console.log(`📊 Cache Statistics:`);
      console.log(`   Total Games Cache Keys: ${gamesCache.totalKeys}`);
      console.log(`   Cache Keys: ${gamesCache.keys.length}`);

      if (gamesCache.keys.length > 0) {
        console.log('\n🔑 Cached Keys:');
        gamesCache.keys.forEach((key: any) => {
          console.log(`   - ${key.key}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to validate cache:', error);
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.WARMUP_BASE_URL || 'http://localhost:3000';
  const warmer = new GamesCacheWarmer(baseUrl);

  try {
    const args = process.argv.slice(2);

    if (args.includes('--selective')) {
      // Selective warmup
      const seasons = args
        .find(arg => arg.startsWith('--seasons='))
        ?.split('=')[1]
        ?.split(',') || ['2024'];
      const statuses = args
        .find(arg => arg.startsWith('--statuses='))
        ?.split('=')[1]
        ?.split(',') || ['finished', 'all'];

      await warmer.warmupSelective(seasons, statuses);
    } else {
      // Full warmup
      await warmer.warmupAll();
    }

    // Validate cache state
    await warmer.validateCache();
  } catch (error) {
    console.error('❌ Cache warmup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { GamesCacheWarmer };
