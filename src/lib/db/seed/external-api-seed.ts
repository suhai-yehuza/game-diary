// Load environment variables from .env files
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { getRapidApiConfig } from '@src/lib/config/api.config';
import * as schema from '@src/lib/db/schema';
import type {
  ILeaguesApiResponse,
  ITeamsApiResponse,
  IPlayersApiResponse,
  IGamesApiResponse,
  ISeasonsApiResponse,
} from '@src/lib/types/externalApiTypes';
import type { Database } from '@src/lib/types/infrastructureTypes';
import { createRapidAPIClient } from '@src/lib/utils/api-client';

// NBA API client
const apiClient = createRapidAPIClient(getRapidApiConfig());

// Fetch real NBA data from API
async function fetchNBAData<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  try {
    console.log(`📡 Fetching ${endpoint} with params:`, params);
    const data = await apiClient.fetch<T>(endpoint, params);
    console.log(`✅ Successfully fetched ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    throw error;
  }
}

export async function seedExternalApiData(_optimizationConfig?: unknown) {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema }) as Database;

  console.log('🌱 Starting external API data seeding...');

  try {
    // Step 1: Fetch and seed leagues
    console.log('📊 Fetching and seeding leagues...');
    const leaguesData = await fetchNBAData<ILeaguesApiResponse>('/leagues');

    for (const league of leaguesData.response) {
      await db
        .insert(schema.leagues)
        .values({
          id: league.id.toString(),
          name: league.name,
          code: league.type,
          country: league.country?.name ?? 'USA',
          logo_url: league.logo,
        })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${leaguesData.response.length} leagues`);

    // Step 2: Fetch and seed seasons
    console.log('📅 Fetching and seeding seasons...');
    const seasonsData = await fetchNBAData<ISeasonsApiResponse>('/seasons');

    for (const season of seasonsData.response) {
      await db
        .insert(schema.seasons)
        .values({
          id: `season_${season.season}`,
          year: season.season,
          league: 'NBA',
          start_date: `${season.season}-10-01`,
          end_date: `${season.season + 1}-04-30`,
          status: season.season === 2024 ? 'ACTIVE' : 'FINISHED',
        })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${seasonsData.response.length} seasons`);

    // Step 3: Fetch and seed teams
    console.log('🏀 Fetching and seeding teams...');
    const teamsData = await fetchNBAData<ITeamsApiResponse>('/teams', {
      season: '2024',
    });

    for (const team of teamsData.response) {
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
          leagues: JSON.stringify([team.leagues?.standard?.conference ?? 'NBA']),
        })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${teamsData.response.length} teams`);

    // Step 4: Fetch and seed players
    console.log('👤 Fetching and seeding players...');
    const playersData = await fetchNBAData<IPlayersApiResponse>('/players', {
      season: '2024',
    });

    // Limit to first 20 players to avoid overwhelming the database
    const playersToSeed = playersData.response.slice(0, 20);

    for (const player of playersToSeed) {
      await db
        .insert(schema.nba_players)
        .values({
          id: player.id.toString(),
          first_name: player.firstname,
          last_name: player.lastname,
          birth: JSON.stringify(player.birth ?? {}),
          nba: JSON.stringify(player.nba ?? {}),
          height: JSON.stringify(player.height ?? {}),
          weight: JSON.stringify(player.weight ?? {}),
          college: player.college,
          affiliation: player.affiliation,
          teams: JSON.stringify([
            {
              season: 'season_2024',
              teams_played_for: [],
            },
          ]),
          leagues: JSON.stringify(['NBA']),
          image_url: `https://media.api-sports.io/basketball/players/${player.id}.png`,
        })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${playersToSeed.length} players`);

    // Step 5: Fetch and seed games
    console.log('🎮 Fetching and seeding games...');
    const gamesData = await fetchNBAData<IGamesApiResponse>('/games', {
      league: '12', // NBA league ID
      season: '2024',
    });

    // Limit to first 10 games to avoid overwhelming the database
    const gamesToSeed = gamesData.response.slice(0, 10);

    for (const game of gamesToSeed) {
      await db
        .insert(schema.nba_games)
        .values({
          id: game.id.toString(),
          game_type: 'nba',
          nba_game_id: game.id.toString(),
          date: new Date(game.date.start),
          home_team_id: game.teams.home.id.toString(),
          away_team_id: game.teams.visitors.id.toString(),
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
    }
    console.log(`✅ Seeded ${gamesToSeed.length} games`);

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

  try {
    // Clear in reverse order of dependencies
    await db.delete(schema.nba_games);
    await db.delete(schema.game_ratings);
    await db.delete(schema.nba_players);
    await db.delete(schema.teams);
    await db.delete(schema.seasons);
    await db.delete(schema.leagues);

    console.log('✅ External API data cleared successfully!');
  } catch (error) {
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
