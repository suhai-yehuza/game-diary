import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { redisCacheService } from '@/lib/cache/redis-cache-service';
import { logger } from '@/lib/utils/logger';

/**
 * @swagger
 * /api/cache/health:
 *   get:
 *     tags:
 *       - Cache
 *     summary: Cache system health check
 *     description: Check Redis connection and cache system status
 *     responses:
 *       200:
 *         description: Cache health status
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check environment variables
    const hasRedisUrl = !!(
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_URL ||
      process.env.KV_URL
    );
    const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

    // Get cache health status
    const healthStatus = await hybridCacheService.getHealthStatus();
    const cacheStats = await hybridCacheService.getStats();
    const connectionTest = await hybridCacheService.testConnections();

    // Get Redis-specific stats
    const redisStats = redisCacheService.getStats();

    const responseTime = Date.now() - startTime;

    const healthData = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime,
      environment: {
        hasRedisUrl,
        hasRedisToken,
        nodeEnv: process.env.NODE_ENV || 'development',
        redisUrlSet: !!process.env.UPSTASH_REDIS_REST_URL,
        redisTokenSet: !!process.env.UPSTASH_REDIS_REST_TOKEN,
        redisUrl: process.env.UPSTASH_REDIS_REST_URL
          ? `${process.env.UPSTASH_REDIS_REST_URL.substring(0, 30)}...`
          : 'Not set',
      },
      cache: {
        strategy: healthStatus.strategy,
        healthy: healthStatus.healthy,
        redis: {
          available: healthStatus.redis,
          connectionTest: connectionTest.redis,
          stats: {
            available: redisStats.redisAvailable,
            memorySize: redisStats.memorySize,
            size: redisStats.size,
            maxSize: redisStats.maxSize,
            keys: redisStats.keys.length,
          },
        },
        memory: {
          available: healthStatus.memory,
          connectionTest: connectionTest.memory,
          size: cacheStats.memorySize,
        },
      },
      status: healthStatus.healthy ? 'healthy' : 'degraded',
    };

    // Log warning if Redis is not available but should be
    if (hasRedisUrl && !hasRedisToken) {
      logger.warn('Redis URL is set but token is missing', {
        hasRedisUrl,
        hasRedisToken,
      });
      healthData.status = 'degraded';
      healthData.cache.redis.available = false;
    }

    if (hasRedisUrl && hasRedisToken && !healthStatus.redis) {
      logger.warn('Redis environment variables are set but connection failed', {
        hasRedisUrl,
        hasRedisToken,
        redisAvailable: healthStatus.redis,
      });
      healthData.status = 'degraded';
    }

    return NextResponse.json(healthData, {
      status: healthStatus.healthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Cache health check failed', { error: String(error) });

    return NextResponse.json(
      {
        success: false,
        error: 'Cache health check failed',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        responseTime,
        status: 'error',
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
