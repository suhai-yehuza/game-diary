import { NextResponse } from 'next/server';

import { testRedisConnection } from '@/lib/cache/index';

// Mark this route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check for Redis configuration at runtime
    const hasRedisConfig =
      Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      Boolean(process.env.REDIS_URL);

    if (!hasRedisConfig) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Redis configuration is missing',
          environment: process.env.NODE_ENV,
          redisUrl: 'Not configured',
          redisToken: 'Not configured',
        },
        { status: 503 }
      );
    }

    // Test Redis connection
    const result = await testRedisConnection();

    if (!result) {
      throw new Error('Redis test failed');
    }

    return NextResponse.json({
      status: 'success',
      message: 'Redis test completed successfully',
      environment: process.env.NODE_ENV,
      redisUrl: 'Configured',
      redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configured' : 'Not configured',
    });
  } catch (error) {
    console.error('Redis test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Redis test failed',
        environment: process.env.NODE_ENV,
        redisUrl:
          process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
            ? 'Configured'
            : 'Not configured',
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configured' : 'Not configured',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
