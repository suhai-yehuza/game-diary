import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { simpleCacheService } from '@/lib/cache/simple-cache-service';
import { getGameByIdQuery, getGameByGameIdQuery } from '@/lib/db/queries/games.queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Validate gameId format (season-gameId or just gameId)
    if (!/^(\d{4}-\d+|\d+)$/.test(gameId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game ID format' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `game-details-${gameId}`;
    const cachedData = await simpleCacheService.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // Try to find the game - first by exact ID, then by game_id field
    let gameData = await getGameByIdQuery(gameId);

    // If not found by exact ID, try to find by game_id field (for cases where only gameId is provided)
    if (!gameData) {
      gameData = await getGameByGameIdQuery(gameId);
    }

    if (!gameData) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    // Transform the data to match expected format
    const teams = (gameData.teams as Record<string, unknown>) || {};
    const scores = (gameData.scores as Record<string, unknown>) || {};
    const transformedData = {
      id: gameData.id,
      date: gameData.date,
      teams: {
        home: (teams.home as Record<string, unknown>) || {},
        away:
          (teams.visitors as Record<string, unknown>) ||
          (teams.away as Record<string, unknown>) ||
          {},
      },
      scores: {
        home: (scores.home as Record<string, unknown>) || { points: 0 },
        away: (scores.visitors as Record<string, unknown>) ||
          (scores.away as Record<string, unknown>) || { points: 0 },
      },
      status: gameData.status || {
        long: 'Completed',
        short: 'FT',
      },
    };

    // Cache the response for 1 hour
    simpleCacheService.set(cacheKey, transformedData, {
      ttl: 3600, // 1 hour
      tags: ['game-details', `game-${gameId}`],
    });

    return NextResponse.json({
      success: true,
      data: transformedData,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
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
