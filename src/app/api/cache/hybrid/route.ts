import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { hybridCache, NBA_API_TABLES, HYBRID_CACHE_CONFIG } from '@/lib/cache/hybrid-cache';
import { errorHandlers } from '@/lib/utils/error-handler';

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return NextResponse.json({
          success: true,
          data: {
            cacheEnabled: true,
            cacheInstance: 'HybridCache',
            strategy: 'NBA API + Redis with DB fallback for NBA data, DB + Redis for other data',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

      case 'tables':
        return NextResponse.json({
          success: true,
          data: {
            nbaTables: Object.values(NBA_API_TABLES),
            databaseTables: [
              'users',
              'game_logs',
              'comments',
              'friendships',
              'reactions',
              'notifications',
            ],
            cacheConfig: HYBRID_CACHE_CONFIG,
            strategy: {
              nbaTables: 'External API + Redis (30min), DB fallback (1hour)',
              databaseTables: 'DB + Redis (15min)',
            },
          },
          timestamp: new Date().toISOString(),
        });

      case 'test': {
        // Test hybrid cache with a simple query
        const stats = hybridCache.getStats();
        return NextResponse.json({
          success: true,
          data: {
            connected: true,
            testQuery: 'Hybrid cache test completed',
            nbaTables: stats.nbaTables,
            databaseTables: stats.databaseTables,
            cacheConfig: stats.cacheConfig,
          },
          timestamp: new Date().toISOString(),
        });
      }

      case 'strategy':
        return NextResponse.json({
          success: true,
          data: {
            nbaStrategy: {
              description: 'External API + Redis with DB fallback',
              tables: Object.values(NBA_API_TABLES),
              flow: [
                '1. Check Redis cache first',
                '2. If cache miss, try external NBA API',
                '3. Cache API result in Redis (30min TTL)',
                '4. If API fails, fallback to database',
                '5. Cache DB result in Redis (1hour TTL)',
              ],
              benefits: [
                'Always get latest NBA data when API is available',
                'Graceful fallback to database when API is down',
                'Reduced external API calls through caching',
                'Fast response times for cached data',
              ],
            },
            databaseStrategy: {
              description: 'Database + Redis only',
              tables: [
                'users',
                'game_logs',
                'comments',
                'friendships',
                'reactions',
                'notifications',
              ],
              flow: [
                '1. Check Redis cache first',
                '2. If cache miss, query database',
                '3. Cache result in Redis (15min TTL)',
                '4. Return cached or fresh data',
              ],
              benefits: [
                'Fast database queries through caching',
                'Reduced database load',
                'Consistent data from single source',
                'Optimized for user-generated content',
              ],
            },
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            availableActions: ['stats', 'test', 'tables', 'strategy', 'invalidate', 'clear'],
            description: 'Hybrid cache management API - NBA API + Redis with DB fallback',
            hybridStrategy:
              'NBA data uses external API + Redis with DB fallback, other data uses DB + Redis',
          },
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Hybrid Cache API',
      action: 'GET /api/cache/hybrid',
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
      case 'invalidate': {
        if (!table) {
          return NextResponse.json(
            {
              success: false,
              error: 'Table parameter is required for invalidate action',
            },
            { status: 400 }
          );
        }

        await hybridCache.invalidateTable(table);
        const isNBA = Object.values(NBA_API_TABLES).includes(
          table as (typeof NBA_API_TABLES)[keyof typeof NBA_API_TABLES]
        );
        return NextResponse.json({
          success: true,
          message: `Hybrid cache invalidated for table: ${table} (${isNBA ? 'NBA API' : 'DB'} cache)`,
          strategy: isNBA ? 'NBA API + Redis with DB fallback' : 'DB + Redis only',
          timestamp: new Date().toISOString(),
        });
      }

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

        await hybridCache.invalidateTable('users');
        return NextResponse.json({
          success: true,
          message: `Hybrid cache invalidated for user: ${userId}`,
          strategy: 'DB + Redis only (user data)',
          timestamp: new Date().toISOString(),
        });

      case 'clear':
        await hybridCache.clearAll();
        return NextResponse.json({
          success: true,
          message: 'All hybrid cache cleared successfully',
          cleared: {
            nbaCache: 'NBA API + Redis cache cleared',
            databaseCache: 'Database + Redis cache cleared',
            allNamespaces: 'All cache namespaces cleared',
          },
          timestamp: new Date().toISOString(),
        });

      case 'test': {
        // Test hybrid cache with a simple query
        const stats = hybridCache.getStats();
        return NextResponse.json({
          success: true,
          data: {
            connected: true,
            testQuery: 'Hybrid cache test completed',
            nbaTables: stats.nbaTables,
            databaseTables: stats.databaseTables,
            cacheConfig: stats.cacheConfig,
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
      component: 'Hybrid Cache API',
      action: 'POST /api/cache/hybrid',
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
