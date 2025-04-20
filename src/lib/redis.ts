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
          (redisClient as UpstashRedis)
            .get(key)
            .then((data) => {
              if (!data) {
                resolve(null);
                return;
              }
              try {
                const parsedData = JSON.parse(data as string);
                resolve(parsedData as T);
              } catch (error) {
                console.error("Error parsing cached data:", error);
                resolve(null);
              }
            })
            .catch((error) => {
              console.error("Error getting cached data:", error);
              resolve(null);
            });
        } else {
          (redisClient as Redis)
            .get(key)
            .then((data) => {
              if (!data) {
                resolve(null);
                return;
              }
              try {
                const parsedData = JSON.parse(data);
                resolve(parsedData as T);
              } catch (error) {
                console.error("Error parsing cached data:", error);
                resolve(null);
              }
            })
            .catch((error) => {
              console.error("Error getting cached data:", error);
              resolve(null);
            });
        }
      } catch (error) {
        console.error("Error in cache.get:", error);
        resolve(null);
      }
    });
  },

  // Set cached data
  set: <T>(key: string, value: T, ttl?: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!redisClient || !isRedisAvailable) {
        resolve();
        return;
      }

      try {
        const serializedValue = JSON.stringify(value);
        if (isProduction) {
          (redisClient as UpstashRedis)
            .set(key, serializedValue, ttl ? { ex: ttl } : undefined)
            .then(() => resolve())
            .catch((error) => {
              console.error("Error setting cached data:", error);
              resolve();
            });
        } else {
          if (ttl) {
            (redisClient as Redis)
              .setex(key, ttl, serializedValue)
              .then(() => resolve())
              .catch((error) => {
                console.error("Error setting cached data:", error);
                resolve();
              });
          } else {
            (redisClient as Redis)
              .set(key, serializedValue)
              .then(() => resolve())
              .catch((error) => {
                console.error("Error setting cached data:", error);
                resolve();
              });
          }
        }
      } catch (error) {
        console.error("Error in cache.set:", error);
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
