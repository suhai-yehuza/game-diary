import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { LandingPageDataService } from '@/lib/services/landing-page-data.service';
import { logger } from '@/lib/utils/logger';

const landingPageService = new LandingPageDataService();

export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.info('Fetching content preview data...');

    // Fetch the data needed for the content preview banner
    const [trendingContent, latestResults] = await Promise.allSettled([
      landingPageService.getTrendingContentWithCache(),
      landingPageService.getLatestResultsWithCache(),
    ]);

    // Process trending content to get the most active game log
    const mostActiveGameLog: Record<string, unknown> | null = (() => {
      if (trendingContent.status === 'fulfilled' && trendingContent.value) {
        const value: Record<string, unknown> = trendingContent.value as Record<string, unknown>;
        // The trending content API returns an object with mostActiveGameLog property
        if (value.mostActiveGameLog) {
          const mostActive: Record<string, unknown> = value.mostActiveGameLog as Record<
            string,
            unknown
          >;
          return mostActive;
        }
        // Fallback: if it's an array, find the most active one
        if (Array.isArray(value)) {
          const result = (value as Record<string, unknown>[]).reduce<Record<string, unknown>>(
            (mostActive, current) => {
              const currentActivity =
                ((current.totalCommentCount as number) || 0) +
                ((current.totalReactionCount as number) || 0);
              const mostActiveActivity =
                ((mostActive.totalCommentCount as number) || 0) +
                ((mostActive.totalReactionCount as number) || 0);
              return currentActivity > mostActiveActivity ? current : mostActive;
            },
            value[0]
          );
          return result;
        }
      }
      return null;
    })();

    // Process latest results to get the most recent finished game
    const latestFinishedGame = (() => {
      if (latestResults.status === 'fulfilled' && latestResults.value?.latestGames) {
        const games = latestResults.value.latestGames;
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
        return finishedGames.length > 0 ? finishedGames[0] : null;
      }
      return null;
    })();

    const contentPreviewData: Record<string, unknown> = {
      mostActiveGameLog,
      latestFinishedGame,
    };

    const totalTime = Date.now() - startTime;

    logger.info('Content preview data fetched successfully', {
      hasMostActiveGameLog: !!mostActiveGameLog,
      hasLatestFinishedGame: !!latestFinishedGame,
      duration: totalTime,
    });

    return NextResponse.json({
      success: true,
      data: contentPreviewData,
      performance: {
        totalTime,
        hasMostActiveGameLog: !!mostActiveGameLog,
        hasLatestFinishedGame: !!latestFinishedGame,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('Failed to fetch content preview data', {
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
