import { sql } from 'drizzle-orm';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import { handleAPIError } from '@src/lib/external-apis';
import type { IGameStatistics } from '@src/lib/types/game-statistics.types';
import { generateUUID } from '@src/lib/utils/processing';

import { nba_player_stats } from './schema';
import { initializeClients } from './utils/initialize-clients';
// Add timeout configuration
const API_TIMEOUT = 10000; // 10 seconds timeout
const DB_RETRY_ATTEMPTS = 3;
const DB_RETRY_DELAY = 3000; // 3 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  attempts: number = DB_RETRY_ATTEMPTS
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (attempts <= 1) throw error;
    await sleep(DB_RETRY_DELAY);
    return retryDatabaseOperation(operation, attempts - 1);
  }
}

/**
 * Fetches and processes player statistics for a specific game
 */
export async function fetchAndProcessNBAPlayerStats(
  playerId: string,
  season: number,
  gameId: string
): Promise<void> {
  try {
    const { db, api } = initializeClients();

    // Check if stats already exist in database with retry
    const existingStats = await retryDatabaseOperation(() =>
      db.query.nba_player_stats.findFirst({
        where: sql`"playerId" = ${playerId} AND "gameId" = ${gameId}`,
      })
    );

    if (existingStats) {
      seedLogger.info(`Stats already exist for player ${playerId} in game ${gameId}, skipping...`);
      return;
    }

    seedLogger.info(`Fetching NBA player statistics for player ${playerId} in game ${gameId}...`);

    // Add timeout to the API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT);
    });

    const responsePromise = api.get<{ response: IGameStatistics[] }>(
      `${API_CONFIG.endpoints.PLAYERS}/statistics?id=${playerId}&season=${season}&game=${gameId}`
    );

    const response = (await Promise.race([responsePromise, timeoutPromise])) as {
      response: IGameStatistics[];
    };

    if (!response?.response) {
      throw new Error('Invalid response structure from NBA API');
    }

    if (!Array.isArray(response.response)) {
      seedLogger.error('Invalid response data:', response.response);
      throw new Error(
        `Invalid response format. Expected response array but got ${typeof response.response}`
      );
    }

    const playerStats = response.response;
    seedLogger.info(`Fetched statistics for player ${playerId}`);
    if ((playerStats?.length || 0) === 0) {
      seedLogger.info(
        `No player stats found for player ${playerId} in game ${gameId} of ${season} season`
      );
      return;
    }

    if (playerStats.length > 1) {
      seedLogger.info('Player stats processed:', { playerStats });
      throw new Error(
        `Multiple player stats found for player ${playerId} in game ${gameId} of ${season} season`
      );
    }

    // Process and store player statistics in the database with retry
    const playerGameStats = playerStats[0] as IGameStatistics;
    await retryDatabaseOperation(() =>
      db.insert(nba_player_stats).values({
        id: generateUUID(),
        playerId: playerId,
        gameId: gameId,
        teamId: playerGameStats?.teamId || '',
        minutes: playerGameStats?.minutes || '0',
        points: playerGameStats?.points || 0,
        rebounds: playerGameStats?.rebounds || 0,
        assists: playerGameStats?.assists || 0,
        steals: playerGameStats?.steals || 0,
        blocks: playerGameStats?.blocks || 0,
        turnovers: playerGameStats?.turnovers || 0,
        fouls: playerGameStats?.fouls || 0,
        fieldGoalsMade: playerGameStats?.fieldGoals?.made || 0,
        fieldGoalsAttempted: playerGameStats?.fieldGoals?.attempted || 0,
        threePointersMade: playerGameStats?.threePointers?.made || 0,
        threePointersAttempted: playerGameStats?.threePointers?.attempted || 0,
        freeThrowsMade: playerGameStats?.freeThrows?.made || 0,
        freeThrowsAttempted: playerGameStats?.freeThrows?.attempted || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    seedLogger.info(`Successfully processed and stored statistics for player ${playerId}`);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'API request timeout') {
        seedLogger.error(`Timeout fetching stats for player ${playerId} in game ${gameId}`);
      } else if (error.message.includes('database') || error.message.includes('connection')) {
        seedLogger.error(`Database error for player ${playerId} in game ${gameId}:`, error.message);
      } else {
        handleAPIError(error);
      }
    } else {
      seedLogger.error('Unexpected error:', error);
    }
    throw error; // Re-throw to allow caller to handle the error
  }
}
