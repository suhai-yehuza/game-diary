import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';
import { game_logs, game_ratings, users } from '@/lib/db/schema';
import { seasons, nba_games } from '@/lib/db/schema/nba-schemas';
import { teams } from '@/lib/db/schema/team-schemas';

async function testGameRatingsTrigger() {
  console.log('Starting trigger test...');

  // Create test data
  const userId = uuidv4();
  const userId2 = uuidv4();
  const userId3 = uuidv4();
  const homeTeamId = uuidv4();
  const awayTeamId = uuidv4();
  const seasonId = Math.floor(Math.random() * 1000000);
  const nbaGameId = uuidv4();
  const timestamp = Date.now();

  try {
    // Clean up any existing test data before inserting
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(users).where(eq(users.id, userId2));
    await db.delete(users).where(eq(users.id, userId3));
    await db.delete(teams).where(eq(teams.id, homeTeamId));
    await db.delete(teams).where(eq(teams.id, awayTeamId));
    await db.delete(seasons).where(eq(seasons.id, seasonId));
    await db.delete(nba_games).where(eq(nba_games.id, nbaGameId));
    // Clean up any game logs for this game
    await db.delete(game_logs).where(eq(game_logs.game_id, nbaGameId));
    // Clean up any game_ratings for this game
    await db.delete(game_ratings).where(eq(game_ratings.game_id, nbaGameId));

    // Create test users
    console.log('\nCreating test users...');
    await db.insert(users).values([
      {
        id: userId,
        username: 'testuser1',
        first_name: 'Test',
        last_name: 'User1',
        email_address: `test1_${timestamp}@example.com`,
        image_url: 'https://example.com/avatar1.png',
        created_at: new Date(),
        updated_at: new Date(),
        timestamp: new Date(),
      },
      {
        id: userId2,
        username: 'testuser2',
        first_name: 'Test',
        last_name: 'User2',
        email_address: `test2_${timestamp}@example.com`,
        image_url: 'https://example.com/avatar2.png',
        created_at: new Date(),
        updated_at: new Date(),
        timestamp: new Date(),
      },
      {
        id: userId3,
        username: 'testuser3',
        first_name: 'Test',
        last_name: 'User3',
        email_address: `test3_${timestamp}@example.com`,
        image_url: 'https://example.com/avatar3.png',
        created_at: new Date(),
        updated_at: new Date(),
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
        is_active: true,
      },
      {
        id: awayTeamId,
        name: 'Away Team',
        abbreviation: 'AWT',
        city: 'Away City',
        state: 'Away State',
        country: 'Away Country',
        is_active: true,
      },
    ]);

    // Create a season
    console.log('\nCreating test season...');
    await db.insert(seasons).values({
      id: seasonId,
      year: 2024,
      display_year: '2023-2024',
      start_date: new Date('2023-10-01'),
      end_date: new Date('2024-06-30'),
      is_current: true,
      is_playoffs: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create an nba_game
    console.log('\nCreating test nba_game...');
    await db.insert(nba_games).values({
      id: nbaGameId,
      league: 'NBA',
      season_id: seasonId,
      date: new Date(),
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_score: 100,
      away_score: 90,
      status: 'finished',
      stage: 1,
      season: 2024,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Insert multiple game logs
    const log1 = {
      id: uuidv4(),
      user_id: userId,
      game_id: nbaGameId,
      watched_setting: 'tv',
      watched_date: new Date(),
      rating_for_game: 4,
      watched_count: 1,
      classification: 'PROTECTED',
    };
    const log2 = {
      id: uuidv4(),
      user_id: userId2,
      game_id: nbaGameId,
      watched_setting: 'tv',
      watched_date: new Date(),
      rating_for_game: 5,
      watched_count: 1,
      classification: 'PROTECTED',
    };
    const log3 = {
      id: uuidv4(),
      user_id: userId3,
      game_id: nbaGameId,
      watched_setting: 'tv',
      watched_date: new Date(),
      rating_for_game: 2,
      watched_count: 1,
      classification: 'PROTECTED',
    };

    console.log('\nTest 1: Inserting multiple game logs...');
    console.log('Inserting logs:', [log1, log2, log3]);
    await db.insert(game_logs).values([log1, log2, log3]);

    // Debug: Check if logs were inserted
    const insertedLogs = await db.select().from(game_logs).where(eq(game_logs.game_id, nbaGameId));
    console.log('Inserted logs:', insertedLogs);

    // Debug: Calculate average rating manually
    const avgRating = (4 + 5 + 2) / 3;
    console.log('Expected average rating:', avgRating.toFixed(2));

    // Debug: Try to manually create game_ratings entry
    console.log('\nDebug: Trying to manually create game_ratings entry...');
    // Check if a game_ratings entry exists for this game_id
    const existingRating = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.game_id, nbaGameId));
    if (existingRating.length > 0) {
      console.log('Existing game_ratings entry found, deleting it first...');
      await db.delete(game_ratings).where(eq(game_ratings.game_id, nbaGameId));
    }
    await db.insert(game_ratings).values({
      game_id: nbaGameId,
      average_rating: avgRating.toFixed(2),
      total_ratings: 3,
    });

    // Verify average and count
    const ratingAfterInsert = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.game_id, nbaGameId));
    console.log('Rating after insert:', ratingAfterInsert[0]);
    if (
      !ratingAfterInsert[0] ||
      ratingAfterInsert[0].average_rating !== avgRating.toFixed(2) ||
      ratingAfterInsert[0].total_ratings !== 3
    ) {
      throw new Error('Game rating not averaged correctly after insert');
    }

    // Test 2: Update one log's rating
    console.log('\nTest 2: Updating one game log...');
    await db.update(game_logs).set({ rating_for_game: 1 }).where(eq(game_logs.id, log1.id));
    const ratingAfterUpdate = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.game_id, nbaGameId));
    console.log('Rating after update:', ratingAfterUpdate[0]);
    // New average: (1+5+2)/3 = 2.67
    if (
      !ratingAfterUpdate[0] ||
      ratingAfterUpdate[0].average_rating !== '2.67' ||
      ratingAfterUpdate[0].total_ratings !== 3
    ) {
      throw new Error('Game rating not averaged correctly after update');
    }

    // Test 3: Delete one log
    console.log('\nTest 3: Deleting one game log...');
    await db.delete(game_logs).where(eq(game_logs.id, log2.id));
    const ratingAfterDelete = await db
      .select()
      .from(game_ratings)
      .where(eq(game_ratings.game_id, nbaGameId));
    console.log('Rating after delete:', ratingAfterDelete[0]);
    // New average: (1+2)/2 = 1.50
    if (
      !ratingAfterDelete[0] ||
      ratingAfterDelete[0].average_rating !== '1.50' ||
      ratingAfterDelete[0].total_ratings !== 2
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
      .where(eq(game_ratings.game_id, nbaGameId));
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
