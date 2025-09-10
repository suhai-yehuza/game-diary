import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';
import type { ILandingPageData } from '@/types';

const landingPageService = new LandingPageDataService();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const bypassCache = searchParams.get('bypass-cache') === 'true';

  try {
    // Check if we should bypass cache
    if (bypassCache) {
      logger.info('Bypassing cache for landing page data');
    }

    // Fetch all required data in parallel for better performance using granular caching
    const [topGameLogs, latestGames, popularGamesResult] = await Promise.allSettled([
      landingPageService.getTrendingContentWithCache(),
      landingPageService.getLatestResultsWithCache(),
      landingPageService.getPopularGamesWithCache(),
    ]);

    // Debug: Log the status of each query
    logger.info('Query results status', {
      topGameLogs: topGameLogs.status,
      latestGames: latestGames.status,
      popularGames: popularGamesResult.status,
    });

    // Debug: Log more details about popularGamesResult
    if (popularGamesResult.status === 'rejected') {
      logger.error('Popular games service failed', {
        error:
          popularGamesResult.reason instanceof Error
            ? popularGamesResult.reason.message
            : String(popularGamesResult.reason),
        errorMessage:
          popularGamesResult.reason instanceof Error
            ? popularGamesResult.reason.message
            : 'Unknown error',
        errorStack:
          popularGamesResult.reason instanceof Error
            ? popularGamesResult.reason.stack || 'No stack trace'
            : 'No stack trace',
      });
    } else {
      logger.info('Popular games service succeeded', {
        value: popularGamesResult.value,
        hasTopRated: !!popularGamesResult.value?.topRated,
        hasMostRated: !!popularGamesResult.value?.mostRated,
        hasMostPopular: !!popularGamesResult.value?.mostPopular,
        topRatedLength: popularGamesResult.value?.topRated?.length || 0,
        mostRatedLength: popularGamesResult.value?.mostRated?.length || 0,
        mostPopularLength: popularGamesResult.value?.mostPopular?.length || 0,
      });
    }

    // Process trending content
    const trendingContent =
      topGameLogs.status === 'fulfilled'
        ? topGameLogs.value
        : { topGameLogs: [], mostActiveGameLog: null };

    // Process latest results
    const latestResults =
      latestGames.status === 'fulfilled'
        ? latestGames.value
        : { latestGames: [], latestFinishedGame: null };

    // Process recent games
    const recentGames = (() => {
      if (latestGames.status === 'fulfilled') {
        const games = latestGames.value.latestGames;
        const finishedGames = games.filter(
          (game: { status?: string | { short?: string; long?: string } }) => {
            const status = game.status;
            if (typeof status === 'string') {
              return status.toLowerCase() === 'finished';
            }
            if (typeof status === 'object' && status !== null) {
              const shortStatus =
                typeof status.short === 'string' ? status.short.toLowerCase() : '';
              const longStatus = typeof status.long === 'string' ? status.long.toLowerCase() : '';
              return shortStatus === 'finished' || longStatus === 'finished';
            }
            return false;
          }
        );

        return {
          finishedGames,
          currentGame: finishedGames.length > 0 ? finishedGames[0] : null,
        };
      }

      return { finishedGames: [], currentGame: null };
    })();

    // Process popular games
    const popularGames = {
      topRated:
        popularGamesResult.status === 'fulfilled' ? popularGamesResult.value?.topRated || [] : [],
      mostRated:
        popularGamesResult.status === 'fulfilled' ? popularGamesResult.value?.mostRated || [] : [],
      mostPopular:
        popularGamesResult.status === 'fulfilled'
          ? popularGamesResult.value?.mostPopular || []
          : [],
    };

    const landingPageData: ILandingPageData = {
      id: 'landing-page-data',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trendingContent,
      latestResults,
      recentGames: recentGames.finishedGames,
      popularGames: popularGames,
      timestamp: new Date().toISOString(),
      source: 'cache',
    };

    const responseTime = Date.now() - startTime;
    logger.performance('landing-page-data-fetch', responseTime);
    logger.info('Landing page data fetched using granular caching', {
      source: 'granular-cache',
      gameLogsCount: trendingContent.topGameLogs.length,
      gamesCount: latestResults.latestGames.length,
      popularGamesCount:
        popularGames.topRated.length +
        popularGames.mostRated.length +
        popularGames.mostPopular.length,
      responseTime,
      cacheStrategy: 'granular',
      cacheKeys: [
        'landingPage:landing-page-data:trendingContent',
        'landingPage:landing-page-data:latestResults',
        'landingPage:landing-page-data:recentGames',
        'landingPage:landing-page-data:popularGames',
      ],
    });

    return NextResponse.json({
      ...landingPageData,
      source: 'cache',
      cached: false,
      responseTime,
      cacheStrategy: 'granular',
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error('Error in landing page data API', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTime,
    });

    // Return fallback data on error
    return NextResponse.json(
      {
        trendingContent: { topGameLogs: [], mostActiveGameLog: null },
        latestResults: { latestGames: [], latestFinishedGame: null },
        recentGames: { finishedGames: [], currentGame: null },
        popularGames: { topRated: [], mostRated: [], mostPopular: [] },
        timestamp: new Date().toISOString(),
        source: 'error',
        cached: false,
        error: 'Failed to fetch landing page data',
        responseTime,
      },
      { status: 500 }
    );
  }
}
