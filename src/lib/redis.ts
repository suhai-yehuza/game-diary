import { Redis } from "ioredis";
import { Redis as UpstashRedis } from "@upstash/redis";

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

let redisClient: Redis | UpstashRedis | null = null;
let isRedisAvailable = false;

try {
  if (isProduction) {
    // Use Upstash Redis in production
    redisClient = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    isRedisAvailable = true;
  } else {
    // Use local Redis in development
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    // Test connection
    redisClient
      .ping()
      .then(() => {
        isRedisAvailable = true;
      })
      .catch(() => {
        console.warn("Local Redis is not available, cache will be disabled");
        redisClient = null;
      });
  }
} catch (error) {
  console.warn(
    "Failed to initialize Redis client, cache will be disabled:",
    error
  );
  redisClient = null;
}

export const cache = {
  // Get cached data
  get: <T>(key: string): Promise<T | null> => {
    return new Promise((resolve) => {
      if (!redisClient || !isRedisAvailable) {
        resolve(null);
        return;
      }

      try {
        if (isProduction) {
          (redisClient as UpstashRedis).get<T>(key).then(resolve);
        } else {
          (redisClient as Redis).get(key).then((data) => {
            resolve(data ? JSON.parse(data) : null);
          });
        }
      } catch (error) {
        console.error(`Error getting cache for key ${key}:`, error);
        resolve(null);
      }
    });
  },

  // Set cached data with expiration
  set: <T>(key: string, value: T, ttl: number = 3600): Promise<void> => {
    return new Promise((resolve) => {
      if (!redisClient || !isRedisAvailable) {
        resolve();
        return;
      }

      try {
        // Ensure TTL is a valid positive number between 1 and 2147483647 (max Redis TTL)
        const validTTL = Math.max(
          1,
          Math.min(Math.floor(Number(ttl) || 3600), 2147483647)
        );

        if (isProduction) {
          (redisClient as UpstashRedis)
            .set(key, JSON.stringify(value), { ex: validTTL })
            .then(() => resolve())
            .catch((error) => {
              console.error(`Error setting cache for key ${key}:`, error);
              resolve();
            });
        } else {
          (redisClient as Redis)
            .set(key, JSON.stringify(value), "EX", validTTL)
            .then(() => resolve())
            .catch((error) => {
              console.error(`Error setting cache for key ${key}:`, error);
              resolve();
            });
        }
      } catch (error) {
        console.error(`Error setting cache for key ${key}:`, error);
        resolve();
      }
    });
  },

  // Delete cached data
  del: (key: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!redisClient || !isRedisAvailable) {
        resolve();
        return;
      }

      try {
        if (isProduction) {
          (redisClient as UpstashRedis).del(key).then(() => resolve());
        } else {
          (redisClient as Redis).del(key).then(() => resolve());
        }
      } catch (error) {
        console.error(`Error deleting cache for key ${key}:`, error);
        resolve();
      }
    });
  },

  // Clear all cached data
  clear: (): Promise<void> => {
    return new Promise((resolve) => {
      if (!redisClient || !isRedisAvailable) {
        resolve();
        return;
      }

      try {
        if (isProduction) {
          // Note: Upstash doesn't support FLUSHALL, so we'll need to handle this differently
          console.warn(
            "FLUSHALL not supported in production. Consider implementing a different cache clearing strategy."
          );
          resolve();
        } else {
          (redisClient as Redis).flushall().then(() => resolve());
        }
      } catch (error) {
        console.error("Error clearing cache:", error);
        resolve();
      }
    });
  },

  isAvailable: (): boolean => {
    return isRedisAvailable && redisClient !== null;
  },
};

// Cache keys
export const CACHE_KEYS = {
  SEASONS: "nba:seasons",
  LEAGUES: "nba:leagues",
  TEAMS: "nba:teams",
  PLAYERS: "nba:players",
  GAME_STATS: (game_id: string) => `nba:game:${game_id}:stats`,
  PLAYER_STATS: (player_id: string) => `nba:player:${player_id}:stats`,
  TEAM_STATS: (team_id: string) => `nba:team:${team_id}:stats`,
  GAME_LOGS: "nba:game_logs",
  USER_GAME_LOGS: (user_id: string) => `nba:user:${user_id}:game_logs`,
  USERS: "users",
  USER: (user_id: string) => `user:${user_id}`,
  FRIENDSHIPS: "friendships",
  USER_FRIENDSHIPS: (user_id: string) => `user:${user_id}:friendships`,
  GAME_RATINGS: "game_ratings",
  GAME_RATING: (game_id: string) => `game:${game_id}:rating`,
  COMMENTS: (target_id: string) => `comments:${target_id}`,
  REACTIONS: (target_id: string) => `reactions:${target_id}`,
};

// Cache TTLs in seconds
export const CACHE_TTL = {
  SEASONS: 24 * 60 * 60, // 24 hours
  LEAGUES: 24 * 60 * 60, // 24 hours
  TEAMS: 12 * 60 * 60, // 12 hours
  PLAYERS: 12 * 60 * 60, // 12 hours
  GAME_STATS: 60 * 60, // 1 hour
  PLAYER_STATS: 60 * 60, // 1 hour
  TEAM_STATS: 60 * 60, // 1 hour
  GAME_LOGS: 30 * 60, // 30 minutes
  USER_GAME_LOGS: 30 * 60, // 30 minutes
  USERS: 24 * 60 * 60, // 24 hours
  USER: 24 * 60 * 60, // 24 hours
  FRIENDSHIPS: 30 * 60, // 30 minutes
  USER_FRIENDSHIPS: 30 * 60, // 30 minutes
  GAME_RATINGS: 60 * 60, // 1 hour
  GAME_RATING: 60 * 60, // 1 hour
  COMMENTS: 30 * 60, // 30 minutes
  REACTIONS: 30 * 60, // 30 minutes
};
