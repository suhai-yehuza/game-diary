import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';

const landingPageService = new LandingPageDataService();

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info('Fetching recent games data...');

    const latestResults = await landingPageService.getLatestResultsWithCache();
    const recentGames = latestResults.latestGames || [];
    const totalTime = Date.now() - startTime;

    logger.info('Recent games fetched successfully', {
      itemCount: recentGames?.length || 0,
      duration: totalTime,
    });

    return NextResponse.json({
      success: true,
      data: recentGames,
      performance: {
        totalTime,
        itemCount: recentGames?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch recent games', {
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
