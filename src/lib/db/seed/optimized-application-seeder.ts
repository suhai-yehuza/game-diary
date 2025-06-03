import { faker } from '@faker-js/faker';
import { sql, desc } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/api.config';
import { game_logs, games } from '@/lib/db/schema/game-schemas';
import { users, friendships, reactions, comments } from '@/lib/db/schema/user-schemas';
import {
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  REACTION_EMOJIS,
  FriendshipStatusValue,
  WatchedSettingValue,
  ReactionEmojiValue,
  WATCHED_SCOPE,
  WatchedScopeValue,
  CLASSIFICATION,
} from '@/lib/types/config.types';
import type { DatabaseClient } from '@/lib/types/database.types';
import { generateUUID } from '@/lib/utils/index.processing';
import { getCurrentSeason } from '@/lib/utils/index.time';

import type { DataProcessor } from './data-processor';

interface ApplicationSeederOptions {
  db: DatabaseClient;
  processor: DataProcessor;
  tables: string[];
  batchSize: number;
  skipUsers: boolean;
}

type DBUser = typeof users.$inferSelect;
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
  if (skipUsers) {
    return;
  }

  let generated = 0;
  let attempts = 0;
  const maxAttempts = targetCount * 2;

  while (generated < targetCount && attempts < maxAttempts) {
    attempts++;
    const username = `${faker.internet.username()}${faker.number.int({ min: 1, max: targetCount * 10 })}`;
    const email = `${username}@${faker.internet.domainName()}`;

    if (!existingEmails.has(email)) {
      existingEmails.add(email);

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
        timestamp: faker.date.recent(),
        last_sign_in_at: null,
        password_enabled: false,
        two_factor_enabled: false,
        email_verified: true,
        email_verification_strategy: null,
        external_id: null,
        external_accounts: [],
        deletedAt: null,
      };

      generated++;
    }
  }

  if (generated < targetCount) {
    console.warn(`Generated ${generated} unique users out of ${targetCount} requested`);
  }
}

// Optimized friendship generator
async function* generateFriendshipsStream(
  userStream: AsyncGenerator<DBUser, void, unknown>
): AsyncGenerator<FriendshipInsert, void, unknown> {
  const userChunks: DBUser[][] = [];
  let currentChunk: DBUser[] = [];

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
      // Only process 10% of users
      if (Math.random() >= 0.1) {
        continue;
      }

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

    // Yield control to prevent blocking
    await new Promise(resolve => setImmediate(resolve));
  }
}

// Optimized game logs generator
async function* generateGameLogsStream(
  userStream: AsyncGenerator<DBUser, void, unknown>,
  db: DatabaseClient
): AsyncGenerator<GameLogInsert, void, unknown> {
  // Get games from the latest season
  const latestSeasonGames = await db
    .select()
    .from(games)
    .orderBy(desc(games.date))
    .limit(API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT);

  if (latestSeasonGames.length === 0) {
    console.warn('No games found in the latest season');
    return;
  }

  // Get the current season and set season boundaries
  const seasonYear = getCurrentSeason();
  const seasonStartDate = new Date(seasonYear, 9, 1); // October 1st (month is 0-based)
  const seasonEndDate = new Date(seasonYear + 1, 5, 30); // June 30th of next year

  // Filter games to only include those from the current season
  const currentSeasonGames = latestSeasonGames.filter(game => {
    const gameDate = new Date(game.date);
    return gameDate >= seasonStartDate && gameDate <= seasonEndDate;
  });

  console.log(
    `Generating game logs from ${currentSeasonGames.length} games in the ${seasonYear}-${seasonYear + 1} season`
  );

  // Track ratings for each game
  const gameRatings = new Map<string, { total: number; count: number }>();
  let totalGameLogsGenerated = 0;
  const targetUserCount = API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT;
  let processedUsers = 0;

  for await (const user of userStream) {
    processedUsers++;
    if (processedUsers > targetUserCount) {
      break;
    }

    // Calculate how many game logs to generate for this user
    const gameLogCount = API_CONFIG.ranges.GAME_LOG_RANGE.getRandom();
    const selectedGames = faker.helpers.arrayElements(
      currentSeasonGames,
      Math.min(gameLogCount, currentSeasonGames.length)
    );

    for (const game of selectedGames) {
      const ratingForGame = faker.number.int({ min: 1, max: 5 });

      // Update game ratings tracking
      const currentRating = gameRatings.get(game.id) || { total: 0, count: 0 };
      gameRatings.set(game.id, {
        total: currentRating.total + ratingForGame,
        count: currentRating.count + 1,
      });

      // Extract watched date
      let watchedDate: Date;
      try {
        if (game.date) {
          watchedDate = new Date(game.date);
        } else {
          watchedDate = faker.date.recent();
        }

        if (isNaN(watchedDate.getTime())) {
          watchedDate = faker.date.recent();
        }
      } catch {
        watchedDate = faker.date.recent();
      }

      // Use weighted distribution for classifications from config
      const classificationWeight = faker.number.float({ min: 0, max: 1 });
      const { CLASSIFICATION_WEIGHTS } = API_CONFIG.classification;
      const classification =
        classificationWeight < CLASSIFICATION_WEIGHTS.protected
          ? CLASSIFICATION.PROTECTED
          : classificationWeight < CLASSIFICATION_WEIGHTS.protected + CLASSIFICATION_WEIGHTS.public
            ? CLASSIFICATION.PUBLIC
            : CLASSIFICATION.PRIVATE;

      yield {
        id: generateUUID(),
        userId: user.id,
        gameId: game.id,
        watchedSetting: faker.helpers.arrayElement(
          Object.values(WATCHED_SETTING)
        ) as WatchedSettingValue,
        watchedDate: watchedDate,
        watchedLocation: faker.location.streetAddress(),
        ratingForGame: ratingForGame,
        watchedScope: faker.helpers.arrayElement(Object.values(WATCHED_SCOPE)) as WatchedScopeValue,
        notes: faker.lorem.paragraph(),
        tags: [],
        classification,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
      };

      totalGameLogsGenerated++;
    }

    // Yield control periodically
    if (Math.random() < 0.1) {
      // 10% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  console.log(`Generated ${totalGameLogsGenerated} game logs from ${processedUsers} users`);
}

// Optimized comments generator
async function* generateCommentsStream(
  userStream: AsyncGenerator<DBUser, void, unknown>,
  gameLogStream: AsyncGenerator<GameLogInsert, void, unknown>
): AsyncGenerator<CommentInsert, void, unknown> {
  const userChunks: DBUser[][] = [];
  let currentChunk: DBUser[] = [];
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

  console.log(`Generated ${totalParentComments} parent comments`);
  if (skippedGameLogs > 0) {
    console.log(`Skipped ${skippedGameLogs} game logs due to missing IDs`);
  }
}

// Helper function to recursively generate child comments
async function* generateChildComments(
  parentComment: CommentInsert,
  userChunk: DBUser[],
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
    console.warn('Skipping child comment generation for parent comment with undefined ID');
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
  userStream: AsyncGenerator<DBUser, void, unknown>,
  commentStream: AsyncGenerator<CommentInsert, void, unknown>,
  gameLogStream: AsyncGenerator<GameLogInsert, void, unknown>
): AsyncGenerator<ReactionInsert, void, unknown> {
  const userChunks: DBUser[][] = [];
  let currentChunk: DBUser[] = [];

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
async function* streamUsers(db: DatabaseClient): AsyncGenerator<DBUser, void, unknown> {
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

// Modify the main seeding function
export async function seedOptimizedApplicationData(
  options: ApplicationSeederOptions
): Promise<void> {
  const { db, processor, batchSize = API_CONFIG.databaseSeeding.BATCH_SIZE, skipUsers } = options;
  const existingEmails = new Set<string>();

  try {
    console.log('👥 Starting optimized application data seeding...');

    // Generate and insert users
    if (!skipUsers) {
      console.log('👤 Generating users...');
      await processor.streamInsert(
        users,
        () => generateUsersStream(API_CONFIG.databaseSeeding.USER_COUNT, existingEmails, skipUsers),
        batchSize,
        'users'
      );
      console.log('👤 Users generated');
    }

    // Generate and insert friendships
    console.log('🤝 Generating friendships...');
    await processor.streamInsert(
      friendships,
      () => generateFriendshipsStream(streamUsers(db)),
      batchSize,
      'friendships'
    );
    console.log('✅ Friendships generated');

    // Generate and insert game logs
    console.log('🎮 Generating game logs...');
    await processor.streamInsert(
      game_logs,
      () => generateGameLogsStream(streamUsers(db), db),
      batchSize,
      'game_logs'
    );
    console.log('✅ Game logs generated');

    // Generate and insert comments
    console.log('💬 Generating comments...');
    await processor.streamInsert(
      comments,
      () => generateCommentsStream(streamUsers(db), streamGameLogs(db)),
      batchSize,
      'comments'
    );
    console.log('✅ Comments generated');

    // Generate and insert reactions
    console.log('👍 Generating reactions...');
    await processor.streamInsert(
      reactions,
      () => generateReactionsStream(streamUsers(db), streamComments(db), streamGameLogs(db)),
      batchSize,
      'reactions'
    );
    console.log('✅ Reactions generated');

    console.log('✅ Optimized application data seeding completed');
  } catch (error) {
    console.error('❌ Error during optimized application data seeding:', error);
    throw error;
  }
}
