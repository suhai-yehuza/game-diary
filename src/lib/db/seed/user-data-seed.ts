import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
import { Command } from 'commander';
import { drizzle } from 'drizzle-orm/neon-http';

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
  DISTRIBUTION_CONFIG_PRESETS,
} from '@src/lib/db/seed/statistical-distributions';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  FRIENDSHIP_STATUS,
  REACTION_EMOJIS,
  TARGET_TYPES,
} from '@src/lib/types';
import type {
  Database,
  IStatisticalSeedingConfig,
  ISeedUser,
  ISeedFriendship,
  ISeedGameLog,
  ISeedComment,
  ISeedReaction,
  ISeedingConfig,
} from '@src/lib/types';
import { encryptField, serializeEncryptedField } from '@src/lib/utils/encryption';
import { errorHandlers } from '@src/lib/utils/error-handler';
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
  // Memory optimization settings
  MEMORY_OPTIMIZATION: {
    BATCH_SIZE: 1000,
    USER_BATCH_SIZE: 500,
    FRIENDSHIP_BATCH_SIZE: 2000,
    GAME_LOG_BATCH_SIZE: 1500,
    COMMENT_BATCH_SIZE: 2000,
    REACTION_BATCH_SIZE: 3000,
    MEMORY_WARNING_THRESHOLD: 100000, // Warn when generating >100k records
    GARBAGE_COLLECTION_HINT_THRESHOLD: 50000, // Suggest GC after 50k records
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

// Memory monitoring utility
class MemoryMonitor {
  private readonly startMemory: number;
  private lastCheck: number;
  private readonly checkInterval: number;

  constructor(checkIntervalMs = 10000) {
    this.startMemory = this.getMemoryUsage();
    this.lastCheck = Date.now();
    this.checkInterval = checkIntervalMs;
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  checkMemory(recordCount: number): void {
    const now = Date.now();
    if (now - this.lastCheck >= this.checkInterval) {
      const currentMemory = this.getMemoryUsage();
      const memoryIncrease = currentMemory - this.startMemory;
      const memoryMB = Math.round(memoryIncrease / 1024 / 1024);

      console.log(`📊 Memory usage: ${memoryMB}MB increase, ${recordCount} records processed`);

      if (recordCount > GENERATION_CONFIG.MEMORY_OPTIMIZATION.GARBAGE_COLLECTION_HINT_THRESHOLD) {
        console.log('💡 Consider running garbage collection if available');
      }

      this.lastCheck = now;
    }
  }

  getMemoryStats(): { start: number; current: number; increase: number } {
    const current = this.getMemoryUsage();
    return {
      start: this.startMemory,
      current,
      increase: current - this.startMemory,
    };
  }
}

// Generate realistic user data - now returns a generator for memory efficiency
export function* generateUsersStream(count: number): Generator<ISeedUser, void, unknown> {
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName });
    // Generate plain values first
    const plainEmail = faker.internet.email({ firstName, lastName });
    const plainPhone = faker.phone.number();

    // Encrypt sensitive fields
    const encryptedEmail = serializeEncryptedField(encryptField(plainEmail));
    const encryptedPhone = serializeEncryptedField(encryptField(plainPhone));

    yield {
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
    };
  }
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

// Generate friendships between users - now returns a generator
export function* generateFriendshipsStream(
  users: ISeedUser[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): Generator<ISeedFriendship, void, unknown> {
  const processedPairs = new Set<string>();

  // Apply Pareto distribution: only some users form friendships
  const userFriendshipProbability = distributionConfig?.userFriendshipProbability ?? 0.6; // 60% of users form friendships by default

  console.log(`📊 User friendship probability: ${(userFriendshipProbability * 100).toFixed(1)}%`);

  let usersWithFriendships = 0;
  let totalUsersProcessed = 0;

  for (const user of users) {
    totalUsersProcessed++;

    // Apply Pareto distribution: only some users form friendships
    if (Math.random() > userFriendshipProbability) {
      continue; // Skip this user
    }

    usersWithFriendships++;

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
      // Create a unique key for this pair to avoid duplicates
      const pairKey = [user.id, friend.id].sort().join('-');

      if (processedPairs.has(pairKey)) {
        continue;
      }
      processedPairs.add(pairKey);

      // Create more realistic friendship scenarios that will trigger notifications
      // 60% pending (will create friend request notifications)
      // 30% accepted (will create acceptance notifications when status changes)
      // 10% rejected (will create rejection notifications when status changes)
      const status = faker.helpers.weightedArrayElement([
        { value: FRIENDSHIP_STATUS.PENDING, weight: 60 },
        { value: FRIENDSHIP_STATUS.ACCEPTED, weight: 30 },
        { value: FRIENDSHIP_STATUS.REJECTED, weight: 10 },
      ]);

      yield {
        id: generateUUIDv7(),
        friend_id: friend.id,
        user_id: user.id,
        status,
      };
    }
  }

  console.log(
    `📊 Users processed: ${totalUsersProcessed}, Users with friendships: ${usersWithFriendships} (${((usersWithFriendships / totalUsersProcessed) * 100).toFixed(1)}%)`
  );
}

// Generate game logs using streaming - now returns a generator for memory efficiency
export function* generateGameLogsStream(
  users: ISeedUser[],
  gameIds: string[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): Generator<ISeedGameLog, void, unknown> {
  // Generate game popularity weights using Pareto distribution
  // This ensures 20% of games get 80% of the game logs
  const gamePopularityWeights = generateGamePopularityWeights(gameIds.length);

  // Apply Pareto distribution: only some users generate game logs
  const userGameLogProbability = distributionConfig?.userGameLogProbability ?? 0.4; // 40% of users generate game logs by default

  // Apply Pareto distribution: only some games get logged
  const gameLogGameProbability = distributionConfig?.gameLogGameProbability ?? 0.3; // 30% of games get logged by default

  console.log(`📊 User game log probability: ${(userGameLogProbability * 100).toFixed(1)}%`);
  console.log(`📊 Game log game probability: ${(gameLogGameProbability * 100).toFixed(1)}%`);

  let usersWithGameLogs = 0;
  let totalUsersProcessed = 0;

  for (const user of users) {
    totalUsersProcessed++;

    // Apply Pareto distribution: only some users generate game logs
    if (Math.random() > userGameLogProbability) {
      continue; // Skip this user
    }

    usersWithGameLogs++;

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

    // Apply game probability filter
    const filteredUserGames = userGames.filter(() => Math.random() <= gameLogGameProbability);

    for (const gameId of filteredUserGames) {
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

      yield {
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
      };
    }
  }

  console.log(
    `📊 Users processed: ${totalUsersProcessed}, Users with game logs: ${usersWithGameLogs} (${((usersWithGameLogs / totalUsersProcessed) * 100).toFixed(1)}%)`
  );
  console.log(`📊 Game log game probability: ${(gameLogGameProbability * 100).toFixed(1)}%`);
}

// Generate comments on game logs with streaming support - now returns a generator
export function* generateCommentsStream(
  users: ISeedUser[],
  gameLogs: ISeedGameLog[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): Generator<ISeedComment, void, unknown> {
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
      yield comment;

      // Recursively generate nested comments (up to 5 levels deep)
      yield* generateNestedCommentsStream(comment, users, 1, config);
    }
  }
}

// Helper function to generate nested comments recursively - now returns a generator
function* generateNestedCommentsStream(
  parentComment: ISeedComment,
  users: ISeedUser[],
  currentDepth: number,
  config: ISeedingConfig
): Generator<ISeedComment, void, unknown> {
  // Stop at depth 10 (max allowed)
  if (currentDepth >= 10) return;

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
    yield reply;

    // Recursively generate replies to this reply
    yield* generateNestedCommentsStream(reply, users, currentDepth + 1, config);
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

// Generate reactions on game logs and comments using streaming - now returns a generator
export function* generateReactionsStream(
  users: ISeedUser[],
  gameLogs: ISeedGameLog[],
  comments: ISeedComment[],
  config: ISeedingConfig,
  distributionConfig?: IStatisticalSeedingConfig
): Generator<ISeedReaction, void, unknown> {
  let totalReactions = 0;

  // Generate reactions on game logs using Pareto distribution
  // Only a subset of game logs should have reactions (following 80/20 rule)
  const gameLogReactionProbability = distributionConfig?.gameLogReactionProbability ?? 0.5; // 50% of game logs get reactions by default

  console.log(
    `📊 Game log reaction probability: ${(gameLogReactionProbability * 100).toFixed(1)}%`
  );

  let gameLogsWithReactions = 0;
  let totalGameLogsProcessed = 0;

  for (const gameLog of gameLogs) {
    totalGameLogsProcessed++;

    // Apply Pareto distribution: only some game logs get reactions
    if (Math.random() > gameLogReactionProbability) {
      continue; // Skip this game log
    }

    gameLogsWithReactions++;

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

        yield {
          id: generateUUIDv7(),
          user_id: reactor.id,
          target_type: TARGET_TYPES.GAME_LOG,
          target_id: gameLog.id,
          // Note: REACTION_EMOJIS constant should be kept in sync with the reaction_emojis database table
          emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
        };

        totalReactions++;

        // Progress indicator for very large datasets
        if (totalReactions % 100000 === 0) {
          console.log(`📊 Progress: ${totalReactions} reactions generated`);
        }
      }
    }
  }

  // Generate reactions on comments using Pareto distribution
  // Only a subset of comments should have reactions (following 80/20 rule)
  const commentReactionProbability = distributionConfig?.commentReactionProbability ?? 0.3; // 30% of comments get reactions by default

  console.log(`📊 Comment reaction probability: ${(commentReactionProbability * 100).toFixed(1)}%`);

  let commentsWithReactions = 0;
  let totalCommentsProcessed = 0;

  for (const comment of comments) {
    totalCommentsProcessed++;

    // Apply Pareto distribution: only some comments get reactions
    if (Math.random() > commentReactionProbability) {
      continue; // Skip this comment
    }

    commentsWithReactions++;

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

        yield {
          id: generateUUIDv7(),
          user_id: reactor.id,
          target_type: TARGET_TYPES.COMMENT,
          target_id: comment.id,
          // Note: REACTION_EMOJIS constant should be kept in sync with the reaction_emojis database table
          emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
        };

        totalReactions++;

        // Progress indicator for very large datasets
        if (totalReactions % 100000 === 0) {
          console.log(`📊 Progress: ${totalReactions} reactions generated`);
        }
      }
    }
  }

  console.log(`📊 Generated ${totalReactions} total reactions`);
  console.log(
    `📊 Game logs processed: ${totalGameLogsProcessed}, Game logs with reactions: ${gameLogsWithReactions} (${((gameLogsWithReactions / totalGameLogsProcessed) * 100).toFixed(1)}%)`
  );
  console.log(
    `📊 Comments processed: ${totalCommentsProcessed}, Comments with reactions: ${commentsWithReactions} (${((commentsWithReactions / totalCommentsProcessed) * 100).toFixed(1)}%)`
  );
}

// Command line argument parsing using commander for robust CLI handling
function parseCommandLineArgs() {
  const program = new Command();

  program
    .name('seed-user-data')
    .description('🌱 User Data Seeding Script')
    .version('1.0.0')
    .option('-u, --users <count>', 'Number of users to generate', parseInt)
    .option('-s, --scenario <type>', 'Use predefined scenario (small, medium, large)', 'small')
    .option('-d, --distribution <preset>', 'Use statistical distribution preset')
    .option('-c, --clear', 'Clear all user data before seeding')
    .option('-h, --help', 'Show this help message');

  // Parse arguments
  program.parse(process.argv);
  const options = program.opts();

  return {
    users: options.users,
    clear: options.clear,
    help: options.help,
    scenario: options.scenario,
    distribution: options.distribution,
  };
}

// Show help information using commander's built-in help
function showHelp() {
  const program = new Command();

  program
    .name('seed-user-data')
    .description('🌱 User Data Seeding Script')
    .version('1.0.0')
    .option('-u, --users <count>', 'Number of users to generate', parseInt)
    .option('-s, --scenario <type>', 'Use predefined scenario (small, medium, large)', 'small')
    .option('-d, --distribution <preset>', 'Use statistical distribution preset')
    .option('-c, --clear', 'Clear all user data before seeding')
    .option('-h, --help', 'Show this help message');

  console.log(`
🌱 User Data Seeding Script

Scenarios:
  small                         100 users (default)
  medium                        1000 users
  large                         10000 users
  custom                        Use --users flag to specify count

Examples:
  pnpm run seed:user-data                    # Seed with 100 users (default)
  pnpm run seed:user-data --users 500       # Seed with 500 custom users
  pnpm run seed:user-data --scenario large  # Seed with 10000 users
  pnpm run seed:user-data --distribution pareto  # Use Pareto distribution
  pnpm run seed:user-data --scenario large --distribution pareto  # Large dataset with Pareto
  pnpm run seed:user-data --distribution normal  # Use normal distribution
  pnpm run seed:user-data --distribution realistic  # Use realistic patterns
  pnpm run seed:user-data --clear           # Clear user data only

Available Distribution Presets:
  uniform, normal, pareto, exponential, poisson, realistic,
  high-engagement, low-engagement, performance

Memory Optimization:
  This script is optimized for large datasets and will automatically:
  - Use streaming generators to minimize memory usage
  - Process data in configurable batches
  - Monitor memory usage in real-time
  - Provide progress indicators for long operations
`);

  program.help();
}

// Main execution function for standalone script
async function main() {
  const options = parseCommandLineArgs();

  // Commander handles help automatically, but we can still show custom help if needed
  if (options.help) {
    showHelp();
    return;
  }

  if (options.clear) {
    console.log('🧹 Clearing user data...');
    await clearUserData();
    return;
  }

  // Determine user count based on scenario or custom value
  let userCount = 100; // default

  if (options.scenario) {
    switch (options.scenario) {
      case 'small':
        userCount = 100;
        break;
      case 'medium':
        userCount = 1000;
        break;
      case 'large':
        userCount = 10000;
        break;
      case 'custom':
        if (options.users) {
          userCount = options.users;
        } else {
          console.error('❌ Custom scenario requires --users flag');
          process.exit(1);
        }
        break;
    }
  } else if (options.users) {
    userCount = options.users;
  }

  // Validate and get distribution config if specified
  let distributionConfig: IStatisticalSeedingConfig | undefined;
  if (options.distribution) {
    const distributionKey = options.distribution.toUpperCase();
    if (distributionKey in DISTRIBUTION_CONFIG_PRESETS) {
      distributionConfig =
        DISTRIBUTION_CONFIG_PRESETS[distributionKey as keyof typeof DISTRIBUTION_CONFIG_PRESETS];
      console.log(`📊 Using distribution preset: ${options.distribution}`);
    } else {
      const validPresets = Object.keys(DISTRIBUTION_CONFIG_PRESETS)
        .map(p => p.toLowerCase())
        .join(', ');
      console.error(`❌ Unknown distribution preset: ${options.distribution}`);
      console.error(`Available presets: ${validPresets}`);
      process.exit(1);
    }
  }

  console.log(`🚀 Starting user data seeding with ${userCount} users...`);
  console.log('💡 This script is memory-optimized for large datasets');

  try {
    await seedUserData({ userCount }, undefined, distributionConfig);
    console.log('✅ User data seeding completed successfully!');
  } catch (error) {
    console.error('❌ User data seeding failed:', error);
    process.exit(1);
  }
}

// Export the main function for programmatic use
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

  // Initialize memory monitor
  const memoryMonitor = new MemoryMonitor();

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
    // Step 1: Generate and insert users in streaming fashion
    console.log(`👥 Generating and inserting ${finalConfig.userCount} users...`);
    await timeStep('Generate and insert users', async () => {
      const userStream = generateUsersStream(finalConfig.userCount);
      let userBatch: ISeedUser[] = [];
      let totalUsers = 0;

      for (const user of userStream) {
        userBatch.push(user);

        if (userBatch.length >= GENERATION_CONFIG.MEMORY_OPTIMIZATION.USER_BATCH_SIZE) {
          await db.insert(users).values(userBatch).onConflictDoNothing();
          totalUsers += userBatch.length;
          userBatch = [];

          memoryMonitor.checkMemory(totalUsers);
        }
      }

      // Insert remaining users
      if (userBatch.length > 0) {
        await db.insert(users).values(userBatch).onConflictDoNothing();
        totalUsers += userBatch.length;
      }

      console.log(`📊 Total users inserted: ${totalUsers}`);
      return totalUsers;
    });

    // Step 2: Generate and insert friendships in streaming fashion
    console.log(`🤝 Generating and inserting friendships...`);
    await timeStep('Generate and insert friendships', async () => {
      // We need to get users from DB for friendship generation
      const usersFromDB = (await db.select().from(users)) as ISeedUser[];

      const friendshipStream = generateFriendshipsStream(
        usersFromDB,
        finalConfig,
        distributionConfig
      );
      let friendshipBatch: ISeedFriendship[] = [];
      let totalFriendships = 0;

      for (const friendship of friendshipStream) {
        friendshipBatch.push(friendship);

        if (friendshipBatch.length >= GENERATION_CONFIG.MEMORY_OPTIMIZATION.FRIENDSHIP_BATCH_SIZE) {
          await db.insert(friendships).values(friendshipBatch).onConflictDoNothing();
          totalFriendships += friendshipBatch.length;
          friendshipBatch = [];

          memoryMonitor.checkMemory(totalFriendships);
        }
      }

      // Insert remaining friendships
      if (friendshipBatch.length > 0) {
        await db.insert(friendships).values(friendshipBatch).onConflictDoNothing();
        totalFriendships += friendshipBatch.length;
      }

      console.log(`📊 Total friendships inserted: ${totalFriendships}`);
      return totalFriendships;
    });

    // Step 3: Get available games for game logs
    console.log(`🎮 Getting available games...`);
    const availableGames = await timeStep('Get available games', () =>
      db.select({ id: nba_games.id }).from(nba_games)
    );
    const gameIds = availableGames.map(game => game.id);

    if (gameIds.length === 0) {
      throw new Error('No games available for seeding game logs');
    }

    // Step 4: Generate and insert game logs in streaming fashion
    console.log(`📝 Generating and inserting game logs...`);
    await timeStep('Generate and insert game logs', async () => {
      const usersFromDB = (await db.select().from(users)) as ISeedUser[];
      const gameLogStream = generateGameLogsStream(
        usersFromDB,
        gameIds,
        finalConfig,
        distributionConfig
      );
      let gameLogBatch: ISeedGameLog[] = [];
      let totalGameLogs = 0;

      for (const gameLog of gameLogStream) {
        gameLogBatch.push(gameLog);

        if (gameLogBatch.length >= GENERATION_CONFIG.MEMORY_OPTIMIZATION.GAME_LOG_BATCH_SIZE) {
          await db.insert(game_logs).values(gameLogBatch).onConflictDoNothing();
          totalGameLogs += gameLogBatch.length;
          gameLogBatch = [];

          memoryMonitor.checkMemory(totalGameLogs);
        }
      }

      // Insert remaining game logs
      if (gameLogBatch.length > 0) {
        await db.insert(game_logs).values(gameLogBatch).onConflictDoNothing();
        totalGameLogs += gameLogBatch.length;
      }

      console.log(`📊 Total game logs inserted: ${totalGameLogs}`);
      return totalGameLogs;
    });

    // Step 5: Generate and insert comments in streaming fashion
    console.log(`💬 Generating and inserting comments...`);
    await timeStep('Generate and insert comments', async () => {
      const usersFromDB = (await db.select().from(users)) as ISeedUser[];
      const gameLogsFromDB = (await db.select().from(game_logs)) as ISeedGameLog[];

      const commentStream = generateCommentsStream(
        usersFromDB,
        gameLogsFromDB,
        finalConfig,
        distributionConfig
      );
      let commentBatch: ISeedComment[] = [];
      let totalComments = 0;

      for (const comment of commentStream) {
        commentBatch.push(comment);

        if (commentBatch.length >= GENERATION_CONFIG.MEMORY_OPTIMIZATION.COMMENT_BATCH_SIZE) {
          await db.insert(comments).values(commentBatch).onConflictDoNothing();
          totalComments += commentBatch.length;
          commentBatch = [];

          memoryMonitor.checkMemory(totalComments);
        }
      }

      // Insert remaining comments
      if (commentBatch.length > 0) {
        await db.insert(comments).values(commentBatch).onConflictDoNothing();
        totalComments += commentBatch.length;
      }

      console.log(`📊 Total comments inserted: ${totalComments}`);
      return totalComments;
    });

    // Step 6: Generate and insert reactions in streaming fashion
    console.log(`👍 Generating and inserting reactions...`);
    await timeStep('Generate and insert reactions', async () => {
      const usersFromDB = (await db.select().from(users)) as ISeedUser[];
      const gameLogsFromDB = (await db.select().from(game_logs)) as ISeedGameLog[];

      // Process comments in chunks to avoid memory issues with large datasets
      const COMMENT_CHUNK_SIZE = 10000; // Process 10k comments at a time
      let totalReactions = 0;
      let offset = 0;
      let hasMoreComments = true;
      let chunkCount = 0;

      console.log(`📊 Starting chunked comment processing with chunk size: ${COMMENT_CHUNK_SIZE}`);

      while (hasMoreComments) {
        try {
          chunkCount++;
          console.log(
            `📊 Processing comments chunk ${chunkCount}: offset ${offset}, size ${COMMENT_CHUNK_SIZE}`
          );

          // Fetch comments in chunks
          const commentsChunk = (await db
            .select()
            .from(comments)
            .limit(COMMENT_CHUNK_SIZE)
            .offset(offset)) as ISeedComment[];

          if (commentsChunk.length === 0) {
            console.log(`📊 No more comments found at offset ${offset}`);
            hasMoreComments = false;
            break;
          }

          console.log(
            `📊 Fetched ${commentsChunk.length} comments for chunk ${chunkCount} (${offset + 1} to ${offset + commentsChunk.length})`
          );

          // Generate reactions for this chunk
          const reactionStream = generateReactionsStream(
            usersFromDB,
            gameLogsFromDB,
            commentsChunk,
            finalConfig,
            distributionConfig
          );

          let reactionBatch: ISeedReaction[] = [];
          let chunkReactions = 0;

          for (const reaction of reactionStream) {
            reactionBatch.push(reaction);

            if (reactionBatch.length >= GENERATION_CONFIG.MEMORY_OPTIMIZATION.REACTION_BATCH_SIZE) {
              await db.insert(reactions).values(reactionBatch).onConflictDoNothing();
              chunkReactions += reactionBatch.length;
              totalReactions += reactionBatch.length;
              reactionBatch = [];

              memoryMonitor.checkMemory(totalReactions);
            }
          }

          // Insert remaining reactions from this chunk
          if (reactionBatch.length > 0) {
            await db.insert(reactions).values(reactionBatch).onConflictDoNothing();
            chunkReactions += reactionBatch.length;
            totalReactions += reactionBatch.length;
          }

          console.log(
            `📊 Chunk ${chunkCount} completed: ${chunkReactions} reactions, Total so far: ${totalReactions}`
          );
          offset += COMMENT_CHUNK_SIZE;

          // Add a small delay between chunks to prevent overwhelming the database
          if (hasMoreComments) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`❌ Error processing chunk ${chunkCount} at offset ${offset}:`, error);
          throw error;
        }
      }

      console.log(`📊 Completed processing ${chunkCount} chunks`);

      console.log(`📊 Total reactions inserted: ${totalReactions}`);
      return totalReactions;
    });

    // Final memory statistics
    const finalMemoryStats = memoryMonitor.getMemoryStats();
    const memoryMB = Math.round(finalMemoryStats.increase / 1024 / 1024);
    console.log(`📊 Final memory usage: ${memoryMB}MB increase`);

    console.log('✅ User data seeding completed successfully!');
  } catch (err: unknown) {
    errorHandlers.database(err instanceof Error ? err : new Error(String(err)), {
      component: 'UserDataSeed',
      action: 'Seed user data',
    });
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
    errorHandlers.database(err instanceof Error ? err : new Error(String(err)), {
      component: 'UserDataSeed',
      action: 'Clear user data',
    });
    throw err;
  }
}

// Execute main function if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
