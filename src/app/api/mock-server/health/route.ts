import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { getMockServer } from '@src/lib/mock-server';

export async function GET() {
  try {
    const mockServer = getMockServer();
    const healthData = await mockServer.healthCheck();
    return NextResponse.json(healthData);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/mock-server/health',
    });
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Mock server health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
