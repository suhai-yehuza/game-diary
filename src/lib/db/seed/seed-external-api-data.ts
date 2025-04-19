import { sql } from 'drizzle-orm';
import pLimit from 'p-limit';

import { DB_CONFIG } from '@/lib/config/db.config';
import { initializeDb } from '@/lib/db/seed/config';
import { fetchAndProcessNBAGameStats } from '@/lib/db/seed/fetch-external-api-game-stats';
import { fetchAndProcessNBAGames } from '@/lib/db/seed/fetch-external-api-games';
import { fetchAndProcessNBAPlayerStats } from '@/lib/db/seed/fetch-external-api-player-stats';
import { fetchAndProcessNBAPlayers } from '@/lib/db/seed/fetch-external-api-players';
import { fetchAndProcessNBASeasons } from '@/lib/db/seed/fetch-external-api-seasons';
import { fetchAndProcessTeamH2H } from '@/lib/db/seed/fetch-external-api-team-h2h';
import { fetchAndProcessNBATeams } from '@/lib/db/seed/fetch-external-api-teams';
import type { DatabaseClient } from '@/lib/types';
import { processInBatches } from '@/lib/utils/index.processing';
import { getCurrentSeason, sleep } from '@/lib/utils/index.time';

// Limit concurrent operations
const CONCURRENT_OPERATIONS = DB_CONFIG.seeding.external.CONCURRENT_OPERATIONS;
const limit = pLimit(CONCURRENT_OPERATIONS);
const currentSeason = getCurrentSeason();

// Add retry mechanism
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = DB_CONFIG.seeding.external.RETRY.MAX_ATTEMPTS,
  delayMs: number = DB_CONFIG.seeding.external.RETRY.BASE_DELAY
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs * attempt); // Exponential backoff
    }
  }

  throw lastError;
}

/**
 * Process game and player stats for a batch of games
 */
async function processGameAndPlayerStats(
  db: DatabaseClient,
  gameBatch: Array<{ id: string | number; teams: unknown }>,
  season: number
) {
  await Promise.all(
    gameBatch.map(async game => {
      await limit(async () => {
        try {
          const gameStatsPromise = withRetry(() =>
            fetchAndProcessNBAGameStats(game.id.toString(), season)
          );

          const teamsData = game.teams as {
            visitors: { id: string };
            home: { id: string };
          };

          if (teamsData?.visitors?.id && teamsData?.home?.id) {
            const gamePlayers = await db.query.nba_players.findMany({
              where: sql`team_id = ${teamsData.visitors.id} OR team_id = ${teamsData.home.id}`,
            });

            await processInBatches({
              items: gamePlayers,
              batchSize: DB_CONFIG.seeding.external.BATCH_SIZE.PLAYERS,
              tableName: 'players',
              processFn: async playerBatch => {
                await Promise.all(
                  playerBatch.map(async player => {
                    try {
                      await withRetry(() =>
                        fetchAndProcessNBAPlayerStats(
                          player.id.toString(),
                          season,
                          game.id.toString()
                        )
                      );
                    } catch (error) {
                      console.error(
                        `Error fetching player stats for player ${player.id} in game ${game.id}:`,
                        error
                      );
                    }
                  })
                );
              },
              concurrencyLimit: CONCURRENT_OPERATIONS,
            });
          }

          await gameStatsPromise;
        } catch (error) {
          console.error(`Error processing game ${game.id}:`, error);
        }
      });
    })
  );
}

export async function seedExternalData(
  options: {
    seasons?: number[];
    skipExternalDb?: boolean;
  } = {
    seasons: [],
    skipExternalDb: false,
  }
) {
  try {
    if (options.skipExternalDb) {
      console.log('Skipping external data seeding as requested');
      return;
    }

    console.log('Starting external data seeding...');
    console.log('Raw options received:', options);
    console.log('Seasons type:', typeof options.seasons);
    console.log('Seasons is array?', Array.isArray(options.seasons));
    console.log('Raw seasons contents:', JSON.stringify(options.seasons));
    console.log('Seed external data options:', options);
    const db = initializeDb();

    // Validate and process seasons with explicit type checking
    const targetSeasons = (Array.isArray(options.seasons) ? options.seasons : [])
      .reduce<number[]>((acc, season) => {
        if (typeof season === 'number' && !isNaN(season) && Number.isInteger(season)) {
          acc.push(season);
        }
        return acc;
      }, [])
      .sort((a, b) => b - a); // Sort in descending order

    console.log('Target seasons before filtering:', targetSeasons);
    console.log('Target seasons array type:', Array.isArray(targetSeasons));
    console.log('Target seasons contents:', JSON.stringify(targetSeasons));
    console.log('First season type:', typeof targetSeasons[0]);
    console.log('First season value:', targetSeasons[0]);

    const validSeasons = targetSeasons
      .filter((season): season is number => {
        return (
          typeof season === 'number' && !isNaN(season) && season > 0 && Number.isInteger(season)
        );
      })
      .sort((a, b) => b - a); // Sort in descending order
    console.log('Valid seasons after filtering:', validSeasons);

    if (validSeasons.length === 0) {
      console.log('No valid seasons provided, using current season');
      validSeasons.push(currentSeason);
    }

    // Process the seasons we have
    console.log(`Processing ${validSeasons.length} seasons: ${validSeasons.join(', ')}`);

    // Table truncation is handled centrally by setup-db.ts

    // Fetch seasons
    console.log('Fetching data for NBA seasons...');
    await fetchAndProcessNBASeasons();

    // Get seasons to process
    let seasons = await db.query.seasons.findMany({
      orderBy: (seasons, { desc }) => [desc(seasons.id)],
    });

    seasons = seasons.filter(season => validSeasons.includes(season.id));
    if (seasons.length === 0) {
      console.log('No seasons found in database. Skipping external data seeding.');
      return;
    }

    console.log(`Processing ${seasons.length} seasons: ${seasons.map(s => s.id).join(', ')}...`);

    // Fetch and store NBA teams
    console.log('Fetching NBA teams...');
    await fetchAndProcessNBATeams();

    // Verify teams were fetched
    const dbTeams = await db.query.teams.findMany();
    if (dbTeams.length === 0) {
      throw new Error('No teams found in database after fetching. Cannot proceed with setup.');
    }
    console.log(`NBA teams fetched and stored: ${dbTeams.length} teams`);

    // Process each season
    for await (const seasonInfo of seasons) {
      const season = seasonInfo.id;
      console.log(`Processing season ${season}...`);

      // Fetch players
      console.log(`Fetching players for the ${season} season...`);
      await fetchAndProcessNBAPlayers(season);

      // Verify players
      const seasonPlayers = await db.query.nba_players.findMany({
        where: sql`seasons_active::jsonb @> jsonb_build_array((${season})::integer)`,
      });
      console.log(`NBA players fetched for season ${season}: ${seasonPlayers.length} players`);

      // Fetch games
      console.log(`Fetching games for the ${season} season...`);
      await fetchAndProcessNBAGames(season);

      // Verify games
      const seasonGames = await db.query.nba_games.findMany({
        where: sql`season = ${season}`,
      });
      console.log(`NBA games fetched for season ${season}: ${seasonGames.length} games`);

      // Fetch game stats and player stats
      console.log(`Fetching game and player stats for the ${season} season...`);
      await processInBatches({
        items: seasonGames,
        batchSize: DB_CONFIG.seeding.external.BATCH_SIZE.GAMES,
        tableName: 'games',
        processFn: gameBatch => processGameAndPlayerStats(db, gameBatch, season),
        concurrencyLimit: CONCURRENT_OPERATIONS,
      });

      // Process team head-to-head stats
      console.log(`Processing team head-to-head stats for the ${season} season...`);
      await fetchAndProcessTeamH2H(db, season);

      console.log(`Completed processing for season ${season}`);
    }

    console.log('External data seeding completed successfully');
  } catch (error) {
    console.error('Error during external data seeding:', error);
    throw error;
  }
}

// Allow running directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const seasonsArg = process.argv[2];
  const seasons = seasonsArg ? seasonsArg.split(',').map(s => parseInt(s.trim())) : [currentSeason];
  const skipExternalDb = process.argv[3] === 'true';
  seedExternalData({ seasons, skipExternalDb })
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to seed external data:', error);
      process.exit(1);
    });
}
