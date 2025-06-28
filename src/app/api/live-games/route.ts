import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRapidApiConfig } from '@src/lib/config/api.config';

export async function GET(request: Readonly<NextRequest>) {
  try {
    const rapidApiConfig = getRapidApiConfig();
    const { searchParams } = new URL(request.url);

    // Build the API URL with query parameters
    const apiUrl = new URL('/games', rapidApiConfig.baseUrl);
    searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value);
    });

    // Make the request from server-side
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiConfig.apiKey,
        'X-RapidAPI-Host': rapidApiConfig.host,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as unknown;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Live games API error:', error);
    return NextResponse.json({ error: 'Failed to fetch live games' }, { status: 500 });
  }
}
