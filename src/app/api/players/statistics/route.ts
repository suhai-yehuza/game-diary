import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { getRapidApiConfig } from '@/lib/config/app.config';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { logger } from '@/lib/utils/logger';
import type { IPlayerStatsApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');
    const season = searchParams.get('season');
    const gameId = searchParams.get('game');

    if (!playerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Player ID is required',
        },
        { status: 400 }
      );
    }

    if (!season) {
      return NextResponse.json(
        {
          success: false,
          error: 'Season is required',
        },
        { status: 400 }
      );
    }

    // Game ID is optional - if provided, extract the numeric game ID
    let nbaGameId: string | undefined;
    if (gameId) {
      // Extract the numeric game ID from the database format (season-gameId)
      // Database format: "2024-15463" -> NBA API format: "15463"
      nbaGameId = gameId;
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
        return NextResponse.json(
          {
            success: false,
            error:
              'Player statistics not available - this game does not have a valid NBA API game ID',
          },
          { status: 404 }
        );
      }
    }

    // Check cache first
    const cacheKey = `player-stats-${playerId}-${season}${nbaGameId ? `-${nbaGameId}` : ''}`;
    const cachedData = simpleCacheService.get<IPlayerStatsApiResponse>(cacheKey);

    if (cachedData) {
      logger.info('Player statistics served from cache', {
        playerId,
        season,
        gameId,
        nbaGameId,
        cacheKey,
      });
      return NextResponse.json({
        success: true,
        data: cachedData,
      });
    }

    logger.info(
      `Fetching player statistics for player ID: ${playerId}, season: ${season}${nbaGameId ? `, game: ${gameId} (NBA API ID: ${nbaGameId})` : ' (season-level)'}`
    );

    // Get API configuration and create API client
    const apiConfig = getRapidApiConfig();
    const apiClient = createRapidAPIClient(apiConfig);

    // Build query parameters
    const queryParams: Record<string, string> = {
      id: playerId,
      season,
    };

    // Add game parameter only if provided
    if (nbaGameId) {
      queryParams.game = nbaGameId;
    }

    // Fetch player statistics from external API
    const playerStatsData = await apiClient.fetch<IPlayerStatsApiResponse>(
      `/players/statistics`,
      queryParams
    );

    // Check if there are any errors in the response
    if (playerStatsData.errors && playerStatsData.errors.length > 0) {
      logger.error('External API returned errors', {
        playerId,
        season,
        gameId,
        errors: playerStatsData.errors,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'External API returned errors',
          details: playerStatsData.errors,
        },
        { status: 400 }
      );
    }

    logger.info('Player statistics fetched successfully', {
      playerId,
      season,
      gameId,
      results: playerStatsData.results,
    });

    // Cache the successful response for 1 hour
    const cacheTags = ['player-stats', `player-${playerId}`, `season-${season}`];
    if (nbaGameId) {
      cacheTags.push(`game-${nbaGameId}`);
    }

    simpleCacheService.set(cacheKey, playerStatsData, {
      ttl: 3600, // 1 hour in seconds
      tags: cacheTags,
    });

    return NextResponse.json({
      success: true,
      data: playerStatsData,
    });
  } catch (error) {
    logger.error('Error fetching player statistics:', {
      error: String(error),
      searchParams: Object.fromEntries(new URL(request.url).searchParams),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
