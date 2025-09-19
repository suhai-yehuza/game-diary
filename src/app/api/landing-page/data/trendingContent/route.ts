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
          topGameLogs: [],
          mostActiveGameLog: null,
        },
        timestamp: new Date().toISOString(),
        mock: true,
      });
    }

    // Fetch trending content data using the service
    const trendingContentData = await landingPageService.getTrendingContentWithCache();
    const responseTime = Date.now() - startTime;

    logger.info('Trending content data fetched', {
      gameLogsCount: trendingContentData.topGameLogs.length,
      responseTime,
    });

    return NextResponse.json({
      success: true,
      data: trendingContentData,
      timestamp: new Date().toISOString(),
      responseTime,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch trending content data', {
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
