import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';

const landingPageService = new LandingPageDataService();

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info('Fetching trending content data...');

    const trendingContent = await landingPageService.getTrendingContentWithCache();
    const totalTime = Date.now() - startTime;

    logger.info('Trending content fetched successfully', {
      itemCount: trendingContent?.topGameLogs?.length || 0,
      duration: totalTime,
    });

    return NextResponse.json({
      success: true,
      data: trendingContent,
      performance: {
        totalTime,
        itemCount: trendingContent?.topGameLogs?.length || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch trending content', {
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
