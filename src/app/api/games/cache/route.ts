import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { logger } from '@/lib/utils/logger';

export function GET() {
  try {
    // Get cache statistics for games
    const cacheStats = hybridCacheService.getStats();
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const season = searchParams.get('season');

    if (action === 'invalidate') {
      if (season) {
        // Invalidate specific season cache by clearing all games cache
        await hybridCacheService.clear();
        logger.info('Games cache invalidated for season', { season });
      } else {
        // Invalidate all games cache
        await hybridCacheService.clear();
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
      // Warm up games cache by fetching data
      let url: string;
      if (season === 'all') {
        // For "all seasons", use a reasonable limit to ensure cache is created
        url = `${request.nextUrl.origin}/api/games?season=all&limit=20000`; // Increased to 20000 to match frontend expectation
      } else if (season) {
        url = `${request.nextUrl.origin}/api/games?season=${season}`;
      } else {
        url = `${request.nextUrl.origin}/api/games`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to warm games cache');
      }

      logger.info('Games cache warmed', { season: season || 'all' });
      return NextResponse.json({
        success: true,
        message: `Games cache ${season ? `for season ${season}` : ''} warmed successfully`,
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
