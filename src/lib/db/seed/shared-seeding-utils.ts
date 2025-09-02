// Shared utilities for external API seeding
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { getRapidApiConfig } from '@/lib/config/app.config';
import { GAME_STATUS_VALUES } from '@/lib/constants';
import * as schema from '@/lib/db/schema';
import type {
  Database,
  ITeamsApiResponse,
  IPlayersApiResponse,
  IGamesApiResponse,
  IGameResponse,
  IPlayerResponse,
  ITeamResponse,
  IExternalApiSeedingConfig,
} from '@/lib/types';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { errorHandlers } from '@/lib/utils/error-handler';
import { formatDuration } from '@/lib/utils/format-duration';

// Shared functions
export async function fetchNBAData<T>(
  apiClient: ReturnType<typeof createRapidAPIClient>,
  endpoint: string,
  params: Record<string, string> = {},
  componentName = 'External API Seeding'
): Promise<T> {
  try {
    console.log(`📡 Fetching ${endpoint} with params:`, params);
    const data = await apiClient.fetch(endpoint, params);
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data;
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: `Fetch ${endpoint}`,
    });
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

export function createDatabaseConnection(): Database {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { schema }) as Database;
}

export function createApiClient() {
  return createRapidAPIClient(getRapidApiConfig());
}

export function createTimeStep() {
  return async <T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();
    const result = await stepFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ${stepName} completed in ${formatDuration(duration)}`);
    return result;
  };
}

// Shared seeding functions
export async function seedLeagues(
  db: Database,
  apiClient: ReturnType<typeof createRapidAPIClient>,
  componentName = 'External API Seeding'
) {
  console.log('📊 Step 1: Fetching and inserting leagues...');

  const data: { response: string[] } = await fetchNBAData(apiClient, '/leagues', {}, componentName);
  console.log(`📡 Fetched ${data.response.length} leagues from API`);

  if (data.response.length === 0) {
    console.warn('⚠️  No leagues returned from API, skipping leagues seeding');
    return data;
  }

  for (const leagueName of data.response) {
    if (typeof leagueName !== 'string') {
      console.warn('⚠️  Skipping non-string league:', leagueName);
      continue;
    }
    try {
      await db
        .insert(schema.leagues)
        .values({
          name: leagueName,
        })
        .onConflictDoNothing();
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: componentName,
        action: 'Insert league',
      });
      console.error('❌ Error inserting league:', leagueName, error);
    }
  }
  console.log(`✅ Seeded ${data.response.length} leagues`);
  return data;
}

export async function seedSeasons(
  db: Database,
  apiClient: ReturnType<typeof createRapidAPIClient>,
  componentName = 'External API Seeding'
) {
  console.log('📅 Step 2: Fetching and inserting seasons...');

  const data: { response: number[] } = await fetchNBAData(apiClient, '/seasons', {}, componentName);
  console.log(`📡 Fetched ${data.response.length} seasons from API`);

  if (data.response.length === 0) {
    console.warn('⚠️  No seasons returned from API, skipping seasons seeding');
    return data;
  }

  for (const seasonYear of data.response) {
    if (typeof seasonYear !== 'number') {
      console.warn('⚠️  Skipping non-number season:', seasonYear);
      continue;
    }
    try {
      await db
        .insert(schema.seasons)
        .values({
          year: seasonYear,
        })
        .onConflictDoNothing();
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: componentName,
        action: 'Insert season',
      });
      console.error('❌ Error inserting season:', seasonYear, error);
    }
  }
  console.log(`✅ Seeded ${data.response.length} seasons`);
  return data;
}

export async function seedTeams(
  db: Database,
  apiClient: ReturnType<typeof createRapidAPIClient>,
  componentName = 'External API Seeding'
) {
  console.log('🏀 Step 3: Fetching and inserting teams...');

  const data: ITeamsApiResponse = await fetchNBAData(apiClient, '/teams', {}, componentName);
  console.log(`📡 Fetched ${data.response.length} teams from API`);

  if (data.response.length === 0) {
    console.warn('⚠️  No teams returned from API, skipping teams seeding');
    return data;
  }

  for (const team of data.response) {
    try {
      await db
        .insert(schema.teams)
        .values({
          id: team.id?.toString() ?? 'missing-team-id',
          name: team.name ?? 'missing-team-name',
          nickname: team.nickname,
          code: team.code,
          city: team.city,
          logo: team.logo,
          all_star: team.allStar ?? false,
          nba_franchise: team.nbaFranchise ?? false,
          conference: team.leagues?.standard?.conference ?? 'unassigned',
        })
        .onConflictDoNothing();
    } catch (error) {
      // Use centralized error handling
      errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
        component: componentName,
        action: 'Insert team',
      });
      console.error('❌ Error inserting team:', team.name, error);
    }
  }
  console.log(`✅ Seeded ${data.response.length} teams`);
  return data;
}

export function determineSeasonsToSeed(
  allSeasonsSorted: number[],
  config: IExternalApiSeedingConfig
): number[] {
  let seasonsToSeed: number[];

  if (config.specificSeasons && config.specificSeasons.length > 0) {
    // Safe to use non-null assertion here because we've already checked existence and length
    const specificSeasons = config.specificSeasons;
    seasonsToSeed = allSeasonsSorted.filter(s => specificSeasons.includes(s));
  } else if (config.startSeason !== undefined || config.endSeason !== undefined) {
    seasonsToSeed = allSeasonsSorted.filter(s => {
      if (config.startSeason !== undefined && s < config.startSeason) return false;
      if (config.endSeason !== undefined && s > config.endSeason) return false;
      return true;
    });
  } else {
    seasonsToSeed = allSeasonsSorted;
  }

  console.log(`🗓️ Seasons to seed: ${seasonsToSeed.join(', ')}`);
  return seasonsToSeed;
}

export function determineGameStatus(game: IGameResponse): string {
  // Use the actual status from the API response
  const statusShort = game.status.short;
  const statusLong = game.status.long;

  // Map status codes to readable values
  // statusShort is a string, undefined, or null
  if (statusShort === '3' || statusLong?.toLowerCase().includes('finished')) {
    return GAME_STATUS_VALUES.FINISHED;
  }

  // A game is only LIVE if it has a clock value (actual game time)
  if (
    (game.status.clock !== null && game.status.clock !== undefined) ||
    statusLong?.toLowerCase().includes('live')
  ) {
    return GAME_STATUS_VALUES.LIVE;
  }

  // Games that are in progress but not currently live (no clock)
  if (statusShort === '2' || statusShort === '4') {
    return GAME_STATUS_VALUES.IN_PROGRESS;
  }

  if (statusShort === '1' || statusLong?.toLowerCase().includes('scheduled')) {
    return GAME_STATUS_VALUES.SCHEDULED;
  }

  if (
    statusLong?.toLowerCase().includes('cancelled') ||
    statusLong?.toLowerCase().includes('postponed')
  ) {
    return GAME_STATUS_VALUES.CANCELLED;
  }

  // Default to the long status if available, otherwise use short
  return statusLong || statusShort || 'UNKNOWN';
}

export function createGameInsertData(
  game: IGameResponse,
  season: number
): {
  id: string;
  game_type: string;
  season: string;
  nba_game_id: string;
  date: Date;
  stage: number;
  home_team_id: string;
  away_team_id: string;
  home_team_score: number | null;
  away_team_score: number | null;
  status: string;
  status_data: Record<string, unknown>;
  scores: Record<string, unknown>;
  arena: Record<string, unknown>;
  periods: Record<string, unknown>;
  officials: string[];
  times_tied: number;
  lead_changes: number;
  nugget: string | null;
} {
  return {
    id: `${season}-${game.id?.toString() ?? 'missing-game-id'}`,
    game_type: 'nba',
    season: season.toString(),
    nba_game_id: game.id?.toString() ?? 'missing-nba-game-id',
    date: new Date(game.date.start),
    stage: game.stage, // Store the game stage
    home_team_id: game.teams.home.id?.toString() ?? 'missing-home-team-id',
    away_team_id: game.teams.visitors.id?.toString() ?? 'missing-away-team-id',
    home_team_score: game.scores?.home?.points ?? null,
    away_team_score: game.scores?.visitors?.points ?? null,
    status: determineGameStatus(game),
    status_data: game.status ?? {}, // Store the complete status object
    scores: game.scores ?? {}, // Store the complete scores object
    arena: game.arena ?? {}, // Store the complete arena object
    periods: game.periods ?? {}, // Store the complete periods object
    officials: game.officials ?? [], // Store officials array
    times_tied: game.timesTied ?? 0, // Store times tied
    lead_changes: game.leadChanges ?? 0, // Store lead changes
    nugget: game.nugget ?? null, // Store game nugget/summary
  };
}

export async function seedGames(
  db: Database,
  apiClient: ReturnType<typeof createRapidAPIClient>,
  seasonsToSeed: number[],
  isSafeMode = false,
  componentName = 'External API Seeding'
) {
  console.log(
    `🎮 Step 4: Fetching and ${isSafeMode ? 'safely ' : ''}inserting games for all seasons...`
  );

  let totalGamesInserted = 0;

  for (const season of seasonsToSeed) {
    console.log(`   📅 Processing season ${season}...`);

    try {
      const gamesData = await fetchNBAData<IGamesApiResponse>(
        apiClient,
        '/games',
        {
          season: season.toString(),
        },
        componentName
      );

      let gamesInserted = 0;
      for (const game of gamesData.response) {
        const gameData = createGameInsertData(game, season);

        if (isSafeMode) {
          // Check if game already exists
          const existingGame = await db
            .select()
            .from(schema.nba_games)
            .where(eq(schema.nba_games.id, gameData.id));

          if (existingGame.length === 0) {
            // Game doesn't exist, insert it
            await db.insert(schema.nba_games).values(gameData);
            gamesInserted++;
          }
        } else {
          // Insert with conflict handling - try to insert, if conflict then skip
          try {
            await db.insert(schema.nba_games).values(gameData);
            gamesInserted++;
          } catch (error) {
            if (
              error instanceof Error &&
              (error.message.includes('duplicate key') ||
                error.message.includes('violates unique constraint') ||
                error.message.includes('already exists'))
            ) {
              // Game already exists, skip it
              console.log(`     🔄 Game ${gameData.id} already exists, skipping...`);
              continue;
            } else {
              throw error;
            }
          }
        }
      }

      totalGamesInserted += gamesInserted;
      const modeText = isSafeMode ? 'safely seeded' : 'seeded';
      console.log(`   ✅ ${modeText} ${gamesInserted} games for season ${season}`);
    } catch (error) {
      console.warn(`   ⚠️  Could not fetch games for season ${season}:`, error);
      continue; // Continue with next season
    }
  }

  return totalGamesInserted;
}

export async function seedPlayers(
  db: Database,
  apiClient: ReturnType<typeof createRapidAPIClient>,
  seasonsToSeed: number[],
  teamsData: ITeamsApiResponse,
  isSafeMode = false,
  componentName = 'External API Seeding'
) {
  console.log(
    `👤 Step 5: Fetching and ${isSafeMode ? 'safely ' : ''}inserting players for each season + team combination...`
  );

  let totalPlayersInserted = 0;

  for (const season of seasonsToSeed) {
    console.log(`   📅 Processing season ${season}...`);

    for (const team of teamsData.response) {
      console.log(`     🏀 Processing team: ${team.name} for season ${season}...`);

      try {
        const playersData = await fetchNBAData<IPlayersApiResponse>(
          apiClient,
          '/players',
          {
            season: season.toString(),
            team: team.id.toString(),
          },
          componentName
        );

        for (const player of playersData.response) {
          const playerId = player.id.toString();

          if (isSafeMode) {
            // Check if player already exists
            const existingPlayer = await db
              .select()
              .from(schema.nba_players)
              .where(eq(schema.nba_players.id, playerId));

            if (existingPlayer.length === 0) {
              // Player doesn't exist, insert it
              await insertPlayerWithTeams(db, player, team, season, componentName);
              totalPlayersInserted++;
            } else {
              // Player exists - update teams field
              await updatePlayerTeams(db, existingPlayer[0], team, season, componentName);
            }
          } else {
            // Insert with conflict handling (now handled in insertPlayerWithTeams)
            await insertPlayerWithTeams(db, player, team, season, componentName);
            totalPlayersInserted++;
          }
        }
      } catch (error) {
        console.warn(
          `     ⚠️  Could not fetch players for team ${team.name} season ${season}:`,
          error
        );
        continue; // Continue with next team
      }
    }
  }

  console.log(`✅ Total players ${isSafeMode ? 'safely ' : ''}inserted: ${totalPlayersInserted}`);
  console.log(
    `📊 Seeding completed for ${seasonsToSeed.length} seasons and ${teamsData.response.length} teams`
  );
  return totalPlayersInserted;
}

async function insertPlayerWithTeams(
  db: Database,
  player: IPlayerResponse,
  team: ITeamResponse,
  season: number,
  _componentName: string
) {
  const playerId = player.id.toString();

  // Check if player already exists
  const existingPlayer = await db
    .select()
    .from(schema.nba_players)
    .where(eq(schema.nba_players.id, playerId));

  if (existingPlayer.length > 0) {
    // Player already exists, update teams field
    console.log(`     🔄 Player ${playerId} already exists, updating teams...`);
    await updatePlayerTeams(db, existingPlayer[0], team, season, _componentName);
    console.log(`     ✅ Updated teams for existing player ${playerId}`);
    return;
  }

  // Player doesn't exist, insert it
  const teamsData = JSON.stringify([
    {
      season: season.toString(),
      teams: [
        {
          team_id: team.id.toString(),
          team_name: team.name,
        },
      ],
    },
  ]);

  await db.insert(schema.nba_players).values({
    id: playerId,
    first_name: player.firstname ?? 'missing-first-name',
    last_name: player.lastname ?? 'missing-last-name',
    birth: player.birth ? JSON.stringify(player.birth) : null,
    nba: player.nba ? JSON.stringify(player.nba) : null,
    height: player.height ? JSON.stringify(player.height) : null,
    weight: player.weight ? JSON.stringify(player.weight) : null,
    college: player.college,
    affiliation: player.affiliation,
    teams: teamsData,
    leagues: player.leagues ? JSON.stringify(player.leagues) : null,
    image_url: null, // IPlayerResponse doesn't have image property
  });
}

async function updatePlayerTeams(
  db: Database,
  currentPlayer: { id: string; teams: string | null },
  team: ITeamResponse,
  season: number,
  _componentName: string
) {
  let currentTeamsBySeason: Array<{
    season: string;
    teams: Array<{ team_id: string; team_name: string }>;
  }> = [];

  try {
    currentTeamsBySeason = currentPlayer.teams
      ? (JSON.parse(currentPlayer.teams) as Array<{
          season: string;
          teams: Array<{ team_id: string; team_name: string }>;
        }>)
      : [];
  } catch {
    currentTeamsBySeason = [];
  }

  // Find existing season entry or create new one
  const seasonEntry = currentTeamsBySeason.find(s => s.season === season.toString());
  const teamInfo = {
    team_id: team.id.toString(),
    team_name: team.name,
  };

  if (seasonEntry) {
    // Season exists, check if team is already in the list
    if (!seasonEntry.teams.some(t => t.team_id === teamInfo.team_id)) {
      seasonEntry.teams.push(teamInfo);
    }
  } else {
    // Season doesn't exist, create new entry
    currentTeamsBySeason.push({
      season: season.toString(),
      teams: [teamInfo],
    });
  }

  // Update the player with new teams data
  try {
    await db
      .update(schema.nba_players)
      .set({
        teams: JSON.stringify(currentTeamsBySeason),
        updated_at: new Date(),
      })
      .where(eq(schema.nba_players.id, currentPlayer.id));
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: _componentName,
      action: 'Update player teams',
    });
    console.error('❌ Error updating player teams:', currentPlayer.id, error);
  }
}

/**
 * Sync reaction emojis table with application constants
 * This ensures the database table stays in sync with the REACTION_EMOJIS constant
 */
export async function syncReactionEmojis(db: Database, componentName = 'Reaction Emojis Sync') {
  console.log('🔄 Syncing reaction emojis table with application constants...');

  try {
    // Import REACTION_EMOJIS from constants
    const { REACTION_EMOJIS } = await import('@/lib/constants');

    // Get all current emojis from the database
    const existingEmojis = await db.select().from(schema.reactionEmojis);
    const existingEmojiSet = new Set(existingEmojis.map(e => e.emoji));

    // Get all emojis from the application constants
    const constantEmojis = Object.values(REACTION_EMOJIS);
    const constantEmojiSet = new Set(constantEmojis);

    // Find emojis to add (in constants but not in database)
    const emojisToAdd = constantEmojis.filter(emoji => !existingEmojiSet.has(emoji));

    // Find emojis to remove (in database but not in constants)
    const emojisToRemove = existingEmojis.filter(
      emoji => !constantEmojiSet.has(emoji.emoji as any)
    );

    // Add new emojis
    if (emojisToAdd.length > 0) {
      console.log(`➕ Adding ${emojisToAdd.length} new emojis: ${emojisToAdd.join(', ')}`);
      await db.insert(schema.reactionEmojis).values(emojisToAdd.map(emoji => ({ emoji })));
    }

    // Remove old emojis
    if (emojisToRemove.length > 0) {
      console.log(
        `➖ Removing ${emojisToRemove.length} old emojis: ${emojisToRemove.map(e => e.emoji).join(', ')}`
      );
      for (const emojiRecord of emojisToRemove) {
        await db
          .delete(schema.reactionEmojis)
          .where(eq(schema.reactionEmojis.emoji, emojiRecord.emoji));
      }
    }

    if (emojisToAdd.length === 0 && emojisToRemove.length === 0) {
      console.log('✅ Reaction emojis table is already in sync with application constants');
    } else {
      console.log('✅ Reaction emojis table synced successfully');
    }
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: 'Sync reaction emojis',
    });
    console.error('❌ Error syncing reaction emojis:', error);
    throw error;
  }
}
