import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { errorHandlers } from '@/lib/utils/error-handler';
import { getMockServer } from '@src/lib/mock-server';

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const table = searchParams.get('table');
    const data = searchParams.get('data');

    if (!operation || !table) {
      return NextResponse.json(
        {
          error: 'Operation and table parameters are required',
          message: 'Please specify operation and table',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();
    const parsedData: Record<string, unknown> | undefined = data
      ? (JSON.parse(data) as Record<string, unknown>)
      : undefined;
    const response = mockServer.handleDatabaseOperation(operation, table, parsedData);

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'GET /api/mock-server/database',
    });
    return NextResponse.json(
      {
        error: 'Mock server database failed',
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
    const operation = body.operation as string;
    const table = body.table as string;
    const data = body.data as Record<string, unknown> | undefined;

    if (!operation || !table) {
      return NextResponse.json(
        {
          error: 'Operation and table are required in request body',
          message: 'Please specify operation and table',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();
    const response = mockServer.handleDatabaseOperation(
      operation,
      table,
      (data as Record<string, unknown>) || {}
    );

    return NextResponse.json(response);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'API',
      action: 'POST /api/mock-server/database',
    });
    return NextResponse.json(
      {
        error: 'Mock server database failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
