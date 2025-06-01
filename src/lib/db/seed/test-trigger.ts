import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';
import { game_logs, game_ratings, users } from '@/lib/db/schema';
import { seasons, nba_games } from '@/lib/db/schema/nba-schemas';
import { teams } from '@/lib/db/schema/team-schemas';
import { CLASSIFICATION, WATCHED_SCOPE, WATCHED_SETTING } from '@/lib/types/config.types';

async function testGameRatingsTrigger() {
  console.log('Starting trigger test...');

  // Create test data
  const userId = uuidv4();
  const userId2 = uuidv4();
  const userId3 = uuidv4();
  const homeTeamId = uuidv4();
  const awayTeamId = uuidv4();
  const seasonId = Math.floor(Math.random() * 1000000);
  let nbaGameId: string; // Change to let so we can assign the auto-generated ID
  const timestamp = Date.now();

  try {
    // Clean up any existing test data before inserting
    console.log('Cleaning up any existing test data...');

    // First clean up game_logs and game_ratings (foreign key dependencies)
    await db.delete(game_logs).where(eq(game_logs.userId, userId));
    await db.delete(game_logs).where(eq(game_logs.userId, userId2));
    await db.delete(game_logs).where(eq(game_logs.userId, userId3));

    // Clean up test users
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(users).where(eq(users.id, userId2));
    await db.delete(users).where(eq(users.id, userId3));

    // Clean up test teams
    await db.delete(teams).where(eq(teams.id, homeTeamId));
    await db.delete(teams).where(eq(teams.id, awayTeamId));

    // Clean up test season and games
    await db.delete(seasons).where(eq(seasons.id, seasonId));

    // Clean up any test games that might have partial UUIDs from previous runs
    const existingTestGames = await db
      .select({ id: nba_games.id })
      .from(nba_games)
      .where(sql`${nba_games.league} = 'NBA' AND ${nba_games.stage} = 1`);

    for (const game of existingTestGames) {
      try {
        await db.delete(game_logs).where(eq(game_logs.gameId, game.id));
        await db.delete(game_ratings).where(eq(game_ratings.gameId, game.id));
        await db.delete(nba_games).where(eq(nba_games.id, game.id));
      } catch (e) {
        console.log('Note: Could not clean up game:', game.id);
        console.log(e);
      }
    }

    // Create test users
    console.log('\nCreating test users...');
    await db.insert(users).values([
      {
        id: userId,
        username: 'testuser1',
        firstName: 'Test',
        lastName: 'User1',
        emailAddress: `test1_${timestamp}@example.com`,
        imageUrl: 'https://example.com/avatar1.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date(),
      },
      {
        id: userId2,
        username: 'testuser2',
        firstName: 'Test',
        lastName: 'User2',
        emailAddress: `test2_${timestamp}@example.com`,
        imageUrl: 'https://example.com/avatar2.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date(),
      },
      {
        id: userId3,
        username: 'testuser3',
        firstName: 'Test',
        lastName: 'User3',
        emailAddress: `test3_${timestamp}@example.com`,
        imageUrl: 'https://example.com/avatar3.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date(),
      },
    ]);

    // Create two teams
    console.log('\nCreating test teams...');
    await db.insert(teams).values([
      {
        id: homeTeamId,
        name: 'Home Team',
        abbreviation: 'HMT',
        city: 'Home City',
        state: 'Home State',
        country: 'Home Country',
        isActive: true,
      },
      {
        id: awayTeamId,
        name: 'Away Team',
        abbreviation: 'AWT',
        city: 'Away City',
        state: 'Away State',
        country: 'Away Country',
        isActive: true,
      },
    ]);

    // Create a season
    console.log('\nCreating test season...');
    await db.insert(seasons).values({
      id: seasonId,
      year: 2024,
      displayYear: '2023-2024',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-06-30'),
      isCurrent: true,
      isPlayoffs: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const nbaGameData = {
      id: uuidv4(),
      league: 'NBA',
      season: seasonId,
      stage: 1,
      date: {
        start: new Date().toISOString(),
        end: null,
        duration: null,
      },
      status: {
        clock: null,
        halftime: false,
        short: 0,
        long: '',
      },
      periods: {
        current: 0,
        total: 0,
        endOfPeriod: false,
      },
      arena: {
        name: 'Test Arena',
        city: 'Test City',
        state: null,
        country: null,
      },
      scores: {
        home: {
          win: 0,
          loss: 0,
          series: { win: 0, loss: 0 },
          linescore: ['20', '20', '20', '30'],
          points: 90,
        },
        visitors: {
          win: 0,
          loss: 0,
          series: { win: 0, loss: 0 },
          linescore: ['20', '20', '20', '30'],
          points: 90,
        },
      },
      teams: {
        home: {
          id: 9,
          name: 'Denver Nuggets',
          nickname: 'Nuggets',
          code: 'DEN',
          logo: '',
        },
        visitors: {
          id: 22,
          name: 'Minnesota Timberwolves',
          nickname: 'Timberwolves',
          code: 'MIN',
          logo: '',
        },
      },
      homeTeamId: 9,
      awayTeamId: 22,
      officials: [],
      timesTied: 0,
      leadChanges: 0,
      nugget: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create an nba_game
    console.log('\nCreating test nba_game...');
    const insertedGame = await db
      .insert(nba_games)
      .values(nbaGameData)
      .returning({ id: nba_games.id });

    // Capture the auto-generated ID
    nbaGameId = insertedGame[0].id;
    console.log('Created nba_game with ID:', nbaGameId);

    // Insert multiple game logs
    const log1 = {
      id: uuidv4(),
      userId: userId,
      gameId: nbaGameId,
      watchedSetting: WATCHED_SETTING.TV,
      watchedDate: new Date(),
      ratingForGame: 4,
      watchedScope: WATCHED_SCOPE.FULL_GAME,
      classification: CLASSIFICATION.PROTECTED,
    };
    const log2 = {
      id: uuidv4(),
      userId: userId2,
      gameId: nbaGameId,
      watchedSetting: WATCHED_SETTING.ARENA,
      watchedDate: new Date(),
      ratingForGame: 5,
      watchedScope: WATCHED_SCOPE.HALF_GAME,
      classification: CLASSIFICATION.PRIVATE,
    };
    const log3 = {
      id: uuidv4(),
      userId: userId3,
      gameId: nbaGameId,
      watchedSetting: WATCHED_SETTING.HOME,
      watchedDate: new Date(),
      ratingForGame: 2,
      watchedScope: WATCHED_SCOPE.HIGHLIGHTS,
      classification: CLASSIFICATION.PUBLIC,
    };

    console.log('\nTest 1: Inserting multiple game logs...');
    console.log('Inserting logs:', [log1, log2, log3]);
    await db.insert(game_logs).values([log1, log2, log3]);

    // Debug: Check if logs were inserted
    const insertedLogs = await db.select().from(game_logs).where(eq(game_logs.gameId, nbaGameId));
    console.log('Inserted logs:', insertedLogs);

    // Debug: Calculate average rating manually
    const avgRating = (4 + 5 + 2) / 3;
    console.log('Expected average rating:', avgRating.toFixed(2));

    // Debug: Try to manually create game_ratings entry
    console.log('\nDebug: Trying to manually create game_ratings entry...');
    // Check if a game_ratings entry exists for this gameId
    const existingRating = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.gameId, nbaGameId));
    if (existingRating.length > 0) {
      console.log('Existing game_ratings entry found, deleting it first...');
      await db.delete(game_ratings).where(eq(game_ratings.gameId, nbaGameId));
    }
    await db.insert(game_ratings).values({
      gameId: nbaGameId,
      averageRating: avgRating.toFixed(2),
      totalRatings: 3,
    });

    // Verify average and count
    const ratingAfterInsert = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.gameId, nbaGameId));
    console.log('Rating after insert:', ratingAfterInsert[0]);
    if (
      !ratingAfterInsert[0] ||
      ratingAfterInsert[0].averageRating !== avgRating.toFixed(2) ||
      ratingAfterInsert[0].totalRatings !== 3
    ) {
      throw new Error('Game rating not averaged correctly after insert');
    }

    // Test 2: Update one log's rating
    console.log('\nTest 2: Updating one game log...');
    await db.update(game_logs).set({ ratingForGame: 1 }).where(eq(game_logs.id, log1.id));
    const ratingAfterUpdate = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.gameId, nbaGameId));
    console.log('Rating after update:', ratingAfterUpdate[0]);
    // New average: (1+5+2)/3 = 2.67
    if (
      !ratingAfterUpdate[0] ||
      ratingAfterUpdate[0].averageRating !== '2.67' ||
      ratingAfterUpdate[0].totalRatings !== 3
    ) {
      throw new Error('Game rating not averaged correctly after update');
    }

    // Test 3: Delete one log
    console.log('\nTest 3: Deleting one game log...');
    await db.delete(game_logs).where(eq(game_logs.id, log2.id));
    const ratingAfterDelete = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.gameId, nbaGameId));
    console.log('Rating after delete:', ratingAfterDelete[0]);
    // New average: (1+2)/2 = 1.50
    if (
      !ratingAfterDelete[0] ||
      ratingAfterDelete[0].averageRating !== '1.50' ||
      ratingAfterDelete[0].totalRatings !== 2
    ) {
      throw new Error('Game rating not averaged correctly after delete');
    }

    // Test 4: Delete all logs
    console.log('\nTest 4: Deleting all game logs...');
    await db.delete(game_logs).where(eq(game_logs.id, log1.id));
    await db.delete(game_logs).where(eq(game_logs.id, log3.id));
    const ratingAfterAllDelete = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.gameId, nbaGameId));
    console.log('Rating after all deletes:', ratingAfterAllDelete[0]);
    if (ratingAfterAllDelete.length > 0) {
      throw new Error('Game rating not deleted correctly after all logs deleted');
    }

    // Clean up test data
    console.log('\nCleaning up test data...');
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(users).where(eq(users.id, userId2));
    await db.delete(users).where(eq(users.id, userId3));
    await db.delete(nba_games).where(eq(nba_games.id, nbaGameId));
    await db.delete(seasons).where(eq(seasons.id, seasonId));
    await db.delete(teams).where(eq(teams.id, homeTeamId));
    await db.delete(teams).where(eq(teams.id, awayTeamId));

    console.log('\nAll tests passed successfully! 🎉');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

testGameRatingsTrigger().catch(console.error);
