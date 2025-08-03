import { NextResponse } from 'next/server';

import { getMockServer } from '@src/lib/mock-server';

export async function GET() {
  try {
    const mockServer = getMockServer();
    const statsData = await mockServer.getStats();
    return NextResponse.json(statsData);
  } catch (error) {
    console.error('Mock server stats error:', error);
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
