// Shared utilities for external API seeding
import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { getRapidApiConfig } from '@/lib/config/app.config';
import { REACTION_EMOJIS } from '@/lib/constants';
import * as schema from '@/lib/db/schema';
import { createRapidAPIClient } from '@/lib/utils/api-client';
import { errorHandlers } from '@/lib/utils/error-handler';
import { formatDuration } from '@/lib/utils/format-duration';
import type {
  Database,
  ITeamsApiResponse,
  IPlayersApiResponse,
  IGamesApiResponse,
  IGameResponse,
  IPlayerResponse,
  ITeamResponse,
  IExternalApiSeedingConfig,
} from '@/types';

// Shared functions
export async function fetchNBAData<T>(
  apiClient: ReturnType<typeof createRapidAPIClient>,
  endpoint: string,
  params: Record<string, unknown> = {},
  componentName = 'External API Seeding'
): Promise<T> {
  try {
    console.log(`📡 Fetching ${endpoint} with params:`, params);
    const data = await apiClient.fetch(endpoint, params as Record<string, string>);
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data as T;
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
  console.log(`📡 Fetched ${data.response?.length || 0} teams from API`);

  if (!data.response || data.response.length === 0) {
    console.warn('⚠️  No teams returned from API, skipping teams seeding');
    return data;
  }

  for (const team of data.response || []) {
    try {
      await db
        .insert(schema.basketball_teams)
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
          leagues: team.leagues ?? null, // Store comprehensive league data as JSONB
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
  console.log(`✅ Seeded ${data.response?.length || 0} teams`);

  // Invalidate NBA Hub counts cache since teams count changed
  try {
    const { NBAHubCacheUtils } = await import('@/lib/cache');
    await NBAHubCacheUtils.invalidateSpecificCountCaches('teams');
    console.log('✅ Invalidated NBA Hub teams count cache');
  } catch (cacheError) {
    console.warn('Failed to invalidate NBA Hub teams count cache:', cacheError);
  }

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

export function createGameInsertData(
  game: IGameResponse,
  season: number
): {
  id: string;
  season: string;
  game_id: string;
  date: Date;
  stage: number;
  teams: Record<string, unknown>;
  status: Record<string, unknown>;
  scores: Record<string, unknown>;
  arena: Record<string, unknown>;
  periods: Record<string, unknown>;
  officials: string[];
  times_tied: number;
  lead_changes: number;
  nugget: string | null;
} {
  // Fix timezone issue: ensure date is interpreted as local time, not UTC
  const dateString = typeof game.date === 'string' ? game.date : game.date.start;
  let gameDate: Date;

  if (dateString.includes('T')) {
    // If it's already a full datetime string, use it as-is
    gameDate = new Date(dateString);
  } else {
    // If it's just a date string (YYYY-MM-DD), append time to avoid UTC interpretation
    // NBA games are typically played in the evening Eastern Time, so use 7 PM ET (midnight UTC next day)
    gameDate = new Date(dateString + 'T19:00:00-05:00'); // 7 PM Eastern Time
  }

  return {
    id: `${season}-${game.id?.toString() ?? 'missing-game-id'}`,
    season: season.toString(),
    game_id: game.id?.toString() ?? 'missing-nba-game-id',
    date: gameDate,
    stage: game.stage || 0, // Store the game stage
    teams: game.teams ?? {}, // Store the complete teams object with home and away team data
    status:
      typeof game.status === 'string'
        ? { short: game.status, long: game.status }
        : (game.status ?? {}), // Store the complete status object
    scores: game.scores ?? {}, // Store the complete scores object
    arena: game.arena ?? {}, // Store the complete arena object
    periods: game.periods ?? {}, // Store the complete periods object
    officials: game.officials ?? [], // Store officials array
    times_tied: (game as IGameResponse & { timesTied?: number }).timesTied ?? 0, // Store times tied
    lead_changes: (game as IGameResponse & { leadChanges?: number }).leadChanges ?? 0, // Store lead changes
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
      for (const externalGame of gamesData.response || []) {
        // Transform external game to internal format
        const game: IGameResponse = {
          id: externalGame.id.toString(),
          date:
            typeof externalGame.date === 'string'
              ? { start: externalGame.date }
              : { start: externalGame.date?.start || '' },
          home_team: externalGame.teams?.home?.name || '',
          away_team: externalGame.teams?.visitors?.name || '',
          home_score: externalGame.scores?.home?.points || 0,
          away_score: externalGame.scores?.visitors?.points || 0,
          status:
            typeof externalGame.status === 'string'
              ? { short: externalGame.status }
              : {
                  short: externalGame.status?.short || '',
                  long: externalGame.status?.long,
                  clock: externalGame.status?.clock,
                },
          teams: externalGame.teams
            ? {
                home: {
                  id: externalGame.teams.home?.id?.toString() || '',
                  name: externalGame.teams.home?.name || '',
                  nickname: externalGame.teams.home?.nickname || '',
                  code: externalGame.teams.home?.code || '',
                  logo: externalGame.teams.home?.logo || '',
                },
                visitors: {
                  id: externalGame.teams.visitors?.id?.toString() || '',
                  name: externalGame.teams.visitors?.name || '',
                  nickname: externalGame.teams.visitors?.nickname || '',
                  code: externalGame.teams.visitors?.code || '',
                  logo: externalGame.teams.visitors?.logo || '',
                },
              }
            : undefined,
          scores: externalGame.scores
            ? {
                home: {
                  points: externalGame.scores.home?.points || 0,
                },
                visitors: {
                  points: externalGame.scores.visitors?.points || 0,
                },
              }
            : undefined,
          season: externalGame.season,
          stage:
            typeof externalGame.stage === 'string'
              ? parseInt(externalGame.stage) || 0
              : externalGame.stage || 0,
          nugget: externalGame.nugget,
          arena: externalGame.arena
            ? {
                name: externalGame.arena.name || '',
                city: externalGame.arena.city || '',
                state: externalGame.arena.state || '',
              }
            : undefined,
          periods: externalGame.periods
            ? {
                current: externalGame.periods.current || 0,
                total: externalGame.periods.total || 0,
              }
            : undefined,
        };
        const gameData = createGameInsertData(game, season);

        if (isSafeMode) {
          // Check if game already exists
          const existingGame = await db
            .select()
            .from(schema.basketball_games)
            .where(eq(schema.basketball_games.id, gameData.id));

          if (existingGame.length === 0) {
            // Game doesn't exist, insert it
            await db.insert(schema.basketball_games).values(gameData);
            gamesInserted++;
          }
        } else {
          // Insert with conflict handling - overwrite on conflict
          await db.insert(schema.basketball_games).values(gameData).onConflictDoNothing();
          gamesInserted++;
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

  // Invalidate NBA Hub counts cache since games count changed
  try {
    const { NBAHubCacheUtils } = await import('@/lib/cache');
    await NBAHubCacheUtils.invalidateSpecificCountCaches('games');
    console.log('✅ Invalidated NBA Hub games count cache');
  } catch (cacheError) {
    console.warn('Failed to invalidate NBA Hub games count cache:', cacheError);
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

    for (const team of teamsData.response || []) {
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

        for (const externalPlayer of playersData.response) {
          // Transform external player to internal format
          const player: IPlayerResponse = {
            id: externalPlayer.id.toString(),
            name: `${externalPlayer.firstname || ''} ${externalPlayer.lastname || ''}`.trim(),
            position:
              externalPlayer.leagues?.standard?.position ||
              externalPlayer.leagues?.standard?.pos ||
              '',
            team: externalPlayer.leagues?.standard?.team || team.name,
            first_name: externalPlayer.firstname || '',
            last_name: externalPlayer.lastname || '',
            birth: externalPlayer.birth,
            nba: externalPlayer.nba,
            height:
              typeof externalPlayer.height === 'string'
                ? { feets: externalPlayer.height, inches: '', meters: '' }
                : externalPlayer.height,
            weight:
              typeof externalPlayer.weight === 'string'
                ? { pounds: externalPlayer.weight, kilograms: '' }
                : externalPlayer.weight,
            college: externalPlayer.college || '',
            affiliation: externalPlayer.affiliation || '',
            leagues: externalPlayer.leagues,
            image_url: externalPlayer.leagues?.standard?.logo || '',
          };

          const playerId = player.id;

          if (isSafeMode) {
            // Check if player already exists
            const existingPlayer = await db
              .select()
              .from(schema.basketball_players)
              .where(eq(schema.basketball_players.id, playerId));

            if (existingPlayer.length === 0) {
              // Player doesn't exist, insert it
              await insertPlayerWithTeams(db, player, team, season, componentName);
              totalPlayersInserted++;
            } else {
              // Player exists - update teams field
              await updatePlayerTeams(
                db,
                existingPlayer[0] as { id: string; teams: string | null },
                team,
                season,
                componentName
              );
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
    `📊 Seeding completed for ${seasonsToSeed.length} seasons and ${teamsData.response?.length || 0} teams`
  );

  // Invalidate NBA Hub counts cache since players count changed
  try {
    const { NBAHubCacheUtils } = await import('@/lib/cache');
    await NBAHubCacheUtils.invalidateSpecificCountCaches('players');
    console.log('✅ Invalidated NBA Hub players count cache');
  } catch (cacheError) {
    console.warn('Failed to invalidate NBA Hub players count cache:', cacheError);
  }

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
    .from(schema.basketball_players)
    .where(eq(schema.basketball_players.id, playerId));

  if (existingPlayer.length > 0) {
    // Player already exists, update teams field
    console.log(`     🔄 Player ${playerId} already exists, updating teams...`);
    await updatePlayerTeams(
      db,
      existingPlayer[0] as { id: string; teams: string | null },
      team,
      season,
      _componentName
    );
    console.log(`     ✅ Updated teams for existing player ${playerId}`);
    return;
  }

  // Player doesn't exist, insert it
  const teamsData = [
    {
      season: season.toString(),
      teams: [
        {
          team_id: team.id.toString(),
          team_name: team.name,
        },
      ],
    },
  ];

  await db
    .insert(schema.basketball_players)
    .values({
      id: playerId,
      first_name: player.first_name ?? 'missing-first-name',
      last_name: player.last_name ?? 'missing-last-name',
      birth: player.birth || '{}', // Store as JSONB object directly
      nba: player.nba || '{}', // Store as JSONB object directly
      height: player.height || '{}', // Store as JSONB object directly
      weight: player.weight || '{}', // Store as JSONB object directly
      college: player.college,
      affiliation: player.affiliation,
      teams: teamsData, // Store as JSONB array directly
      leagues: player.leagues || '{}', // Store as JSONB object directly
      image_url: '', // IPlayerResponse doesn't have image property
    })
    .onConflictDoNothing();
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
      .update(schema.basketball_players)
      .set({
        teams: currentTeamsBySeason, // Store as JSONB array directly
        updated_at: new Date(),
      })
      .where(eq(schema.basketball_players.id, currentPlayer.id));
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
    const constantEmojis = Object.values(REACTION_EMOJIS) as string[];
    const constantEmojiSet = new Set(constantEmojis);

    // Find emojis to add (in constants but not in database)
    const emojisToAdd = constantEmojis.filter(emoji => !existingEmojiSet.has(emoji));

    // Find emojis to remove (in database but not in constants)
    const emojisToRemove = existingEmojis.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emoji => !constantEmojiSet.has(emoji.emoji as any)
    );

    // Add new emojis
    if (emojisToAdd.length > 0) {
      console.log(`➕ Adding ${emojisToAdd.length} new emojis: ${emojisToAdd.join(', ')}`);
      await db
        .insert(schema.reactionEmojis)
        .values(emojisToAdd.map(emoji => ({ emoji })))
        .onConflictDoNothing();
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

/**
 * Seed public comments for NBA games from the latest season
 * Creates realistic comments using faker for 10% of games
 */
export async function seedPublicComments(db: Database, componentName = 'Public Comments Seeding') {
  console.log('💬 Seeding public comments for latest season games...');

  try {
    // Get the latest season
    const latestSeason = await db
      .select()
      .from(schema.seasons)
      .orderBy(desc(schema.seasons.year))
      .limit(1);

    if (latestSeason.length === 0) {
      console.warn('⚠️  No seasons found, skipping public comments seeding');
      return;
    }

    const seasonYear = latestSeason[0].year;
    console.log(`📅 Using season ${seasonYear} for comments seeding`);

    // Get 2% of games from the latest season
    const allGames = await db
      .select()
      .from(schema.basketball_games)
      .where(eq(schema.basketball_games.season, seasonYear.toString()));

    const gamesToComment = Math.max(1, Math.floor(allGames.length * 0.02));
    const selectedGames = faker.helpers.arrayElements(allGames, gamesToComment);

    console.log(
      `🎯 Selected ${selectedGames.length} games (${gamesToComment} out of ${allGames.length}) for comments`
    );

    let commentCount = 0;
    const createdComments: Array<{ id: string; gameId: string }> = [];

    // Generate realistic comments for each selected game
    for (const game of selectedGames) {
      // Generate 2-5 comments per game
      const numComments = faker.number.int({ min: 2, max: 5 });

      for (let i = 0; i < numComments; i++) {
        const commentId = faker.string.uuid();
        const commentContent = generateGameComment(game);

        await db
          .insert(schema.publicComments)
          .values({
            id: commentId,
            parent_id: game.id,
            parent_type: 'BASKETBALL_GAME' as const,
            content: commentContent,
            anonymous_name: faker.internet.displayName(),
            anonymous_email: faker.internet.email(),
            depth: 0,
            is_approved: true,
          })
          .onConflictDoNothing();

        createdComments.push({ id: commentId, gameId: game.id });
        commentCount++;
      }
    }

    // Generate nested comments (replies) up to 5 levels deep for some of the created comments
    const commentsToReplyTo = faker.helpers.arrayElements(
      createdComments,
      Math.floor(createdComments.length * 0.5) // Increased from 0.3 to 0.5 for more nested comments
    );
    let totalNestedCommentCount = 0;
    let totalNestedReactionCount = 0;

    console.log(
      `🌳 Creating nested comments up to 5 levels deep for ${commentsToReplyTo.length} parent comments...`
    );

    for (const parentComment of commentsToReplyTo) {
      const nestedResult = await createNestedComments(
        db,
        parentComment.id,
        'PUBLIC_COMMENT',
        0, // Start at depth 0 (parent is depth 0, so children start at depth 1)
        5, // Max depth of 5 levels
        componentName
      );
      totalNestedCommentCount += nestedResult.commentCount;
      totalNestedReactionCount += nestedResult.reactionCount;
    }

    // Generate reactions for some comments
    const commentsToReactTo = faker.helpers.arrayElements(
      createdComments,
      Math.floor(createdComments.length * 0.3)
    );
    let commentReactionCount = 0;

    for (const comment of commentsToReactTo) {
      // Generate 1-3 reactions per comment
      const numReactions = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < numReactions; i++) {
        const reactionId = faker.string.uuid();
        const emoji = faker.helpers.arrayElement(Object.values(REACTION_EMOJIS));

        await db
          .insert(schema.publicReactions)
          .values({
            id: reactionId,
            target_id: comment.id,
            target_type: 'PUBLIC_COMMENT' as const,
            emoji: emoji,
            anonymous_name: faker.internet.displayName(),
            anonymous_email: faker.internet.email(),
            is_approved: true,
          })
          .onConflictDoNothing();

        commentReactionCount++;
      }
    }

    console.log(
      `✅ Seeded ${commentCount} public comments, ${totalNestedCommentCount} nested comments (up to 5 levels deep), ${commentReactionCount} parent comment reactions, and ${totalNestedReactionCount} nested comment reactions for ${selectedGames.length} games`
    );
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: 'Seed public comments',
    });
    console.error('❌ Error seeding public comments:', error);
    throw error;
  }
}

/**
 * Generate realistic game comments using faker
 */
function generateGameComment(game: {
  id: string;
  home_team?: { name: string } | null;
  visitor_team?: { name: string } | null;
}): string {
  const commentTemplates = [
    `What a game! ${game.home_team?.name || 'Home team'} vs ${game.visitor_team?.name || 'Away team'} was incredible!`,
    `Amazing performance by both teams. The energy was off the charts! 🔥`,
    `This game had everything - great plays, intense moments, and fantastic basketball!`,
    `Can't believe how close this game was! Every possession mattered.`,
    `The atmosphere must have been electric! Wish I could have been there.`,
    `What a nail-biter! This is why I love basketball.`,
    `Both teams brought their A-game tonight. Respect to all the players!`,
    `This game will be remembered for a long time. Absolutely incredible!`,
    `The intensity in this game was something else. Pure basketball at its finest!`,
    `What a display of skill and determination from both sides!`,
  ];

  return faker.helpers.arrayElement(commentTemplates);
}

/**
 * Generate realistic nested comments based on depth level
 */
function generateNestedComment(depth: number): string {
  const templatesByDepth = {
    0: [
      'What a game! The energy was incredible!',
      'Amazing performance by both teams!',
      'This game had everything - great plays and intense moments!',
      "Can't believe how close this game was!",
      'The atmosphere must have been electric!',
    ],
    1: [
      'Totally agree! This was an amazing game.',
      'I was there and the atmosphere was incredible!',
      "Couldn't have said it better myself!",
      'This game will be remembered for years to come.',
      'The players really brought their A-game tonight.',
    ],
    2: [
      'Exactly! The intensity was off the charts!',
      'You nailed it! This is why I love basketball.',
      'So true! Every possession mattered in this one.',
      'I completely agree with your take on this.',
      'Well said! The players showed incredible heart.',
    ],
    3: [
      "Right on! Couldn't have said it better.",
      'Absolutely! This game was something special.',
      "You're spot on! The energy was contagious.",
      'Perfect analysis! This is basketball at its finest.',
      'Exactly my thoughts! What a performance.',
    ],
    4: [
      'This! 👏👏👏',
      '100% agree!',
      'You said it perfectly!',
      "Couldn't agree more!",
      'This is the truth!',
    ],
    5: ['Facts! 💯', 'This!', 'Exactly!', 'So true!', 'Agreed!'],
  };

  const templates = templatesByDepth[depth as keyof typeof templatesByDepth] || templatesByDepth[5];
  return faker.helpers.arrayElement(templates);
}

/**
 * Recursively create nested comments up to specified depth
 */
async function createNestedComments(
  db: Database,
  parentId: string,
  parentType: 'PUBLIC_COMMENT' | 'BASKETBALL_GAME' | 'BASKETBALL_TEAM' | 'BASKETBALL_PLAYER',
  currentDepth: number,
  maxDepth: number,
  componentName: string
): Promise<{ commentCount: number; reactionCount: number }> {
  if (currentDepth >= maxDepth) {
    return { commentCount: 0, reactionCount: 0 };
  }

  let totalComments = 0;
  let totalReactions = 0;

  // Determine how many child comments to create based on depth
  // Deeper levels have fewer comments to maintain realism
  const commentCounts = [2, 3, 2, 1, 1]; // Comments per level: 0->1, 1->2, 2->3, 3->4, 4->5
  const numComments = commentCounts[currentDepth] || 1;

  for (let i = 0; i < numComments; i++) {
    // Only create child comments for a percentage of parent comments to keep it realistic
    if (faker.datatype.boolean({ probability: 0.6 })) {
      const commentId = faker.string.uuid();
      const commentContent = generateNestedComment(currentDepth + 1);

      try {
        await db
          .insert(schema.publicComments)
          .values({
            id: commentId,
            parent_id: parentId,
            parent_type: parentType,
            content: commentContent,
            anonymous_name: faker.internet.displayName(),
            anonymous_email: faker.internet.email(),
            depth: currentDepth + 1,
            is_approved: true,
          })
          .onConflictDoNothing();

        totalComments++;

        // Generate reactions for some nested comments (higher probability for deeper levels)
        const reactionProbability = Math.min(0.4 + currentDepth * 0.1, 0.8); // 40% to 80% based on depth
        if (faker.datatype.boolean({ probability: reactionProbability })) {
          const numReactions = faker.number.int({ min: 1, max: Math.max(1, 4 - currentDepth) }); // Fewer reactions at deeper levels

          for (let j = 0; j < numReactions; j++) {
            const reactionId = faker.string.uuid();
            const emoji = faker.helpers.arrayElement(Object.values(REACTION_EMOJIS));

            await db
              .insert(schema.publicReactions)
              .values({
                id: reactionId,
                target_id: commentId,
                target_type: 'PUBLIC_COMMENT' as const,
                emoji: emoji,
                anonymous_name: faker.internet.displayName(),
                anonymous_email: faker.internet.email(),
                is_approved: true,
              })
              .onConflictDoNothing();

            totalReactions++;
          }
        }

        // Recursively create nested comments for this comment
        const nestedResult = await createNestedComments(
          db,
          commentId,
          'PUBLIC_COMMENT',
          currentDepth + 1,
          maxDepth,
          componentName
        );
        totalComments += nestedResult.commentCount;
        totalReactions += nestedResult.reactionCount;
      } catch (error) {
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: componentName,
          action: 'Create nested comment',
        });
        console.error(`❌ Error creating nested comment at depth ${currentDepth + 1}:`, error);
      }
    }
  }

  return { commentCount: totalComments, reactionCount: totalReactions };
}

/**
 * Generate realistic user comment content based on depth level
 */
function generateUserCommentContent(depth: number): string {
  const templatesByDepth = {
    0: [
      'Great game! The energy was incredible!',
      'Amazing performance by both teams!',
      'This game had everything - great plays and intense moments!',
      "Can't believe how close this game was!",
      'The atmosphere must have been electric!',
      'What a nail-biter! This is why I love basketball.',
      'Both teams brought their A-game tonight. Respect!',
      'This game will be remembered for a long time.',
      'The intensity in this game was something else.',
      'What a display of skill and determination!',
    ],
    1: [
      'Totally agree! This was an amazing game.',
      'I was there and the atmosphere was incredible!',
      "Couldn't have said it better myself!",
      'This game will be remembered for years to come.',
      'The players really brought their A-game tonight.',
      'What a performance by both teams!',
      "I've been following this team all season and this was their best game yet.",
      'The energy in the arena was off the charts!',
      'This is why I love basketball - games like this!',
      "Absolutely incredible! Can't wait for the next one.",
    ],
    2: [
      'Exactly! The intensity was off the charts!',
      'You nailed it! This is why I love basketball.',
      'So true! Every possession mattered in this one.',
      'I completely agree with your take on this.',
      'Well said! The players showed incredible heart.',
      "Right on! Couldn't have said it better.",
      'Absolutely! This game was something special.',
      "You're spot on! The energy was contagious.",
      'Perfect analysis! This is basketball at its finest.',
      'Exactly my thoughts! What a performance.',
    ],
    3: [
      'This! 👏👏👏',
      '100% agree!',
      'You said it perfectly!',
      "Couldn't agree more!",
      'This is the truth!',
      'Facts! 💯',
      'This!',
      'Exactly!',
      'So true!',
      'Agreed!',
    ],
    4: ['Facts! 💯', 'This!', 'Exactly!', 'So true!', 'Agreed!'],
    5: ['Facts! 💯', 'This!', 'Exactly!', 'So true!', 'Agreed!'],
  };

  const templates = templatesByDepth[depth as keyof typeof templatesByDepth] || templatesByDepth[5];
  return faker.helpers.arrayElement(templates);
}

/**
 * Recursively create nested user comments up to specified depth
 */
async function createNestedUserComments(
  db: Database,
  parentId: string,
  parentType: 'COMMENT' | 'GAME_LOG',
  currentDepth: number,
  maxDepth: number,
  users: Array<{ id: string }>,
  componentName: string
): Promise<{ commentCount: number; reactionCount: number }> {
  if (currentDepth >= maxDepth) {
    return { commentCount: 0, reactionCount: 0 };
  }

  let totalComments = 0;
  let totalReactions = 0;

  // Determine how many child comments to create based on depth
  // Deeper levels have fewer comments to maintain realism
  const commentCounts = [2, 3, 2, 1, 1]; // Comments per level: 0->1, 1->2, 2->3, 3->4, 4->5
  const numComments = commentCounts[currentDepth] || 1;

  for (let i = 0; i < numComments; i++) {
    // Only create child comments for a percentage of parent comments to keep it realistic
    if (faker.datatype.boolean({ probability: 0.6 })) {
      const commentId = faker.string.uuid();
      const commentContent = generateUserCommentContent(currentDepth + 1);
      const commenter = faker.helpers.arrayElement(users);

      try {
        await db
          .insert(schema.comments)
          .values({
            id: commentId,
            user_id: commenter.id,
            parent_id: parentId,
            parent_type: parentType,
            content: commentContent,
            depth: currentDepth + 1,
          })
          .onConflictDoNothing();

        totalComments++;

        // Generate reactions for some nested comments (higher probability for deeper levels)
        const reactionProbability = Math.min(0.4 + currentDepth * 0.1, 0.8); // 40% to 80% based on depth
        if (faker.datatype.boolean({ probability: reactionProbability })) {
          const numReactions = faker.number.int({ min: 1, max: Math.max(1, 4 - currentDepth) }); // Fewer reactions at deeper levels

          for (let j = 0; j < numReactions; j++) {
            const reactionId = faker.string.uuid();
            const emoji = faker.helpers.arrayElement(Object.values(REACTION_EMOJIS));
            const reactor = faker.helpers.arrayElement(users);

            await db
              .insert(schema.reactions)
              .values({
                id: reactionId,
                user_id: reactor.id,
                target_id: commentId,
                target_type: 'COMMENT' as const,
                emoji: emoji,
              })
              .onConflictDoNothing();

            totalReactions++;
          }
        }

        // Recursively create nested comments for this comment
        const nestedResult = await createNestedUserComments(
          db,
          commentId,
          'COMMENT',
          currentDepth + 1,
          maxDepth,
          users,
          componentName
        );
        totalComments += nestedResult.commentCount;
        totalReactions += nestedResult.reactionCount;
      } catch (error) {
        errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
          component: componentName,
          action: 'Create nested user comment',
        });
        console.error(`❌ Error creating nested user comment at depth ${currentDepth + 1}:`, error);
      }
    }
  }

  return { commentCount: totalComments, reactionCount: totalReactions };
}

/**
 * Seed user comments for game logs with nested comments up to 5 levels deep
 */
export async function seedUserComments(db: Database, componentName = 'User Comments Seeding') {
  console.log('💬 Seeding user comments for game logs with nested comments...');

  try {
    // Get some users for commenting
    const users = await db.select().from(schema.users).limit(20); // Limit to 20 users for performance

    if (users.length === 0) {
      console.warn('⚠️  No users found, skipping user comments seeding');
      return;
    }

    // Get some game logs to comment on
    const gameLogs = await db.select().from(schema.game_logs).limit(10); // Limit to 10 game logs for performance

    if (gameLogs.length === 0) {
      console.warn('⚠️  No game logs found, skipping user comments seeding');
      return;
    }

    console.log(`📅 Using ${users.length} users and ${gameLogs.length} game logs for comments`);

    let commentCount = 0;
    const createdComments: Array<{ id: string; gameLogId: string }> = [];

    // Generate realistic comments for each selected game log
    for (const gameLog of gameLogs) {
      // Generate 3-8 comments per game log (increased from 2-5)
      const numComments = faker.number.int({ min: 3, max: 8 });

      for (let i = 0; i < numComments; i++) {
        const commentId = faker.string.uuid();
        const commentContent = generateUserCommentContent(0);
        const commenter = faker.helpers.arrayElement(users);

        // Skip if same user as game log author
        if (commenter.id === gameLog.user_id) continue;

        await db
          .insert(schema.comments)
          .values({
            id: commentId,
            user_id: commenter.id,
            parent_id: gameLog.id,
            parent_type: 'GAME_LOG' as const,
            content: commentContent,
            depth: 0,
          })
          .onConflictDoNothing();

        createdComments.push({ id: commentId, gameLogId: gameLog.id });
        commentCount++;
      }
    }

    // Generate nested comments (replies) up to 5 levels deep for some of the created comments
    const commentsToReplyTo = faker.helpers.arrayElements(
      createdComments,
      Math.floor(createdComments.length * 0.5) // Increased from 30% to 50% of comments get nested replies
    );
    let totalNestedCommentCount = 0;
    let totalNestedReactionCount = 0;

    console.log(
      `🌳 Creating nested user comments up to 5 levels deep for ${commentsToReplyTo.length} parent comments...`
    );

    for (const parentComment of commentsToReplyTo) {
      const nestedResult = await createNestedUserComments(
        db,
        parentComment.id,
        'COMMENT',
        0, // Start at depth 0 (parent is depth 0, so children start at depth 1)
        5, // Max depth of 5 levels
        users,
        componentName
      );
      totalNestedCommentCount += nestedResult.commentCount;
      totalNestedReactionCount += nestedResult.reactionCount;
    }

    // Generate reactions for some parent comments
    const commentsToReactTo = faker.helpers.arrayElements(
      createdComments,
      Math.floor(createdComments.length * 0.3)
    );
    let commentReactionCount = 0;

    for (const comment of commentsToReactTo) {
      // Generate 1-3 reactions per comment
      const numReactions = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < numReactions; i++) {
        const reactionId = faker.string.uuid();
        const emoji = faker.helpers.arrayElement(Object.values(REACTION_EMOJIS));
        const reactor = faker.helpers.arrayElement(users);

        await db
          .insert(schema.reactions)
          .values({
            id: reactionId,
            user_id: reactor.id,
            target_id: comment.id,
            target_type: 'COMMENT' as const,
            emoji: emoji,
          })
          .onConflictDoNothing();

        commentReactionCount++;
      }
    }

    console.log(
      `✅ Seeded ${commentCount} user comments, ${totalNestedCommentCount} nested comments (up to 5 levels deep), ${commentReactionCount} parent comment reactions, and ${totalNestedReactionCount} nested comment reactions for ${gameLogs.length} game logs`
    );
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: 'Seed user comments',
    });
    console.error('❌ Error seeding user comments:', error);
    throw error;
  }
}

/**
 * Seed user reactions for game logs
 */
export async function seedUserReactions(db: Database, componentName = 'User Reactions Seeding') {
  console.log('👍 Seeding user reactions for game logs...');

  try {
    // Get some users for reacting
    const users = await db.select().from(schema.users).limit(20); // Limit to 20 users for performance

    if (users.length === 0) {
      console.warn('⚠️  No users found, skipping user reactions seeding');
      return;
    }

    // Get some game logs to react to
    const gameLogs = await db.select().from(schema.game_logs).limit(10); // Limit to 10 game logs for performance

    if (gameLogs.length === 0) {
      console.warn('⚠️  No game logs found, skipping user reactions seeding');
      return;
    }

    console.log(
      `🎯 Selected ${gameLogs.length} game logs for reactions with ${users.length} users`
    );

    // Common reaction emojis for game logs
    const reactionEmojis = Object.values(REACTION_EMOJIS);

    let reactionCount = 0;

    // Generate realistic reactions for each selected game log
    for (const gameLog of gameLogs) {
      // Generate 2-8 reactions per game log
      const numReactions = faker.number.int({ min: 2, max: 8 });

      for (let i = 0; i < numReactions; i++) {
        const reactionId = faker.string.uuid();
        const emoji = faker.helpers.arrayElement(reactionEmojis);
        const reactor = faker.helpers.arrayElement(users);

        // Skip if same user as game log author
        if (reactor.id === gameLog.user_id) continue;

        await db
          .insert(schema.reactions)
          .values({
            id: reactionId,
            user_id: reactor.id,
            target_id: gameLog.id,
            target_type: 'GAME_LOG' as const,
            emoji: emoji,
          })
          .onConflictDoNothing();

        reactionCount++;
      }
    }

    console.log(`✅ Seeded ${reactionCount} user reactions for ${gameLogs.length} game logs`);
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: 'Seed user reactions',
    });
    console.error('❌ Error seeding user reactions:', error);
    throw error;
  }
}

/**
 * Seed public reactions for NBA games from the latest season
 * Creates realistic reactions using faker for 10% of games
 */
export async function seedPublicReactions(
  db: Database,
  componentName = 'Public Reactions Seeding'
) {
  console.log('👍 Seeding public reactions for latest season games...');

  try {
    // Get the latest season
    const latestSeason = await db
      .select()
      .from(schema.seasons)
      .orderBy(desc(schema.seasons.year))
      .limit(1);

    if (latestSeason.length === 0) {
      console.warn('⚠️  No seasons found, skipping public reactions seeding');
      return;
    }

    const seasonYear = latestSeason[0].year;
    console.log(`📅 Using season ${seasonYear} for reactions seeding`);

    // Get 10% of games from the latest season
    const allGames = await db
      .select()
      .from(schema.basketball_games)
      .where(eq(schema.basketball_games.season, seasonYear.toString()));

    const gamesToReact = Math.max(1, Math.floor(allGames.length * 0.05));
    const selectedGames = faker.helpers.arrayElements(allGames, gamesToReact);

    console.log(
      `🎯 Selected ${selectedGames.length} games (${gamesToReact} out of ${allGames.length}) for reactions`
    );

    // Common reaction emojis for basketball games
    const reactionEmojis = Object.values(REACTION_EMOJIS);

    let reactionCount = 0;

    // Generate realistic reactions for each selected game
    for (const game of selectedGames) {
      // Generate 2-8 reactions per game
      const numReactions = faker.number.int({ min: 5, max: 100 });

      for (let i = 0; i < numReactions; i++) {
        const reactionId = faker.string.uuid();
        const emoji = faker.helpers.arrayElement(reactionEmojis);

        await db
          .insert(schema.publicReactions)
          .values({
            id: reactionId,
            target_id: game.id,
            target_type: 'BASKETBALL_GAME' as const,
            emoji: emoji,
            anonymous_name: faker.internet.displayName(),
            anonymous_email: faker.internet.email(),
            is_approved: true,
          })
          .onConflictDoNothing();

        reactionCount++;
      }
    }

    console.log(`✅ Seeded ${reactionCount} game reactions for ${selectedGames.length} games`);
  } catch (error) {
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: componentName,
      action: 'Seed public reactions',
    });
    console.error('❌ Error seeding public reactions:', error);
    throw error;
  }
}
