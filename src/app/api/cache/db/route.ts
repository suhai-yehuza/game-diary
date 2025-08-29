import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { dbCache } from '@/lib/cache/db-cache';
import { cachedDB } from '@/lib/db/cached-db';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        return NextResponse.json({
          success: true,
          data: {
            cacheEnabled: true,
            cacheInstance: 'DatabaseCache',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'test': {
        // Test database cache with a simple query
        const testResult = await cachedDB.getUserById('test-user');
        return NextResponse.json({
          success: true,
          data: {
            connected: true,
            testQuery: 'Database cache test completed',
            result: testResult ? 'Cache working' : 'Cache miss (expected for test user)',
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'tables':
        return NextResponse.json({
          success: true,
          data: {
            cachedTables: [
              'users',
              'games',
              'game_logs',
              'teams',
              'players',
              'comments',
              'friendships',
              'search',
              'analytics',
            ],
            cacheConfig: {
              users: { ttl: 15 * 60, priority: 'high' },
              games: { ttl: 30 * 60, priority: 'high' },
              gameLogs: { ttl: 10 * 60, priority: 'medium' },
              teams: { ttl: 60 * 60, priority: 'high' },
              players: { ttl: 60 * 60, priority: 'high' },
              search: { ttl: 5 * 60, priority: 'low' },
              comments: { ttl: 10 * 60, priority: 'medium' },
              friendships: { ttl: 15 * 60, priority: 'medium' },
              analytics: { ttl: 60 * 60, priority: 'critical' },
            },
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            availableActions: ['stats', 'test', 'tables', 'invalidate', 'clear'],
            description: 'Database cache management API',
          },
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Cache API',
      action: 'GET /api/cache/db',
    });

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { action: string; table?: string; userId?: string };
    const { action, table, userId } = body;

    switch (action) {
      case 'invalidate':
        if (!table) {
          return NextResponse.json(
            {
              success: false,
              error: 'Table parameter is required for invalidate action',
            },
            { status: 400 }
          );
        }

        await cachedDB.invalidateTable(table);
        return NextResponse.json({
          success: true,
          message: `Database cache invalidated for table: ${table}`,
          timestamp: new Date().toISOString(),
        });

      case 'invalidateUser':
        if (!userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'UserId parameter is required for invalidateUser action',
            },
            { status: 400 }
          );
        }

        await cachedDB.invalidateUser(userId);
        return NextResponse.json({
          success: true,
          message: `Database cache invalidated for user: ${userId}`,
          timestamp: new Date().toISOString(),
        });

      case 'clear':
        await dbCache.clearAll();
        return NextResponse.json({
          success: true,
          message: 'All database cache cleared successfully',
          timestamp: new Date().toISOString(),
        });

      case 'test': {
        // Test database cache with a simple query
        const testResult = await cachedDB.getUserById('test-user');
        return NextResponse.json({
          success: true,
          data: {
            connected: true,
            testQuery: 'Database cache test completed',
            result: testResult ? 'Cache working' : 'Cache miss (expected for test user)',
          },
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Valid actions: invalidate, invalidateUser, clear, test',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Database Cache API',
      action: 'POST /api/cache/db',
    });

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
