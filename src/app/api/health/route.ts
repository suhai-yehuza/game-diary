import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db, dbManager } from '@/lib/db';
import { errorHandlers } from '@/lib/utils/error-handler';

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

    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/health',
    });

    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      response_time: responseTime,
      error: 'Health check failed',
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
    // Ensure database is initialized in CI or cold start environments when DATABASE_URL is present
    try {
      const ok = await dbManager.testConnection();
      if (!ok && (process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
        await dbManager.initialize();
      }
    } catch {
      // ignore, will be handled by execute below
    }

    // Get database instance and execute query
    const database = db();
    await database.execute('SELECT 1 as health_check');

    return {
      healthy: true,
      response_time: 0, // Could be enhanced to measure actual query time
    };
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'Database health check',
    });

    return {
      healthy: false,
      error: 'Database check failed',
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
