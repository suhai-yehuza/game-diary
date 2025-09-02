// External API data seeding (with overwrites)
import * as schema from '@/lib/db/schema';
import type { IExternalApiSeedingConfig } from '@/lib/types';
import { ErrorHandler } from '@/lib/utils/error-handler';

import {
  createDatabaseConnection,
  createApiClient,
  createTimeStep,
  seedLeagues,
  seedSeasons,
  seedTeams,
  determineSeasonsToSeed,
  seedGames,
  seedPlayers,
} from './shared-seeding-utils';

export async function seedExternalApiData(
  optimizationConfig?: IExternalApiSeedingConfig,
  clearFirst = false
) {
  // Initialize database and API client
  const db = createDatabaseConnection();
  const apiClient = createApiClient();
  const timeStep = createTimeStep();

  console.log('🌱 Starting external API data seeding...');

  // Clear database first if requested
  if (clearFirst) {
    console.log('🧹 Clearing existing data before seeding...');
    await clearExternalApiData();
  }

  // Use centralized error handling for the entire seeding process
  const result = await ErrorHandler.getInstance().handleAsync(
    async () => {
      // Step 1: Seed leagues
      await timeStep('League fetching and insertion', async () => {
        return seedLeagues(db, apiClient, 'External API Seeding');
      });

      // Step 2: Seed seasons
      await timeStep('Season fetching and insertion', async () => {
        return seedSeasons(db, apiClient, 'External API Seeding');
      });

      // Step 3: Seed teams
      const teamsData = await timeStep('Team fetching and insertion', async () => {
        return seedTeams(db, apiClient, 'External API Seeding');
      });

      // Step 4: Determine seasons to seed
      const allSeasonsData = await timeStep('Season determination', async () => {
        const allSeasons = await db.select().from(schema.seasons).orderBy(schema.seasons.year);
        const allSeasonsSorted = allSeasons.map(s => s.year).sort((a, b) => b - a);

        return determineSeasonsToSeed(allSeasonsSorted, optimizationConfig || {});
      });

      // Step 5: Seed games (with overwrites)
      await timeStep('Game fetching and insertion for all seasons', async () => {
        return seedGames(db, apiClient, allSeasonsData, false, 'External API Seeding');
      });

      // Step 6: Seed players (with overwrites)
      await timeStep('Player fetching and insertion for all seasons and teams', async () => {
        return seedPlayers(db, apiClient, allSeasonsData, teamsData, false, 'External API Seeding');
      });

      console.log('🎉 External API data seeding completed successfully!');
      return { success: true };
    },
    {
      component: 'External API Seeding',
      action: 'Database seeding process',
    }
  );

  if (!result) {
    throw new Error('External API data seeding failed: Operation returned no result');
  }
}

// Function to clear external API data (useful for testing)
export async function clearExternalApiData() {
  const db = createDatabaseConnection();
  const timeStep = createTimeStep();

  console.log('🧹 Clearing external API data...');

  try {
    // Use centralized error handling for the clearing process
    const result = await ErrorHandler.getInstance().handleAsync(
      async () => {
        // Clear in reverse order of dependencies
        await timeStep('Clear NBA games', () => db.delete(schema.nba_games));
        await timeStep('Clear game ratings', () => db.delete(schema.game_ratings));
        await timeStep('Clear NBA players', () => db.delete(schema.nba_players));
        await timeStep('Clear teams', () => db.delete(schema.teams));
        await timeStep('Clear seasons', () => db.delete(schema.seasons));
        await timeStep('Clear leagues', () => db.delete(schema.leagues));

        console.log('✅ External API data cleared successfully!');
        return { success: true };
      },
      {
        component: 'External API Seeding',
        action: 'Database clearing process',
      }
    );

    if (!result) {
      throw new Error('External API data clearing failed: Operation returned no result');
    }
  } catch (error) {
    // Provide more specific error context for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    throw new Error(
      `External API data clearing failed: ${errorMessage}${
        errorStack ? `\nStack trace: ${errorStack}` : ''
      }`
    );
  }
}

// Main execution function
if (import.meta.url === `file://${process.argv[1]}`) {
  // Check if --clear flag is provided
  const shouldClear = process.argv.includes('--clear');

  seedExternalApiData(undefined, shouldClear)
    .then(() => {
      console.log('✅ External API seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ External API seeding script failed:', error);
      process.exit(1);
    });
}
