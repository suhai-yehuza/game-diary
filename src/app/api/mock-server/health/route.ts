import { NextResponse } from 'next/server';

import { getMockServer } from '@src/lib/mock-server';

export async function GET() {
  try {
    const mockServer = getMockServer();
    const healthData = await mockServer.healthCheck();
    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Mock server health check error:', error);
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
