import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
import type { Table } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { encryptField, serializeEncryptedField } from '@/lib/utils/encryption';
import {
  users,
  friendships,
  game_logs,
  comments,
  reactions,
  nba_games,
  notifications,
  game_ratings,
} from '@src/lib/db/schema';
import {
  generateGameRating,
  generateCommentCount,
  generateActivityAge,
  generateUserBehavior,
  generateGamePopularityWeights,
  selectGamesByPopularity,
  generateUserBehaviorWithConfig,
  generateValue,
  generateActivityAgeWithConfig,
  generateGameRatingWithConfig,
  generateCommentCountWithConfig,
} from '@src/lib/db/seed/statistical-distributions';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  FRIENDSHIP_STATUS,
  REACTION_EMOJIS,
  TARGET_TYPES,
} from '@src/lib/types';
import type { Database } from '@/lib/types/db.types';
import type {
  IStatisticalSeedingConfig,
  ISeedUser,
  ISeedFriendship,
  ISeedGameLog,
  ISeedComment,
  ISeedReaction,
  ISeedingConfig,
} from '@/lib/types/seeding.types';
import { generateUUIDv7 } from '@src/lib/utils/id-generator';

// Configuration for data generation
const GENERATION_CONFIG = {
  USERS: {
    COUNT: 100, // Generate 100 users
    MIN_FRIENDSHIPS_PER_USER: 2,
    MAX_FRIENDSHIPS_PER_USER: 8,
  },
  GAME_LOGS: {
    MIN_PER_USER: 3,
    MAX_PER_USER: 15,
  },
  COMMENTS: {
    MIN_PER_GAME_LOG: 1,
    MAX_PER_GAME_LOG: 5,
    CHILD_COMMENT_CHANCE: 0.3, // 30% chance of child comments
  },
  REACTIONS: {
    MIN_PER_GAME_LOG: 1,
    MAX_PER_GAME_LOG: 4,
    MIN_PER_COMMENT: 0,
    MAX_PER_COMMENT: 2,
  },
  SAFETY_LIMITS: {
    MAX_USERS: 100000,
    MAX_GAME_LOGS_PER_USER: 50,
    MAX_COMMENTS_PER_GAME_LOG: 100,
    MAX_REACTIONS_PER_ITEM: 200,
    MAX_TOTAL_RECORDS: 10000000, // 10M records max
  },
} as const;

// Configuration interface is now imported from seeding-types

// Default configuration
const DEFAULT_CONFIG: ISeedingConfig = {
  userCount: GENERATION_CONFIG.USERS.COUNT,
  gameLogsPerUser: {
    min: GENERATION_CONFIG.GAME_LOGS.MIN_PER_USER,
    max: GENERATION_CONFIG.GAME_LOGS.MAX_PER_USER,
  },
  commentsPerGameLog: {
    min: GENERATION_CONFIG.COMMENTS.MIN_PER_GAME_LOG,
    max: GENERATION_CONFIG.COMMENTS.MAX_PER_GAME_LOG,
  },
  friendshipsPerUser: {
    min: GENERATION_CONFIG.USERS.MIN_FRIENDSHIPS_PER_USER,
    max: GENERATION_CONFIG.USERS.MAX_FRIENDSHIPS_PER_USER,
  },
  reactionsPerGameLog: {
    min: GENERATION_CONFIG.REACTIONS.MIN_PER_GAME_LOG,
    max: GENERATION_CONFIG.REACTIONS.MAX_PER_GAME_LOG,
  },
  reactionsPerComment: {
    min: GENERATION_CONFIG.REACTIONS.MIN_PER_COMMENT,
    max: GENERATION_CONFIG.REACTIONS.MAX_PER_COMMENT,
  },
  childCommentChance: GENERATION_CONFIG.COMMENTS.CHILD_COMMENT_CHANCE,
};

// Basketball-specific data for realistic generation
const BASKETBALL_DATA = {
  TEAMS: [
    'Lakers',
    'Celtics',
    'Warriors',
    'Heat',
    'Bulls',
    'Knicks',
    'Bucks',
    'Suns',
    'Mavericks',
    'Nuggets',
    'Clippers',
    'Nets',
    '76ers',
    'Raptors',
    'Hawks',
  ],
  PLAYERS: [
    'LeBron James',
    'Stephen Curry',
    'Kevin Durant',
    'Giannis Antetokounmpo',
    'Nikola Jokic',
    'Luka Doncic',
    'Joel Embiid',
    'Jayson Tatum',
    'Devin Booker',
    'Damian Lillard',
    'Jimmy Butler',
    'Anthony Davis',
    'Kawhi Leonard',
  ],
  WATCHED_LOCATIONS: [
    'Home',
    'Sports Bar',
    'Arena',
    "Friend's House",
    'Work',
    'Gym',
    'Restaurant',
    'Airport',
    'Hotel',
    'Campus',
    'Park',
  ],
  GAME_NOTES: [
    'Incredible game! The atmosphere was electric.',
    'Close game until the final minutes.',
    'Amazing performance by the star player.',
    'Great defensive effort from both teams.',
    'The crowd was absolutely wild tonight.',
    'Perfect game for a date night.',
    'Watched with my basketball buddies.',
    'The refs were questionable tonight.',
    'What a comeback in the fourth quarter!',
    'The team chemistry is really showing.',
    'Incredible three-point shooting display.',
    'The defense was lockdown tonight.',
    'Great game for the kids to watch.',
    'The energy in the arena was unmatched.',
    'Perfect way to spend a Sunday afternoon.',
  ],
  TAGS: [
    'classic',
    'rivalry',
    'playoff',
    'overtime',
    'comeback',
    'blowout',
    'defense',
    'offense',
    'threes',
    'dunks',
    'clutch',
    'buzzer-beater',
    'all-star',
    'rookie',
    'veteran',
    'coach',
    'refs',
    'crowd',
    'atmosphere',
    'friends',
    'family',
    'date',
    'work',
    'travel',
    'home',
    'away',
  ],
} as const;

// Generate realistic user data
export function generateUsers(count: number): ISeedUser[] {
  const users: ISeedUser[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName({ firstName, lastName });
    // Generate plain values first
    const plainEmail = faker.internet.email({ firstName, lastName });
    const plainPhone = faker.phone.number();

    // Encrypt sensitive fields
    const encryptedEmail = serializeEncryptedField(encryptField(plainEmail));
    const encryptedPhone = serializeEncryptedField(encryptField(plainPhone));

    users.push({
      id: generateUUIDv7(),
      object: 'user',
      username,
      first_name: firstName,
      last_name: lastName,
      image_url: faker.image.avatar(),
      has_image: faker.datatype.boolean(),
      profile_image_url: faker.image.avatar(),
      primary_email_address_id: `email_${i + 1}`,
      primary_phone_number_id: `phone_${i + 1}`,
      email_address: encryptedEmail,
      phone_number: encryptedPhone,
      external_id: `clerk_user_${i + 1}`,
      bio: generateUserBio(),
      timezone: faker.helpers.arrayElement([
        'America/Los_Angeles',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Phoenix',
        'America/Anchorage',
      ]),
      preferred_language: faker.helpers.arrayElement(['en', 'es', 'fr']),
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
    });
  }
  return users;
}

function generateUserBio(): string {
  const team = faker.helpers.arrayElement(BASKETBALL_DATA.TEAMS);
  const player = faker.helpers.arrayElement(BASKETBALL_DATA.PLAYERS);
  const bioTemplates = [
    `Big ${team} fan! Love watching basketball with friends.`,
    `${team} fan since day one! 🏀`,
    `${team} fan for life! The energy and culture is unmatched.`,
    `Die-hard ${team} supporter. ${player} is my favorite player!`,
    `Basketball enthusiast and ${team} loyalist.`,
    `Love the game, love the ${team}!`,
    `${team} nation! Basketball is life.`,
    `Proud ${team} fan. Let's go!`,
    `Basketball and ${team} - that's all I need.`,
    `${team} fanatic here! Always ready for game day.`,
  ];

  return faker.helpers.arrayElement(bioTemplates);
}

// Generate friendships between users
export function generateFriendships(users: ISeedUser[], config: ISeedingConfig): ISeedFriendship[] {
  const friendships: ISeedFriendship[] = [];

  for (const user of users) {
    const friendshipCount = faker.number.int({
      min: config.friendshipsPerUser.min,
      max: config.friendshipsPerUser.max,
    });

    // Pick unique friends for this user
    const potentialFriends = users.filter(u => u.id !== user.id);
    const selectedFriends = faker.helpers.arrayElements(
      potentialFriends,
      Math.min(friendshipCount, potentialFriends.length)
    );

    for (const friend of selectedFriends) {
      // Avoid duplicate friendships (user1-user2 and user2-user1)
      if (
        friendships.some(
          f =>
            (f.user_id === friend.id && f.friend_id === user.id) ||
            (f.user_id === user.id && f.friend_id === friend.id)
        )
      ) {
        continue;
      }

      // Create more realistic friendship scenarios that will trigger notifications
      // 60% pending (will create friend request notifications)
      // 30% accepted (will create acceptance notifications when status changes)
      // 10% rejected (will create rejection notifications when status changes)
      const status = faker.helpers.weightedArrayElement([
        { value: FRIENDSHIP_STATUS.PENDING, weight: 60 },
        { value: FRIENDSHIP_STATUS.ACCEPTED, weight: 30 },
        { value: FRIENDSHIP_STATUS.REJECTED, weight: 10 },
      ]);

      friendships.push({
        id: generateUUIDv7(),
        friend_id: friend.id,
        user_id: user.id,
        status,
      });
    }
  }

  return friendships;
}

// Generate game logs using actual game IDs with realistic statistical distributions
export function generateGameLogs(
  users: ISeedUser[],
  gameIds: string[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): ISeedGameLog[] {
  const gameLogs: ISeedGameLog[] = [];

  // Generate game popularity weights using Pareto distribution
  // This ensures 20% of games get 80% of the game logs
  const gamePopularityWeights = generateGamePopularityWeights(gameIds.length);

  for (const user of users) {
    // Use user engagement to determine activity level
    const userBehavior = distributionConfig
      ? generateUserBehaviorWithConfig(distributionConfig)
      : generateUserBehavior();
    const engagementMultiplier = userBehavior.engagement;

    // Adjust game log count based on user engagement and distribution config
    const baseGameLogCount = distributionConfig
      ? Math.round(generateValue(distributionConfig.gameLogsPerUser))
      : faker.number.int({
          min: config.gameLogsPerUser.min,
          max: config.gameLogsPerUser.max,
        });
    const gameLogCount = Math.round(baseGameLogCount * engagementMultiplier);

    // Select games based on popularity weights (Pareto distribution)
    const selectedGameIndices = selectGamesByPopularity(
      gameIds.length,
      Math.min(gameLogCount, gameIds.length),
      gamePopularityWeights
    );
    // Deduplicate so each user only logs each game once
    const uniqueGameIndices = Array.from(new Set(selectedGameIndices));
    const userGames = uniqueGameIndices.map(index => gameIds[index]);

    for (const gameId of userGames) {
      // Generate realistic activity age (most recent, some older)
      const activityAge = distributionConfig
        ? generateActivityAgeWithConfig(distributionConfig)
        : generateActivityAge();
      const watchedDate = new Date(Date.now() - activityAge * 24 * 60 * 60 * 1000);

      // Use realistic classification distribution
      const classification = faker.helpers.weightedArrayElement([
        { value: CLASSIFICATION.PUBLIC, weight: 0.3 },
        { value: CLASSIFICATION.PROTECTED, weight: 0.6 },
        { value: CLASSIFICATION.PRIVATE, weight: 0.1 },
      ]);

      // Generate realistic game rating using distribution config
      const rating = distributionConfig
        ? generateGameRatingWithConfig(distributionConfig)
        : generateGameRating();

      gameLogs.push({
        id: generateUUIDv7(),
        user_id: user.id,
        game_id: gameId,
        classification,
        watched_setting: faker.helpers.arrayElement(Object.values(WATCHED_SETTING)),
        watched_scope: faker.helpers.arrayElement(Object.values(WATCHED_SCOPE)),
        watched_date: watchedDate,
        watched_location: faker.helpers.arrayElement(BASKETBALL_DATA.WATCHED_LOCATIONS),
        rating_for_game: rating,
        notes: faker.helpers.arrayElement(BASKETBALL_DATA.GAME_NOTES),
        tags: faker.helpers.arrayElements(
          BASKETBALL_DATA.TAGS,
          faker.number.int({ min: 1, max: 4 })
        ),
      });
    }
  }
  return gameLogs;
}

// Generate comments on game logs with support for up to 5 levels of nesting using realistic distributions
export function generateComments(
  users: ISeedUser[],
  gameLogs: ISeedGameLog[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): ISeedComment[] {
  const comments: ISeedComment[] = [];

  for (const gameLog of gameLogs) {
    // Use realistic comment count distribution (Poisson + Power Law for viral content)
    const commentCount = distributionConfig
      ? generateCommentCountWithConfig(distributionConfig)
      : generateCommentCount();

    // Limit to available users and reasonable bounds
    const maxComments = Math.min(commentCount, users.length, 20);
    const actualCommentCount = Math.max(0, maxComments);

    // Generate top-level comments for this game log
    const commenters = faker.helpers.arrayElements(users, actualCommentCount);
    for (const commenter of commenters) {
      if (commenter.id === gameLog.user_id) continue; // Skip if same user

      const comment: ISeedComment = {
        id: generateUUIDv7(),
        user_id: commenter.id,
        parent_id: gameLog.id,
        parent_type: TARGET_TYPES.GAME_LOG, // Type assertion for compatibility
        content: generateCommentContent(),
        depth: 0, // Top-level comment
      };
      comments.push(comment);

      // Recursively generate nested comments (up to 5 levels deep)
      generateNestedComments(comment, comments, users, 1, config);
    }
  }
  return comments;
}

// Helper function to generate nested comments recursively
function generateNestedComments(
  parentComment: ISeedComment,
  comments: ISeedComment[],
  users: ISeedUser[],
  currentDepth: number,
  config: ISeedingConfig
) {
  // Stop at depth 5 (max allowed)
  if (currentDepth >= 5) return;

  // Generate 1-2 replies to this comment
  const replyCount = faker.number.int({ min: 1, max: 2 });

  for (let i = 0; i < replyCount; i++) {
    // 50% chance to generate a reply at each level
    if (!faker.datatype.boolean({ probability: 0.5 })) continue;

    const replier = faker.helpers.arrayElement(users.filter(u => u.id !== parentComment.user_id));

    const reply: ISeedComment = {
      id: generateUUIDv7(),
      user_id: replier.id,
      parent_id: parentComment.id,
      parent_type: TARGET_TYPES.COMMENT,
      content: generateNestedCommentContent(currentDepth),
      depth: currentDepth,
    };
    comments.push(reply);

    // Recursively generate replies to this reply
    generateNestedComments(reply, comments, users, currentDepth + 1, config);
  }
}

function generateNestedCommentContent(depth: number): string {
  const templates = [
    'Totally agree!',
    'Great point!',
    'I think so too.',
    'Absolutely!',
    'Well said!',
    "Couldn't agree more.",
    'Spot on!',
    'Exactly my thoughts.',
    'You nailed it!',
    'Perfect analysis!',
    'This is so true!',
    'I see what you mean.',
    'Good insight!',
    'Makes perfect sense.',
    'I agree with this take.',
  ];

  // Add depth-specific content for deeper comments
  if (depth >= 3) {
    templates.push(
      'This thread is getting deep!',
      "We're really diving into this.",
      'Great discussion here.',
      'Love this conversation.',
      'This is getting interesting.'
    );
  }

  return faker.helpers.arrayElement(templates);
}

function generateCommentContent(): string {
  const templates = [
    'Great game log! I watched that game too, it was incredible!',
    'Amazing game! The atmosphere must have been electric.',
    'I love watching this team play. Great analysis!',
    'The energy in that game was unmatched.',
    'What a performance! Thanks for sharing.',
    'I wish I could have been there!',
    'Great insights on the game.',
    'The team chemistry is really showing this season.',
    'Incredible game! Thanks for the detailed notes.',
    'I agree with your assessment of the game.',
    'The crowd was absolutely wild tonight.',
    'Perfect game for a basketball fan.',
    'Great defensive effort from both teams.',
    'The refs were questionable tonight.',
    'What a comeback in the fourth quarter!',
  ];

  return faker.helpers.arrayElement(templates);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateChildCommentContent(): string {
  const templates = [
    'Totally agree!',
    'Great point!',
    'I think so too.',
    'Absolutely!',
    'Well said!',
    "Couldn't agree more.",
    'Spot on!',
    'Exactly my thoughts.',
    'You nailed it!',
    'Perfect analysis!',
  ];

  return faker.helpers.arrayElement(templates);
}

// Generate reactions on game logs and comments using realistic distributions
export function generateReactions(
  users: ISeedUser[],
  gameLogs: ISeedGameLog[],
  comments: ISeedComment[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
) {
  const reactions: ISeedReaction[] = [];
  const maxReactionsPerBatch = 10000; // Limit memory usage for very large datasets
  let hasWarnedLarge = false;
  let hasWarnedVeryLarge = false;

  // Generate reactions on game logs
  for (const gameLog of gameLogs) {
    // Use configuration for reaction count per game log
    const reactionCount = distributionConfig
      ? Math.round(generateValue(distributionConfig.reactionCount))
      : faker.number.int({
          min: config.reactionsPerGameLog.min,
          max: config.reactionsPerGameLog.max,
        });

    if (reactionCount > 0) {
      const reactors = faker.helpers.arrayElements(users, Math.min(reactionCount, users.length));
      for (const reactor of reactors) {
        if (reactor.id === gameLog.user_id) continue; // Skip if same user
        reactions.push({
          id: generateUUIDv7(),
          user_id: reactor.id,
          target_type: TARGET_TYPES.GAME_LOG,
          target_id: gameLog.id,
          emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
        });

        // Memory management: warn only once when thresholds are crossed
        if (!hasWarnedLarge && reactions.length > maxReactionsPerBatch) {
          console.warn(
            `⚠️  Large reaction dataset detected: ${reactions.length} reactions generated so far`
          );
          hasWarnedLarge = true;
        }
      }
    }
  }

  // Generate reactions on comments
  for (const comment of comments) {
    // Use configuration for reaction count per comment
    const reactionCount = distributionConfig
      ? Math.round(generateValue(distributionConfig.reactionCount))
      : faker.number.int({
          min: config.reactionsPerComment.min,
          max: config.reactionsPerComment.max,
        });

    if (reactionCount > 0) {
      const reactors = faker.helpers.arrayElements(users, Math.min(reactionCount, users.length));
      for (const reactor of reactors) {
        if (reactor.id === comment.user_id) continue; // Skip if same user
        reactions.push({
          id: generateUUIDv7(),
          user_id: reactor.id,
          target_type: TARGET_TYPES.COMMENT,
          target_id: comment.id,
          emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
        });

        // Memory management: warn only once when thresholds are crossed
        if (!hasWarnedVeryLarge && reactions.length > maxReactionsPerBatch * 2) {
          console.warn(
            `⚠️  Very large reaction dataset detected: ${reactions.length} reactions generated so far`
          );
          hasWarnedVeryLarge = true;
        }
      }
    }
  }

  console.log(`📊 Generated ${reactions.length} total reactions`);
  return reactions;
}

// Helper function to batch insert large arrays
async function batchInsert<T>(db: Database, table: Table, data: T[], batchSize = 500) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await db.insert(table).values(batch);
  }
}

export async function seedUserData(
  config?: Partial<ISeedingConfig>,
  _optimizationConfig?: unknown,
  distributionConfig?: IStatisticalSeedingConfig,
  _options?: { overrideSafetyLimits?: boolean }
) {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql) as unknown as Database;

  // Merge provided config with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Validate configuration for potential issues
  const validateConfiguration = (config: ISeedingConfig, _overrideSafetyLimits = false) => {
    const estimatedGameLogs =
      config.userCount * ((config.gameLogsPerUser.min + config.gameLogsPerUser.max) / 2);
    const estimatedComments =
      estimatedGameLogs * ((config.commentsPerGameLog.min + config.commentsPerGameLog.max) / 2);
    const estimatedReactions =
      (estimatedGameLogs + estimatedComments) *
      ((config.reactionsPerGameLog.min + config.reactionsPerGameLog.max) / 2);
    const totalRecords =
      config.userCount + estimatedGameLogs + estimatedComments + estimatedReactions;

    console.log('📊 Estimated data volume:');
    console.log(`   Users: ${config.userCount}`);
    console.log(`   Game Logs: ~${Math.round(estimatedGameLogs)}`);
    console.log(`   Comments: ~${Math.round(estimatedComments)}`);
    console.log(`   Reactions: ~${Math.round(estimatedReactions)}`);
    console.log(`   Total records: ~${Math.round(totalRecords)}`);

    // Check safety limits
    const safetyLimits = GENERATION_CONFIG.SAFETY_LIMITS;
    let hasWarnings = false;

    if (config.userCount > safetyLimits.MAX_USERS) {
      console.warn(
        `⚠️  User count exceeds safety limit: ${config.userCount} > ${safetyLimits.MAX_USERS}`
      );
      hasWarnings = true;
    }

    if (config.userCount * config.gameLogsPerUser.max > safetyLimits.MAX_GAME_LOGS_PER_USER) {
      console.warn(
        `⚠️  Game log count exceeds safety limit: ${config.userCount * config.gameLogsPerUser.max} > ${safetyLimits.MAX_GAME_LOGS_PER_USER}`
      );
      hasWarnings = true;
    }

    if (config.userCount * config.commentsPerGameLog.max > safetyLimits.MAX_COMMENTS_PER_GAME_LOG) {
      console.warn(
        `⚠️  Comment count exceeds safety limit: ${config.userCount * config.commentsPerGameLog.max} > ${safetyLimits.MAX_COMMENTS_PER_GAME_LOG}`
      );
      hasWarnings = true;
    }

    if (config.userCount * config.reactionsPerGameLog.max > safetyLimits.MAX_REACTIONS_PER_ITEM) {
      console.warn(
        `⚠️  Reaction count exceeds safety limit: ${config.userCount * config.reactionsPerGameLog.max} > ${safetyLimits.MAX_REACTIONS_PER_ITEM}`
      );
      hasWarnings = true;
    }

    if (
      config.userCount * config.gameLogsPerUser.min + config.gameLogsPerUser.max >
      safetyLimits.MAX_TOTAL_RECORDS
    ) {
      console.warn(
        `⚠️  Total record count exceeds safety limit: ${config.userCount * config.gameLogsPerUser.min + config.gameLogsPerUser.max} > ${safetyLimits.MAX_TOTAL_RECORDS}`
      );
      hasWarnings = true;
    }

    if (hasWarnings) {
      console.warn('⚠️  Configuration warnings detected');
    }
  };

  validateConfiguration(finalConfig);

  // Timing utility function
  const timeStep = async <T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();
    const result = await stepFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ${stepName} completed in ${duration}ms`);
    return result;
  };

  try {
    // Step 1: Generate users
    console.log(`👥 Generating ${finalConfig.userCount} users...`);
    const usersData = await timeStep('Generate users', () =>
      Promise.resolve(generateUsers(finalConfig.userCount))
    );

    // Step 2: Insert users into database
    await timeStep('Insert users', () => batchInsert(db, users, usersData));

    // Step 3: Generate friendships
    console.log(`🤝 Generating friendships...`);
    const friendshipsData = await timeStep('Generate friendships', () =>
      Promise.resolve(generateFriendships(usersData, finalConfig))
    );

    // Step 4: Insert friendships into database
    if (friendshipsData.length > 0) {
      await timeStep('Insert friendships', () => batchInsert(db, friendships, friendshipsData));
    }

    // Step 5: Get available games for game logs
    console.log(`🎮 Getting available games...`);
    const availableGames = await timeStep('Get available games', () =>
      db.select({ id: nba_games.id }).from(nba_games)
    );
    const gameIds = availableGames.map(game => game.id);

    if (gameIds.length === 0) {
      throw new Error('No games available for seeding game logs');
    }

    // Step 6: Generate game logs
    console.log(`📝 Generating game logs...`);
    const gameLogsData = await timeStep('Generate game logs', () =>
      Promise.resolve(generateGameLogs(usersData, gameIds, finalConfig, distributionConfig))
    );

    // Step 7: Insert game logs into database
    if (gameLogsData.length > 0) {
      await timeStep('Insert game logs', () => batchInsert(db, game_logs, gameLogsData));
    }

    // Step 8: Generate comments
    console.log(`💬 Generating comments...`);
    const commentsData = await timeStep('Generate comments', () =>
      Promise.resolve(generateComments(usersData, gameLogsData, finalConfig, distributionConfig))
    );

    // Step 9: Insert comments into database
    if (commentsData.length > 0) {
      await timeStep('Insert comments', () => batchInsert(db, comments, commentsData));
    }

    // Step 10: Generate reactions
    console.log(`👍 Generating reactions...`);
    const reactionsData = await timeStep('Generate reactions', () =>
      Promise.resolve(
        generateReactions(usersData, gameLogsData, commentsData, finalConfig, distributionConfig)
      )
    );

    // Step 11: Insert reactions into database
    if (reactionsData.length > 0) {
      await timeStep('Insert reactions', () => batchInsert(db, reactions, reactionsData));
    }

    console.log('✅ User data seeding completed successfully!');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Error seeding user data:', err.message);
    } else {
      console.error('❌ Error seeding user data:', err);
    }
    throw err;
  }
}

// Function to clear user data (useful for testing)
export async function clearUserData() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql) as unknown as Database;

  console.log('🧹 Clearing user data...');

  // Timing utility function
  const timeStep = async <T>(stepName: string, stepFunction: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();
    const result = await stepFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`✅ ${stepName} completed in ${duration}ms`);
    return result;
  };

  try {
    // Clear in reverse order of dependencies
    await timeStep('Clear notifications', () => db.delete(notifications));
    await timeStep('Clear reactions', () => db.delete(reactions));
    await timeStep('Clear comments', () => db.delete(comments));
    await timeStep('Clear game logs', () => db.delete(game_logs));
    await timeStep('Clear game ratings', () => db.delete(game_ratings));
    await timeStep('Clear friendships', () => db.delete(friendships));
    await timeStep('Clear users', () => db.delete(users));

    console.log('✅ User data cleared successfully!');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('❌ Error clearing user data:', err.message);
    } else {
      console.error('❌ Error clearing user data:', err);
    }
    throw err;
  }
}
