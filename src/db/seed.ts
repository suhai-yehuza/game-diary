import { db } from "./index";
import * as schema from "./schema";
import { faker } from "@faker-js/faker";
import { reset } from "drizzle-seed";
import {
  users,
  friendships,
  game_logs,
  comments,
  reactions,
  game_ratings,
} from "./schema";
import { eq, sql } from "drizzle-orm";

// Configuration
const SEED_CONFIG = {
  users: 100,
  friendshipsPerUser: 10,
  gameLogsPerUser: 20,
  commentsPerGameLog: 5,
  maxReactionsPerTarget: 10,
  maxCommentDepth: 3,
  childCommentsPerParent: 2,
  games: 50,
  batchSize: 20, // Added for consistent batch processing
};

// Constants
const REACTION_EMOJIS = [
  "👍",
  "❤️",
  "🔥",
  "👏",
  "😂",
  "😮",
  "🏀",
  "💪",
  "🐐",
  "🎯",
];
const WATCH_SETTINGS = [
  "tv",
  "arena",
  "phone",
  "laptop",
  "bar",
  "home",
  "other",
] as const;
const FRIENDSHIP_STATUSES = ["pending", "connected", "rejected"] as const;

// Helper functions
const getValidTimestamp = (value: Date | string | number): Date => {
  try {
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
};

const generateStarRating = (rating: number): string => {
  return "⭐".repeat(rating) + "☆".repeat(5 - rating);
};

const updateGameRating = async (gameId: string) => {
  const result = await db
    .select({
      averageRating: sql<number>`ROUND(AVG(${schema.game_logs.rating_for_game})::numeric, 2)`,
      totalRatings: sql<number>`COUNT(*)`,
    })
    .from(schema.game_logs)
    .where(eq(schema.game_logs.game_id, gameId))
    .groupBy(schema.game_logs.game_id);

  if (result.length === 0) return;

  const { averageRating, totalRatings } = result[0];

  await db
    .update(schema.game_ratings)
    .set({
      average_rating: averageRating.toString(),
      total_ratings: totalRatings,
      updated_at: new Date(),
    })
    .where(eq(schema.game_ratings.game_id, gameId));
};

// Batch processing
const processInBatches = async <T>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<unknown>
) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processFn(batch);
  }
};

// Main seeding function
async function seedDb() {
  try {
    await reset(db, schema);
    console.log("Database reset complete");

    // Generate user IDs and values
    const userIds = Array.from({ length: SEED_CONFIG.users }, () =>
      faker.string.uuid()
    );
    const userValues = userIds.map((id) => ({
      id,
      username: faker.internet.username(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email_address: faker.internet.email(),
      image_url: faker.image.avatar(),
      created_at: getValidTimestamp(faker.date.past()),
      updated_at: getValidTimestamp(faker.date.recent()),
      timestamp: getValidTimestamp(faker.date.recent()),
      inbound_friendship_ids: [],
      outbound_friendship_ids: [],
      banned: false,
    }));

    // Insert users in batches
    await processInBatches(userValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(users).values(batch)
    );
    console.log("Users seeded");

    // Generate and insert friendships
    const friendshipValues = [];
    for (let i = 0; i < SEED_CONFIG.users; i++) {
      const existingFriendships = new Set([i]);

      for (let j = 0; j < SEED_CONFIG.friendshipsPerUser; j++) {
        let responderIndex;
        do {
          responderIndex = Math.floor(Math.random() * SEED_CONFIG.users);
        } while (existingFriendships.has(responderIndex));

        existingFriendships.add(responderIndex);
        const friendshipId = faker.string.uuid();

        friendshipValues.push({
          id: friendshipId,
          subscriber_id: userIds[i],
          user_id: userIds[responderIndex],
          status: faker.helpers.arrayElement(FRIENDSHIP_STATUSES),
          timestamp: getValidTimestamp(faker.date.recent()),
        });

        // Update friendship IDs
        await Promise.all([
          db
            .update(users)
            .set({ outbound_friendship_ids: [friendshipId] })
            .where(eq(users.id, userIds[i])),
          db
            .update(users)
            .set({ inbound_friendship_ids: [friendshipId] })
            .where(eq(users.id, userIds[responderIndex])),
        ]);
      }
    }

    // Insert friendships in batches
    await processInBatches(friendshipValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(friendships).values(batch)
    );
    console.log("Friendships seeded");

    // Generate game ratings
    const game_ids = Array.from({ length: SEED_CONFIG.games }, () =>
      faker.string.uuid()
    );
    const gameRatingValues = game_ids.map((game_id) => ({
      id: faker.string.uuid(),
      game_id: game_id,
      average_rating: faker.number
        .float({ min: 1, max: 5, fractionDigits: 1 })
        .toFixed(2),
      total_ratings: faker.number.int({ min: 1, max: 50 }),
      created_at: getValidTimestamp(faker.date.past()),
      updated_at: getValidTimestamp(faker.date.recent()),
    }));

    // Insert game ratings in batches
    await processInBatches(gameRatingValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(game_ratings).values(batch)
    );
    console.log("Game ratings seeded");

    // Generate and insert game logs
    const gameLogValues = [];
    const gameLogIds = [];

    for (let i = 0; i < SEED_CONFIG.users; i++) {
      for (let j = 0; j < SEED_CONFIG.gameLogsPerUser; j++) {
        const gameLogId = faker.string.uuid();
        gameLogIds.push(gameLogId);
        const gameId = game_ids[Math.floor(Math.random() * game_ids.length)];
        const rating = faker.number.int({ min: 1, max: 5 });

        gameLogValues.push({
          id: gameLogId,
          user_id: userIds[i],
          game_id: gameId,
          watched_setting: faker.helpers.arrayElement(WATCH_SETTINGS),
          watched_date: getValidTimestamp(faker.date.past()),
          watched_location: faker.location.streetAddress(),
          rating_for_game: rating,
          rating_stars: generateStarRating(rating),
          watched_count: faker.number.int({ min: 1, max: 10 }),
          created_at: getValidTimestamp(faker.date.past()),
          updated_at: getValidTimestamp(faker.date.recent()),
        });
      }
    }

    // Insert game logs in batches
    await processInBatches(gameLogValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(game_logs).values(batch)
    );
    console.log("Game logs seeded");

    // Update game ratings based on new game logs
    await Promise.all(game_ids.map(updateGameRating));
    console.log("Game ratings updated");

    // Generate and insert comments
    const commentValues = [];
    const parentCommentIds = new Map();

    for (const gameLogId of gameLogIds) {
      const numTopLevelComments = faker.number.int({
        min: 1,
        max: SEED_CONFIG.commentsPerGameLog,
      });

      // Generate top-level comments
      for (let i = 0; i < numTopLevelComments; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const commentDate = getValidTimestamp(faker.date.recent());
        const commentId = faker.string.uuid();

        commentValues.push({
          id: commentId,
          user_id: userId,
          parent_id: gameLogId,
          content: faker.helpers.arrayElement([
            faker.lorem.sentence(),
            "Great game!",
            "What a finish!",
            "Can't believe that ending!",
            "The refs were terrible...",
            "MVP performance!",
            "Defense wins championships!",
            "Clutch play in the 4th!",
            faker.lorem.paragraph(1),
          ]),
          created_at: commentDate,
          updated_at: commentDate,
        });

        if (!parentCommentIds.has(gameLogId)) {
          parentCommentIds.set(gameLogId, []);
        }
        parentCommentIds.get(gameLogId).push(commentId);

        // Generate child comments
        const numChildComments = faker.number.int({
          min: 0,
          max: SEED_CONFIG.childCommentsPerParent,
        });
        for (let j = 0; j < numChildComments; j++) {
          const childUserId =
            userIds[Math.floor(Math.random() * userIds.length)];
          const childCommentDate = getValidTimestamp(faker.date.recent());
          const childCommentId = faker.string.uuid();

          commentValues.push({
            id: childCommentId,
            user_id: childUserId,
            parent_id: commentId,
            content: faker.helpers.arrayElement([
              "I agree!",
              "Totally!",
              "Couldn't have said it better!",
              "Exactly!",
              "Well said!",
              "100%!",
              "Spot on!",
              "Preach!",
              faker.lorem.sentence(),
            ]),
            created_at: childCommentDate,
            updated_at: childCommentDate,
          });

          // Generate nested child comments (up to maxCommentDepth)
          let currentDepth = 1;
          let currentParentId = childCommentId;
          while (
            currentDepth < SEED_CONFIG.maxCommentDepth &&
            Math.random() > 0.5
          ) {
            const nestedUserId =
              userIds[Math.floor(Math.random() * userIds.length)];
            const nestedCommentDate = getValidTimestamp(faker.date.recent());
            const nestedCommentId = faker.string.uuid();

            commentValues.push({
              id: nestedCommentId,
              user_id: nestedUserId,
              parent_id: currentParentId,
              content: faker.helpers.arrayElement([
                "This!",
                "True!",
                "Facts!",
                "Agreed!",
                "Same!",
                "Yup!",
                "Right on!",
                "Word!",
                faker.lorem.sentence(),
              ]),
              created_at: nestedCommentDate,
              updated_at: nestedCommentDate,
            });

            currentParentId = nestedCommentId;
            currentDepth++;
          }
        }
      }
    }

    // Insert comments in batches
    await processInBatches(commentValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(comments).values(batch)
    );
    console.log("Comments seeded");

    // Generate and insert reactions
    const reactionValues = [];

    // Add reactions to game logs
    for (const gameLogId of gameLogIds) {
      const numReactions = faker.number.int({
        min: 0,
        max: SEED_CONFIG.maxReactionsPerTarget,
      });
      const reactingUsers = faker.helpers.arrayElements(userIds, numReactions);

      for (const userId of reactingUsers) {
        const reactionDate = getValidTimestamp(faker.date.recent());
        reactionValues.push({
          id: faker.string.uuid(),
          user_id: userId,
          target_type: "game_log" as const,
          target_id: gameLogId,
          emoji: faker.helpers.arrayElement(REACTION_EMOJIS),
          created_at: reactionDate,
          updated_at: reactionDate,
        });
      }
    }

    // Add reactions to comments
    for (const comment of commentValues) {
      const numReactions = faker.number.int({
        min: 0,
        max: SEED_CONFIG.maxReactionsPerTarget,
      });
      const reactingUsers = faker.helpers.arrayElements(userIds, numReactions);

      for (const userId of reactingUsers) {
        const reactionDate = getValidTimestamp(faker.date.recent());
        reactionValues.push({
          id: faker.string.uuid(),
          user_id: userId,
          target_type: "comment" as const,
          target_id: comment.id,
          emoji: faker.helpers.arrayElement(REACTION_EMOJIS),
          created_at: reactionDate,
          updated_at: reactionDate,
        });
      }
    }

    // Insert reactions in batches
    await processInBatches(reactionValues, SEED_CONFIG.batchSize, (batch) =>
      db.insert(reactions).values(batch)
    );
    console.log("Reactions seeded");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error during database seeding:", error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await seedDb();
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

main();

export { seedDb };
