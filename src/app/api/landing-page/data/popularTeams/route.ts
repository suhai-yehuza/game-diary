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
    logger.error('Error fetching popular teams:', { error: String(error) });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular teams',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
