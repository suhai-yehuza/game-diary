import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';

const landingPageService = new LandingPageDataService();

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info('Fetching popular games data...');

    const popularGames = await landingPageService.getPopularGamesWithCache();
    const totalTime = Date.now() - startTime;

    logger.info('Popular games fetched successfully', {
      itemCount:
        (popularGames?.topRated?.length || 0) +
        (popularGames?.mostRated?.length || 0) +
        (popularGames?.mostPopular?.length || 0),
      duration: totalTime,
    });

    return NextResponse.json({
      success: true,
      data: popularGames,
      performance: {
        totalTime,
        itemCount:
          (popularGames?.topRated?.length || 0) +
          (popularGames?.mostRated?.length || 0) +
          (popularGames?.mostPopular?.length || 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch popular games', {
      error: errorMessage,
      duration: totalTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
