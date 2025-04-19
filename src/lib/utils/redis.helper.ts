import { Redis } from 'ioredis';

// Basic stub Redis helper functions

/**
 * Safely get a value from Redis with error handling
 */
export async function safeRedisGet(redisClient: Redis, key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error(`Error getting value from Redis for key ${key}:`, error);
    return null;
  }
}

/**
 * Safely set a value in Redis with error handling
 */
export async function safeRedisSet(
  redisClient: Redis,
  key: string,
  value: string | number | Buffer,
  ttl?: number
): Promise<boolean> {
  try {
    if (ttl) {
      await redisClient.set(key, value, 'EX', ttl);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`Error setting value in Redis for key ${key}:`, error);
    return false;
  }
}

// Add other Redis-related functions as needed
