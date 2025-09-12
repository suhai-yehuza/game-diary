import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { errorHandlers } from '@/lib/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;

    // Validate playerId
    if (!playerId || !/^\d+$/.test(playerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid player ID format' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `nba-player-${playerId}`;
    const cachedData = await simpleCacheService.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // Get API configuration
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Fetch player data from NBA API
    const playerData = await apiClient.fetch<{
      results: number;
      response: unknown[];
      errors?: Record<string, unknown>;
    }>(`/players?id=${playerId}`);

    // Check for API errors
    if (playerData.errors && Object.keys(playerData.errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch player data',
          details: playerData.errors,
        },
        { status: 400 }
      );
    }

    if (playerData.results === 0 || !playerData.response || playerData.response.length === 0) {
      return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
    }

    // Cache the response for 1 hour
    simpleCacheService.set(cacheKey, playerData, {
      ttl: 3600, // 1 hour
      tags: ['nba-player', `player-${playerId}`],
    });

    return NextResponse.json({
      success: true,
      data: playerData as Record<string, unknown>,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching NBA player data:', error);
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'NBA Player API',
      action: 'fetchPlayerData',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
