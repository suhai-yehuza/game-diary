import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { createCorsResponse, handleCorsOptions } from '@/lib/utils/cors';
import { logger } from '@/lib/utils/logger';
import type { IGameStatsApiResponse } from '@/types';

/**
 * Handle CORS preflight requests
 */
export function OPTIONS() {
  return handleCorsOptions();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return createCorsResponse(
        {
          success: false,
          error: 'Game ID is required',
        },
        400
      );
    }

    // Extract the numeric game ID from the database format (season-gameId)
    // Database format: "2024-15463" -> NBA API format: "15463"
    let nbaGameId = gameId;
    if (gameId.includes('-')) {
      const parts = gameId.split('-');
      nbaGameId = parts[parts.length - 1]; // Get the last part after the last dash
    }

    // Validate that we have a numeric game ID for the NBA API
    if (!/^\d+$/.test(nbaGameId)) {
      logger.info('Game ID does not contain a valid numeric NBA API game ID', {
        gameId,
        nbaGameId,
      });
      return createCorsResponse(
        {
          success: false,
          error: 'Game statistics not available - this game does not have a valid NBA API game ID',
        },
        404
      );
    }

    // Check cache first
    const cacheKey = `game-stats-${nbaGameId}`;
    const cachedData = simpleCacheService.get<IGameStatsApiResponse>(cacheKey);

    if (cachedData) {
      logger.info('Game statistics served from cache', {
        gameId,
        nbaGameId,
        cacheKey,
      });
      return createCorsResponse({
        success: true,
        data: cachedData,
      });
    }

    logger.info(`Fetching game statistics for game ID: ${gameId} (NBA API ID: ${nbaGameId})`);

    // Get API configuration and create API client
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Fetch game statistics from external API using the numeric NBA game ID
    const gameStatsData = await apiClient.fetch<IGameStatsApiResponse>(`/games/statistics`, {
      id: nbaGameId,
    });

    // Check if there are any errors in the response
    if (gameStatsData.errors && Object.keys(gameStatsData.errors).length > 0) {
      logger.error('External API returned errors', {
        gameId,
        nbaGameId,
        errors: gameStatsData.errors,
      });
      return createCorsResponse(
        {
          success: false,
          error: 'External API returned errors',
          details: gameStatsData.errors,
        },
        400
      );
    }

    // Check if there are no results
    if (
      gameStatsData.results === 0 ||
      !gameStatsData.response ||
      gameStatsData.response.length === 0
    ) {
      logger.info('No game statistics available for this game - returning empty array', {
        gameId,
        nbaGameId,
        results: gameStatsData.results,
      });

      // Return successful response with empty array
      const emptyResponse = {
        ...gameStatsData,
        response: [],
        results: 0,
      };

      // Cache the empty response for 1 hour to avoid repeated API calls
      simpleCacheService.set(cacheKey, emptyResponse, {
        ttl: 3600, // 1 hour in seconds
        tags: ['game-statistics', `game-${gameId}`, `nba-game-${nbaGameId}`],
      });

      return NextResponse.json({
        success: true,
        data: emptyResponse,
      });
    }

    logger.info('Game statistics fetched successfully', {
      gameId,
      nbaGameId,
      results: gameStatsData.results,
    });

    // Cache the successful response for 1 hour
    simpleCacheService.set(cacheKey, gameStatsData, {
      ttl: 3600, // 1 hour in seconds
      tags: ['game-stats', `game-${nbaGameId}`],
    });

    return createCorsResponse({
      success: true,
      data: gameStatsData,
    });
  } catch (error) {
    logger.error('Error fetching game statistics:', {
      error: String(error),
      gameId: (await params).gameId,
    });

    return createCorsResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
}
