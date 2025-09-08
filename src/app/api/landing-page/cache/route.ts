import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { ErrorHandler } from '@/lib/utils/error-handler';

const landingPageService = new LandingPageDataService();

export function GET(_request: NextRequest) {
  const result = ErrorHandler.getInstance().handleSync(
    () => {
      const cacheStats = landingPageService.getCacheStats();

      return NextResponse.json({
        success: true,
        data: cacheStats,
        timestamp: new Date().toISOString(),
      });
    },
    {
      component: 'LandingPageCacheAPI',
      action: 'GET',
    }
  );

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cache stats',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return result as NextResponse;
}

export async function DELETE(request: NextRequest) {
  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      const { searchParams } = new URL(request.url);
      const section = searchParams.get('section') as
        | 'trending-content'
        | 'latest-results'
        | 'recent-games'
        | 'popular-games'
        | 'all';

      if (!section) {
        return NextResponse.json(
          {
            success: false,
            error: 'Section parameter is required',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      await landingPageService.invalidateCacheSection(section);

      return NextResponse.json({
        success: true,
        message: `Cache section '${section}' invalidated successfully`,
        timestamp: new Date().toISOString(),
      });
    },
    {
      component: 'LandingPageCacheAPI',
      action: 'DELETE',
    }
  );

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to invalidate cache section',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return result as NextResponse;
}
