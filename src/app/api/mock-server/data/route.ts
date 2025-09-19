import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { getMockServer } from '@src/lib/mock-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        {
          error: 'Type parameter is required',
          message:
            'Please specify a type: live-games, nba-games, nba-teams, nba-players, nba-standings, nba-statistics, trending-content, recent-games, popular-games, popular-teams, popular-players',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();
    const mockData = await mockServer.getMockData(type);

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      mock: true,
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/mock-server/data',
    });
    return NextResponse.json(
      {
        error: 'Mock server data failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
