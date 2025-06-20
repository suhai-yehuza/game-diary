import { sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import type {
  IPlayerWithTeams,
  IGameApiResponse,
  ISeasonData,
  IApplicationSeederOptions,
} from '@/lib/types';
import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import type * as schema from '@src/lib/db/schema';
import { games } from '@src/lib/db/schema/game-schemas';
import { seasons, teams, nba_players, nba_games } from '@src/lib/db/schema/nba-schemas';
import {
  fetchNbaSeasons,
  fetchNbaTeams,
  fetchNbaPlayers,
  fetchNbaGames,
} from '@src/lib/external-apis';
import type { TeamRow } from '@src/lib/types/seeding.types';

import { createDatabaseClient } from './config';
import { DataProcessor, PerformanceMonitor } from './data-processor';
import { fetchAndProcessNBAGameStats } from './fetch-external-api-game-stats';
import { fetchAndProcessNBAPlayerStats } from './fetch-external-api-player-stats';
import { fetchAndProcessTeamH2H } from './fetch-external-api-team-h2h';
import type { OptimizedAPIClient } from './utils/api-client';

// Helper functions
function createSeasonData(year: number, isCurrent: boolean): ISeasonData {
  return {
    id: year,
    year,
    displayYear: `${year}-${(year + 1).toString().slice(-2)}`,
    startDate: new Date(year, 9, 1), // October 1st
    endDate: new Date(year + 1, 5, 30), // June 30th
    isCurrent: isCurrent,
    isPlayoffs: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function processSeasons(
  apiClient: OptimizedAPIClient,
  inputSeasonYears: number[],
  batchSize: number,
  appendingData: boolean = false
): Promise<number[]> {
  seedLogger.info('📅 Fetching NBA seasons...');
  const seasonsResponse = await fetchNbaSeasons();

  if (!Array.isArray(seasonsResponse?.response)) {
    throw new Error('Invalid response structure from NBA API');
  }

  const seasonYears = seasonsResponse.response.sort((a, b) => b - a);
  const seasonsToProcess =
    inputSeasonYears.length > 0
      ? seasonYears.filter(year => inputSeasonYears.includes(year))
      : seasonYears;

  if (seasonsToProcess.length === 0) {
    throw new Error(
      `No matching seasons found. Requested: ${inputSeasonYears.join(', ')}, Available: ${seasonYears.join(', ')}`
    );
  }

  const maxYear = Math.max(...seasonYears);
  const seasonData = seasonYears.map(year => createSeasonData(year, year === maxYear));

  if (!appendingData) {
    await apiClient.bulkInsertWithConflictHandling(
      seasons,
      seasonData,
      seasons.id,
      batchSize,
      'seasons'
    );
  }

  return seasonsToProcess;
}

async function processTeams(
  apiClient: OptimizedAPIClient,
  db: NeonHttpDatabase<typeof schema>,
  batchSize: number
): Promise<TeamRow[]> {
  seedLogger.info('Starting to fetch NBA teams...');
  const teamsResponse = await fetchNbaTeams();

  if (!teamsResponse?.response) {
    throw new Error('Invalid response structure from NBA API');
  }

  seedLogger.info(`Processing ${teamsResponse.response.length} teams...`);
  const allTeams = teamsResponse.response
    .filter(team => {
      if (!team.id) {
        seedLogger.warn('Skipping team with no ID:', team);
        return false;
      }
      return true;
    })
    .map(team => {
      const standardLeague = (team.leagues?.standard || {}) as {
        conference?: string;
        division?: string;
      };

      // Ensure we have a valid team name
      const teamName = team.name || 'Unknown Team';
      const teamCode =
        team.code || (teamName.length >= 3 ? teamName.substring(0, 3).toUpperCase() : 'UNK');
      const teamCity = team.city || teamName.split(' ')[0] || 'Unknown';

      const processedTeam = {
        id: String(team.id), // Convert to string but don't allow empty string
        name: teamName,
        code: teamCode,
        city: teamCity,
        state: 'Unknown',
        country: 'USA',
        conference: standardLeague.conference || null,
        division: standardLeague.division || null,
        logoUrl: team.logo || '',
        all_star: Boolean(team.allStar),
        nba_franchise: Boolean(team.nbaFranchise),
        leagues: team.leagues || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      seedLogger.info(`Processed team: ${JSON.stringify(processedTeam, null, 2)}`);
      return processedTeam;
    });

  if (allTeams.length === 0) {
    throw new Error('No valid teams found to insert');
  }

  seedLogger.info(`Attempting to insert ${allTeams.length} teams into database...`);
  await apiClient.bulkInsertWithConflictHandling(teams, allTeams, teams.id, batchSize, 'teams');
  seedLogger.info('Teams insertion completed.');

  // Verify teams were inserted
  const insertedTeams = await db.query.teams.findMany();
  seedLogger.info(`Verification: Found ${insertedTeams.length} teams in database`);
  seedLogger.info(
    'Sample teams:',
    insertedTeams.slice(0, 3).map(t => ({ id: t.id, name: t.name }))
  );

  return insertedTeams;
}

async function processPlayers(
  apiClient: OptimizedAPIClient,
  db: NeonHttpDatabase<typeof schema>,
  season: number,
  batchSize: number
): Promise<void> {
  seedLogger.info(`👥 Processing players for season ${season}...`);
  const allTeams = await db.query.teams.findMany();
  const uniquePlayers = new Map<string, IPlayerWithTeams>();

  // Collect all players and their teams
  for (const team of allTeams) {
    seedLogger.info(`Fetching players for team ${team.id}...`);
    const playersResponse = await fetchNbaPlayers(`team=${team.id}&season=${season}`);

    if (!playersResponse?.response?.response) {
      seedLogger.warn(`No players found for team ${team.id} in season ${season}`);
      continue;
    }

    for (const player of playersResponse.response.response) {
      const playerId = String(player.id);
      if (!uniquePlayers.has(playerId)) {
        uniquePlayers.set(playerId, {
          id: playerId,
          name: `${player.firstname} ${player.lastname}`,
          player: {
            id: playerId,
            firstname: player.firstname,
            lastname: player.lastname,
            birth: player.birth,
            nba: player.nba,
            height: player.height,
            weight: player.weight,
            jersey: player.jersey,
            active: player.active,
            pos: player.pos,
            team: {
              id: team.id,
              name: team.name,
              nickname: team.name,
              code: team.code,
              city: team.city,
            },
          },
          teams: new Set([team.id]),
        });
      } else {
        uniquePlayers.get(playerId)?.teams.add(team.id);
      }
    }
  }

  // Fetch existing players data
  const existingPlayers = await db.query.nba_players.findMany({
    where: (nba_players, { inArray }) => inArray(nba_players.id, Array.from(uniquePlayers.keys())),
  });

  const existingPlayersMap = new Map<string, Array<{ season: number; teamIds: string[] }>>(
    existingPlayers.map(p => [p.id, p.seasonsActive ?? []])
  );

  // Insert/update all unique players
  const playerData = Array.from(uniquePlayers.values()).map(({ player }) => {
    const extendedPlayer = player as typeof player & {
      college?: string;
      affiliation?: string;
      leagues?: {
        standard?: {
          jersey?: string;
          active?: boolean;
          pos?: string;
        };
      };
    };

    return {
      id: String(player.id),
      firstName: player.firstname,
      lastName: player.lastname,
      birth: player.birth ? { date: player.birth.date, country: player.birth.country } : null,
      nba: player.nba ? { start: player.nba.start, pro: player.nba.pro } : null,
      height: player.height
        ? { feets: player.height.feets, inches: player.height.inches, meters: player.height.meters }
        : null,
      weight: player.weight
        ? { pounds: player.weight.pounds, kilograms: player.weight.kilograms }
        : null,
      college: extendedPlayer.college || null,
      affiliation: extendedPlayer.affiliation || null,
      jersey:
        extendedPlayer.leagues?.standard?.jersey?.toString() || player.jersey?.toString() || null,
      active: extendedPlayer.leagues?.standard?.active ?? player.active ?? false,
      pos: extendedPlayer.leagues?.standard?.pos || player.pos || null,
      seasonsActive: existingPlayersMap.get(String(player.id)) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await apiClient.bulkInsertWithConflictHandling(
    nba_players,
    playerData,
    nba_players.id,
    Math.min(batchSize, API_CONFIG.batchSize.PLAYERS),
    `players-${season}`
  );
}

// Helper to safely extract start date
function getStartDate(date: string | { start: string; end?: string; duration?: string }): string {
  if (typeof date === 'object' && date !== null && 'start' in date) {
    return date.start;
  }
  return date as string;
}

// Helper to safely get home/away scores
function getHomeScore(scores: unknown): number {
  const scoresObj = scores as { home?: { points?: number } };
  return scoresObj?.home?.points || 0;
}
function getAwayScore(scores: unknown): number {
  const scoresObj = scores as { visitors?: { points?: number } };
  return scoresObj?.visitors?.points || 0;
}

async function processGames(
  apiClient: OptimizedAPIClient,
  db: NeonHttpDatabase<typeof schema>,
  season: number,
  batchSize: number,
  startDate?: string
): Promise<void> {
  seedLogger.info(`🎮 Fetching games for season ${season}...`);
  const gamesResponse = await fetchNbaGames(`season=${season}`);

  if (!gamesResponse?.response) {
    seedLogger.warn(`No games found for season ${season}`);
    return;
  }

  seedLogger.info(`Processing ${gamesResponse.response.length} games for season ${season}`);

  // Get all teams from database
  const allTeams = await db.query.teams.findMany();
  const teamIds = new Set(allTeams.map((team: { id: string }) => team.id));
  seedLogger.info(`Found ${teamIds.size} teams in database`);

  // Filter out games with invalid team IDs and apply startDate filter if provided
  const validGames = gamesResponse.response.filter(game => {
    const homeTeamId = game.teams?.home?.id?.toString();
    const awayTeamId = game.teams?.visitors?.id?.toString();

    if (!homeTeamId || !awayTeamId) {
      seedLogger.warn(`Skipping game ${game.id} - missing team IDs:`, {
        homeTeamId,
        awayTeamId,
        game,
      });
      return false;
    }

    // Verify both teams exist in database
    if (!teamIds.has(homeTeamId) || !teamIds.has(awayTeamId)) {
      seedLogger.warn(`Skipping game ${game.id} - one or both teams not found in database:`, {
        homeTeamId,
        awayTeamId,
        game,
      });
      return false;
    }

    // Apply startDate filter if provided
    if (startDate) {
      const gameDate = new Date(getStartDate(game.date));
      const filterDate = new Date(startDate);
      if (gameDate < filterDate) {
        seedLogger.info(`Skipping game ${game.id} - before startDate ${startDate}`);
        return false;
      }
    }

    return true;
  });

  seedLogger.info(
    `Found ${validGames.length} valid games out of ${gamesResponse.response.length} total games`
  );

  // Add debug logging for arena data
  seedLogger.info('Sample game arena data:', validGames[0]?.arena);
  seedLogger.info('Sample game arena type:', typeof validGames[0]?.arena);

  const nbaGamesData = validGames.map(game => {
    // Type guards for date and status
    const statusObj =
      typeof game.status === 'object' &&
      game.status !== null &&
      ('clock' in game.status || 'halftime' in game.status)
        ? (game.status as { clock?: string; halftime?: boolean; short?: string; long?: string })
        : { short: game.status as string, long: game.status as string };
    return {
      id: game.id.toString(),
      league: typeof game.league === 'string' ? game.league : '',
      season: typeof game.season === 'number' ? game.season : 0,
      date: {
        start: getStartDate(game.date),
        end:
          typeof game.date === 'object' && game.date !== null && 'end' in game.date
            ? game.date.end || null
            : null,
        duration:
          typeof game.date === 'object' && game.date !== null && 'duration' in game.date
            ? game.date.duration || null
            : null,
      },
      stage: typeof game.stage === 'number' ? game.stage : 0,
      status: {
        clock: statusObj.clock || null,
        halftime: statusObj.halftime || false,
        short: statusObj.short || '',
        long: statusObj.long || '',
      },
      periods: {
        current: game.periods?.current ?? 0,
        total: game.periods?.total ?? 0,
        endOfPeriod: game.periods?.endOfPeriod ?? false,
      },
      arena: {
        name: game.arena?.name || '',
        city: game.arena?.city || '',
        state: game.arena?.state || null,
        country: game.arena?.country || null,
      },
      teams: {
        home: {
          id: Number(game.teams.home.id),
          name: game.teams.home.name || '',
          nickname: game.teams.home.nickname || game.teams.home.name || '',
          code: game.teams.home.code || '',
          logo: game.teams.home.logo || '',
        },
        visitors: {
          id: Number(game.teams.visitors.id),
          name: game.teams.visitors.name || '',
          nickname: game.teams.visitors.nickname || game.teams.visitors.name || '',
          code: game.teams.visitors.code || '',
          logo: game.teams.visitors.logo || '',
        },
      },
      scores: game.scores
        ? {
            home: {
              win: game.scores.home?.win || 0,
              loss: game.scores.home?.loss || 0,
              series: {
                win: game.scores.home?.series?.win || 0,
                loss: game.scores.home?.series?.loss || 0,
              },
              linescore: (game.scores.home?.linescore || []).map(score => {
                const num = Number(score);
                return isNaN(num) ? 0 : Math.floor(num);
              }),
              points: getHomeScore(game.scores),
            },
            visitors: {
              win: game.scores.visitors?.win || 0,
              loss: game.scores.visitors?.loss || 0,
              series: {
                win: game.scores.visitors?.series?.win || 0,
                loss: game.scores.visitors?.series?.loss || 0,
              },
              linescore: (game.scores.visitors?.linescore || []).map(score => {
                const num = Number(score);
                return isNaN(num) ? 0 : Math.floor(num);
              }),
              points: getAwayScore(game.scores),
            },
          }
        : {
            home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
            visitors: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [], points: 0 },
          },
      officials: game.officials || [],
      timesTied: game.timesTied || 0,
      leadChanges: game.leadChanges || 0,
      nugget: game.nugget || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  if (nbaGamesData.length === 0) {
    seedLogger.warn(`No valid games to insert for season ${season}`);
    return;
  }

  await apiClient.bulkInsertWithConflictHandling(
    nba_games,
    nbaGamesData,
    nba_games.id,
    Math.min(batchSize, API_CONFIG.batchSize.GAMES),
    `nba-games-${season}`
  );

  const genericGamesData = validGames.map(game => ({
    id: game.id.toString(),
    gameType: 'nba',
    nbaGameId: game.id.toString(),
    date: new Date(getStartDate(game.date)),
    homeTeamId: game.teams.home.id.toString(),
    awayTeamId: game.teams.visitors.id.toString(),
    homeTeamScore: getHomeScore(game.scores),
    awayTeamScore: getAwayScore(game.scores),
    status: typeof game.status === 'string' ? game.status : game.status?.long || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await apiClient.bulkInsertWithConflictHandling(
    games,
    genericGamesData,
    games.id,
    batchSize,
    `games-${season}`
  );
}

async function processSeasonStats(
  season: number,
  games: IGameApiResponse,
  processor: DataProcessor,
  batchSize: number
): Promise<void> {
  const db: NeonHttpDatabase<typeof schema> = createDatabaseClient();
  const CONCURRENT_PLAYER_BATCHES = 3; // Limit concurrent player batch processing
  const PLAYERS_PER_BATCH = 5; // Process 5 players at a time

  // Process game stats
  await processor.processInChunks(
    games.response.map(game => ({ response: [game] })),
    async (gamesBatch: IGameApiResponse[]) => {
      const gameStatsPromises = gamesBatch.map(async game => {
        try {
          // Use the reliable game stats function
          await fetchAndProcessNBAGameStats(game.response[0].id.toString(), season);

          // Get players for both teams using the seasonsActive field
          const [homeTeamPlayers, awayTeamPlayers] = await Promise.all([
            db.query.nba_players.findMany({
              where: sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements("seasonsActive") as season
                WHERE season->>'season' = ${season.toString()}
                AND season->'teamIds' ? ${game.response[0].teams.home.id.toString()}
              )`,
            }),
            db.query.nba_players.findMany({
              where: sql`EXISTS (
                SELECT 1 FROM jsonb_array_elements("seasonsActive") as season
                WHERE season->>'season' = ${season.toString()}
                AND season->'teamIds' ? ${game.response[0].teams.visitors.id.toString()}
              )`,
            }),
          ]);

          // Combine all players and process in smaller batches
          const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

          // Process players in smaller batches with controlled concurrency
          for (let i = 0; i < allPlayers.length; i += PLAYERS_PER_BATCH) {
            const playerBatch = allPlayers.slice(i, i + PLAYERS_PER_BATCH);
            const batchPromises = playerBatch.map(player =>
              fetchAndProcessNBAPlayerStats(
                player.id.toString(),
                season,
                game.response[0].id.toString()
              )
            );

            // Wait for current batch to complete before starting next batch
            await Promise.all(batchPromises);

            // Add a small delay between batches to prevent overwhelming the API
            if (i + PLAYERS_PER_BATCH < allPlayers.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          return true;
        } catch (error) {
          seedLogger.warn(`Failed to fetch game stats for game ${game.response[0].id}:`, error);
          return null;
        }
      });

      // Process games with controlled concurrency
      const results = [];
      for (let i = 0; i < gameStatsPromises.length; i += CONCURRENT_PLAYER_BATCHES) {
        const batch = gameStatsPromises.slice(i, i + CONCURRENT_PLAYER_BATCHES);
        const batchResults = await Promise.all(batch);
        results.push(...batchResults);

        // Add a small delay between game batches
        if (i + CONCURRENT_PLAYER_BATCHES < gameStatsPromises.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    },
    Math.min(batchSize, API_CONFIG.batchSize.GAME_STATS),
    `game-stats-processing-${season}`
  );

  // Process team head-to-head stats using the reliable function
  await fetchAndProcessTeamH2H(db, season);
}

export async function seedOptimizedExternalData(options: IApplicationSeederOptions): Promise<void> {
  const {
    seasons: inputSeasonYears = [],
    apiClient,
    processor,
    batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE,
    appendingData,
    startDate,
  } = options;

  if (!apiClient) throw new Error('apiClient is required');

  try {
    // Create a single database client for the entire seeding process
    const db: NeonHttpDatabase<typeof schema> = createDatabaseClient();
    // Add raw property to satisfy DatabaseClient interface
    (db as typeof db & { raw: unknown; $client: unknown }).raw = (
      db as typeof db & { $client: unknown }
    ).$client;

    // Ensure a real DataProcessor instance is used
    const monitor = new PerformanceMonitor();
    const realProcessor = processor || new DataProcessor(db, apiClient, monitor);

    // Process seasons
    const seasonsToProcess = await processSeasons(
      apiClient,
      inputSeasonYears,
      batchSize,
      appendingData
    );
    seedLogger.info(
      `🏀 Processing ${seasonsToProcess.length} NBA seasons: ${seasonsToProcess.join(', ')}`
    );

    // Process teams
    await processTeams(apiClient, db, batchSize);

    // Process each season
    for (const season of seasonsToProcess) {
      seedLogger.info(`\nProcessing season ${season}...`);

      // Process players
      await processPlayers(apiClient, db, season, batchSize);

      // Process games
      await processGames(apiClient, db, season, batchSize, startDate);

      // Process game stats
      await processSeasonStats(
        season,
        await fetchNbaGames(`season=${season}`),
        realProcessor,
        batchSize
      );

      seedLogger.info(`✅ Completed processing season ${season}`);
    }
  } catch (error) {
    seedLogger.error('❌ Error during optimized database seeding:', error);
    throw error;
  }
}

export async function appendOptimizedExternalData(
  options: IApplicationSeederOptions
): Promise<void> {
  const {
    seasons: inputSeasonYears = [],
    apiClient,
    processor,
    batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE,
    tables,
    startDate,
  } = options;

  if (!apiClient) throw new Error('apiClient is required');

  seedLogger.info('Tables to check:', { tables });

  try {
    // Create a single database client for the entire seeding process
    const db: NeonHttpDatabase<typeof schema> = createDatabaseClient();
    // Add raw property to satisfy DatabaseClient interface
    (db as typeof db & { raw: unknown; $client: unknown }).raw = (
      db as typeof db & { $client: unknown }
    ).$client;

    // Ensure a real DataProcessor instance is used
    const monitor = new PerformanceMonitor();
    const realProcessor = processor || new DataProcessor(db, apiClient, monitor);

    // Process seasons
    const seasonsToProcess = await processSeasons(apiClient, inputSeasonYears, batchSize);
    seedLogger.info(
      `🏀 Processing ${seasonsToProcess.length} NBA seasons: ${seasonsToProcess.join(', ')}`
    );

    // Process teams
    await processTeams(apiClient, db, batchSize);

    // Process each season
    for (const season of seasonsToProcess) {
      seedLogger.info(`\nProcessing season ${season}...`);

      // Process players
      await processPlayers(apiClient, db, season, batchSize);

      // Process games
      await processGames(apiClient, db, season, batchSize, startDate);

      // Process game stats
      await processSeasonStats(
        season,
        await fetchNbaGames(`season=${season}`),
        realProcessor,
        batchSize
      );

      seedLogger.info(`✅ Completed processing season ${season}`);
    }
  } catch (error) {
    seedLogger.error('❌ Error during optimized database seeding:', error);
    throw error;
  }
}
