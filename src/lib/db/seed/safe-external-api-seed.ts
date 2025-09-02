// Safe external API data seeding (no overwrites)

import * as schema from '@/lib/db/schema';
import type {
  IExternalApiSeedingConfig,
  IDbRefreshProgressCallback,
} from '@/lib/types/seeding.types';

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

export type { IDbRefreshProgressCallback };

export async function safeSeedExternalApiData(
  optimizationConfig?: IExternalApiSeedingConfig,
  progressCallback?: IDbRefreshProgressCallback
) {
  // Initialize database and API client
  const db = createDatabaseConnection();
  const apiClient = createApiClient();
  const timeStep = createTimeStep();

  const startTime = new Date();
  console.log('🌱 Starting safe external API data seeding (no overwrites)...');

  // Update progress
  if (progressCallback) {
    progressCallback({
      currentStep: 'Initializing...',
      stepNumber: 0,
      totalSteps: 5,
      progress: 0,
      status: 'running',
      message: 'Starting database refresh process',
      details: 'Initializing database connection and API client',
      startTime,
    });
  }

  try {
    // Step 1: Seed leagues (only if they don't exist)
    if (progressCallback) {
      progressCallback({
        currentStep: 'Seeding Leagues',
        stepNumber: 1,
        totalSteps: 5,
        progress: 20,
        status: 'running',
        message: 'Fetching and inserting leagues',
        details: 'Processing league data from NBA API',
        startTime,
      });
    }

    await timeStep('League fetching and safe insertion', async () => {
      return seedLeagues(db, apiClient, 'Safe External API Seeding');
    });

    // Step 2: Seed seasons (only if they don't exist)
    if (progressCallback) {
      progressCallback({
        currentStep: 'Seeding Seasons',
        stepNumber: 2,
        totalSteps: 5,
        progress: 40,
        status: 'running',
        message: 'Fetching and inserting seasons',
        details: 'Processing season data from NBA API',
        startTime,
      });
    }

    await timeStep('Season fetching and safe insertion', async () => {
      return seedSeasons(db, apiClient, 'Safe External API Seeding');
    });

    // Step 3: Seed teams (only if they don't exist)
    if (progressCallback) {
      progressCallback({
        currentStep: 'Seeding Teams',
        stepNumber: 3,
        totalSteps: 5,
        progress: 60,
        status: 'running',
        message: 'Fetching and inserting teams',
        details: 'Processing team data from NBA API',
        startTime,
      });
    }

    const teamsData = await timeStep('Team fetching and safe insertion', async () => {
      return seedTeams(db, apiClient, 'Safe External API Seeding');
    });

    // Step 4: Determine seasons to seed
    if (progressCallback) {
      progressCallback({
        currentStep: 'Determining Seasons',
        stepNumber: 4,
        totalSteps: 5,
        progress: 80,
        status: 'running',
        message: 'Determining which seasons to seed',
        details: 'Processing season configuration and filters',
        startTime,
      });
    }

    const allSeasonsData = await timeStep('Season determination', async () => {
      const allSeasons = await db.select().from(schema.seasons).orderBy(schema.seasons.year);
      const allSeasonsSorted = allSeasons.map(s => s.year).sort((a, b) => b - a);

      return determineSeasonsToSeed(allSeasonsSorted, optimizationConfig || {});
    });

    // Step 5: Seed games (safely - no overwrites)
    if (progressCallback) {
      progressCallback({
        currentStep: 'Seeding Games',
        stepNumber: 5,
        totalSteps: 5,
        progress: 90,
        status: 'running',
        message: 'Fetching and safely inserting games',
        details: 'Processing game data from NBA API (safe mode)',
        startTime,
      });
    }

    const totalGamesInserted = await timeStep(
      'Game fetching and safe insertion for all seasons',
      async () => {
        return seedGames(db, apiClient, allSeasonsData, true, 'Safe External API Seeding');
      }
    );

    // Step 6: Seed players (safely - no overwrites)
    if (progressCallback) {
      progressCallback({
        currentStep: 'Seeding Players',
        stepNumber: 5,
        totalSteps: 5,
        progress: 95,
        status: 'running',
        message: 'Fetching and safely inserting players',
        details: 'Processing player data from NBA API (safe mode)',
        startTime,
      });
    }

    const totalPlayersInserted = await timeStep(
      'Player fetching and safe insertion for all seasons and teams',
      async () => {
        return seedPlayers(
          db,
          apiClient,
          allSeasonsData,
          teamsData,
          true,
          'Safe External API Seeding'
        );
      }
    );

    // Final progress update
    if (progressCallback) {
      progressCallback({
        currentStep: 'Completed',
        stepNumber: 5,
        totalSteps: 5,
        progress: 100,
        status: 'completed',
        message: 'Database refresh completed successfully',
        details: `Seeded ${totalGamesInserted} games and ${totalPlayersInserted} players`,
        startTime,
      });
    }

    console.log('🎉 Safe external API data seeding completed successfully!');
    console.log(
      `📊 Summary: ${totalGamesInserted} games and ${totalPlayersInserted} players processed`
    );
  } catch (error) {
    // Update progress on error
    if (progressCallback) {
      progressCallback({
        currentStep: 'Error',
        stepNumber: 0,
        totalSteps: 5,
        progress: 0,
        status: 'error',
        message: 'Database refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        startTime,
      });
    }

    console.error('❌ Safe external API data seeding failed:', error);
    throw error;
  }
}

// Main execution function
if (import.meta.url === `file://${process.argv[1]}`) {
  safeSeedExternalApiData()
    .then(() => {
      console.log('✅ Safe external API seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Safe external API seeding script failed:', error);
      process.exit(1);
    });
}
