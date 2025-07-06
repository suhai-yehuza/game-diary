import { faker } from '@faker-js/faker';
import { neon } from '@neondatabase/serverless';
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
} from '@src/lib/db/seed/statistical-distributions';
import {
  CLASSIFICATION,
  WATCHED_SETTING,
  WATCHED_SCOPE,
  FRIENDSHIP_STATUS,
  REACTION_EMOJIS,
  TARGET_TYPES,
} from '@src/lib/types';
import type { Database } from '@src/lib/types/dbTypes';
import type {
  IStatisticalSeedingConfig,
  ISeedUser,
  ISeedFriendship,
  ISeedGameLog,
  ISeedComment,
  ISeedReaction,
  ISeedingConfig,
} from '@src/lib/types/seeding-types';
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
    const username = faker.internet.username({ firstName, lastName });
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
  config: ISeedingConfig
): ISeedGameLog[] {
  const gameLogs: ISeedGameLog[] = [];

  // Generate game popularity weights using Pareto distribution
  // This ensures 20% of games get 80% of the game logs
  const gamePopularityWeights = generateGamePopularityWeights(gameIds.length);

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

    // Select games based on popularity weights (Pareto distribution)
    const selectedGameIndices = selectGamesByPopularity(
      gameIds.length,
      Math.min(gameLogCount, gameIds.length),
      gamePopularityWeights
    );
    const userGames = selectedGameIndices.map(index => gameIds[index]);

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
  config: ISeedingConfig
): ISeedComment[] {
  const comments: ISeedComment[] = [];

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
  comments: ISeedComment[]
) {
  const reactions: ISeedReaction[] = [];

  // Generate reactions on game logs
  for (const gameLog of gameLogs) {
    // Random number of reactions per game log (0 to 100)
    const reactionCount = faker.number.int({ min: 0, max: 100 });
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
    }
  }
  // Generate reactions on comments
  for (const comment of comments) {
    // Random number of reactions per comment (0 to 100)
    const reactionCount = faker.number.int({ min: 0, max: 100 });
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
  const db = drizzle(sql) as unknown as Database;

  // Merge provided config with defaults
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  console.log('🌱 Starting user data seeding...');
  console.log(`📊 Configuration: ${finalConfig.userCount} users`);

  try {
    // Step 1: Create and insert users
    console.log('👥 Step 1: Creating and inserting users...');
    const userData = generateUsers(finalConfig.userCount);

    for (const user of userData) {
      await db.insert(users).values(user);
    }
    console.log(`✅ Created ${userData.length} users`);

    // Step 2: For each user, create 0-N friendships
    console.log('🤝 Step 2: Creating friendships for each user...');
    const friendshipData = generateFriendships(userData, finalConfig);

    for (const friendship of friendshipData) {
      await db.insert(friendships).values(friendship);
    }
    console.log(`✅ Created ${friendshipData.length} friendships`);

    // Step 3: Get valid game IDs from the database
    console.log('🎮 Step 3: Getting valid game IDs...');
    const validGames = await db.select({ id: nba_games.id }).from(nba_games);
    const gameIds = validGames.map(game => game.id);

    if (gameIds.length === 0) {
      console.warn('⚠️  No games found in database. Please run external API seeding first.');
      return;
    }
    console.log(`✅ Found ${gameIds.length} valid games`);

    // Step 4: For each user, create 0-N game_logs using valid game_ids
    console.log('📝 Step 4: Creating game logs for each user...');
    const gameLogData = generateGameLogs(userData, gameIds, finalConfig);

    for (const gameLog of gameLogData) {
      await db.insert(game_logs).values(gameLog);
    }
    console.log(`✅ Created ${gameLogData.length} game logs`);

    // Step 5: For each game_log, create 0-N comments (including nested comments) from valid users
    console.log('💬 Step 5: Creating comments for game logs...');
    const commentData = generateComments(userData, gameLogData, finalConfig);

    for (const comment of commentData) {
      await db.insert(comments).values(comment);
    }
    console.log(`✅ Created ${commentData.length} comments (including nested comments)`);

    // Step 6: Generate reactions for game logs and comments
    console.log('👍 Step 6: Creating reactions...');
    const reactionData = generateReactions(userData, gameLogData, commentData);

    for (const reaction of reactionData) {
      await db.insert(reactions).values(reaction);
    }
    console.log(`✅ Created ${reactionData.length} reactions`);

    console.log('🎉 User data seeding completed successfully!');

    // Log summary
    const userCount = await db.select().from(users);
    const friendshipCount = await db.select().from(friendships);
    const gameLogCount = await db.select().from(game_logs);
    const commentCount = await db.select().from(comments);
    const reactionCount = await db.select().from(reactions);

    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${userCount.length}`);
    console.log(`   Friendships: ${friendshipCount.length}`);
    console.log(`   Game Logs: ${gameLogCount.length}`);
    console.log(`   Comments: ${commentCount.length}`);
    console.log(`   Reactions: ${reactionCount.length}`);
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
  const db = drizzle(sql) as unknown as Database;

  console.log('🧹 Clearing user data...');

  try {
    // Clear in reverse order of dependencies
    await db.delete(notifications);
    await db.delete(reactions);
    await db.delete(comments);
    await db.delete(game_logs);
    await db.delete(game_ratings);
    await db.delete(friendships);
    await db.delete(users);

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
