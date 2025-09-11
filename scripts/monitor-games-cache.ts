#!/usr/bin/env tsx

/**
 * Cache monitoring script for games caching strategy
 * Monitors cache performance, hit rates, and memory usage
 */

import { logger } from '../src/lib/utils/logger';

interface CacheMetrics {
  timestamp: Date;
  totalKeys: number;
  gamesKeys: number;
  memoryUsage: number;
  hitRate: number;
  avgResponseTime: number;
}

interface CacheKeyInfo {
  key: string;
  ttl: number;
  status: string;
  season: string;
  page: number;
  limit: number;
  lastAccessed: Date;
  hitCount: number;
}

class GamesCacheMonitor {
  private baseUrl: string;
  private metrics: CacheMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async getCacheStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/games/cache`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  async getCacheKeyInfo(): Promise<CacheKeyInfo[]> {
    try {
      const stats = await this.getCacheStats();
      if (!stats?.gamesCache?.keys) {
        return [];
      }

      return stats.gamesCache.keys.map((keyInfo: any) => {
        // Parse cache key to extract information
        const key = keyInfo.key;
        const parts = key.split(':');

        return {
          key,
          ttl: keyInfo.ttl || 0,
          status: parts[3] || 'all',
          season: parts[2] || 'all',
          page: parseInt(parts[5]) || 1,
          limit: parseInt(parts[7]) || 50,
          lastAccessed: new Date(),
          hitCount: 0,
        };
      });
    } catch (error) {
      console.error('Failed to get cache key info:', error);
      return [];
    }
  }

  async collectMetrics(): Promise<CacheMetrics> {
    const startTime = Date.now();

    try {
      // Test a simple request to measure response time
      const testResponse = await fetch(`${this.baseUrl}/api/games?page=1&limit=10`);
      const responseTime = Date.now() - startTime;

      const stats = await this.getCacheStats();
      const cacheKeys = await this.getCacheKeyInfo();

      return {
        timestamp: new Date(),
        totalKeys: stats?.overallCache?.totalKeys || 0,
        gamesKeys: cacheKeys.length,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        hitRate: 0, // Would need to track this over time
        avgResponseTime: responseTime,
      };
    } catch (error) {
      console.error('Failed to collect metrics:', error);
      return {
        timestamp: new Date(),
        totalKeys: 0,
        gamesKeys: 0,
        memoryUsage: 0,
        hitRate: 0,
        avgResponseTime: 0,
      };
    }
  }

  async analyzeCacheEfficiency(): Promise<void> {
    console.log('\n🔍 Cache Efficiency Analysis');
    console.log('='.repeat(40));

    const cacheKeys = await this.getCacheKeyInfo();

    if (cacheKeys.length === 0) {
      console.log('No games cache keys found');
      return;
    }

    // Group by status
    const statusGroups = cacheKeys.reduce(
      (acc, key) => {
        const status = key.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(key);
        return acc;
      },
      {} as Record<string, CacheKeyInfo[]>
    );

    console.log('\n📊 Cache Keys by Status:');
    Object.entries(statusGroups).forEach(([status, keys]) => {
      console.log(`   ${status}: ${keys.length} keys`);
    });

    // Group by season
    const seasonGroups = cacheKeys.reduce(
      (acc, key) => {
        const season = key.season;
        if (!acc[season]) acc[season] = [];
        acc[season].push(key);
        return acc;
      },
      {} as Record<string, CacheKeyInfo[]>
    );

    console.log('\n📅 Cache Keys by Season:');
    Object.entries(seasonGroups).forEach(([season, keys]) => {
      console.log(`   ${season}: ${keys.length} keys`);
    });

    // TTL analysis
    const ttlGroups = cacheKeys.reduce(
      (acc, key) => {
        const ttl = key.ttl;
        const ttlGroup =
          ttl >= 86400 ? '24h+' : ttl >= 3600 ? '1h-24h' : ttl >= 300 ? '5m-1h' : '5m-';
        if (!acc[ttlGroup]) acc[ttlGroup] = [];
        acc[ttlGroup].push(key);
        return acc;
      },
      {} as Record<string, CacheKeyInfo[]>
    );

    console.log('\n⏰ Cache TTL Distribution:');
    Object.entries(ttlGroups).forEach(([ttlGroup, keys]) => {
      console.log(`   ${ttlGroup}: ${keys.length} keys`);
    });
  }

  async generateRecommendations(): Promise<void> {
    console.log('\n💡 Optimization Recommendations');
    console.log('='.repeat(40));

    const cacheKeys = await this.getCacheKeyInfo();

    // Check for cache fragmentation
    const pageCounts = cacheKeys.reduce(
      (acc, key) => {
        const keyId = `${key.season}:${key.status}:${key.limit}`;
        acc[keyId] = (acc[keyId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const fragmentedKeys = Object.entries(pageCounts)
      .filter(([_, count]) => count > 10)
      .map(([key, count]) => ({ key, count }));

    if (fragmentedKeys.length > 0) {
      console.log('\n⚠️  Cache Fragmentation Detected:');
      fragmentedKeys.forEach(({ key, count }) => {
        console.log(`   ${key}: ${count} pages cached`);
      });
      console.log('   Recommendation: Consider increasing page size or implementing cache warming');
    }

    // Check for underutilized cache
    const statusCounts = cacheKeys.reduce(
      (acc, key) => {
        acc[key.status] = (acc[key.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const underutilized = Object.entries(statusCounts)
      .filter(([status, count]) => count < 3 && status !== 'all')
      .map(([status, count]) => ({ status, count }));

    if (underutilized.length > 0) {
      console.log('\n📉 Underutilized Cache Statuses:');
      underutilized.forEach(({ status, count }) => {
        console.log(`   ${status}: ${count} keys`);
      });
      console.log('   Recommendation: Consider removing rarely used status filters');
    }

    // Memory usage recommendations
    const totalKeys = cacheKeys.length;
    if (totalKeys > 100) {
      console.log('\n🧠 Memory Usage:');
      console.log(`   Total cache keys: ${totalKeys}`);
      console.log('   Recommendation: Consider implementing cache eviction policies');
    }
  }

  async startMonitoring(intervalMs: number = 30000): Promise<void> {
    console.log(`🚀 Starting cache monitoring (interval: ${intervalMs}ms)`);

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.metrics.push(metrics);

        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
          this.metrics = this.metrics.slice(-100);
        }

        console.log(
          `📊 ${metrics.timestamp.toISOString()}: ${metrics.gamesKeys} games keys, ${metrics.avgResponseTime}ms avg response`
        );
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Cache monitoring stopped');
    }
  }

  async generateReport(): Promise<void> {
    console.log('\n📋 Cache Performance Report');
    console.log('='.repeat(50));

    if (this.metrics.length === 0) {
      console.log('No metrics collected yet');
      return;
    }

    const latest = this.metrics[this.metrics.length - 1];
    const avgResponseTime =
      this.metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / this.metrics.length;
    const maxResponseTime = Math.max(...this.metrics.map(m => m.avgResponseTime));
    const minResponseTime = Math.min(...this.metrics.map(m => m.avgResponseTime));

    console.log(`📊 Current Status:`);
    console.log(`   Games Cache Keys: ${latest.gamesKeys}`);
    console.log(`   Total Cache Keys: ${latest.totalKeys}`);
    console.log(`   Memory Usage: ${latest.memoryUsage.toFixed(2)} MB`);

    console.log(`\n⏱️  Response Time Analysis:`);
    console.log(`   Average: ${avgResponseTime.toFixed(1)}ms`);
    console.log(`   Maximum: ${maxResponseTime}ms`);
    console.log(`   Minimum: ${minResponseTime}ms`);

    await this.analyzeCacheEfficiency();
    await this.generateRecommendations();
  }
}

// Main execution
async function main() {
  const baseUrl = process.env.MONITOR_BASE_URL || 'http://localhost:3000';
  const monitor = new GamesCacheMonitor(baseUrl);

  try {
    // Run initial analysis
    await monitor.generateReport();

    // Start monitoring if requested
    if (process.argv.includes('--monitor')) {
      const interval = parseInt(
        process.argv.find(arg => arg.startsWith('--interval='))?.split('=')[1] || '30000'
      );
      await monitor.startMonitoring(interval);

      // Keep running until interrupted
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping monitoring...');
        monitor.stopMonitoring();
        process.exit(0);
      });

      // Keep the process alive
      await new Promise(() => {});
    }
  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { GamesCacheMonitor };
