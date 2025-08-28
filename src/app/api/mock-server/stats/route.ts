import { NextResponse } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { getMockServer } from '@src/lib/mock-server';

export async function GET() {
  try {
    const mockServer = getMockServer();
    const statsData = await mockServer.getStats();
    return NextResponse.json(statsData);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/mock-server/stats',
    });
    return NextResponse.json(
      {
        error: 'Mock server stats failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
