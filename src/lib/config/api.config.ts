import { z } from 'zod';

import type {
  RangeConfig,
  BatchSizeConfig,
  DatabaseSeedingConfig,
  RateLimitConfig,
  ClassificationWeights,
  DistributionFunctions,
} from '@/lib/types/config.types';
import type { APIConfigOptions } from '@/lib/types/shared.types';

const SMALL = 100;
const MEDIUM = 10 * SMALL;
const LARGE = 10 * MEDIUM;
const XLARGE = 100 * LARGE;

// Environment variable validation schema
const envSchema = z.object({
  NEXT_PUBLIC_RAPID_API_HOST: z.string().min(1),
  NEXT_PUBLIC_RAPID_API_KEY: z.string().min(1),
  NEXT_PUBLIC_RAPID_API_BASE_URL: z.string().url(),
});

// Distribution functions
const distributions: DistributionFunctions = {
  natural: (rand: number) => Math.pow(rand, 2),
  bellCurve: (u1: number, u2: number) => {
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const mean = 50;
    const stdDev = 16.67;
    return z0 * stdDev + mean;
  },
  pareto: (rand: number, alpha = 1.16) => Math.pow(rand, -1 / alpha),
  exponential: (rand: number) => Math.exp(-2 * rand),
  powerLaw: (rand: number, exponent = -2) => Math.pow(rand, exponent),
} as const;

// Function to validate and get environment variables
export function getEnv() {
  return envSchema.parse({
    NEXT_PUBLIC_RAPID_API_HOST: process.env.NEXT_PUBLIC_RAPID_API_HOST,
    NEXT_PUBLIC_RAPID_API_KEY: process.env.NEXT_PUBLIC_RAPID_API_KEY,
    NEXT_PUBLIC_RAPID_API_BASE_URL: process.env.NEXT_PUBLIC_RAPID_API_BASE_URL,
  });
}

// RapidAPI Configuration
export function getRapidApiConfig(): APIConfigOptions {
  const env = getEnv();
  return {
    baseUrl: env.NEXT_PUBLIC_RAPID_API_BASE_URL,
    apiKey: env.NEXT_PUBLIC_RAPID_API_KEY,
    host: env.NEXT_PUBLIC_RAPID_API_HOST,
    headers: {
      'x-rapidapi-host': env.NEXT_PUBLIC_RAPID_API_HOST,
      'x-rapidapi-key': env.NEXT_PUBLIC_RAPID_API_KEY,
    },
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    method: 'GET',
  };
}

// API Configuration
export const API_CONFIG = {
  endpoints: {
    GAMES: '/games',
    PLAYERS: '/players',
    SEASONS: '/seasons',
    LEAGUES: '/leagues',
    STANDINGS: '/standings',
    TEAMS: '/teams',
  } as const,

  databaseSeeding: {
    CONCURRENT_OPERATIONS: 5,
    BATCH_SIZE: 25,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    USER_COUNT: XLARGE,
    DEFAULT_SAMPLE_COUNT: MEDIUM,
  } as const satisfies DatabaseSeedingConfig,

  ranges: {
    FRIENDSHIP_RANGE: {
      min: 0,
      max: MEDIUM,
      getRandom: () => {
        const rand = Math.random();
        const normalizedValue = distributions.natural(rand);
        return Math.floor(Math.min(MEDIUM, normalizedValue * MEDIUM));
      },
    } satisfies RangeConfig,

    GAME_LOG_RANGE: {
      min: 0,
      max: MEDIUM,
      getRandom: () => {
        const u1 = Math.random();
        const u2 = Math.random();
        const value = distributions.bellCurve(u1, u2);
        return Math.floor(Math.max(0, Math.min(MEDIUM, value)));
      },
    } satisfies RangeConfig,

    COMMENT_RANGE: {
      min: 0,
      max: MEDIUM,
      getRandom: () => {
        const rand = Math.random();
        const paretoValue = distributions.pareto(rand);
        return Math.floor(Math.max(0, Math.min(MEDIUM, paretoValue * MEDIUM)));
      },
    } satisfies RangeConfig,

    CHILD_COMMENT_RANGE: {
      min: 0,
      max: SMALL,
      getRandom: () => {
        const rand = Math.random();
        const decayedValue = distributions.exponential(rand);
        return Math.floor(Math.max(0, Math.min(SMALL, decayedValue * SMALL)));
      },
    } satisfies RangeConfig,

    REACTION_RANGE: {
      min: 0,
      max: LARGE,
      getRandom: () => {
        const rand = Math.random();
        const powerValue = distributions.powerLaw(rand);
        return Math.floor(Math.max(0, Math.min(LARGE, powerValue * LARGE)));
      },
    } satisfies RangeConfig,
  } as const,

  classification: {
    CLASSIFICATION_WEIGHTS: {
      private: 0.1,
      protected: 0.6,
      public: 0.3,
    } satisfies ClassificationWeights,
  } as const,

  rateLimit: {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 5000,
    RATE_LIMIT_DELAY: 60000,
  } as const satisfies RateLimitConfig,

  errors: {
    MISSING_API_KEY: 'API key is required',
    INVALID_API_KEY: 'Invalid API key',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    INVALID_RESPONSE: 'Invalid response from API',
    NETWORK_ERROR: 'Network error occurred',
    REQUEST_FAILED: 'Request failed',
  } as const,

  request: {
    baseUrl: '',
    headers: {},
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    method: 'GET',
  } as const,

  batchSize: {
    GAMES: 25,
    GAME_STATS: 10,
    PLAYERS: 50,
  } as const satisfies BatchSizeConfig,
} as const;

// For backward compatibility
export const DEFAULT_CONFIG = API_CONFIG.request;

// Error messages (moved from API_CONFIG.errors for better organization)
export const API_ERROR_MESSAGES = {
  MISSING_API_KEY: 'API key is required',
  INVALID_API_KEY: 'Invalid API key',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_RESPONSE: 'Invalid response from API',
  NETWORK_ERROR: 'Network error occurred',
} as const;
