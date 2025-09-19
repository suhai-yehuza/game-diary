import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

const landingPageService = new LandingPageDataService();

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    // In mock mode, return empty data
    if (isMockModeEnabled()) {
      return NextResponse.json({
        success: true,
        data: {
          latestGames: [],
          latestFinishedGame: null,
        },
        timestamp: new Date().toISOString(),
        mock: true,
      });
    }

    // Fetch recent games data using the service
    const recentGamesData = await landingPageService.getRecentGamesWithCache();
    const responseTime = Date.now() - startTime;

    logger.info('Recent games data fetched', {
      gamesCount: recentGamesData.finishedGames.length,
      responseTime,
    });

    return NextResponse.json({
      success: true,
      data: recentGamesData,
      timestamp: new Date().toISOString(),
      responseTime,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch recent games data', {
      error: errorMessage,
      responseTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime,
      },
      { status: 500 }
    );
  }
}
