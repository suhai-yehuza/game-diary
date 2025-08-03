import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getMockServer } from '@src/lib/mock-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const params = searchParams.get('params');

    if (!endpoint) {
      return NextResponse.json(
        {
          error: 'Endpoint parameter is required',
          message: 'Please specify an endpoint',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();
    const parsedParams: Record<string, unknown> | undefined = params
      ? (JSON.parse(params) as Record<string, unknown>)
      : undefined;
    const response = await mockServer.handleExternalAPI(endpoint, parsedParams);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Mock server external API error:', error);
    return NextResponse.json(
      {
        error: 'Mock server external API failed',
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
    const endpoint = body.endpoint as string;
    const params = body.params as Record<string, unknown> | undefined;

    if (!endpoint) {
      return NextResponse.json(
        {
          error: 'Endpoint is required in request body',
          message: 'Please specify an endpoint',
        },
        { status: 400 }
      );
    }

    const mockServer = getMockServer();
    const response = await mockServer.handleExternalAPI(
      endpoint,
      (params as Record<string, unknown>) || {}
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Mock server external API POST error:', error);
    return NextResponse.json(
      {
        error: 'Mock server external API failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
