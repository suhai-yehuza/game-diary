import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCacheService } from '@/lib/cache/hybrid-cache-service';
import { ErrorHandler } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      if (action === 'list') {
        // List all cache keys with their metadata
        // We'll use patterns to get keys for different types
        const patterns = [
          'games:*',
          'players:*',
          'teams:*',
          'landingPage:*',
          'nbaHub:*',
          'gameLogs:*',
        ];

        const allKeys: string[] = [];
        for (const pattern of patterns) {
          const keys = await ErrorHandler.getInstance().handleAsync(
            () => hybridCacheService.getKeysByPattern(pattern),
            {
              component: 'CacheAPI',
              action: 'getKeysByPattern',
            }
          );
          if (keys && Array.isArray(keys)) {
            allKeys.push(...keys);
          }
        }

        // Get additional info for each key
        const keysWithInfo = await Promise.all(
          allKeys.map(async key => {
            const value = await ErrorHandler.getInstance().handleAsync(
              () => hybridCacheService.get(key),
              {
                component: 'CacheAPI',
                action: 'getKeyInfo',
              }
            );

            // Determine cache type based on key pattern
            let type = 'unknown';
            if (key.startsWith('games:')) type = 'games';
            else if (key.startsWith('players:')) type = 'players';
            else if (key.startsWith('teams:')) type = 'teams';
            else if (key.startsWith('landingPage:')) type = 'landingPage';
            else if (key.startsWith('nbaHub:')) type = 'nbaHub';
            else if (key.startsWith('gameLogs:')) type = 'gameLogs';

            return {
              key,
              type,
              ttl: 'unknown', // TTL info not directly available
              value: value || null,
            };
          })
        );

        return NextResponse.json({
          success: true,
          keys: keysWithInfo,
          total: keysWithInfo.length,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Invalid action. Use ?action=list' },
        { status: 400 }
      );
    },
    {
      component: 'CacheAPI',
      action: 'GET',
    }
  );

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Failed to list cache keys' },
      { status: 500 }
    );
  }

  return result as NextResponse;
}

export async function DELETE(request: NextRequest) {
  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');
      const tag = searchParams.get('tag');
      const key = searchParams.get('key');

      if (action === 'invalidate') {
        if (tag) {
          // Invalidate specific tag by pattern
          const pattern = `*:tag:${tag}:*`;
          await hybridCacheService.invalidate({ pattern });
          return NextResponse.json({
            success: true,
            message: `Cache invalidated for tag: ${tag}`,
          });
        } else {
          // Invalidate all cache by clearing everything
          await hybridCacheService.clear();
          return NextResponse.json({
            success: true,
            message: 'All cache invalidated successfully',
          });
        }
      }

      if (action === 'delete' && key) {
        // Delete specific cache key
        await hybridCacheService.delete(key);
        return NextResponse.json({
          success: true,
          message: `Cache key deleted: ${key}`,
          key,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use ?action=invalidate or ?action=delete&key=<key>',
        },
        { status: 400 }
      );
    },
    {
      component: 'CacheAPI',
      action: 'DELETE',
    }
  );

  if (!result) {
    return NextResponse.json(
      { success: false, error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }

  return result as NextResponse;
}
