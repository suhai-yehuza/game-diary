import { faker } from '@faker-js/faker';
import { sql, desc } from 'drizzle-orm';

import { API_CONFIG } from '@src/lib/config/api.config';
import { game_logs, games } from '@src/lib/db/schema/game-schemas';
import { users, friendships, comments, type reactions } from '@src/lib/db/schema/user-schemas';
import { seedLogger } from 'lib/core/logger';
import {
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  REACTION_EMOJIS,
  WATCHED_SCOPE,
  CLASSIFICATION,
  type FriendshipStatusValue,
  type ReactionEmojiValue,
  type WatchedSettingValue,
  type WatchedScopeValue,
} from '@src/lib/types/config.types';
import type { ApplicationSeederOptions } from '@src/lib/types/consolidated.types';
import type { DatabaseClient } from '@src/lib/types/database.types';
import { generateUUID } from '@src/lib/utils/processing';
import { getCurrentSeason } from '@src/lib/utils/time';

// Type definitions
type DbUser = typeof users.$inferSelect;
type UserInsert = typeof users.$inferInsert;
type FriendshipInsert = typeof friendships.$inferInsert;
type GameLogInsert = typeof game_logs.$inferInsert;
type CommentInsert = typeof comments.$inferInsert;
type ReactionInsert = typeof reactions.$inferInsert;

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
        last_sign_in_at: null,
        password_enabled: false,
        two_factor_enabled: false,
        email_verified: true,
        email_verification_strategy: null,
        external_id: null,
        external_accounts: [],
        deletedAt: null,
      };
    }
  }

  if (generated < targetCount) {
    seedLogger.warn(`Generated ${generated} unique users out of ${targetCount} requested`);
  }
}

// Optimized friendship generator
async function* generateFriendshipsStream(
  userStream: AsyncGenerator<UserInsert, void, unknown>
): AsyncGenerator<FriendshipInsert, void, unknown> {
  const userChunks: UserInsert[][] = [];
  let currentChunk: UserInsert[] = [];

  // Collect users into chunks
  for await (const user of userStream) {
    currentChunk.push(user);
    if (currentChunk.length >= 100) {
      userChunks.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    userChunks.push(currentChunk);
  }

  for (const userChunk of userChunks) {
    for (const user of userChunk) {
      if (Math.random() >= 0.1) continue; // Only process 10% of users

      const friendshipCount = API_CONFIG.ranges.FRIENDSHIP_RANGE.getRandom();
      const potentialFriends = userChunk.filter(u => u.id !== user.id);
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
          ) as FriendshipStatusValue,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };
      }
    }
    await new Promise(resolve => setImmediate(resolve));
  }
}

// Optimized game logs generator
async function* generateGameLogsStream(
  userStream: AsyncGenerator<UserInsert, void, unknown>,
  db: DatabaseClient
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

  const seasonYear = getCurrentSeason();
  const seasonStartDate = new Date(seasonYear, 9, 1); // October 1st
  const seasonEndDate = new Date(seasonYear + 1, 5, 30); // June 30th

  const currentSeasonGames = latestSeasonGames.filter(game => {
    const gameDate = new Date(game.date);
    return gameDate >= seasonStartDate && gameDate <= seasonEndDate;
  });

  seedLogger.info(
    `Generating game logs from ${currentSeasonGames.length} games in the ${seasonYear}-${seasonYear + 1} season`
  );

  const gameRatings = new Map<string, { total: number; count: number }>();
  let processedUsers = 0;
  const targetUserCount = API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT;

  for await (const user of userStream) {
    if (++processedUsers > targetUserCount) break;

    const gameLogCount = API_CONFIG.ranges.GAME_LOG_RANGE.getRandom();
    const selectedGames = faker.helpers.arrayElements(
      currentSeasonGames,
      Math.min(gameLogCount, currentSeasonGames.length)
    );

    for (const game of selectedGames) {
      const ratingForGame = faker.number.int({ min: 1, max: 5 });
      const currentRating = gameRatings.get(game.id) || { total: 0, count: 0 };
      gameRatings.set(game.id, {
        total: currentRating.total + ratingForGame,
        count: currentRating.count + 1,
      });

      yield {
        id: generateUUID(),
        userId: user.id,
        gameId: game.id,
        watchedDate: new Date(game.date),
        ratingForGame,
        watchedSetting: faker.helpers.arrayElement(
          Object.values(WATCHED_SETTING)
        ) as WatchedSettingValue,
        watchedScope: faker.helpers.arrayElement(Object.values(WATCHED_SCOPE)) as WatchedScopeValue,
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

// Optimized comments generator
async function* generateCommentsStream(
  userStream: AsyncGenerator<DbUser, void, unknown>,
  gameLogStream: AsyncGenerator<GameLogInsert, void, unknown>
): AsyncGenerator<CommentInsert, void, unknown> {
  const userChunks: DbUser[][] = [];
  let currentChunk: DbUser[] = [];
  let totalParentComments = 0;
  let skippedGameLogs = 0;

  // Collect users into chunks
  for await (const user of userStream) {
    currentChunk.push(user);
    if (currentChunk.length >= 100) {
      userChunks.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    userChunks.push(currentChunk);
  }

  for await (const gameLog of gameLogStream) {
    // Only generate comments for 10% of game logs that have reactions
    if (Math.random() >= 0.1) {
      continue;
    }

    if (!gameLog.id) {
      skippedGameLogs++;
      continue;
    }

    const commentCount = API_CONFIG.ranges.COMMENT_RANGE.getRandom();
    const userChunk = userChunks[Math.floor(Math.random() * userChunks.length)];
    const commenters = faker.helpers.arrayElements(
      userChunk,
      Math.min(commentCount, userChunk.length)
    );

    for (const commenter of commenters) {
      const parentComment: CommentInsert = {
        id: generateUUID(),
        userId: commenter.id,
        parentId: gameLog.id,
        parentType: 'game_log' as const,
        content: faker.lorem.paragraph(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
      };

      totalParentComments++;
      yield parentComment;

      // Recursively generate child comments with 10% probability at each level
      yield* generateChildComments(parentComment, userChunk, 1);
    }

    // Yield control periodically
    if (Math.random() < 0.1) {
      // 10% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  seedLogger.info(`Generated ${totalParentComments} parent comments`);
  if (skippedGameLogs > 0) {
    seedLogger.info(`Skipped ${skippedGameLogs} game logs due to missing IDs`);
  }
}

// Helper function to recursively generate child comments
async function* generateChildComments(
  parentComment: CommentInsert,
  userChunk: DbUser[],
  depth: number,
  maxDepth: number = 3 // Cap at 3 levels deep
): AsyncGenerator<CommentInsert, void, unknown> {
  // Stop if we've reached max depth
  if (depth >= maxDepth) {
    return;
  }

  // Only generate child comments for 10% of parent comments
  if (Math.random() >= 0.1) {
    return;
  }

  if (!parentComment.id) {
    seedLogger.warn('Skipping child comment generation for parent comment with undefined ID');
    return;
  }

  const childCommentCount = API_CONFIG.ranges.CHILD_COMMENT_RANGE.getRandom();
  const childCommenters = faker.helpers.arrayElements(
    userChunk,
    Math.min(childCommentCount, userChunk.length)
  );

  for (const childCommenter of childCommenters) {
    const childComment: CommentInsert = {
      id: generateUUID(),
      userId: childCommenter.id,
      parentId: parentComment.id,
      parentType: 'comment' as const,
      content: faker.lorem.paragraph(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
    };

    yield childComment;

    // Recursively generate next level of child comments with 10% probability
    yield* generateChildComments(childComment, userChunk, depth + 1, maxDepth);
  }
}

// Optimized reactions generator
async function* generateReactionsStream(
  userStream: AsyncGenerator<DbUser, void, unknown>,
  commentStream: AsyncGenerator<CommentInsert, void, unknown>,
  gameLogStream: AsyncGenerator<GameLogInsert, void, unknown>
): AsyncGenerator<ReactionInsert, void, unknown> {
  const userChunks: DbUser[][] = [];
  let currentChunk: DbUser[] = [];

  // Collect users into chunks
  for await (const user of userStream) {
    currentChunk.push(user);
    if (currentChunk.length >= 100) {
      userChunks.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    userChunks.push(currentChunk);
  }

  // Generate reactions for game logs
  for await (const gameLog of gameLogStream) {
    // Only generate reactions for 10% of game logs
    if (Math.random() >= 0.1) {
      continue;
    }

    const reactionCount = API_CONFIG.ranges.REACTION_RANGE.getRandom();
    const userChunk = userChunks[Math.floor(Math.random() * userChunks.length)];
    const reactors = faker.helpers.arrayElements(
      userChunk,
      Math.min(reactionCount, userChunk.length)
    );

    for (const reactor of reactors) {
      yield {
        id: generateUUID(),
        userId: reactor.id,
        targetId: gameLog.id ?? generateUUID(), // Fallback to new UUID if undefined
        targetType: 'game_log' as const,
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)) as ReactionEmojiValue,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
    }

    // Yield control periodically
    if (Math.random() < 0.1) {
      // 10% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  // Generate reactions for comments
  for await (const comment of commentStream) {
    // Only generate reactions for 10% of comments
    if (Math.random() >= 0.1) {
      continue;
    }

    // For game log comments, we want to ensure we're only reacting to 10% of game logs
    if (comment.parentType === ('game_log' as const)) {
      // Skip if this game log wasn't selected for reactions
      if (Math.random() >= 0.1) {
        continue;
      }
    }
    // For child comments, we want to ensure we're only reacting to 10% of parent comments
    else if (comment.parentType === ('comment' as const)) {
      // Skip if this parent comment wasn't selected for reactions
      if (Math.random() >= 0.1) {
        continue;
      }
    }

    const reactionCount = API_CONFIG.ranges.REACTION_RANGE.getRandom();
    const userChunk = userChunks[Math.floor(Math.random() * userChunks.length)];
    const reactors = faker.helpers.arrayElements(
      userChunk,
      Math.min(reactionCount, userChunk.length)
    );

    for (const reactor of reactors) {
      yield {
        id: generateUUID(),
        userId: reactor.id,
        targetId: comment.id ?? generateUUID(), // Fallback to new UUID if undefined
        targetType: 'comment' as const,
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)) as ReactionEmojiValue,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };
    }

    // Yield control periodically
    if (Math.random() < 0.1) {
      // 10% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }
}

// Add new streaming functions
async function* streamUsers(db: DatabaseClient): AsyncGenerator<DbUser, void, unknown> {
  const batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE;
  let lastId: string | undefined;

  while (true) {
    const query = db.select().from(users);
    if (lastId) {
      query.where(sql`id > ${lastId}`);
    }
    const batch = await query.limit(batchSize).orderBy(users.id);

    if (batch.length === 0) break;

    for (const user of batch) {
      yield user;
      lastId = user.id;
    }

    if (batch.length < batchSize) break;
  }
}

async function* streamGameLogs(db: DatabaseClient): AsyncGenerator<GameLogInsert, void, unknown> {
  const batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE;
  let lastId: string | undefined;

  while (true) {
    const query = db.select().from(game_logs);
    if (lastId) {
      query.where(sql`id > ${lastId}`);
    }
    const batch = await query.limit(batchSize).orderBy(game_logs.id);

    if (batch.length === 0) break;

    for (const log of batch) {
      yield log;
      lastId = log.id;
    }

    if (batch.length < batchSize) break;
  }
}

async function* streamComments(db: DatabaseClient): AsyncGenerator<CommentInsert, void, unknown> {
  const batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE;
  let lastId: string | undefined;

  while (true) {
    const query = db.select().from(comments);
    if (lastId) {
      query.where(sql`id > ${lastId}`);
    }
    const batch = await query.limit(batchSize).orderBy(comments.id);

    if (batch.length === 0) break;

    for (const comment of batch) {
      yield comment;
      lastId = comment.id;
    }

    if (batch.length < batchSize) break;
  }
}

// Main seeding function
export async function seedOptimizedApplicationData(
  options: ApplicationSeederOptions
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

    // Generate and insert friendships
    const friendshipStream = generateFriendshipsStream(
      generateUsersStream(
        API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT,
        existingEmails,
        skipUsers
      )
    );
    const friendshipsArray = [];
    for await (const friendship of friendshipStream) {
      friendshipsArray.push(friendship);
    }
    await db.insert(friendships).values(friendshipsArray);

    // Generate and insert game logs
    const gameLogStream = generateGameLogsStream(
      generateUsersStream(
        API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT,
        existingEmails,
        skipUsers
      ),
      db
    );
    const gameLogsArray = [];
    for await (const gameLog of gameLogStream) {
      gameLogsArray.push(gameLog);
    }
    await db.insert(game_logs).values(gameLogsArray);

    seedLogger.info('Successfully seeded application data');
  } catch (error) {
    seedLogger.error('Error seeding application data:', error);
    throw error;
  }
}
