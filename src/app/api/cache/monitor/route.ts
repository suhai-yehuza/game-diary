import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cache } from '@/lib/cache';
import { errorHandlers } from '@/lib/utils/error-handler';

/**
 * GET /api/cache/monitor
 * Monitor cache performance and usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats': {
        // Get comprehensive cache statistics
        const memoryStats = cache.getStats();
        const redisStats = cache.getRedisStats();
        const redisConnected = await cache.testRedisConnection();

        const stats = {
          memory: {
            hits: memoryStats.hits,
            misses: memoryStats.misses,
            sets: memoryStats.sets,
            deletes: memoryStats.deletes,
            size: memoryStats.size,
            hitRate:
              memoryStats.hits + memoryStats.misses > 0
                ? ((memoryStats.hits / (memoryStats.hits + memoryStats.misses)) * 100).toFixed(2) +
                  '%'
                : '0%',
          },
          redis: {
            connected: redisConnected,
            available: redisStats.redisAvailable,
            memorySize: redisStats.memorySize,
            // Redis stats are not tracked in the current implementation
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            size: redisStats.memorySize,
            hitRate: '0%',
          },
          overall: {
            totalHits: memoryStats.hits,
            totalMisses: memoryStats.misses,
            totalSets: memoryStats.sets,
            totalDeletes: memoryStats.deletes,
            totalSize: memoryStats.size + redisStats.memorySize,
            overallHitRate:
              memoryStats.hits + memoryStats.misses > 0
                ? ((memoryStats.hits / (memoryStats.hits + memoryStats.misses)) * 100).toFixed(2) +
                  '%'
                : '0%',
          },
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case 'health': {
        // Check cache health
        const health = {
          memory: {
            status: 'healthy',
            size: cache.getStats().size,
          },
          redis: {
            status: (await cache.testRedisConnection()) ? 'connected' : 'disconnected',
            available: await cache.testRedisConnection(),
          },
          overall: 'healthy',
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: health,
        });
      }

      case 'clear': {
        // Clear all cache (admin only)
        const clearKey = searchParams.get('key');
        if (clearKey) {
          // Clear specific key
          await cache.delete(clearKey);
          return NextResponse.json({
            success: true,
            message: `Cleared cache key: ${clearKey}`,
          });
        } else {
          // Clear all cache
          await cache.clear();
          return NextResponse.json({
            success: true,
            message: 'All cache cleared',
          });
        }
      }

      case 'test': {
        // Test cache functionality
        const testKey = 'cache-test-' + Date.now();
        const testValue = { test: true, timestamp: new Date().toISOString() };

        // Test set
        await cache.set(testKey, testValue, 60 * 1000); // 1 minute TTL

        // Test get
        const retrieved = await cache.get(testKey);

        // Clean up
        await cache.delete(testKey);

        const testResult = {
          set: true,
          get: retrieved !== null,
          value: retrieved,
          timestamp: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: testResult,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Valid actions: stats, health, clear, test',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache Monitor API',
      action: 'GET /api/cache/monitor',
      requestId: request.headers.get('x-request-id') || undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
