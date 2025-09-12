import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getRapidApiConfig } from '@/lib/config/app.config';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const rapidApiConfig = getRapidApiConfig();
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');

    // Check if this is a team logo (which comes from Wikipedia)
    let imageUrl: string;
    if (imagePath.startsWith('basketball/teams/')) {
      // For team logos, we need to get the actual logo URL from the team data
      // This is a simplified approach - in production, you'd want to cache team data
      const _teamId = imagePath
        .split('/')[2]
        .replace('.png', '')
        .replace('_small', '')
        .replace('_large', '');
      // For now, return a 404 for team logos as we'll handle them differently
      return new NextResponse('Team logo not available through image proxy', { status: 404 });
    } else {
      // For player images, try the media API-Sports URL
      imageUrl = `https://media.api-sports.io/${imagePath}`;
    }

    console.log(`[Image Proxy] Fetching image from: ${imageUrl}`);

    // Make the request with RapidAPI headers
    const response = await fetch(imageUrl, {
      headers: {
        'X-RapidAPI-Key': rapidApiConfig.apiKey,
        'X-RapidAPI-Host': rapidApiConfig.host,
        'User-Agent': 'Game-Diary/1.0',
      },
    });

    if (!response.ok) {
      console.error(
        `[Image Proxy] Failed to fetch image: ${response.status} ${response.statusText}`
      );
      return new NextResponse('Image not found', { status: 404 });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'Image Proxy',
      action: 'GET /api/images/[...path]',
    });

    console.error('[Image Proxy] Error fetching image:', error);
    return new NextResponse('Image fetch failed', { status: 500 });
  }
}
