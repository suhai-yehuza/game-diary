import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    logger.info('Fetching popular teams data...');

    const landingPageService = new LandingPageDataService();
    const data = await landingPageService.getPopularTeamsWithCache();

    logger.info(`Popular teams fetched successfully`, {
      mostPopular: data.mostPopular.length,
    });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Error fetching popular teams:', {
      error: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular teams',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
