import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRapidApiConfig } from '@src/lib/config/api.config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpoint: string[] }> }
) {
  try {
    const rapidApiConfig = getRapidApiConfig();
    const resolvedParams = await params;
    const endpointPath = `/${resolvedParams.endpoint.join('/')}`;
    const apiUrl = new URL(endpointPath, rapidApiConfig.baseUrl);

    // Forward query params
    const { searchParams } = new URL(request.url);
    searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value);
    });

    console.log(`[API Proxy] Making request to: ${apiUrl.toString()}`);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiConfig.apiKey,
        'X-RapidAPI-Host': rapidApiConfig.host,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[API Proxy] API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`[API Proxy] Error response: ${errorText}`);
      return NextResponse.json(
        {
          error: `API request failed: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();
    console.log(`[API Proxy] Success response: ${JSON.stringify(data).substring(0, 200)}...`);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Proxy] Unexpected error:', error);
    return NextResponse.json(
      {
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}
