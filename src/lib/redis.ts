import { Redis } from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

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
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    // Test connection
    redisClient
      .ping()
      .then(() => {
        isRedisAvailable = true;
      })
      .catch(() => {
        console.warn('Local Redis is not available, cache will be disabled');
        redisClient = null;
      });
  }
} catch (error) {
  console.warn('Failed to initialize Redis client, cache will be disabled:', error);
  redisClient = null;
}

export const cache = {
  // Get cached data
  get: <T>(key: string): Promise<T | null> => {
    return new Promise(resolve => {
      if (!redisClient || !isRedisAvailable) {
        resolve(null);
        return;
      }

      try {
        if (isProduction) {
          (redisClient as UpstashRedis)
            .get(key)
            .then(data => {
              if (!data) {
                resolve(null);
                return;
              }
              try {
                const parsedData = JSON.parse(data as string);
                resolve(parsedData as T);
              } catch (error) {
                console.error('Error parsing cached data:', error);
                resolve(null);
              }
            })
            .catch(error => {
              console.error('Error getting cached data:', error);
              resolve(null);
            });
        } else {
          (redisClient as Redis)
            .get(key)
            .then(data => {
              if (!data) {
                resolve(null);
                return;
              }
              try {
                const parsedData = JSON.parse(data);
                resolve(parsedData as T);
              } catch (error) {
                console.error('Error parsing cached data:', error);
                resolve(null);
              }
            })
            .catch(error => {
              console.error('Error getting cached data:', error);
              resolve(null);
            });
        }
      } catch (error) {
        console.error('Error in cache.get:', error);
        resolve(null);
      }
    });
  },

  // Set cached data
  set: <T>(key: string, value: T, ttl?: number): Promise<void> => {
    return new Promise(resolve => {
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
            .catch(error => {
              console.error('Error setting cached data:', error);
              resolve();
            });
        } else {
          if (ttl) {
            (redisClient as Redis)
              .setex(key, ttl, serializedValue)
              .then(() => resolve())
              .catch(error => {
                console.error('Error setting cached data:', error);
                resolve();
              });
          } else {
            (redisClient as Redis)
              .set(key, serializedValue)
              .then(() => resolve())
              .catch(error => {
                console.error('Error setting cached data:', error);
                resolve();
              });
          }
        }
      } catch (error) {
        console.error('Error in cache.set:', error);
        resolve();
      }
    });
  },

  // Delete cached data
  del: (key: string): Promise<void> => {
    return new Promise(resolve => {
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
    return new Promise(resolve => {
      if (!redisClient || !isRedisAvailable) {
        resolve();
        return;
      }

      try {
        if (isProduction) {
          // Note: Upstash doesn't support FLUSHALL, so we'll need to handle this differently
          console.warn(
            'FLUSHALL not supported in production. Consider implementing a different cache clearing strategy.'
          );
          resolve();
        } else {
          (redisClient as Redis).flushall().then(() => resolve());
        }
      } catch (error) {
        console.error('Error clearing cache:', error);
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
  SEASONS: 'seasons',
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  GAME_STATS: (game_id: string) => `game_stats:${game_id}`,
  PLAYER_STATS: (player_id: string) => `player_stats:${player_id}`,
  TEAM_STATS: (team_id: string) => `team_stats:${team_id}`,
  GAME_LOGS: 'game_logs',
  USER_GAME_LOGS: (user_id: string) => `user_game_logs:${user_id}`,
  USERS: 'users',
  USER: (user_id: string) => `user:${user_id}`,
  GAME_RATINGS: 'game_ratings',
  GAME_RATING: (game_id: string) => `game_rating:${game_id}`,
  COMMENTS: (parent_id: string) => `comments:${parent_id}`,
  REACTIONS: (target_id: string) => `reactions:${target_id}`,
  GAME: (game_id: string) => `game:${game_id}`,
  FRIENDSHIPS: 'friendships',
  USER_FRIENDSHIPS: (user_id: string) => `user_friendships:${user_id}`,
} as const;

// Cache TTLs in seconds
export const CACHE_TTL = {
  SEASONS: 24 * 60 * 60, // 24 hours
  LEAGUES: 24 * 60 * 60, // 24 hours
  TEAMS: 24 * 60 * 60, // 24 hours
  PLAYERS: 24 * 60 * 60, // 24 hours
  GAME_STATS: 60 * 60, // 1 hour
  PLAYER_STATS: 60 * 60, // 1 hour
  TEAM_STATS: 60 * 60, // 1 hour
  GAME_LOGS: 60 * 60, // 1 hour
  USER_GAME_LOGS: 60 * 60, // 1 hour
  USERS: 24 * 60 * 60, // 24 hours
  USER: 24 * 60 * 60, // 24 hours
  GAME_RATINGS: 60 * 60, // 1 hour
  GAME_RATING: 60 * 60, // 1 hour
  COMMENTS: 60 * 60, // 1 hour
  REACTIONS: 60 * 60, // 1 hour
  GAME: 60 * 60, // 1 hour
  FRIENDSHIPS: 60 * 60, // 1 hour
  USER_FRIENDSHIPS: 60 * 60, // 1 hour
} as const;
