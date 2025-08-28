// Load environment variables from .env files
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { getRapidApiConfig } from '@/lib/config/app.config';
import type {
  Database,
  ITeamsApiResponse,
  IPlayersApiResponse,
  IGamesApiResponse,
} from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';
import * as schema from '@src/lib/db/schema';
import { createRapidAPIClient } from '@src/lib/utils/api-client';
import { formatDuration } from '@src/lib/utils/format-duration';

// Fetch real NBA data from API
async function fetchNBAData<T>(
  apiClient: ReturnType<typeof createRapidAPIClient>,
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  try {
    console.log(`📡 Fetching ${endpoint} with params:`, params);
    const data = await apiClient.fetch<T>(endpoint, params);
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data;
  } catch (error) {
    // Use centralized error handling
    errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
      component: 'External API Seeding',
      action: `Fetch ${endpoint}`,
    });
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

export async function seedExternalApiData(_optimizationConfig?: unknown) {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  // Initialize API client here, after environment variables are loaded
  const apiClient = createRapidAPIClient(getRapidApiConfig());

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema }) as Database;

  console.log('🌱 Starting external API data seeding...');

  // Timing utility function
  const timeStep = async <T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();
    const result = await stepFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ${stepName} completed in ${formatDuration(duration)}`);
    return result;
  };

  try {
    // Step 1: Fetch and insert leagues
    console.log('📊 Step 1: Fetching and inserting leagues...');
    await timeStep('League fetching and insertion', async () => {
      const data: { response: string[] } = await fetchNBAData(apiClient, '/leagues');
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
            component: 'External API Seeding',
            action: 'Insert league',
          });
          console.error('❌ Error inserting league:', leagueName, error);
        }
      }
      console.log(`✅ Seeded ${data.response.length} leagues`);
      return data;
    });

    // Step 2: Fetch and insert seasons
    console.log('📅 Step 2: Fetching and inserting seasons...');
    const seasonsData = await timeStep('Season fetching and insertion', async () => {
      const data: { response: number[] } = await fetchNBAData(apiClient, '/seasons');
      console.log(`📡 Fetched ${data.response.length} seasons from API`);

      if (data.response.length === 0) {
        console.warn('⚠️  No seasons returned from API, skipping seasons seeding');
        return data;
      }

      for (const year of data.response) {
        if (typeof year !== 'number') {
          console.warn('⚠️  Skipping non-number season:', year);
          continue;
        }
        try {
          await db
            .insert(schema.seasons)
            .values({
              year,
            })
            .onConflictDoNothing();
        } catch (error) {
          // Use centralized error handling
          errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
            component: 'External API Seeding',
            action: 'Insert season',
          });
          console.error('❌ Error inserting season:', year, error);
        }
      }
      console.log(`✅ Seeded ${data.response.length} seasons`);
      return data;
    });

    // Step 3: Fetch and insert teams
    console.log('🏀 Step 3: Fetching and inserting teams...');
    const teamsData = await timeStep('Team fetching and insertion', async () => {
      const data = await fetchNBAData<ITeamsApiResponse>(apiClient, '/teams', {});
      console.log(`📡 Fetched ${data.response.length} teams from API`);

      if (data.response && data.response.length > 0) {
        for (const team of data.response) {
          console.log(`   🏀 Processing team: ${team.name} (ID: ${team.id})`);
          try {
            await db
              .insert(schema.teams)
              .values({
                id: team.id.toString(),
                name: team.name,
                nickname: team.nickname,
                code: team.code,
                city: team.city,
                logo: team.logo,
                all_star: team.allStar,
                nba_franchise: team.nbaFranchise,
                conference: JSON.stringify([team.leagues?.standard?.conference ?? 'NBA']),
              })
              .onConflictDoNothing();
            console.log(`   ✅ Inserted team: ${team.name}`);
          } catch (error) {
            // Use centralized error handling
            errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
              component: 'External API Seeding',
              action: 'Insert team',
            });
            console.error(`   ❌ Error inserting team ${team.name}:`, error);
          }
        }
        console.log(`✅ Seeded ${data.response.length} teams`);
      } else {
        console.warn('⚠️  No teams returned from API or empty response');
      }
      return data;
    });

    // Step 4: For each season (earliest to latest), fetch and insert all games
    console.log('🎮 Step 4: Fetching and inserting games for each season...');
    await timeStep('Game fetching and insertion for all seasons', async () => {
      const sortedSeasons = seasonsData.response.sort((a, b) => a - b);

      for (const season of sortedSeasons) {
        console.log(`   📅 Processing season ${season}...`);

        try {
          const gamesData = await fetchNBAData<IGamesApiResponse>(apiClient, '/games', {
            league: 'standard', // Use string 'standard' per API docs
            season: season.toString(),
          });

          let gamesInserted = 0;
          for (const game of gamesData.response) {
            await db
              .insert(schema.nba_games)
              .values({
                id: game.id?.toString() ?? 'missing-game-id',
                game_type: 'nba',
                nba_game_id: game.id?.toString() ?? 'missing-nba-game-id',
                date: new Date(game.date.start),
                home_team_id: game.teams.home.id?.toString() ?? 'missing-home-team-id',
                away_team_id: game.teams.visitors.id?.toString() ?? 'missing-away-team-id',
                home_team_score: game.scores?.home?.points ?? null,
                away_team_score: game.scores?.visitors?.points ?? null,
                status:
                  game.status.short === 'FT'
                    ? 'FINISHED'
                    : game.status.short === 'LIVE'
                      ? 'LIVE'
                      : 'SCHEDULED',
              })
              .onConflictDoNothing();
            gamesInserted++;
          }
          console.log(`   ✅ Seeded ${gamesInserted} games for season ${season}`);
        } catch (error) {
          console.warn(`   ⚠️  Could not fetch games for season ${season}:`, error);
          continue; // Continue with next season
        }
      }
    });

    // Step 5: For each team, fetch and insert players with duplicate handling
    console.log('👤 Step 5: Fetching and inserting players for each team...');
    await timeStep('Player fetching and insertion for all teams', async () => {
      for (const team of teamsData.response) {
        console.log(`   🏀 Processing team: ${team.name}...`);

        try {
          const playersData = await fetchNBAData<IPlayersApiResponse>(apiClient, '/players', {
            season: '2024',
            team: team.id.toString(),
          });

          for (const player of playersData.response) {
            const playerId = player.id.toString();

            // Check if player already exists
            const existingPlayer = await db
              .select()
              .from(schema.nba_players)
              .where(eq(schema.nba_players.id, playerId));

            if (existingPlayer.length > 0) {
              // Player exists - update teams field by reconstructing existing teams data
              const currentPlayer = existingPlayer[0];
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
              const seasonEntry = currentTeamsBySeason.find(s => s.season === '2024');
              const teamInfo = {
                team_id: team.id.toString(),
                team_name: team.name,
              };

              if (seasonEntry) {
                // Season exists - check if team is already in the season
                const teamExists = seasonEntry.teams.some(t => t.team_id === teamInfo.team_id);
                if (!teamExists) {
                  seasonEntry.teams.push(teamInfo);
                }
              } else {
                // Season doesn't exist - create new season entry
                currentTeamsBySeason.push({
                  season: '2024',
                  teams: [teamInfo],
                });
              }

              // Update the player with new teams data
              await db
                .update(schema.nba_players)
                .set({
                  teams: JSON.stringify(currentTeamsBySeason),
                  updated_at: new Date(),
                })
                .where(eq(schema.nba_players.id, playerId));
            } else {
              // New player - insert with initial teams data
              await db
                .insert(schema.nba_players)
                .values({
                  id: playerId,
                  first_name: player.firstname ?? 'missing-first-name',
                  last_name: player.lastname ?? 'missing-last-name',
                  birth: JSON.stringify(player.birth ?? {}),
                  nba: JSON.stringify(player.nba ?? {}),
                  height: JSON.stringify(player.height ?? {}),
                  weight: JSON.stringify(player.weight ?? {}),
                  college: player.college ?? 'missing-college',
                  affiliation: player.affiliation ?? 'missing-affiliation',
                  teams: JSON.stringify([
                    {
                      season: '2024',
                      teams: [
                        {
                          team_id: team.id.toString(),
                          team_code: team.code,
                          team_name: team.name,
                        },
                      ],
                    },
                  ]),
                  leagues: JSON.stringify(['NBA']),
                  image_url: `https://media.api-sports.io/basketball/players/${player.id}.png`,
                })
                .onConflictDoNothing();
            }
          }
          console.log(`   ✅ Processed players for team: ${team.name}`);
        } catch (error) {
          // Use centralized error handling
          errorHandlers.api(error instanceof Error ? error : new Error(String(error)), {
            component: 'External API Seeding',
            action: 'Fetch players for team',
          });
          console.warn(`   ⚠️  Could not fetch players for team ${team.name}:`, error);
          continue; // Continue with next team
        }
      }
    });

    console.log('🎉 External API data seeding completed successfully!');

    // Log summary
    const leagueCount = await db.select().from(schema.leagues);
    const seasonCount = await db.select().from(schema.seasons);
    const teamCount = await db.select().from(schema.teams);
    const playerCount = await db.select().from(schema.nba_players);
    const gameCount = await db.select().from(schema.nba_games);

    console.log('\n📊 Seeding Summary:');
    console.log(`   Leagues: ${leagueCount.length}`);
    console.log(`   Seasons: ${seasonCount.length}`);
    console.log(`   Teams: ${teamCount.length}`);
    console.log(`   Players: ${playerCount.length}`);
    console.log(`   Games: ${gameCount.length}`);
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'External API Seeding',
      action: 'Seed external API data',
    });
    console.error('❌ Error seeding external API data:', error);
    throw error;
  }
}

// Function to clear external API data (useful for testing)
export async function clearExternalApiData() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema }) as Database;

  console.log('🧹 Clearing external API data...');

  // Timing utility function
  const timeStep = async <T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();
    const result = await stepFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ${stepName} completed in ${formatDuration(duration)}`);
    return result;
  };

  try {
    // Clear in reverse order of dependencies
    await timeStep('Clear NBA games', () => db.delete(schema.nba_games));
    await timeStep('Clear game ratings', () => db.delete(schema.game_ratings));
    await timeStep('Clear NBA players', () => db.delete(schema.nba_players));
    await timeStep('Clear teams', () => db.delete(schema.teams));
    await timeStep('Clear seasons', () => db.delete(schema.seasons));
    await timeStep('Clear leagues', () => db.delete(schema.leagues));

    console.log('✅ External API data cleared successfully!');
  } catch (error) {
    // Use centralized error handling
    errorHandlers.database(error instanceof Error ? error : new Error(String(error)), {
      component: 'External API Seeding',
      action: 'Clear external API data',
    });
    console.error('❌ Error clearing external API data:', error);
    throw error;
  }
}

// Main execution function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExternalApiData()
    .then(() => {
      console.log('✅ External API seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ External API seeding script failed:', error);
      process.exit(1);
    });
}
