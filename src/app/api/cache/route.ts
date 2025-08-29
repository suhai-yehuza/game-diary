import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisService } from '@/lib/cache/redis-service';
import { CacheNamespace } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return NextResponse.json({
          success: true,
          data: redisService.getStats(),
          timestamp: new Date().toISOString(),
        });

      case 'get': {
        const key = searchParams.get('key');
        if (!key) {
          return NextResponse.json(
            {
              success: false,
              error: 'Key parameter is required for get action',
            },
            { status: 400 }
          );
        }
        const namespace =
          (searchParams.get('namespace') as CacheNamespace) || CacheNamespace.SYSTEM;
        const cachedData = await redisService.get(key, namespace);
        return NextResponse.json({
          success: true,
          data: cachedData,
          timestamp: new Date().toISOString(),
        });
      }

      case 'test': {
        const isConnected = await redisService.testConnection();
        return NextResponse.json({
          success: true,
          data: { connected: isConnected },
          timestamp: new Date().toISOString(),
        });
      }

      case 'namespaces':
        return NextResponse.json({
          success: true,
          data: {
            namespaces: Object.values(CacheNamespace),
            currentStats: redisService.getStats(),
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Valid actions: stats, test, namespaces, get',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache API',
      action: 'GET /api/cache',
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
    const body = (await request.json()) as {
      action: string;
      namespace?: string;
      key?: string;
      value?: unknown;
      priority?: string;
    };
    const { action, namespace } = body;

    switch (action) {
      case 'clear':
        await redisService.clear();
        return NextResponse.json({
          success: true,
          message: 'All cache cleared successfully',
          timestamp: new Date().toISOString(),
        });

      case 'set': {
        const {
          key: setKey,
          value,
          namespace: setNamespace,
          priority,
        } = body as {
          key: string;
          value: unknown;
          namespace?: string;
          priority?: string;
        };
        if (!setKey || value === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: 'Key and value are required for set action',
            },
            { status: 400 }
          );
        }
        await redisService.set(
          setKey,
          value,
          (setNamespace as CacheNamespace) || CacheNamespace.SYSTEM,
          (priority as 'low' | 'medium' | 'high' | 'critical') || 'medium'
        );
        return NextResponse.json({
          success: true,
          message: 'Cache set successfully',
          timestamp: new Date().toISOString(),
        });
      }

      case 'delete': {
        const { key: deleteKey, namespace: deleteNamespace } = body as {
          key: string;
          namespace?: string;
        };
        if (!deleteKey) {
          return NextResponse.json(
            {
              success: false,
              error: 'Key is required for delete action',
            },
            { status: 400 }
          );
        }
        await redisService.delete(
          deleteKey,
          (deleteNamespace as CacheNamespace) || CacheNamespace.SYSTEM
        );
        return NextResponse.json({
          success: true,
          message: 'Cache deleted successfully',
          timestamp: new Date().toISOString(),
        });
      }

      case 'clearNamespace': {
        if (!namespace) {
          return NextResponse.json(
            {
              success: false,
              error: 'Namespace parameter is required for clearNamespace action',
            },
            { status: 400 }
          );
        }

        // Normalize namespace to handle case variations
        const normalizedNamespace = namespace.toLowerCase();
        const validNamespaces = Object.values(CacheNamespace);

        // Debug logging
        console.log('Cache clearNamespace:', {
          originalNamespace: namespace,
          normalizedNamespace,
          validNamespaces,
          isValid: validNamespaces.includes(normalizedNamespace as CacheNamespace),
        });

        if (!validNamespaces.includes(normalizedNamespace as CacheNamespace)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid namespace. Valid namespaces: ' + validNamespaces.join(', '),
            },
            { status: 400 }
          );
        }

        await redisService.clearNamespace(normalizedNamespace as CacheNamespace);
        return NextResponse.json({
          success: true,
          message: `Cache namespace '${normalizedNamespace}' cleared successfully`,
          timestamp: new Date().toISOString(),
        });
      }

      case 'test': {
        const isConnected = await redisService.testConnection();
        return NextResponse.json({
          success: true,
          data: { connected: isConnected },
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Valid actions: clear, set, delete, clearNamespace, test',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Cache API',
      action: 'POST /api/cache',
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
