import { sql } from 'drizzle-orm';

import { API_CONFIG, getRapidApiConfig, validateAPIKey } from '@/lib/config/api.config';
import { createRapidAPIClient, handleAPIError } from '@/lib/external-apis';
import { PlayerStatistics } from '@/lib/types/consolidated.types';
import { generateUUID } from '@/lib/utils/index.processing';

import { createDatabaseClient } from './config';
import { nba_player_stats } from './schema';
import { import { seedLogger } from '@/lib/logger'; } from '@/lib/logger';
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
    const db = createDatabaseClient();
    const rapidApiConfig = getRapidApiConfig();
    const apiKey = validateAPIKey(rapidApiConfig.apiKey);
    const api = createRapidAPIClient(apiKey);

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

    const responsePromise = api.get<{ response: PlayerStatistics[] }>(
      `${API_CONFIG.endpoints.PLAYERS}/statistics?id=${playerId}&season=${season}&game=${gameId}`
    );

    const response = (await Promise.race([responsePromise, timeoutPromise])) as {
      response: PlayerStatistics[];
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
      seedLogger.info({ playerStats });
      throw new Error(
        `Multiple player stats found for player ${playerId} in game ${gameId} of ${season} season`
      );
    }

    // Process and store player statistics in the database with retry
    const playerGameStats = playerStats[0] as PlayerStatistics;
    await retryDatabaseOperation(() =>
      db.insert(nba_player_stats).values({
        id: generateUUID(),
        playerId: playerId,
        gameId: gameId,
        teamId: playerGameStats?.team?.id?.toString() || '',
        minutes: playerGameStats?.min ? String(playerGameStats.min) : '',
        points: playerGameStats?.points || 0,
        rebounds: playerGameStats?.totReb || 0,
        assists: playerGameStats?.assists || 0,
        steals: playerGameStats?.steals || 0,
        blocks: playerGameStats?.blocks || 0,
        turnovers: playerGameStats?.turnovers || 0,
        fouls: playerGameStats?.pFouls || 0,
        fieldGoalsMade: playerGameStats?.fgm || 0,
        fieldGoalsAttempted: playerGameStats?.fga || 0,
        threePointersMade: playerGameStats?.tpm || 0,
        threePointersAttempted: playerGameStats?.tpa || 0,
        freeThrowsMade: playerGameStats?.ftm || 0,
        freeThrowsAttempted: playerGameStats?.fta || 0,
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
