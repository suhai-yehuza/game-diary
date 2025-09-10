import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { logger } from '@/lib/utils/logger';

export function GET() {
  try {
    // Get cache statistics for games
    const cacheStats = simpleCacheService.getStats();
    const gamesCacheKeys = Object.keys(cacheStats).filter(key => key.startsWith('games:'));

    const gamesCacheInfo = gamesCacheKeys.map(key => ({
      key,
      ttl: 'unknown', // ICacheStats doesn't have per-key TTL info
      tags: [], // ICacheStats doesn't have per-key tags info
      size: 'unknown', // ICacheStats doesn't have per-key size info
    }));

    return NextResponse.json({
      success: true,
      gamesCache: {
        totalKeys: gamesCacheKeys.length,
        keys: gamesCacheInfo,
      },
      overallCache: cacheStats,
    });
  } catch (error) {
    logger.error('Failed to get games cache statistics', { error: String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

export function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const season = searchParams.get('season');

    if (action === 'invalidate') {
      if (season) {
        // Invalidate specific season cache by clearing all games cache
        simpleCacheService.clear();
        logger.info('Games cache invalidated for season', { season });
      } else {
        // Invalidate all games cache
        simpleCacheService.clear();
        logger.info('All games cache invalidated');
      }

      return NextResponse.json({
        success: true,
        message: `Games cache ${season ? `for season ${season}` : ''} invalidated successfully`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=invalidate' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to invalidate games cache', { error: String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const season = searchParams.get('season');

    if (action === 'warm') {
      // Warm up games cache by fetching data using paginated API
      const statuses = ['finished', 'live', 'scheduled', 'all'];
      const warmPromises = statuses.map(async status => {
        const url = `${request.nextUrl.origin}/api/games?season=${season || 'all'}&status=${status}&page=1&limit=50`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to warm games cache for season ${season || 'all'}, status ${status}`
          );
        }
        return { status, success: true };
      });

      const results = await Promise.all(warmPromises);

      logger.info('Games cache warmed', {
        season: season || 'all',
        statuses: results.map(r => r.status),
        totalCombinations: results.length,
      });
      return NextResponse.json({
        success: true,
        message: `Games cache ${season ? `for season ${season}` : 'for all seasons'} warmed successfully (${results.length} status combinations)`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=warm' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to warm games cache', { error: String(error) });
    return NextResponse.json({ success: false, error: 'Failed to warm cache' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
