import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

import { API_CONFIG } from '@/lib/config/api.config';
import { GameLogClassification } from '@/lib/db/schema/game-log-schemas';
import { game_logs, games, game_ratings } from '@/lib/db/schema/game-schemas';
import { users, friendships, reactions, comments } from '@/lib/db/schema/user-schemas';
import {
  FRIENDSHIP_STATUS,
  WATCHED_SETTINGS,
  REACTION_EMOJIS,
  FriendshipStatusValue,
  WatchedSettingValue,
  ReactionEmojiValue,
} from '@/lib/types/config.types';
import type { DatabaseClient } from '@/lib/types/db.types';
import { generateUUID } from '@/lib/utils/index.processing';

import type { DataProcessor } from './data-processor';

interface ApplicationSeederOptions {
  db: DatabaseClient;
  processor: DataProcessor;
  tables: string[];
  batchSize: number;
  skipUsers: boolean;
}

type User = typeof users.$inferSelect;
type UserInsert = typeof users.$inferInsert;
type FriendshipInsert = typeof friendships.$inferInsert;
type GameLogInsert = typeof game_logs.$inferInsert;
type CommentInsert = typeof comments.$inferInsert;
type ReactionInsert = typeof reactions.$inferInsert;
type Game = typeof games.$inferSelect;

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
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email_address: email,
        image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        inbound_friendship_ids: [],
        outbound_friendship_ids: [],
        banned: false,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        timestamp: faker.date.recent(),
        last_sign_in_at: null,
        password_enabled: false,
        two_factor_enabled: false,
        email_verified: true,
        email_verification_strategy: null,
        external_id: null,
        external_accounts: [],
        deleted_at: null,
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
  userStream: AsyncGenerator<User, void, unknown>
): AsyncGenerator<FriendshipInsert, void, unknown> {
  const userChunks: User[][] = [];
  let currentChunk: User[] = [];

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
      // Only process 20% of users
      if (Math.random() >= 0.2) {
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
          friend_id: user.id,
          user_id: friend.id,
          status: faker.helpers.arrayElement(
            Object.values(FRIENDSHIP_STATUS)
          ) as FriendshipStatusValue,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        };
      }
    }

    // Yield control to prevent blocking
    await new Promise(resolve => setImmediate(resolve));
  }
}

// Optimized game logs generator
async function* generateGameLogsStream(
  userStream: AsyncGenerator<User, void, unknown>,
  db: DatabaseClient
): AsyncGenerator<GameLogInsert, void, unknown> {
  // Get games in batches to reduce memory usage
  const gameLimit = API_CONFIG.databaseSeeding.DEFAULT_SAMPLE_COUNT;
  const gamesList = (await db.select().from(games).limit(gameLimit).orderBy(games.date)) as Game[];

  console.log(`Generating game logs from ${gamesList.length} available games`);

  // Track ratings for each game
  const gameRatings = new Map<string, { total: number; count: number }>();

  for await (const user of userStream) {
    // Only generate game logs for 20% of users
    if (Math.random() >= 0.2) {
      continue;
    }

    const gameLogCount = API_CONFIG.ranges.GAME_LOG_RANGE.getRandom();
    const selectedGames = faker.helpers.arrayElements(
      gamesList,
      Math.min(gameLogCount, gamesList.length)
    );

    for (const game of selectedGames) {
      const rating = faker.number.int({ min: 1, max: 5 });

      // Update game ratings tracking
      const currentRating = gameRatings.get(game.id) || { total: 0, count: 0 };
      gameRatings.set(game.id, {
        total: currentRating.total + rating,
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
          ? 'PROTECTED'
          : classificationWeight < CLASSIFICATION_WEIGHTS.protected + CLASSIFICATION_WEIGHTS.public
            ? 'PUBLIC'
            : ('PRIVATE' as GameLogClassification);

      yield {
        id: generateUUID(),
        user_id: user.id,
        game_id: game.id,
        watched_setting: faker.helpers.arrayElement(
          Object.values(WATCHED_SETTINGS)
        ) as WatchedSettingValue,
        watched_date: watchedDate,
        watched_location: faker.location.streetAddress(),
        rating_for_game: rating,
        rating_stars: '⭐'.repeat(rating) + '☆'.repeat(5 - rating),
        watched_count: faker.number.int({ min: 1, max: 10 }),
        notes: faker.lorem.paragraph(),
        tags: [],
        classification,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      };
    }

    // Yield control periodically
    if (Math.random() < 0.1) {
      // 20% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  // After all game logs are generated, update game ratings
  console.log('Updating game ratings...');
  for (const [gameId, rating] of gameRatings.entries()) {
    const averageRating = (rating.total / rating.count).toFixed(2);
    await db
      .insert(game_ratings)
      .values({
        id: generateUUID(),
        game_id: gameId,
        average_rating: averageRating,
        total_ratings: rating.count,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: game_ratings.game_id,
        set: {
          average_rating: averageRating,
          total_ratings: rating.count,
          updated_at: new Date(),
        },
      });
  }
  console.log('Game ratings updated');
}

// Optimized comments generator
async function* generateCommentsStream(
  userStream: AsyncGenerator<User, void, unknown>,
  gameLogStream: AsyncGenerator<GameLogInsert, void, unknown>
): AsyncGenerator<CommentInsert, void, unknown> {
  const userChunks: User[][] = [];
  let currentChunk: User[] = [];
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
    // Only generate comments for 20% of game logs
    if (Math.random() >= 0.2) {
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
        user_id: commenter.id,
        parent_id: gameLog.id,
        parent_type: 'game_log',
        content: faker.lorem.paragraph(),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      };

      totalParentComments++;
      yield parentComment;

      // Recursively generate child comments with 20% probability at each level
      yield* generateChildComments(parentComment, userChunk, 1);
    }

    // Yield control periodically
    if (Math.random() < 0.2) {
      // 20% chance to yield control
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
  userChunk: User[],
  depth: number,
  maxDepth: number = 3 // Cap at 3 levels deep
): AsyncGenerator<CommentInsert, void, unknown> {
  // Stop if we've reached max depth
  if (depth >= maxDepth) {
    return;
  }

  // Only generate child comments for 20% of parent comments
  if (Math.random() >= 0.2) {
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
      user_id: childCommenter.id,
      parent_id: parentComment.id,
      parent_type: 'comment',
      content: faker.lorem.paragraph(),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      deleted_at: null,
    };

    yield childComment;

    // Recursively generate next level of child comments
    yield* generateChildComments(childComment, userChunk, depth + 1, maxDepth);
  }
}

// Optimized reactions generator
async function* generateReactionsStream(
  userStream: AsyncGenerator<User, void, unknown>,
  commentStream: AsyncGenerator<CommentInsert, void, unknown>
): AsyncGenerator<ReactionInsert, void, unknown> {
  const userChunks: User[][] = [];
  let currentChunk: User[] = [];

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

  for await (const comment of commentStream) {
    // Only generate reactions for 20% of comments
    if (Math.random() >= 0.2) {
      continue;
    }

    // For game log comments, we want to ensure we're only reacting to 20% of game logs
    if (comment.parent_type === 'game_log') {
      // Skip if this game log wasn't selected for reactions
      if (Math.random() >= 0.2) {
        continue;
      }
    }
    // For child comments, we want to ensure we're only reacting to 20% of parent comments
    else if (comment.parent_type === 'comment') {
      // Skip if this parent comment wasn't selected for reactions
      if (Math.random() >= 0.2) {
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
        user_id: reactor.id,
        target_id: comment.id ?? generateUUID(), // Fallback to new UUID if undefined
        target_type: 'comment',
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)) as ReactionEmojiValue,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
    }

    // Yield control periodically
    if (Math.random() < 0.2) {
      // 20% chance to yield control
      await new Promise(resolve => setImmediate(resolve));
    }
  }
}

// Utility function to chunk arrays
// function chunkArray<T>(array: T[], chunkSize: number): T[][] {
//   const chunks: T[][] = [];
//   for (let i = 0; i < array.length; i += chunkSize) {
//     chunks.push(array.slice(i, i + chunkSize));
//   }
//   return chunks;
// }

// Add new streaming functions
async function* streamUsers(db: DatabaseClient): AsyncGenerator<User, void, unknown> {
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
      () => generateReactionsStream(streamUsers(db), streamComments(db)),
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
