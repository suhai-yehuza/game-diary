#!/usr/bin/env tsx

/**
 * Cache warming script for game logs caching strategy
 * Pre-populates cache with commonly requested game log data
 */

import { simpleCacheService } from '../src/lib/cache/simple-cache-service';
import { logger } from '../src/lib/utils/logger';

interface WarmupQuery {
  name: string;
  gameId?: string;
  userId?: string;
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

class GameLogsCacheWarmer {
  private baseUrl: string;
  private results: WarmupResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async warmQuery(query: WarmupQuery): Promise<WarmupResult> {
    const startTime = Date.now();

    try {
      const params = new URLSearchParams({
        page: query.page.toString(),
        limit: query.limit.toString(),
      });

      if (query.gameId) {
        params.append('gameId', query.gameId);
      }
      if (query.userId) {
        params.append('userId', query.userId);
      }

      const url = `${this.baseUrl}/api/game-logs?${params.toString()}`;

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

      console.log(`   ✅ Success: ${dataCount} game logs, ${duration}ms`);
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
        name: 'Recent Game Logs - Page 1',
        page: 1,
        limit: 50,
        priority: 'high',
      },
      {
        name: 'Recent Game Logs - Page 2',
        page: 2,
        limit: 50,
        priority: 'high',
      },
      {
        name: 'Recent Game Logs - Large Set',
        page: 1,
        limit: 100,
        priority: 'high',
      },

      // Medium priority - frequently requested
      {
        name: 'Recent Game Logs - Page 3',
        page: 3,
        limit: 50,
        priority: 'medium',
      },
      {
        name: 'Recent Game Logs - Page 4',
        page: 4,
        limit: 50,
        priority: 'medium',
      },
      {
        name: 'Medium Game Logs Set',
        page: 1,
        limit: 75,
        priority: 'medium',
      },

      // Low priority - less frequently requested
      {
        name: 'Recent Game Logs - Page 5',
        page: 5,
        limit: 50,
        priority: 'low',
      },
      {
        name: 'Recent Game Logs - Extended Set',
        page: 1,
        limit: 200,
        priority: 'low',
      },
      {
        name: 'Deep Pagination Test',
        page: 10,
        limit: 25,
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
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  async warmupAll(): Promise<void> {
    console.log('🚀 Starting Game Logs Cache Warmup');
    console.log('='.repeat(50));

    // Warm up by priority
    await this.warmupByPriority('high');
    await this.warmupByPriority('medium');
    await this.warmupByPriority('low');

    // Generate report
    this.generateReport();
  }

  async warmupSelective(gameIds: string[], userIds: string[]): Promise<void> {
    console.log('🎯 Starting Selective Game Logs Cache Warmup');
    console.log('='.repeat(50));

    const queries: WarmupQuery[] = [];

    // Game-specific queries
    gameIds.forEach(gameId => {
      queries.push({
        name: `Game ${gameId} - Page 1`,
        gameId,
        page: 1,
        limit: 50,
        priority: 'medium',
      });
    });

    // User-specific queries
    userIds.forEach(userId => {
      queries.push({
        name: `User ${userId} - Page 1`,
        userId,
        page: 1,
        limit: 30,
        priority: 'medium',
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
    console.log('\n📋 Game Logs Cache Warmup Report');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${this.results.length}`);

    if (successful.length > 0) {
      const totalGameLogs = successful.reduce((sum, r) => sum + r.dataCount, 0);
      const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;

      console.log(`📝 Total Game Logs Cached: ${totalGameLogs}`);
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

    console.log('\n🎉 Game logs cache warmup complete!');
  }

  async validateCache(): Promise<void> {
    console.log('\n🔍 Validating Game Logs Cache State');
    console.log('='.repeat(50));

    try {
      // Check cache stats via the cache service
      const stats = simpleCacheService.getStats();
      const gameLogsCacheKeys = Object.keys(stats).filter(
        key => key.startsWith('game-logs:') || key.includes('game_logs')
      );

      console.log(`📊 Cache Statistics:`);
      console.log(`   Total Game Logs Cache Keys: ${gameLogsCacheKeys.length}`);

      if (gameLogsCacheKeys.length > 0) {
        console.log('\n🔑 Cached Keys:');
        gameLogsCacheKeys.forEach(key => {
          const keyStats = stats[key];
          console.log(`   - ${key}: TTL=${keyStats?.ttl}s, Tags=${keyStats?.tags?.join(', ')}`);
        });
      }

      // Also try the API endpoint if it exists
      try {
        const response = await fetch(`${this.baseUrl}/api/game-logs/cache`);
        if (response.ok) {
          const data = await response.json();
          console.log(`\n📈 API Cache Stats:`, data);
        }
      } catch (error) {
        console.log('ℹ️  API cache endpoint not available');
      }
    } catch (error) {
      console.error('❌ Failed to validate cache:', error);
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.WARMUP_BASE_URL || 'http://localhost:3000';
  const warmer = new GameLogsCacheWarmer(baseUrl);

  try {
    logger.info('game-logs-cache', 'warming-started');

    const args = process.argv.slice(2);

    if (args.includes('--selective')) {
      // Selective warmup
      const gameIds =
        args
          .find(arg => arg.startsWith('--games='))
          ?.split('=')[1]
          ?.split(',') || [];
      const userIds =
        args
          .find(arg => arg.startsWith('--users='))
          ?.split('=')[1]
          ?.split(',') || [];

      await warmer.warmupSelective(gameIds, userIds);
    } else if (args.includes('--validate-only')) {
      // Only validate cache state
      await warmer.validateCache();
    } else {
      // Full warmup
      await warmer.warmupAll();
    }

    // Validate cache state unless explicitly skipped
    if (!args.includes('--skip-validation')) {
      await warmer.validateCache();
    }

    logger.info('game-logs-cache', 'warming-completed');
  } catch (error) {
    logger.error('game-logs-cache', 'warming-failed', { error: String(error) });
    console.error('❌ Game logs cache warmup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { GameLogsCacheWarmer };
