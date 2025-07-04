import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbCheck = await checkDatabase();

    // Check external services
    const externalCheck = checkExternalServices();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine overall health
    const isHealthy = dbCheck.healthy && externalCheck.healthy;
    const statusCode = isHealthy ? 200 : 503;

    const healthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      response_time: responseTime,
      checks: {
        database: dbCheck,
        external_services: externalCheck,
      },
      version: process.env.npm_package_version ?? 'unknown',
      environment: process.env.NODE_ENV,
    };

    return NextResponse.json(healthResponse, { status: statusCode });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      response_time: responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: { healthy: false, error: 'Health check failed' },
        external_services: { healthy: false, error: 'Health check failed' },
      },
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

async function checkDatabase() {
  try {
    // Simple database connectivity check
    if (!db) {
      return {
        healthy: false,
        error: 'Database connection not available',
      };
    }

    await db.execute('SELECT 1 as health_check');

    return {
      healthy: true,
      response_time: 0, // Could be enhanced to measure actual query time
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

function checkExternalServices() {
  const services = {
    clerk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
    rapidapi: process.env.NEXT_PUBLIC_RAPID_API_KEY,
    redis: process.env.UPSTASH_REDIS_REST_URL ?? process.env.REDIS_URL,
  };

  const healthy = Object.values(services).some(Boolean);

  return {
    healthy,
    services: Object.fromEntries(Object.entries(services).map(([key, value]) => [key, !!value])),
  };
}
