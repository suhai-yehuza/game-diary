import { faker } from '@faker-js/faker';
import { desc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { seedLogger } from '@lib/core/logger';
import { API_CONFIG } from '@src/lib/config/api.config';
import type * as schema from '@src/lib/db/schema';
import { game_logs, games } from '@src/lib/db/schema/game-schemas';
import { users, friendships, comments, reactions } from '@src/lib/db/schema/user-schemas';
import {
  FRIENDSHIP_STATUS,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  CLASSIFICATION,
  REACTION_EMOJIS,
} from '@src/lib/types';
import type {
  IApplicationSeederOptions,
  IWatchedScopeValue,
  IWatchedSettingValue,
  IFriendshipStatusValue,
} from '@src/lib/types';
import type {
  UserInsert,
  FriendshipInsert,
  GameLogInsert,
  CommentInsert,
  ReactionInsert,
} from '@src/lib/types/seeding.types';
import { generateUUID } from '@src/lib/utils/processing';
import { getCurrentSeason } from '@src/lib/utils/time';

// Statistical Distribution Utilities
class StatisticalDistributions {
  /**
   * Normal distribution (Bell curve) using Box-Muller transform
   * @param mean - Center of the distribution
   * @param stdDev - Standard deviation (spread of the distribution)
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   */
  static normal(
    mean: number,
    stdDev: number,
    min: number = -Infinity,
    max: number = Infinity
  ): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    const result = z0 * stdDev + mean;

    return Math.max(min, Math.min(max, result));
  }

  /**
   * Pareto distribution (80/20 rule) - for highly skewed data
   * @param scale - Scale parameter (minimum value)
   * @param shape - Shape parameter (higher = more skewed toward minimum)
   * @param max - Maximum allowed value
   */
  static pareto(scale: number, shape: number, max: number = Infinity): number {
    const u = Math.random();
    const result = scale / Math.pow(u, 1 / shape);
    return Math.min(result, max);
  }

  /**
   * Exponential distribution - for time-based events
   * @param lambda - Rate parameter (higher = more events closer to zero)
   * @param max - Maximum allowed value
   */
  static exponential(lambda: number, max: number = Infinity): number {
    const u = Math.random();
    const result = -Math.log(1 - u) / lambda;
    return Math.min(result, max);
  }

  /**
   * Beta distribution - for values between 0 and 1, then scaled
   * @param alpha - Shape parameter 1
   * @param beta - Shape parameter 2
   * @param min - Minimum value to scale to
   * @param max - Maximum value to scale to
   */
  static beta(alpha: number, beta: number, min: number = 0, max: number = 1): number {
    // Simple approximation of beta distribution
    let x = 0,
      y = 0;
    for (let i = 0; i < alpha; i++) x += -Math.log(Math.random());
    for (let i = 0; i < beta; i++) y += -Math.log(Math.random());

    const betaValue = x / (x + y);
    return min + betaValue * (max - min);
  }

  /**
   * Log-normal distribution - for highly right-skewed positive data
   * @param mu - Mean of underlying normal distribution
   * @param sigma - Standard deviation of underlying normal distribution
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   */
  static logNormal(mu: number, sigma: number, min: number = 0, max: number = Infinity): number {
    const normal = this.normal(mu, sigma);
    const result = Math.exp(normal);
    return Math.max(min, Math.min(max, result));
  }

  /**
   * Power law distribution - for social networks (friend counts, etc.)
   * @param min - Minimum value
   * @param max - Maximum value
   * @param exponent - Power law exponent (typically between 2-3 for social networks)
   */
  static powerLaw(min: number, max: number, exponent: number = 2.5): number {
    const u = Math.random();
    const exp = 1 - exponent;
    const result = Math.pow(
      (Math.pow(max, exp) - Math.pow(min, exp)) * u + Math.pow(min, exp),
      1 / exp
    );
    return Math.round(result);
  }

  /**
   * Zipf distribution - for popularity/frequency data (likes, views, etc.)
   * @param n - Number of elements
   * @param s - Exponent parameter (typically around 1)
   */
  static zipf(n: number, s: number = 1): number {
    const harmonic = Array.from({ length: n }, (_, i) => 1 / Math.pow(i + 1, s)).reduce(
      (a, b) => a + b,
      0
    );
    const u = Math.random() * harmonic;

    let sum = 0;
    for (let i = 1; i <= n; i++) {
      sum += 1 / Math.pow(i, s);
      if (sum >= u) return i;
    }
    return n;
  }

  /**
   * Get realistic user activity level using Pareto distribution
   * Most users are casual (80%), some are moderate (15%), few are power users (5%)
   */
  static getUserActivityLevel(): 'casual' | 'moderate' | 'power' {
    const value = this.pareto(1, 4, 100); // Pareto with strong skew
    if (value <= 5) return 'power'; // Top 5% are power users
    if (value <= 20) return 'moderate'; // Next 15% are moderate
    return 'casual'; // Bottom 80% are casual
  }

  /**
   * Get realistic social connection count using power law
   * Most people have few friends, some have many (social network effect)
   */
  static getSocialConnections(min: number = 1, max: number = 50): number {
    return this.powerLaw(min, max, 2.3); // Social network exponent
  }

  /**
   * Get realistic engagement count using log-normal distribution
   * Most content gets little engagement, some gets viral
   */
  static getEngagementCount(base: number = 1, max: number = 100): number {
    return Math.round(this.logNormal(Math.log(base), 1.5, 1, max));
  }

  /**
   * Get realistic rating using beta distribution skewed toward positive
   * Most ratings are 3-5 stars, fewer 1-2 star ratings
   */
  static getPositiveSkewedRating(min: number = 1, max: number = 5): number {
    const betaValue = this.beta(2, 1.2); // Skewed toward higher values
    return Math.round(min + betaValue * (max - min));
  }
}

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

      // Use normal distribution for realistic user creation times
      // Most users created recently, fewer from long ago
      const daysAgo = Math.abs(StatisticalDistributions.exponential(0.05, 365)); // Exponential decay
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

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
        createdAt,
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

// Optimized friendship generator from existing users with realistic distributions
async function* generateFriendshipsFromUsers(
  insertedUsers: UserInsert[]
): AsyncGenerator<FriendshipInsert, void, unknown> {
  if (insertedUsers.length === 0) {
    seedLogger.warn('No users provided for friendship generation');
    return;
  }

  // Use Pareto distribution to determine which users are social
  // 80% of users have few friends, 20% have many (realistic social network pattern)
  const socialUsers = insertedUsers.filter(() => Math.random() < 0.4); // 40% of users create friendships

  for (const user of socialUsers) {
    // Use power law distribution for friend count (realistic social network)
    const friendshipCount = Math.min(
      StatisticalDistributions.getSocialConnections(2, 30), // 2-30 friends, power law distributed
      insertedUsers.length - 1
    );

    // Select random friends from the inserted users (excluding self)
    const potentialFriends = insertedUsers.filter(u => u.id !== user.id);
    const selectedFriends = faker.helpers.arrayElements(
      potentialFriends,
      Math.min(friendshipCount, potentialFriends.length)
    );

    for (const friend of selectedFriends) {
      // Use realistic friendship status distribution
      // Most friendships are accepted (80%), some pending (15%), few blocked (5%)
      let status: IFriendshipStatusValue;
      const statusRoll = Math.random();
      if (statusRoll < 0.8) {
        status = FRIENDSHIP_STATUS.ACCEPTED;
      } else if (statusRoll < 0.95) {
        status = FRIENDSHIP_STATUS.PENDING;
      } else {
        status = FRIENDSHIP_STATUS.BLOCKED;
      }

      // Use exponential distribution for friendship creation time
      const daysAgo = Math.abs(StatisticalDistributions.exponential(0.02, 180)); // More recent friendships
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      yield {
        id: generateUUID(),
        friendId: user.id,
        userId: friend.id,
        status,
        createdAt,
        updatedAt: faker.date.recent(),
      };
    }
  }
}

// Optimized game logs generator with realistic distributions
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

  // Use activity levels to determine user participation
  // Process users based on their activity level (Pareto principle)
  for (const user of insertedUsers) {
    const activityLevel = StatisticalDistributions.getUserActivityLevel();

    let gameLogCount: number;
    switch (activityLevel) {
      case 'power':
        // Power users log many games (10-25)
        gameLogCount = Math.min(
          Math.round(StatisticalDistributions.normal(18, 4, 10, 25)),
          currentSeasonGames.length
        );
        break;
      case 'moderate':
        // Moderate users log some games (5-15)
        gameLogCount = Math.min(
          Math.round(StatisticalDistributions.normal(10, 3, 5, 15)),
          currentSeasonGames.length
        );
        break;
      case 'casual':
      default:
        // Casual users log few games (1-8), many log 0
        if (Math.random() < 0.3) continue; // 70% of casual users don't log games
        gameLogCount = Math.min(
          Math.round(StatisticalDistributions.exponential(0.3, 8)),
          currentSeasonGames.length
        );
        break;
    }

    const selectedGames = faker.helpers.arrayElements(
      currentSeasonGames,
      Math.min(gameLogCount, currentSeasonGames.length)
    );

    for (const game of selectedGames) {
      const gameRecord = game as { id: string; date: string | Date };

      // Use beta distribution for ratings (skewed toward positive)
      const ratingForGame = StatisticalDistributions.getPositiveSkewedRating(1, 5);

      const currentRating = gameRatings.get(gameRecord.id) || { total: 0, count: 0 };
      gameRatings.set(gameRecord.id, {
        total: currentRating.total + ratingForGame,
        count: currentRating.count + 1,
      });

      // Realistic distribution of watching settings
      // Most people watch at home (60%), some at venues (25%), fewer elsewhere (15%)
      let watchedSetting: IWatchedSettingValue;
      const settingRoll = Math.random();
      if (settingRoll < 0.6) {
        watchedSetting = WATCHED_SETTING.HOME;
      } else if (settingRoll < 0.85) {
        watchedSetting = WATCHED_SETTING.ARENA;
      } else {
        watchedSetting = faker.helpers.arrayElement(
          Object.values(WATCHED_SETTING)
        ) as IWatchedSettingValue;
      }

      // Realistic distribution of watching scope
      // Most watch full games (70%), some highlights (25%), few other (5%)
      let watchedScope: IWatchedScopeValue;
      const scopeRoll = Math.random();
      if (scopeRoll < 0.7) {
        watchedScope = WATCHED_SCOPE.FULL_GAME;
      } else if (scopeRoll < 0.95) {
        watchedScope = WATCHED_SCOPE.HIGHLIGHTS;
      } else {
        watchedScope = faker.helpers.arrayElement(
          Object.values(WATCHED_SCOPE)
        ) as IWatchedScopeValue;
      }

      // Notes length follows log-normal distribution (most short, some very long)
      const notesLength = StatisticalDistributions.logNormal(3, 1, 1, 5); // 1-5 sentences, log-normal
      const notes = faker.lorem.sentences(Math.round(notesLength));

      yield {
        id: generateUUID(),
        userId: user.id,
        gameId: gameRecord.id,
        watchedDate: new Date(gameRecord.date),
        ratingForGame,
        watchedSetting,
        watchedScope,
        notes,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
        tags: [],
        classification: CLASSIFICATION.PUBLIC,
      };
    }
  }
}

// Comments generator with realistic engagement patterns
async function* generateCommentsOnGameLogs(
  insertedUsers: UserInsert[],
  insertedGameLogs: GameLogInsert[]
): AsyncGenerator<CommentInsert, void, unknown> {
  if (insertedUsers.length === 0 || insertedGameLogs.length === 0) {
    seedLogger.warn('No users or game logs provided for comment generation');
    return;
  }

  // Generate comments using Zipf distribution (few posts get many comments, many get few)
  for (const gameLog of insertedGameLogs) {
    // Use Pareto distribution for comment likelihood
    // 80% of posts get few/no comments, 20% get many
    const commentProbability = StatisticalDistributions.pareto(0.1, 3, 1);
    if (commentProbability > 0.4) continue; // Skip if low engagement

    // Use log-normal distribution for comment count (realistic engagement)
    const commentCount = StatisticalDistributions.getEngagementCount(1, 12); // 1-12 comments, log-normal
    const commenters = faker.helpers.arrayElements(
      insertedUsers,
      Math.min(commentCount, insertedUsers.length)
    );

    for (const commenter of commenters) {
      if (!commenter.id || !gameLog.id) continue;

      // Comment length follows log-normal distribution
      const sentenceCount = Math.round(StatisticalDistributions.logNormal(1, 0.8, 1, 6)); // 1-6 sentences

      yield {
        id: generateUUID(),
        userId: commenter.id,
        parentId: gameLog.id,
        parentType: 'game_log',
        content: faker.lorem.sentences(sentenceCount),
        createdAt: faker.date.recent({ days: 30 }),
        updatedAt: faker.date.recent({ days: 7 }),
        deletedAt: null,
      };
    }
  }
}

// Enhanced nested comments with multi-level threading (max depth 3)
async function* generateMultiLevelNestedComments(
  insertedUsers: UserInsert[],
  levelOneComments: CommentInsert[],
  currentDepth: number = 1,
  maxDepth: number = 3
): AsyncGenerator<CommentInsert, void, unknown> {
  if (insertedUsers.length === 0 || levelOneComments.length === 0 || currentDepth > maxDepth) {
    return;
  }

  const newComments: CommentInsert[] = [];

  // Generate replies for current level comments
  for (const parentComment of levelOneComments) {
    // Exponential decay in reply probability as depth increases
    // Level 1: 30% chance, Level 2: 15% chance, Level 3: 7% chance
    const baseReplyChance = 0.3 / Math.pow(2, currentDepth - 1);
    const replyProbability = StatisticalDistributions.exponential(3, 1);
    if (replyProbability > baseReplyChance) continue;

    // Fewer replies at deeper levels (exponential decay)
    // Level 1: 1-5 replies, Level 2: 1-3 replies, Level 3: 1-2 replies
    const maxReplies = Math.max(1, 6 - currentDepth * 2);
    const replyCount = StatisticalDistributions.powerLaw(1, maxReplies, 2.5 + currentDepth * 0.5);
    const repliers = faker.helpers.arrayElements(
      insertedUsers,
      Math.min(replyCount, insertedUsers.length)
    );

    for (const replier of repliers) {
      if (!replier.id || !parentComment.id) continue;

      // Reply length gets shorter with depth (more focused responses)
      const baseSentenceCount = Math.max(1, 3 - currentDepth);
      const sentenceCount = Math.max(
        1,
        Math.round(
          StatisticalDistributions.normal(baseSentenceCount, 0.5, 1, baseSentenceCount + 1)
        )
      );

      // Vary response time based on depth (deeper replies are more immediate)
      const maxDaysAgo = Math.max(1, 15 - currentDepth * 4);

      const newComment: CommentInsert = {
        id: generateUUID(),
        userId: replier.id,
        parentId: parentComment.id,
        parentType: 'comment',
        content: faker.lorem.sentences(sentenceCount),
        createdAt: faker.date.recent({ days: maxDaysAgo }),
        updatedAt: faker.date.recent({ days: Math.max(1, maxDaysAgo / 2) }),
        deletedAt: null,
      };

      newComments.push(newComment);
      yield newComment;
    }
  }

  // Recursively generate next level if we haven't reached max depth
  if (currentDepth < maxDepth && newComments.length > 0) {
    // Only continue threading on a subset of comments (realistic conversation patterns)
    const threadContinuationRate = Math.max(0.1, 0.5 - currentDepth * 0.15);
    const commentsToThread = newComments.filter(() => Math.random() < threadContinuationRate);

    if (commentsToThread.length > 0) {
      for await (const deeperComment of generateMultiLevelNestedComments(
        insertedUsers,
        commentsToThread,
        currentDepth + 1,
        maxDepth
      )) {
        yield deeperComment;
      }
    }
  }
}

// Helper function to manage the complete nested comment generation process
async function* generateAllNestedComments(
  insertedUsers: UserInsert[],
  topLevelComments: CommentInsert[],
  maxDepth: number = 3
): AsyncGenerator<CommentInsert, void, unknown> {
  if (insertedUsers.length === 0 || topLevelComments.length === 0) {
    seedLogger.warn('No users or top-level comments provided for nested comment generation');
    return;
  }

  seedLogger.info(
    `Generating nested comments with max depth ${maxDepth} from ${topLevelComments.length} top-level comments`
  );

  for await (const nestedComment of generateMultiLevelNestedComments(
    insertedUsers,
    topLevelComments,
    1,
    maxDepth
  )) {
    yield nestedComment;
  }
}

// Reactions with realistic engagement distributions
async function* generateReactionsOnGameLogs(
  insertedUsers: UserInsert[],
  insertedGameLogs: GameLogInsert[]
): AsyncGenerator<ReactionInsert, void, unknown> {
  if (insertedUsers.length === 0 || insertedGameLogs.length === 0) {
    seedLogger.warn('No users or game logs provided for reaction generation');
    return;
  }

  const emojis = Object.values(REACTION_EMOJIS);

  // Emoji popularity follows Zipf distribution (some emojis much more popular)
  const emojiWeights = [0.4, 0.25, 0.15, 0.1, 0.05, 0.03, 0.015, 0.005]; // Zipf-like distribution
  const weightedEmojis = emojis.flatMap((emoji, index) =>
    Array(Math.round((emojiWeights[index] || 0.001) * 1000)).fill(emoji)
  );

  for (const gameLog of insertedGameLogs) {
    // Use Pareto distribution for reaction probability
    // Popular posts get many reactions, most get few/none
    const reactionProbability = StatisticalDistributions.pareto(0.2, 2, 1);
    if (reactionProbability > 0.7) continue; // 70% of posts get reactions

    // Use log-normal distribution for reaction count
    const reactionCount = StatisticalDistributions.getEngagementCount(2, 25); // 2-25 reactions, log-normal
    const reactors = faker.helpers.arrayElements(
      insertedUsers,
      Math.min(reactionCount, insertedUsers.length)
    );

    for (const reactor of reactors) {
      if (!reactor.id || !gameLog.id) continue;

      // Use weighted emoji selection (realistic popularity)
      const emoji = faker.helpers.arrayElement(weightedEmojis);

      yield {
        id: generateUUID(),
        userId: reactor.id,
        targetId: gameLog.id,
        targetType: 'game_log',
        emoji,
        createdAt: faker.date.recent({ days: 30 }),
        updatedAt: faker.date.recent({ days: 7 }),
        deletedAt: null,
      };
    }
  }
}

// Reactions on comments with lower engagement
async function* generateReactionsOnComments(
  insertedUsers: UserInsert[],
  insertedComments: CommentInsert[]
): AsyncGenerator<ReactionInsert, void, unknown> {
  if (insertedUsers.length === 0 || insertedComments.length === 0) {
    seedLogger.warn('No users or comments provided for reaction generation');
    return;
  }

  // Limited emoji set for comments (simpler reactions)
  // const emojis = ['👍', '❤️', '😂', '👏', '🐐', '💯', '🔥', '😮', '👎'];
  // const emojiWeights = [0.35, 0.15, 0.15, 0.1, 0.1, 0.08, 0.04, 0.02, 0.01]; // Zipf-like for comments

  for (const comment of insertedComments) {
    // Comments get fewer reactions than posts (exponential distribution)
    const reactionProbability = StatisticalDistributions.exponential(3, 1);
    if (reactionProbability > 0.25) continue; // 25% of comments get reactions

    // Fewer reactions per comment (exponential distribution)
    const reactionCount = Math.max(1, Math.round(StatisticalDistributions.exponential(0.4, 8))); // 1-8 reactions
    const reactors = faker.helpers.arrayElements(
      insertedUsers,
      Math.min(reactionCount, insertedUsers.length)
    );

    for (const reactor of reactors) {
      // Use weighted selection with actual REACTION_EMOJIS for type safety
      const emojiValues = Object.values(REACTION_EMOJIS);
      const emojiWeightedArray = [
        ...Array(35).fill(emojiValues[0]), // 👍 - 35%
        ...Array(25).fill(emojiValues[2]), // ❤️ - 25%
        ...Array(15).fill(emojiValues[3]), // 😂 - 15%
        ...Array(10).fill(emojiValues[8]), // 👏 - 10%
        ...Array(8).fill(emojiValues[10]), // 🐐 - 8%
        ...Array(4).fill(emojiValues[7]), // 🔥 - 4%
        ...Array(2).fill(emojiValues[6]), // 😮 - 2%
        ...Array(1).fill(emojiValues[1]), // 👎 - 1%
      ];
      const emoji = faker.helpers.arrayElement(emojiWeightedArray);

      yield {
        id: generateUUID(),
        userId: reactor.id,
        targetId: comment.id!,
        targetType: 'comment',
        emoji,
        createdAt: faker.date.recent({ days: 15 }),
        updatedAt: faker.date.recent({ days: 3 }),
        deletedAt: null,
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
    let gameLogsArray: GameLogInsert[] = [];
    let gameLogBatchCount = 0;
    const allGameLogs: GameLogInsert[] = []; // Collect all game logs for later use

    for await (const gameLog of gameLogStream) {
      gameLogsArray.push(gameLog);
      allGameLogs.push(gameLog); // Keep track of all generated game logs

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

    // Generate and insert comments on game logs in batches
    const commentStream = generateCommentsOnGameLogs(usersArray, allGameLogs);

    const COMMENT_BATCH_SIZE = 200; // Safe batch size for comments
    let topLevelCommentsArray: CommentInsert[] = [];
    let commentBatchCount = 0;
    const allTopLevelComments: CommentInsert[] = []; // Collect all top-level comments for later use

    for await (const comment of commentStream) {
      topLevelCommentsArray.push(comment);
      allTopLevelComments.push(comment); // Keep track of all generated top-level comments

      if (topLevelCommentsArray.length >= COMMENT_BATCH_SIZE) {
        await db.insert(comments).values(topLevelCommentsArray);
        seedLogger.info(
          `Inserted top-level comment batch ${++commentBatchCount} (${topLevelCommentsArray.length} records)`
        );
        topLevelCommentsArray = [];
      }
    }

    // Insert remaining top-level comments
    if (topLevelCommentsArray.length > 0) {
      await db.insert(comments).values(topLevelCommentsArray);
      seedLogger.info(
        `Inserted final top-level comment batch (${topLevelCommentsArray.length} records)`
      );
    }

    // Generate and insert nested comments (up to depth 3) in batches
    const nestedCommentStream = generateAllNestedComments(usersArray, allTopLevelComments, 3);

    let nestedCommentsArray: CommentInsert[] = [];
    let nestedCommentBatchCount = 0;
    const allNestedComments: CommentInsert[] = []; // Collect all nested comments for later use

    for await (const nestedComment of nestedCommentStream) {
      nestedCommentsArray.push(nestedComment);
      allNestedComments.push(nestedComment); // Keep track of all generated nested comments

      if (nestedCommentsArray.length >= COMMENT_BATCH_SIZE) {
        await db.insert(comments).values(nestedCommentsArray);
        seedLogger.info(
          `Inserted nested comment batch ${++nestedCommentBatchCount} (${nestedCommentsArray.length} records)`
        );
        nestedCommentsArray = [];
      }
    }

    // Insert remaining nested comments
    if (nestedCommentsArray.length > 0) {
      await db.insert(comments).values(nestedCommentsArray);
      seedLogger.info(
        `Inserted final nested comment batch (${nestedCommentsArray.length} records)`
      );
    }

    // Collect all comments (top-level + nested) for reaction generation
    const allComments = [...allTopLevelComments, ...allNestedComments];

    // Generate and insert reactions on game logs in batches
    const gameLogReactionStream = generateReactionsOnGameLogs(usersArray, allGameLogs);

    const REACTION_BATCH_SIZE = 300; // Safe batch size for reactions
    let gameLogReactionsArray: ReactionInsert[] = [];
    let gameLogReactionBatchCount = 0;

    for await (const reaction of gameLogReactionStream) {
      gameLogReactionsArray.push(reaction);

      if (gameLogReactionsArray.length >= REACTION_BATCH_SIZE) {
        await db.insert(reactions).values(gameLogReactionsArray);
        seedLogger.info(
          `Inserted game log reaction batch ${++gameLogReactionBatchCount} (${gameLogReactionsArray.length} records)`
        );
        gameLogReactionsArray = [];
      }
    }

    // Insert remaining game log reactions
    if (gameLogReactionsArray.length > 0) {
      await db.insert(reactions).values(gameLogReactionsArray);
      seedLogger.info(
        `Inserted final game log reaction batch (${gameLogReactionsArray.length} records)`
      );
    }

    // Generate and insert reactions on comments in batches
    const commentReactionStream = generateReactionsOnComments(usersArray, allComments);

    let commentReactionsArray: ReactionInsert[] = [];
    let commentReactionBatchCount = 0;

    for await (const reaction of commentReactionStream) {
      commentReactionsArray.push(reaction);

      if (commentReactionsArray.length >= REACTION_BATCH_SIZE) {
        await db.insert(reactions).values(commentReactionsArray);
        seedLogger.info(
          `Inserted comment reaction batch ${++commentReactionBatchCount} (${commentReactionsArray.length} records)`
        );
        commentReactionsArray = [];
      }
    }

    // Insert remaining comment reactions
    if (commentReactionsArray.length > 0) {
      await db.insert(reactions).values(commentReactionsArray);
      seedLogger.info(
        `Inserted final comment reaction batch (${commentReactionsArray.length} records)`
      );
    }

    seedLogger.info(
      'Successfully seeded application data with multi-level comments and realistic engagement patterns'
    );
  } catch (error) {
    seedLogger.error('Error seeding application data:', error);
    throw error;
  }
}
