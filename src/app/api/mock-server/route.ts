import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { getMockServer } from '@src/lib/mock-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      return NextResponse.json(
        {
          error: 'Action parameter is required',
          message: 'Please specify an action: health, stats, mock-data, external-api, database',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();

    switch (action) {
      case 'health': {
        const healthData = await mockServer.healthCheck();
        return NextResponse.json(healthData);
      }

      case 'stats': {
        const statsData = await mockServer.getStats();
        return NextResponse.json(statsData);
      }

      case 'mock-data': {
        const type = searchParams.get('type');
        if (!type) {
          return NextResponse.json(
            {
              error: 'Type parameter is required for mock-data action',
              message:
                'Please specify a type: live-games, nba-games, nba-teams, nba-players, nba-standings, nba-statistics',
            },
            { status: 400 }
          );
        }

        const mockData = await mockServer.getMockData(type);
        return NextResponse.json({
          success: true,
          data: mockData,
          timestamp: new Date().toISOString(),
          mock: true,
        });
      }

      case 'external-api': {
        const endpoint = searchParams.get('endpoint');
        const params = searchParams.get('params');

        if (!endpoint) {
          return NextResponse.json(
            {
              error: 'Endpoint parameter is required for external-api action',
              message: 'Please specify an endpoint',
            },
            { status: 400 }
          );
        }

        const parsedParams: Record<string, unknown> | undefined = params
          ? (JSON.parse(params) as Record<string, unknown>)
          : undefined;
        const response = await mockServer.handleExternalAPI(endpoint, parsedParams);
        return NextResponse.json(response);
      }

      case 'database': {
        const operation = searchParams.get('operation');
        const table = searchParams.get('table');
        const data = searchParams.get('data');

        if (!operation || !table) {
          return NextResponse.json(
            {
              error: 'Operation and table parameters are required for database action',
              message: 'Please specify operation and table',
            },
            { status: 400 }
          );
        }

        const parsedData: Record<string, unknown> | undefined = data
          ? (JSON.parse(data) as Record<string, unknown>)
          : undefined;
        const response = mockServer.handleDatabaseOperation(operation, table, parsedData);
        return NextResponse.json(response);
      }

      default:
        return NextResponse.json(
          {
            error:
              'Invalid action. Valid actions: health, stats, mock-data, external-api, database',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/mock-server',
    });
    return NextResponse.json(
      {
        error: 'Mock server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = body.action as string;

    if (!action) {
      return NextResponse.json(
        {
          error: 'Action is required in request body',
          message: 'Please specify an action: database, external-api',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();

    switch (action) {
      case 'database': {
        const operation = body.operation as string;
        const table = body.table as string;
        const data = body.data as Record<string, unknown> | undefined;
        if (!operation || !table) {
          return NextResponse.json({ error: 'Operation and table are required' }, { status: 400 });
        }
        const dbResponse = mockServer.handleDatabaseOperation(
          operation,
          table,
          (data as Record<string, unknown>) || {}
        );
        return NextResponse.json(dbResponse);
      }

      case 'external-api': {
        const endpoint = body.endpoint as string;
        const params = body.params as Record<string, unknown> | undefined;
        if (!endpoint) {
          return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
        }
        const apiResponse = await mockServer.handleExternalAPI(
          endpoint,
          (params as Record<string, unknown>) || {}
        );
        return NextResponse.json(apiResponse);
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid action. Valid actions: database, external-api',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'POST /api/mock-server',
    });
    return NextResponse.json(
      {
        error: 'Mock server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
