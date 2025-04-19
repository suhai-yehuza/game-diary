import type { Redis as UpstashRedis } from '@upstash/redis';
import type Redis from 'ioredis';

export type RedisClient = UpstashRedis | Redis;
export type RedisClientType = 'upstash' | 'ioredis' | null;
