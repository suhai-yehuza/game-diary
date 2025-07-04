import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { schema } from '@src/lib/db/schema';
import {
  generateGameRating,
  generateCommentCount,
  generateReactionCount,
  generateActivityAge,
  generateUserBehavior,
} from '@src/lib/db/seed/statistical-distributions';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  FRIENDSHIP_STATUS,
  REACTION_EMOJIS,
  TARGET_TYPES,
} from '@src/lib/types';
import type { Database } from '@src/lib/types/infrastructureTypes';
import type {
  IStatisticalSeedingConfig,
  ISeedUser,
  ISeedFriendship,
  ISeedGameLog,
  ISeedComment,
  ISeedReaction,
  ISeedingConfig,
} from '@src/lib/types/seeding-types';

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
    MIN_PER_GAME_LOG: 2,
    MAX_PER_GAME_LOG: 8,
    MIN_PER_COMMENT: 1,
    MAX_PER_COMMENT: 3,
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
    users.push({
      id: `user_${i + 1}`,
      object: 'user',
      username,
      first_name: firstName,
      last_name: lastName,
      image_url: faker.image.avatar(),
      has_image: faker.datatype.boolean(),
      profile_image_url: faker.image.avatar(),
      primary_email_address_id: `email_${i + 1}`,
      primary_phone_number_id: `phone_${i + 1}`,
      email_address: faker.internet.email({ firstName, lastName }),
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
  let friendshipId = 1;
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
      const status = faker.helpers.arrayElement([
        FRIENDSHIP_STATUS.ACCEPTED,
        FRIENDSHIP_STATUS.PENDING,
        FRIENDSHIP_STATUS.ACCEPTED, // Higher chance of accepted
      ]);
      friendships.push({
        id: `friendship_${friendshipId++}`,
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
  config: ISeedingConfig
): ISeedGameLog[] {
  const gameLogs: ISeedGameLog[] = [];
  let gameLogId = 1;

  for (const user of users) {
    // Use user engagement to determine activity level
    const userBehavior = generateUserBehavior();
    const engagementMultiplier = userBehavior.engagement;

    // Adjust game log count based on user engagement (Pareto distribution)
    const baseGameLogCount = faker.number.int({
      min: config.gameLogsPerUser.min,
      max: config.gameLogsPerUser.max,
    });
    const gameLogCount = Math.round(baseGameLogCount * engagementMultiplier);

    // Select random games for this user
    const userGames = faker.helpers.arrayElements(gameIds, Math.min(gameLogCount, gameIds.length));

    for (const gameId of userGames) {
      // Generate realistic activity age (most recent, some older)
      const activityAge = generateActivityAge();
      const watchedDate = new Date(Date.now() - activityAge * 24 * 60 * 60 * 1000);

      // Use realistic classification distribution
      const classification = faker.helpers.weightedArrayElement([
        { value: CLASSIFICATION.PUBLIC, weight: 0.3 },
        { value: CLASSIFICATION.PROTECTED, weight: 0.6 },
        { value: CLASSIFICATION.PRIVATE, weight: 0.1 },
      ]);

      // Generate realistic game rating using beta distribution
      const rating = generateGameRating();

      gameLogs.push({
        id: `game_log_${gameLogId++}`,
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
  config: ISeedingConfig
): ISeedComment[] {
  const comments: ISeedComment[] = [];
  let commentId = 1;

  for (const gameLog of gameLogs) {
    // Use realistic comment count distribution (Poisson + Power Law for viral content)
    const commentCount = generateCommentCount();

    // Limit to available users and reasonable bounds
    const maxComments = Math.min(commentCount, users.length, 20);
    const actualCommentCount = Math.max(0, maxComments);

    // Generate top-level comments for this game log
    const commenters = faker.helpers.arrayElements(users, actualCommentCount);
    for (const commenter of commenters) {
      if (commenter.id === gameLog.user_id) continue; // Skip if same user

      const comment: ISeedComment = {
        id: `comment_${commentId++}`,
        user_id: commenter.id,
        parent_id: gameLog.id,
        parent_type: TARGET_TYPES.GAME_LOG, // Type assertion for compatibility
        content: generateCommentContent(),
        depth: 0, // Top-level comment
      };
      comments.push(comment);

      // Recursively generate nested comments (up to 5 levels deep)
      generateNestedComments(comment, comments, users, { value: commentId }, 1, config);
    }
  }
  return comments;
}

// Helper function to generate nested comments recursively
function generateNestedComments(
  parentComment: ISeedComment,
  comments: ISeedComment[],
  users: ISeedUser[],
  commentId: { value: number },
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
      id: `comment_${commentId.value++}`,
      user_id: replier.id,
      parent_id: parentComment.id,
      parent_type: TARGET_TYPES.COMMENT,
      content: generateNestedCommentContent(currentDepth),
      depth: currentDepth,
    };
    comments.push(reply);

    // Recursively generate replies to this reply
    generateNestedComments(reply, comments, users, commentId, currentDepth + 1, config);
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
  config: ISeedingConfig
): ISeedReaction[] {
  const reactions: ISeedReaction[] = [];
  let reactionId = 1;

  // Generate reactions on game logs
  for (const gameLog of gameLogs) {
    // Use realistic reaction count distribution (Pareto distribution)
    const reactionCount = generateReactionCount();
    const reactors = faker.helpers.arrayElements(users, Math.min(reactionCount, users.length));
    for (const reactor of reactors) {
      if (reactor.id === gameLog.user_id) continue; // Skip if same user
      reactions.push({
        id: `reaction_${reactionId++}`,
        user_id: reactor.id,
        target_type: TARGET_TYPES.GAME_LOG,
        target_id: gameLog.id,
        emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
      });
    }
  }
  // Generate reactions on comments
  for (const comment of comments) {
    const reactionCount = faker.number.int({
      min: config.reactionsPerComment.min,
      max: config.reactionsPerComment.max,
    });
    if (reactionCount > 0) {
      const reactors = faker.helpers.arrayElements(users, Math.min(reactionCount, users.length));
      for (const reactor of reactors) {
        if (reactor.id === comment.user_id) continue; // Skip if same user
        reactions.push({
          id: `reaction_${reactionId++}`,
          user_id: reactor.id,
          target_type: TARGET_TYPES.COMMENT,
          target_id: comment.id,
          emoji: faker.helpers.arrayElement(Object.values(REACTION_EMOJIS)),
        });
      }
    }
  }
  return reactions;
}

export async function seedUserData(
  config?: Partial<ISeedingConfig>,
  _optimizationConfig?: unknown,
  _distributionConfig?: IStatisticalSeedingConfig
) {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';
  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }
  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema }) as unknown as Database;
  const finalConfig: ISeedingConfig = { ...DEFAULT_CONFIG, ...config };
  console.log('👥 Starting user data seeding with Faker.js...');
  console.log(`📊 Configuration: ${finalConfig.userCount} users`);
  try {
    // Get actual seeded data to reference
    const teams = await db.select().from(schema.teams);
    const games = await db.select().from(schema.nba_games);
    const players = await db.select().from(schema.nba_players);
    if (teams.length === 0 || games.length === 0) {
      throw new Error(
        'External API data must be seeded first. Please run seed:external before seed:user'
      );
    }
    console.log(
      `📊 Found ${teams.length} teams, ${games.length} games, and ${players.length} players to reference`
    );
    // Use actual game IDs from seeded data
    const gameIds = games.map((game: { id: string }) => game.id);
    console.log(`🎲 Generating ${finalConfig.userCount} users with realistic data...`);
    // Generate all the data
    const users = generateUsers(finalConfig.userCount);
    const friendships = generateFriendships(users, finalConfig);
    const gameLogs = generateGameLogs(users, gameIds, finalConfig);
    const comments = generateComments(users, gameLogs, finalConfig);
    const reactions = generateReactions(users, gameLogs, comments, finalConfig);

    console.log(`📈 Generated data summary:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Friendships: ${friendships.length}`);
    console.log(`   Game Logs: ${gameLogs.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Reactions: ${reactions.length}`);
    console.log(`   Notifications: Will be auto-generated by triggers`);
    console.log(`   Game Ratings: Will be auto-generated by triggers`);
    // Seed users
    console.log('👤 Seeding users...');
    for (const user of users) {
      await db.insert(schema.users).values(user).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${users.length} users`);
    // Seed friendships
    console.log('🤝 Seeding friendships...');
    for (const friendship of friendships) {
      await db.insert(schema.friendships).values(friendship).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${friendships.length} friendships`);
    // Seed game logs
    console.log('📝 Seeding game logs...');
    for (const gameLog of gameLogs) {
      await db.insert(schema.game_logs).values(gameLog).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${gameLogs.length} game logs`);
    // Seed comments in dependency order (parents first, then children)
    console.log('💬 Seeding comments...');
    const commentsByDepth = new Map<number, ISeedComment[]>();

    // Group comments by depth
    for (const comment of comments) {
      if (!commentsByDepth.has(comment.depth)) {
        commentsByDepth.set(comment.depth, []);
      }
      const commentsAtDepth = commentsByDepth.get(comment.depth);
      if (commentsAtDepth) {
        commentsAtDepth.push(comment);
      }
    }

    // Seed comments by depth (0 first, then 1, 2, 3, 4, 5)
    for (let depth = 0; depth <= 5; depth++) {
      const commentsAtDepth = commentsByDepth.get(depth) ?? [];
      if (commentsAtDepth.length > 0) {
        console.log(`   Seeding ${commentsAtDepth.length} comments at depth ${depth}...`);
        for (const comment of commentsAtDepth) {
          await db.insert(schema.comments).values(comment).onConflictDoNothing();
        }
      }
    }
    console.log(`✅ Seeded ${comments.length} comments`);
    // Seed reactions
    console.log('👍 Seeding reactions...');
    for (const reaction of reactions) {
      await db.insert(schema.reactions).values(reaction).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${reactions.length} reactions`);

    console.log('🎉 User data seeding completed successfully!');
    console.log('🔔 Notifications will be automatically generated by database triggers');
    console.log('⭐ Game ratings will be automatically generated by database triggers');

    // Log final summary
    const userCount = await db.select().from(schema.users);
    const friendshipCount = await db.select().from(schema.friendships);
    const gameLogCount = await db.select().from(schema.game_logs);
    const commentCount = await db.select().from(schema.comments);
    const reactionCount = await db.select().from(schema.reactions);
    const notificationCount = await db.select().from(schema.notifications);
    const gameRatingCount = await db.select().from(schema.game_ratings);

    console.log('\n📊 Final Database Summary:');
    console.log(`   Users: ${userCount.length}`);
    console.log(`   Friendships: ${friendshipCount.length}`);
    console.log(`   Game Logs: ${gameLogCount.length}`);
    console.log(`   Comments: ${commentCount.length}`);
    console.log(`   Reactions: ${reactionCount.length}`);
    console.log(`   Notifications: ${notificationCount.length} (auto-generated)`);
    console.log(`   Game Ratings: ${gameRatingCount.length} (auto-generated)`);
  } catch (error) {
    console.error('❌ Error seeding user data:', error);
    throw error;
  }
}

// Function to clear user data (useful for testing)
export async function clearUserData() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '';

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql, { schema }) as unknown as Database;

  console.log('🧹 Clearing user data...');

  try {
    // Clear in reverse order of dependencies
    await db.delete(schema.notifications);
    await db.delete(schema.reactions);
    await db.delete(schema.comments);
    await db.delete(schema.game_logs);
    await db.delete(schema.game_ratings);
    await db.delete(schema.friendships);
    await db.delete(schema.users);

    console.log('✅ User data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  }
}

// Main execution function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUserData()
    .then(() => {
      console.log('✅ User data seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ User data seeding script failed:', error);
      process.exit(1);
    });
}
