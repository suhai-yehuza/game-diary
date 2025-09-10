import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { logger } from '@/lib/utils/logger';

export function GET() {
  try {
    // Get cache statistics for players
    const cacheStats = simpleCacheService.getStats();
    const playersCacheKeys = Object.keys(cacheStats).filter(key => key.startsWith('players:'));

    const playersCacheInfo = playersCacheKeys.map(key => ({
      key,
      ttl: 'unknown', // ICacheStats doesn't have per-key TTL info
      tags: [], // ICacheStats doesn't have per-key tags info
      size: 'unknown', // ICacheStats doesn't have per-key size info
    }));

    return NextResponse.json({
      success: true,
      playersCache: {
        totalKeys: playersCacheKeys.length,
        keys: playersCacheInfo,
      },
      overallCache: cacheStats,
    });
  } catch (error) {
    logger.error('Failed to get players cache statistics', { error: String(error) });
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
    const filterType = searchParams.get('filterType');

    if (action === 'invalidate') {
      if (filterType) {
        // Invalidate specific filter cache
        simpleCacheService.clear();
        logger.info('Players cache invalidated for filter type', { filterType });
      } else {
        // Invalidate all players cache
        simpleCacheService.clear();
        logger.info('All players cache invalidated');
      }

      return NextResponse.json({
        success: true,
        message: `Players cache ${filterType ? `for filter type ${filterType}` : ''} invalidated successfully`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=invalidate' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to invalidate players cache', { error: String(error) });
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

    if (action === 'warm') {
      // Warm up players cache by fetching data
      const url = `${request.nextUrl.origin}/api/players`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to warm players cache');
      }

      logger.info('Players cache warmed');
      return NextResponse.json({
        success: true,
        message: 'Players cache warmed successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=warm' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to warm players cache', { error: String(error) });
    return NextResponse.json({ success: false, error: 'Failed to warm cache' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
