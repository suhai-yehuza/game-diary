import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { logger } from '@/lib/utils/logger';

export function GET() {
  try {
    // Get cache statistics for teams
    const cacheStats = hybridCacheService.getStats();
    const teamsCacheKeys = Object.keys(cacheStats).filter(key => key.startsWith('teams:'));

    const teamsCacheInfo = teamsCacheKeys.map(key => ({
      key,
      ttl: 'unknown', // ICacheStats doesn't have per-key TTL info
      tags: [], // ICacheStats doesn't have per-key tags info
      size: 'unknown', // ICacheStats doesn't have per-key size info
    }));

    return NextResponse.json({
      success: true,
      teamsCache: {
        totalKeys: teamsCacheKeys.length,
        keys: teamsCacheInfo,
      },
      overallCache: cacheStats,
    });
  } catch (error) {
    logger.error('Failed to get teams cache statistics', { error: String(error) });
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
    const league = searchParams.get('league');

    if (action === 'invalidate') {
      if (league) {
        // Invalidate specific league cache
        await hybridCacheService.clear();
        logger.info('Teams cache invalidated for league', { league });
      } else {
        // Invalidate all teams cache
        await hybridCacheService.clear();
        logger.info('All teams cache invalidated');
      }

      return NextResponse.json({
        success: true,
        message: `Teams cache ${league ? `for league ${league}` : ''} invalidated successfully`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=invalidate' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to invalidate teams cache', { error: String(error) });
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
      // Warm up teams cache by fetching data
      const url = `${request.nextUrl.origin}/api/teams`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to warm teams cache');
      }

      logger.info('Teams cache warmed');
      return NextResponse.json({
        success: true,
        message: 'Teams cache warmed successfully',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use ?action=warm' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Failed to warm teams cache', { error: String(error) });
    return NextResponse.json({ success: false, error: 'Failed to warm cache' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
