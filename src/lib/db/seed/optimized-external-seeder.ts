import { sql } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/api.config';
import { games } from '@/lib/db/schema/game-schemas';
import { seasons, teams, nba_players, nba_games } from '@/lib/db/schema/nba-schemas';
import {
  fetchNbaSeasons,
  fetchNbaTeams,
  fetchNbaPlayers,
  fetchNbaGames,
} from '@/lib/external-apis';
import type {
  PlayerApiResponse,
  GameApiResponse,
  GameResponseData,
} from '@/lib/types/consolidated.types';
import type { DatabaseClient } from '@/lib/types/database.types';

import { createDatabaseClient } from './config';
import type { DataProcessor } from './data-processor';
import { fetchAndProcessNBAGameStats } from './fetch-external-api-game-stats';
import { fetchAndProcessNBAPlayerStats } from './fetch-external-api-player-stats';
import { fetchAndProcessTeamH2H } from './fetch-external-api-team-h2h';
import { OptimizedAPIClient } from './utils/api-client';

// Helper types
type PlayerWithTeams = {
  player: PlayerApiResponse['response']['response'][0];
  teams: Set<string>;
};

type SeasonData = {
  id: number;
  year: number;
  displayYear: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isPlayoffs: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SeasonActive = Array<{ season: number; teamIds: string[] }>;

// Helper functions
function createSeasonData(year: number, isCurrent: boolean): SeasonData {
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

function createPlayerData(
  player: PlayerApiResponse['response']['response'][0],
  teams: Set<string>,
  existingSeasons: SeasonActive,
  season: number
) {
  const currentSeasonTeams = Array.from(teams);
  const existingSeasonIndex = existingSeasons.findIndex(s => s.season === season);

  const updatedSeasons =
    existingSeasonIndex >= 0
      ? existingSeasons.map((s, idx) =>
          idx === existingSeasonIndex
            ? { ...s, teamIds: Array.from(new Set([...s.teamIds, ...currentSeasonTeams])) }
            : s
        )
      : [...existingSeasons, { season, teamIds: currentSeasonTeams }];

  return {
    id: String(player.id),
    firstName: String(player.firstname || 'no-first-name'),
    lastName: String(player.lastname || 'no-last-name'),
    birth: player.birth?.date
      ? { date: player.birth.date, country: player.birth.country || 'Unknown' }
      : null,
    nba: player.nba ? { start: player.nba.start || 0, pro: player.nba.pro || 0 } : null,
    height:
      typeof player.height === 'object' && player.height?.meters ? player.height.meters : null,
    weight:
      typeof player.weight === 'object' && player.weight?.kilograms
        ? player.weight.kilograms
        : null,
    college: String(player.college || 'no-college'),
    affiliation: String(player.affiliation || 'no-affiliation'),
    jersey: player.leagues?.standard?.jersey ? String(player.leagues.standard.jersey) : null,
    active: player.leagues?.standard?.active || false,
    pos: String(player.leagues?.standard?.pos || 'no-pos'),
    seasonsActive: updatedSeasons,
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
  console.log('📅 Fetching NBA seasons...');
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

async function processTeams(apiClient: OptimizedAPIClient, batchSize: number): Promise<void> {
  console.log('Starting to fetch NBA teams...');
  const teamsResponse = await fetchNbaTeams();

  if (!teamsResponse?.response) {
    throw new Error('Invalid response structure from NBA API');
  }

  console.log(`Processing ${teamsResponse.response.length} teams...`);
  const allTeams = teamsResponse.response
    .filter(team => {
      if (!team.id) {
        console.warn('Skipping team with no ID:', team);
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
      const teamNickname = team.nickname || teamName;
      const teamCode =
        team.code || (teamName.length >= 3 ? teamName.substring(0, 3).toUpperCase() : 'UNK');
      const teamCity = team.city || teamName.split(' ')[0] || teamNickname || 'Unknown';

      const processedTeam = {
        id: String(team.id), // Convert to string but don't allow empty string
        name: teamName,
        abbreviation: teamCode,
        nickname: teamNickname,
        code: teamCode,
        city: teamCity,
        state: 'Unknown',
        country: 'USA',
        conference: standardLeague.conference || null,
        division: standardLeague.division || null,
        logoUrl: team.logo || '',
        primaryColor: null,
        secondaryColor: null,
        all_star: Boolean(team.allStar),
        nba_franchise: Boolean(team.nbaFranchise),
        leagues: team.leagues || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log(`Processed team: ${JSON.stringify(processedTeam, null, 2)}`);
      return processedTeam;
    });

  if (allTeams.length === 0) {
    throw new Error('No valid teams found to insert');
  }

  console.log(`Attempting to insert ${allTeams.length} teams into database...`);
  await apiClient.bulkInsertWithConflictHandling(teams, allTeams, teams.id, batchSize, 'teams');
  console.log('Teams insertion completed.');

  // Verify teams were inserted
  const db = createDatabaseClient();
  const insertedTeams = await db.query.teams.findMany();
  console.log(`Verification: Found ${insertedTeams.length} teams in database`);
  console.log('Team IDs in database:', insertedTeams.map(t => t.id).join(', '));
  console.log('NBA Franchise teams:', insertedTeams.filter(t => t.isActive).length);
  console.log('Non-NBA Franchise teams:', insertedTeams.filter(t => !t.isActive).length);
}

async function processPlayers(
  apiClient: OptimizedAPIClient,
  db: DatabaseClient,
  season: number,
  batchSize: number
): Promise<void> {
  console.log(`👥 Processing players for season ${season}...`);
  const allTeams = await db.query.teams.findMany();
  const uniquePlayers = new Map<string, PlayerWithTeams>();

  // Collect all players and their teams
  for (const team of allTeams) {
    console.log(`Fetching players for team ${team.id}...`);
    const playersResponse = await fetchNbaPlayers(`team=${team.id}&season=${season}`);

    if (!playersResponse?.response?.response) {
      console.warn(`No players found for team ${team.id} in season ${season}`);
      continue;
    }

    for (const player of playersResponse.response.response) {
      const playerId = String(player.id);
      if (!uniquePlayers.has(playerId)) {
        uniquePlayers.set(playerId, {
          player,
          teams: new Set([team.id]),
        });
      } else {
        uniquePlayers.get(playerId)?.teams.add(team.id);
      }
    }
  }

  // Fetch existing players data
  const existingPlayers = await db.query.nba_players.findMany({
    where: (players, { inArray }) => inArray(players.id, Array.from(uniquePlayers.keys())),
  });

  const existingPlayersMap = new Map<string, SeasonActive>(
    existingPlayers.map(p => [p.id, p.seasonsActive || []])
  );

  // Insert/update all unique players
  const playerData = Array.from(uniquePlayers.values()).map(({ player, teams }) =>
    createPlayerData(player, teams, existingPlayersMap.get(String(player.id)) || [], season)
  );

  await apiClient.bulkInsertWithConflictHandling(
    nba_players,
    playerData,
    nba_players.id,
    Math.min(batchSize, API_CONFIG.batchSize.PLAYERS),
    `players-${season}`
  );
}

async function processGames(
  apiClient: OptimizedAPIClient,
  season: number,
  batchSize: number
): Promise<void> {
  console.log(`🎮 Fetching games for season ${season}...`);
  const gamesResponse = await fetchNbaGames(`season=${season}`);

  if (!gamesResponse?.response) {
    console.warn(`No games found for season ${season}`);
    return;
  }

  console.log(`Processing ${gamesResponse.response.length} games for season ${season}`);

  // Filter out games with invalid team IDs
  const validGames = gamesResponse.response.filter(game => {
    const homeTeamId = game.teams?.home?.id;
    const awayTeamId = game.teams?.visitors?.id;

    if (!homeTeamId || !awayTeamId) {
      console.warn(`Skipping game ${game.id} - missing team IDs:`, {
        homeTeamId,
        awayTeamId,
        game,
      });
      return false;
    }
    return true;
  });

  console.log(
    `Found ${validGames.length} valid games out of ${gamesResponse.response.length} total games`
  );

  // Add debug logging for arena data
  console.log('Sample game arena data:', validGames[0]?.arena);
  console.log('Sample game arena type:', typeof validGames[0]?.arena);

  const nbaGamesData = validGames.map(game => {
    return {
      id: game.id.toString(),
      league: game.league,
      season: game.season,
      date: {
        start: game.date.start,
        end: game.date.end || null,
        duration: game.date.duration || null,
      },
      stage: game.stage,
      status: {
        clock: game.status.clock || null,
        halftime: game.status.halftime || false,
        short: game.status.short || '',
        long: game.status.long || '',
      },
      periods: {
        current: game.periods?.current || 0,
        total: game.periods?.total || 0,
        endOfPeriod: game.periods?.endOfPeriod || false,
      },
      arena: {
        name: game.arena?.name || '',
        city: game.arena?.city || '',
        state: game.arena?.state || null,
        country: game.arena?.country || null,
      },
      teams: {
        home: {
          id: game.teams.home.id,
          name: game.teams.home.name || '',
          nickname: game.teams.home.nickname || '',
          code: game.teams.home.code || '',
          logo: game.teams.home.logo || '',
        },
        visitors: {
          id: game.teams.visitors.id,
          name: game.teams.visitors.name || '',
          nickname: game.teams.visitors.nickname || '',
          code: game.teams.visitors.code || '',
          logo: game.teams.visitors.logo || '',
        },
      },
      scores: {
        home: {
          win: game.scores.home.win || 0,
          loss: game.scores.home.loss || 0,
          series: {
            win: game.scores.home.series?.win || 0,
            loss: game.scores.home.series?.loss || 0,
          },
          linescore: (game.scores.home.linescore || []).map(String),
          points: game.scores.home.points || 0,
        },
        visitors: {
          win: game.scores.visitors.win || 0,
          loss: game.scores.visitors.loss || 0,
          series: {
            win: game.scores.visitors.series?.win || 0,
            loss: game.scores.visitors.series?.loss || 0,
          },
          linescore: (game.scores.visitors.linescore || []).map(String),
          points: game.scores.visitors.points || 0,
        },
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
    console.warn(`No valid games to insert for season ${season}`);
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
    date: new Date(game.date.start),
    homeTeamId: game.teams.home.id.toString(),
    awayTeamId: game.teams.visitors.id.toString(),
    homeTeamScore: game.scores.home.points,
    awayTeamScore: game.scores.visitors.points,
    status: typeof game.status === 'string' ? game.status : game.status.long,
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
  games: GameApiResponse,
  processor: DataProcessor,
  batchSize: number
): Promise<void> {
  const db = createDatabaseClient();
  const CONCURRENT_PLAYER_BATCHES = 3; // Limit concurrent player batch processing
  const PLAYERS_PER_BATCH = 5; // Process 5 players at a time

  // Process game stats
  await processor.processInChunks(
    games.response,
    async (gamesBatch: GameResponseData[]) => {
      const gameStatsPromises = gamesBatch.map(async game => {
        try {
          // Use the reliable game stats function
          await fetchAndProcessNBAGameStats(game.id.toString(), season);

          // Get players for both teams using the seasonsActive field
          const [homeTeamPlayers, awayTeamPlayers] = await Promise.all([
            db.query.nba_players.findMany({
              where: sql`"seasonsActive" @> ${JSON.stringify([{ season, teamIds: [game.teams.home.id.toString()] }])}`,
            }),
            db.query.nba_players.findMany({
              where: sql`"seasonsActive" @> ${JSON.stringify([{ season, teamIds: [game.teams.visitors.id.toString()] }])}`,
            }),
          ]);

          // Combine all players and process in smaller batches
          const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

          // Process players in smaller batches with controlled concurrency
          for (let i = 0; i < allPlayers.length; i += PLAYERS_PER_BATCH) {
            const playerBatch = allPlayers.slice(i, i + PLAYERS_PER_BATCH);
            const batchPromises = playerBatch.map(player =>
              fetchAndProcessNBAPlayerStats(player.id.toString(), season, game.id.toString())
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
          console.warn(`Failed to fetch game stats for game ${game.id}:`, error);
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

export async function appendOptimizedExternalData(options: OptimizedSeederOptions): Promise<void> {
  const { seasons: inputSeasonYears, apiClient, processor, batchSize, tables } = options;
  const db = createDatabaseClient();
  console.log({ tables });

  try {
    // Process seasons
    const seasonsToProcess = await processSeasons(apiClient, inputSeasonYears, batchSize);
    console.log(
      `🏀 Processing ${seasonsToProcess.length} NBA seasons: ${seasonsToProcess.join(', ')}`
    );

    // Process teams
    await processTeams(apiClient, batchSize);

    // Process each season
    for (const season of seasonsToProcess) {
      console.log(`\nProcessing season ${season}...`);

      // Process players
      await processPlayers(apiClient, db, season, batchSize);

      // Process games
      await processGames(apiClient, season, batchSize);

      // Process game stats
      await processSeasonStats(
        season,
        await fetchNbaGames(`season=${season}`),
        processor,
        batchSize
      );

      console.log(`✅ Completed processing season ${season}`);
    }
  } catch (error) {
    console.error('❌ Error during optimized database seeding:', error);
    throw error;
  }
}

export async function seedOptimizedExternalData(options: OptimizedSeederOptions): Promise<void> {
  const { seasons: inputSeasonYears, apiClient, processor, batchSize, appendingData } = options;
  const db = createDatabaseClient();

  try {
    // Process seasons
    const seasonsToProcess = await processSeasons(
      apiClient,
      inputSeasonYears,
      batchSize,
      appendingData
    );
    console.log(
      `🏀 Processing ${seasonsToProcess.length} NBA seasons: ${seasonsToProcess.join(', ')}`
    );

    // Process teams
    await processTeams(apiClient, batchSize);

    // Process each season
    for (const season of seasonsToProcess) {
      console.log(`\nProcessing season ${season}...`);

      // Process players
      await processPlayers(apiClient, db, season, batchSize);

      // Process games
      await processGames(apiClient, season, batchSize);

      // Process game stats
      await processSeasonStats(
        season,
        await fetchNbaGames(`season=${season}`),
        processor,
        batchSize
      );

      console.log(`✅ Completed processing season ${season}`);
    }
  } catch (error) {
    console.error('❌ Error during optimized database seeding:', error);
    throw error;
  }
}

export interface OptimizedSeederOptions {
  seasons: number[];
  apiClient: OptimizedAPIClient;
  processor: DataProcessor;
  batchSize: number;
  tables?: string[];
  appendingData?: boolean;
}
