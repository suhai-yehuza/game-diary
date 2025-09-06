import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';

const landingPageService = new LandingPageDataService();

export async function POST(_request: NextRequest) {
  try {
    const startTime = Date.now();

    // Warm up all cache sections by fetching data
    const _warmUpResult = await landingPageService.getLandingPageDataWithGranularCache();

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        warmedSections: ['trending-content', 'latest-results', 'recent-games', 'popular-games'],
        performance: {
          totalTime,
          averageTimePerSection: totalTime / 4,
          successRate: 100,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
