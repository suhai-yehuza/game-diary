import { faker } from '@faker-js/faker';

import { API_CONFIG } from '@/lib/config/api.config';
import { DB_CONFIG } from '@/lib/config/db.config';
import { schema } from '@/lib/db/schema';
import { initializeDb } from '@/lib/db/seed/config';
import { FRIENDSHIP_STATUS, WATCHED_SETTINGS, REACTION_EMOJIS } from '@/lib/types/config.types';
import type {
  FriendshipStatusValue,
  WatchedSettingValue,
  ReactionEmojiValue,
} from '@/lib/types/config.types';
import type { DatabaseClient } from '@/lib/types/db.types';
import { processInBatches, generateUUID } from '@/lib/utils/index.processing';

// Limit concurrent operations
const CONCURRENT_OPERATIONS = DB_CONFIG.seeding.internal.CONCURRENT_OPERATIONS;
// const limit = pLimit(CONCURRENT_OPERATIONS);

/**
 * Generate and insert users
 */
async function generateAndInsertUsers(db: DatabaseClient) {
  console.log('Generating users...');
  const usedEmails = new Set<string>();

  // First, get all existing emails from the database
  const existingUsers = await db.query.users.findMany({
    columns: {
      email_address: true,
    },
  });
  existingUsers.forEach(user => usedEmails.add(user.email_address));
  console.log(`Found ${usedEmails.size} existing email addresses in database`);

  // Generate all users first with unique emails
  const users: Array<Required<typeof schema.users.$inferInsert>> = [];
  const targetCount = DB_CONFIG.seeding.internal.USER_COUNT;
  let attempts = 0;
  const maxAttempts = targetCount * 2; // Allow some extra attempts for retries

  while (users.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const username = `${faker.internet.username()}${faker.number.int({ min: 1, max: targetCount })}`;
    const email = `${username}@${faker.internet.domainName()}`;

    if (!usedEmails.has(email)) {
      usedEmails.add(email);
      const user: Required<typeof schema.users.$inferInsert> = {
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
      users.push(user);
    }
  }

  if (users.length < targetCount) {
    console.warn(
      `Warning: Only generated ${users.length} unique users out of ${targetCount} requested after ${attempts} attempts`
    );
    console.warn(
      'This may indicate a high number of existing users in the database or potential email generation issues'
    );
  }

  console.log(`Generated ${users.length} unique users`);

  // Insert all users in batches (neon-http driver doesn't support transactions)
  try {
    // Insert users in smaller chunks to avoid hitting query size limits
    const chunkSize = 100;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      await db.insert(schema.users).values(chunk);
      console.log(`Inserted users ${i + 1} to ${Math.min(i + chunkSize, users.length)}`);
    }
    console.log(`Successfully inserted all ${users.length} users in batches`);
  } catch (error: unknown) {
    console.error('Error inserting users:', error);
    // If we get a duplicate key error, try to identify which email caused it
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'constraint' in error &&
      'detail' in error &&
      error.code === '23505' &&
      error.constraint === 'users_email_address_unique'
    ) {
      const duplicateEmail = (error.detail as string)?.match(
        /Key \(email_address\)=\((.*?)\)/
      )?.[1];
      if (duplicateEmail) {
        console.error(`Duplicate email found: ${duplicateEmail}`);
        // Find the user with this email in our generated list
        const duplicateUser = users.find(u => u.email_address === duplicateEmail);
        if (duplicateUser) {
          console.error('Duplicate user details:', {
            id: duplicateUser.id,
            email: duplicateUser.email_address,
            username: duplicateUser.username,
          });
        }
      }
    }
    throw error;
  }

  return users;
}

/**
 * Generate and insert friendships
 */
async function generateAndInsertFriendships(
  db: DatabaseClient,
  users: Array<typeof schema.users.$inferSelect>
) {
  console.log('Generating friendships...');
  const friendships: Array<typeof schema.friendships.$inferInsert> = [];

  for (const user of users) {
    const friendshipCount = API_CONFIG.ranges.FRIENDSHIP_RANGE.getRandom();
    const potentialFriends = users.filter(u => u.id !== user.id);
    const selectedFriends = faker.helpers.arrayElements(potentialFriends, friendshipCount);

    for (const friend of selectedFriends) {
      friendships.push({
        id: generateUUID(),
        friend_id: user.id,
        user_id: friend.id,
        status: faker.helpers.arrayElement(
          Object.values(FRIENDSHIP_STATUS)
        ) as FriendshipStatusValue,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      });
    }
  }

  await processInBatches({
    items: friendships,
    batchSize: DB_CONFIG.seeding.internal.BATCH_SIZE,
    tableName: 'friendships',
    processFn: async friendshipBatch => {
      await db.insert(schema.friendships).values(friendshipBatch);
    },
    concurrencyLimit: CONCURRENT_OPERATIONS,
  });

  console.log(`Generated ${friendships.length} friendships`);
  return friendships;
}

// Helper to ensure all required fields are present
function createGameLog(
  obj: Omit<Required<typeof schema.game_logs.$inferInsert>, 'user_id'> & { user_id: string }
): Required<typeof schema.game_logs.$inferInsert> {
  return obj;
}
function createComment(
  obj: Omit<Required<typeof schema.comments.$inferInsert>, 'user_id' | 'parent_id'> & {
    user_id: string;
    parent_id: string;
  }
): Required<typeof schema.comments.$inferInsert> {
  return obj;
}

/**
 * Generate and insert game logs
 */
async function generateAndInsertGameLogs(
  db: DatabaseClient,
  users: Array<typeof schema.users.$inferSelect>
) {
  console.log('Generating game logs...');
  const gameLogs: Array<Required<typeof schema.game_logs.$inferInsert>> = [];

  for (const user of users) {
    const gameLogCount = API_CONFIG.ranges.GAME_LOG_RANGE.getRandom();
    const games = await db.query.nba_games.findMany({
      limit: gameLogCount,
      orderBy: (games, { desc }) => [desc(games.date)],
    });

    for (const game of games) {
      const rating = faker.number.int({ min: 1, max: 5 });

      // Extract the start date from the JSONB date object
      let watchedDate: Date;
      if (typeof game.date === 'object' && game.date !== null && 'start' in game.date) {
        watchedDate = new Date(game.date.start as string);
      } else if (typeof game.date === 'string') {
        watchedDate = new Date(game.date);
      } else if (game.date instanceof Date) {
        watchedDate = game.date;
      } else {
        // Fallback to a random recent date if date is invalid
        watchedDate = faker.date.recent();
      }

      // Validate the date before using it
      if (isNaN(watchedDate.getTime())) {
        watchedDate = faker.date.recent();
      }

      const gameLog = createGameLog({
        id: generateUUID(),
        user_id: user.id || '',
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
        classification: 'PROTECTED',
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
      gameLogs.push(gameLog);
    }
  }

  await processInBatches({
    items: gameLogs,
    batchSize: DB_CONFIG.seeding.internal.BATCH_SIZE,
    tableName: 'game_logs',
    processFn: async gameLogBatch => {
      await db.insert(schema.game_logs).values(gameLogBatch);
    },
    concurrencyLimit: CONCURRENT_OPERATIONS,
  });

  console.log(`Generated ${gameLogs.length} game logs`);
  return gameLogs;
}

/**
 * Generate and insert comments
 */
async function generateAndInsertComments(
  db: DatabaseClient,
  users: Array<typeof schema.users.$inferSelect>,
  gameLogs: Array<typeof schema.game_logs.$inferSelect>
) {
  console.log('Generating comments...');
  const comments: Array<Required<typeof schema.comments.$inferInsert>> = [];

  // Generate top-level comments
  for (const gameLog of gameLogs) {
    const commentCount = API_CONFIG.ranges.COMMENT_RANGE.getRandom();
    const commenters = faker.helpers.arrayElements(users, commentCount);

    for (const commenter of commenters) {
      const comment = createComment({
        id: generateUUID(),
        user_id: commenter.id || '',
        parent_id: gameLog.id || '',
        parent_type: 'game_log' as const,
        target_id: gameLog.id || '',
        target_type: 'game_log' as const,
        content: faker.lorem.paragraph(),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        deleted_at: null,
      });
      comments.push(comment);

      // Generate child comments
      const childCommentCount = API_CONFIG.ranges.CHILD_COMMENT_RANGE.getRandom();
      const childCommenters = faker.helpers.arrayElements(users, childCommentCount);

      for (const childCommenter of childCommenters) {
        const childComment = createComment({
          id: generateUUID(),
          user_id: childCommenter.id || '',
          parent_id: comment.id || '',
          parent_type: 'comment' as const,
          target_id: comment.id || '',
          target_type: 'comment' as const,
          content: faker.lorem.paragraph(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
          deleted_at: null,
        });
        comments.push(childComment);
      }
    }
  }

  await processInBatches({
    items: comments,
    batchSize: DB_CONFIG.seeding.internal.BATCH_SIZE,
    tableName: 'comments',
    processFn: async commentBatch => {
      await db.insert(schema.comments).values(commentBatch);
    },
    concurrencyLimit: CONCURRENT_OPERATIONS,
  });

  console.log(`Generated ${comments.length} comments`);
  return comments;
}

/**
 * Generate and insert reactions
 */
async function generateAndInsertReactions(
  db: DatabaseClient,
  users: Array<typeof schema.users.$inferSelect>,
  comments: Array<typeof schema.comments.$inferSelect>,
  gameLogs: Array<typeof schema.game_logs.$inferSelect>
) {
  console.log('Generating reactions...');
  const reactions: Array<typeof schema.reactions.$inferInsert> = [];

  // Generate reactions for comments
  for (const comment of comments) {
    const reactionCount = API_CONFIG.ranges.REACTION_RANGE.getRandom();
    const reactors = faker.helpers.arrayElements(users, reactionCount);

    for (const reactor of reactors) {
      const reaction: typeof schema.reactions.$inferInsert = {
        id: generateUUID(),
        user_id: reactor.id,
        target_id: comment.id,
        target_type: 'comment' as const,
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)) as ReactionEmojiValue,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
      reactions.push(reaction);
    }
  }

  // Generate reactions for game logs
  for (const gameLog of gameLogs) {
    const reactionCount = API_CONFIG.ranges.REACTION_RANGE.getRandom();
    const reactors = faker.helpers.arrayElements(users, reactionCount);

    for (const reactor of reactors) {
      const reaction: typeof schema.reactions.$inferInsert = {
        id: generateUUID(),
        user_id: reactor.id,
        target_id: gameLog.id,
        target_type: 'game_log' as const,
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)) as ReactionEmojiValue,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
      reactions.push(reaction);
    }
  }

  await processInBatches({
    items: reactions,
    batchSize: DB_CONFIG.seeding.internal.BATCH_SIZE,
    tableName: 'reactions',
    processFn: async reactionBatch => {
      await db.insert(schema.reactions).values(reactionBatch);
    },
    concurrencyLimit: CONCURRENT_OPERATIONS,
  });

  console.log(`Generated ${reactions.length} reactions`);
  return reactions;
}

export async function seedApplicationData(
  options: {
    skipApplicationDb?: boolean;
  } = {}
) {
  try {
    if (options.skipApplicationDb) {
      console.log('Skipping application data seeding as requested');
      return;
    }

    console.log('Starting application data seeding...');
    // Initialize the database client first
    const db = initializeDb();
    if (!db) {
      throw new Error('Failed to initialize database client');
    }

    // Table truncation is handled centrally by setup-db.ts

    // Generate and insert data
    const users = await generateAndInsertUsers(db);
    await generateAndInsertFriendships(db, users);
    const gameLogs = await generateAndInsertGameLogs(db, users);
    const comments = await generateAndInsertComments(db, users, gameLogs);
    await generateAndInsertReactions(db, users, comments, gameLogs);

    console.log('Application data seeding completed successfully');
  } catch (error) {
    console.error('Error during application data seeding:', error);
    throw error;
  }
}

// Allow running directly from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const skipApplicationDb = process.argv[2] === 'true';
  seedApplicationData({ skipApplicationDb })
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed to seed application data:', error);
      process.exit(1);
    });
}
