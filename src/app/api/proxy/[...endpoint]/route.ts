import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  getRapidApiConfig,
  isTestEnvironment,
  isE2ETestEnvironment,
} from '@src/lib/config/api.config';
import { MOCK_LIVE_GAMES } from '@src/lib/mock/liveGamesMock';
import { MOCK_NBA_GAMES } from '@src/lib/mock/nbaGamesMock';
import { MOCK_NBA_PLAYERS } from '@src/lib/mock/nbaPlayersMock';
import { MOCK_NBA_STANDINGS } from '@src/lib/mock/nbaStandingsMock';
import { MOCK_NBA_TEAMS } from '@src/lib/mock/nbaTeamsMock';

// Simple in-memory cache for API responses
const apiCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<unknown>>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

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

    const cacheKey = apiUrl.toString();
    console.log(`[API Proxy] Making request to: ${cacheKey}`);

    // Debug environment variables
    console.log('[API Proxy] Environment debug:', {
      NODE_ENV: process.env.NODE_ENV,
      CI: process.env.CI,
      GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
      PLAYWRIGHT_TEST: process.env.PLAYWRIGHT_TEST,
      PLAYWRIGHT_CI: process.env.PLAYWRIGHT_CI,
      E2E_MOCK_MODE: process.env.E2E_MOCK_MODE,
      API_MOCK_MODE: process.env.API_MOCK_MODE,
      isTestEnvironment,
      isE2ETestEnvironment,
      apiKey: rapidApiConfig.apiKey,
    });

    // Check cache first
    const cachedEntry = apiCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
      console.log(`[API Proxy] Returning cached response for: ${cacheKey}`);
      return NextResponse.json(cachedEntry.data);
    }

    // Check for pending request (deduplication)
    if (pendingRequests.has(cacheKey)) {
      console.log(`[API Proxy] Waiting for pending request: ${cacheKey}`);
      const cachedData = await pendingRequests.get(cacheKey);
      return NextResponse.json(cachedData);
    }

    // Check if we're in a test environment or using fallback config
    const isTestOrFallback =
      rapidApiConfig.apiKey === 'test-api-key' || rapidApiConfig.apiKey === 'fallback-key';

    console.log(
      `[API Proxy] isTestOrFallback: ${isTestOrFallback}, apiKey: ${rapidApiConfig.apiKey}`
    );

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

    // Create the request promise
    const requestPromise = (async () => {
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
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: unknown = await response.json();
      console.log(`[API Proxy] Success response: ${JSON.stringify(data).substring(0, 200)}...`);

      // Cache the successful response
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
      });

      return data;
    })();

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;
      return NextResponse.json(data);
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
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
