import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getRapidApiConfig } from '@src/lib/config/api.config';

export async function GET(
  request: Readonly<NextRequest>,
  { params }: Readonly<{ readonly params: Promise<{ readonly endpoint: readonly string[] }> }>
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

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiConfig.apiKey,
        'X-RapidAPI-Host': rapidApiConfig.host,
        'Content-Type': 'application/json',
      },
    });

    const data: unknown = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
