import { faker } from '@faker-js/faker';
import { desc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import type * as schema from '@src/lib/db/schema';
import { game_logs, games } from '@src/lib/db/schema/game-schemas';
import { users, friendships } from '@src/lib/db/schema/user-schemas';
import { FRIENDSHIP_STATUS, WATCHED_SETTING, WATCHED_SCOPE, CLASSIFICATION } from '@src/lib/types';
import type {
  IApplicationSeederOptions,
  IWatchedScopeValue,
  IWatchedSettingValue,
  IFriendshipStatusValue,
} from '@src/lib/types';
import type { UserInsert, FriendshipInsert, GameLogInsert } from '@src/lib/types/seeding.types';
import { generateUUID } from '@src/lib/utils/processing';
import { getCurrentSeason } from '@src/lib/utils/time';

// Memory-efficient user generator
async function* generateUsersStream(
  targetCount: number,
  existingEmails: Set<string>,
  skipUsers: boolean = false
): AsyncGenerator<UserInsert, void, unknown> {
  if (skipUsers) return;

  let generated = 0;
  const maxAttempts = targetCount * 2;

  while (generated < targetCount && generated < maxAttempts) {
    const username = `${faker.internet.username()}${faker.number.int({ min: 1, max: targetCount * 10 })}`;
    const email = `${username}@${faker.internet.domainName()}`;

    if (!existingEmails.has(email)) {
      existingEmails.add(email);
      generated++;

      yield {
        id: generateUUID(),
        username,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        emailAddress: email,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        inboundFriendshipIds: [],
        outboundFriendshipIds: [],
        banned: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        last_sign_in_at: faker.date.recent(),
        password_enabled: false,
        two_factor_enabled: false,
        email_verified: true,
        email_verification_strategy: 'email_code',
        external_id: generateUUID(),
        external_accounts: [],
      };
    }
  }

  if (generated < targetCount) {
    seedLogger.warn(`Generated ${generated} unique users out of ${targetCount} requested`);
  }
}

// Optimized friendship generator from existing users
async function* generateFriendshipsFromUsers(
  insertedUsers: UserInsert[]
): AsyncGenerator<FriendshipInsert, void, unknown> {
  if (insertedUsers.length === 0) {
    seedLogger.warn('No users provided for friendship generation');
    return;
  }

  // Only process a small percentage of users to create friendships
  const usersToProcess = insertedUsers.filter(() => Math.random() < 0.05); // 5% of users

  for (const user of usersToProcess) {
    // Limit friendships to a realistic number
    const friendshipCount = Math.min(
      faker.number.int({ min: 1, max: 10 }), // Max 10 friends per user
      insertedUsers.length - 1
    );

    // Select random friends from the inserted users (excluding self)
    const potentialFriends = insertedUsers.filter(u => u.id !== user.id);
    const selectedFriends = faker.helpers.arrayElements(
      potentialFriends,
      Math.min(friendshipCount, potentialFriends.length)
    );

    for (const friend of selectedFriends) {
      yield {
        id: generateUUID(),
        friendId: user.id,
        userId: friend.id,
        status: faker.helpers.arrayElement(
          Object.values(FRIENDSHIP_STATUS)
        ) as IFriendshipStatusValue,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
    }
  }
}

// Optimized game logs generator from existing users
async function* generateGameLogsFromUsers(
  insertedUsers: UserInsert[],
  db: NeonHttpDatabase<typeof schema>
): AsyncGenerator<GameLogInsert, void, unknown> {
  const latestSeasonGames = await db
    .select()
    .from(games)
    .orderBy(desc(games.date))
    .limit(API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT);

  if (latestSeasonGames.length === 0) {
    seedLogger.warn('No games found in the latest season');
    return;
  }

  if (insertedUsers.length === 0) {
    seedLogger.warn('No users provided for game log generation');
    return;
  }

  const seasonYear = getCurrentSeason();
  const seasonStartDate = new Date(seasonYear, 9, 1); // October 1st
  const seasonEndDate = new Date(seasonYear + 1, 5, 30); // June 30th

  const currentSeasonGames = latestSeasonGames.filter((game: { date: string | Date }) => {
    const gameDate = new Date(game.date);
    return gameDate >= seasonStartDate && gameDate <= seasonEndDate;
  });

  seedLogger.info(
    `Generating game logs from ${currentSeasonGames.length} games in the ${seasonYear}-${seasonYear + 1} season`
  );

  const gameRatings = new Map<string, { total: number; count: number }>();

  // Process a subset of users to create game logs
  const usersToProcess = insertedUsers.slice(0, Math.min(100, insertedUsers.length)); // Limit to 100 users

  for (const user of usersToProcess) {
    const gameLogCount = Math.min(
      faker.number.int({ min: 1, max: 20 }), // Max 20 game logs per user
      currentSeasonGames.length
    );

    const selectedGames = faker.helpers.arrayElements(
      currentSeasonGames,
      Math.min(gameLogCount, currentSeasonGames.length)
    );

    for (const game of selectedGames) {
      const gameRecord = game as { id: string; date: string | Date };
      const ratingForGame = faker.number.int({ min: 1, max: 5 });
      const currentRating = gameRatings.get(gameRecord.id) || { total: 0, count: 0 };
      gameRatings.set(gameRecord.id, {
        total: currentRating.total + ratingForGame,
        count: currentRating.count + 1,
      });

      yield {
        id: generateUUID(),
        userId: user.id,
        gameId: gameRecord.id,
        watchedDate: new Date(gameRecord.date),
        ratingForGame,
        watchedSetting: faker.helpers.arrayElement(
          Object.values(WATCHED_SETTING)
        ) as IWatchedSettingValue,
        watchedScope: faker.helpers.arrayElement(
          Object.values(WATCHED_SCOPE)
        ) as IWatchedScopeValue,
        notes: faker.lorem.paragraph(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
        tags: [],
        classification: CLASSIFICATION.PUBLIC,
      };
    }
  }
}

// Main seeding function
export async function seedOptimizedApplicationData(
  options: Omit<IApplicationSeederOptions, 'db'> & { db: NeonHttpDatabase<typeof schema> }
): Promise<void> {
  const { db, skipUsers = false } = options;
  if (!db) {
    throw new Error('Database client is required for seeding');
  }

  const existingEmails = new Set<string>();

  try {
    // Generate and insert users
    const userStream = generateUsersStream(
      API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT,
      existingEmails,
      skipUsers
    );
    const usersArray = [];
    for await (const user of userStream) {
      usersArray.push(user);
    }
    await db.insert(users).values(usersArray);

    // Generate and insert friendships in batches using the SAME users that were inserted
    const friendshipStream = generateFriendshipsFromUsers(usersArray);

    const FRIENDSHIP_BATCH_SIZE = 300; // Safe batch size
    let friendshipsArray = [];
    let batchCount = 0;

    for await (const friendship of friendshipStream) {
      friendshipsArray.push(friendship);

      if (friendshipsArray.length >= FRIENDSHIP_BATCH_SIZE) {
        await db.insert(friendships).values(friendshipsArray);
        seedLogger.info(
          `Inserted friendship batch ${++batchCount} (${friendshipsArray.length} records)`
        );
        friendshipsArray = [];
      }
    }

    // Insert remaining friendships
    if (friendshipsArray.length > 0) {
      await db.insert(friendships).values(friendshipsArray);
      seedLogger.info(`Inserted final friendship batch (${friendshipsArray.length} records)`);
    }

    // Generate and insert game logs in batches using the SAME users that were inserted
    const gameLogStream = generateGameLogsFromUsers(usersArray, db);

    const GAME_LOG_BATCH_SIZE = 100; // Safe batch size for game logs
    let gameLogsArray = [];
    let gameLogBatchCount = 0;

    for await (const gameLog of gameLogStream) {
      gameLogsArray.push(gameLog);

      if (gameLogsArray.length >= GAME_LOG_BATCH_SIZE) {
        await db.insert(game_logs).values(gameLogsArray);
        seedLogger.info(
          `Inserted game log batch ${++gameLogBatchCount} (${gameLogsArray.length} records)`
        );
        gameLogsArray = [];
      }
    }

    // Insert remaining game logs
    if (gameLogsArray.length > 0) {
      await db.insert(game_logs).values(gameLogsArray);
      seedLogger.info(`Inserted final game log batch (${gameLogsArray.length} records)`);
    }

    seedLogger.info('Successfully seeded application data');
  } catch (error) {
    seedLogger.error('Error seeding application data:', error);
    throw error;
  }
}
