import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRapidApiConfig } from '@src/lib/config/api.config';
import { MOCK_LIVE_GAMES } from '@src/lib/mock/liveGamesMock';
import { MOCK_NBA_GAMES } from '@src/lib/mock/nbaGamesMock';
import { MOCK_NBA_PLAYERS } from '@src/lib/mock/nbaPlayersMock';
import { MOCK_NBA_STANDINGS } from '@src/lib/mock/nbaStandingsMock';
import { MOCK_NBA_TEAMS } from '@src/lib/mock/nbaTeamsMock';

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

    // Check if we're in a test environment or using fallback config
    const isTestOrFallback =
      rapidApiConfig.apiKey === 'test-api-key' || rapidApiConfig.apiKey === 'fallback-key';

    if (isTestOrFallback) {
      console.log('[API Proxy] Using mock response for test/fallback environment');

      // Return appropriate mock data based on the endpoint
      const endpoint = resolvedParams.endpoint.join('/');
      const parameters = Object.fromEntries(searchParams.entries());

      let mockResponse;

      switch (endpoint) {
        case 'games':
          if (parameters.live === 'all') {
            mockResponse = MOCK_LIVE_GAMES;
          } else {
            mockResponse = MOCK_NBA_GAMES;
          }
          break;
        case 'teams':
          mockResponse = MOCK_NBA_TEAMS;
          break;
        case 'standings':
          mockResponse = MOCK_NBA_STANDINGS;
          break;
        case 'players':
          mockResponse = MOCK_NBA_PLAYERS;
          break;
        default:
          // Fallback for unknown endpoints
          mockResponse = {
            get: endpoint,
            parameters,
            errors: [],
            results: 0,
            response: [],
          };
      }

      return NextResponse.json(mockResponse);
    }

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

    // Return a graceful error response instead of 500
    return NextResponse.json(
      {
        get: 'games',
        parameters: {},
        errors: [(error as Error).message],
        results: 0,
        response: [],
      },
      { status: 200 } // Return 200 with empty response instead of 500
    );
  }
}
