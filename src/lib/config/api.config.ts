import { z } from 'zod';

import { APIError } from '@src/lib/errors/api.error';
import type {
  IRangeConfig,
  IBatchSizeConfig,
  IClassificationWeights,
  IPaginationConfig,
  IDistributionFunctions,
} from '@src/lib/types';

const BASE_MULTIPLIER = 10;
const XSMALL = BASE_MULTIPLIER;
const SMALL = BASE_MULTIPLIER * XSMALL;
const MEDIUM = BASE_MULTIPLIER * SMALL;
const LARGE = BASE_MULTIPLIER * MEDIUM;
const XLARGE = BASE_MULTIPLIER * LARGE;

// Constants for magic numbers
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_ATTEMPTS = 10;
const UNAUTHORIZED_STATUS = 401;
const RATE_LIMIT_BACKOFF_MULTIPLIER = -2.0;
const RATE_LIMIT_BASE_DELAY = 1.16;
const RATE_LIMIT_MIN_DELAY = -2;

// Environment validation schema
const envSchema = z.object({
  RAPIDAPI_KEY: z.string().min(1, 'RAPIDAPI_KEY is required'),
  RAPIDAPI_HOST: z.string().min(1, 'RAPIDAPI_HOST is required'),
  RAPIDAPI_BASE_URL: z.string().url('RAPIDAPI_BASE_URL must be a valid URL'),
});

export function validateAPIKey(key: string | undefined): string {
  if (!key) {
    throw new APIError(
      API_CONFIG.errors.MISSING_API_KEY,
      UNAUTHORIZED_STATUS,
      'MISSING_API_KEY',
      'MISSING_API_KEY'
    );
  }
  return key;
}

// Distribution functions
const distributions: IDistributionFunctions = {
  natural: (rand: number) => Math.pow(rand, 2),
  bellCurve: (u1: number, u2: number) => {
    const z0 =
      Math.sqrt(RATE_LIMIT_BACKOFF_MULTIPLIER * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const mean = 50;
    const stdDev = 16.67;
    return z0 * stdDev + mean;
  },
  pareto: (rand: number, alpha = RATE_LIMIT_BASE_DELAY) => Math.pow(rand, -1 / alpha),
  exponential: (rand: number) => Math.exp(RATE_LIMIT_MIN_DELAY * rand),
  powerLaw: (rand: number, exponent = RATE_LIMIT_MIN_DELAY) => Math.pow(rand, exponent),
} as const satisfies IDistributionFunctions;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.RAPIDAPI_BASE_URL ?? 'https://api-sports.io/v1',
  timeout: DEFAULT_TIMEOUT_MS,
  retryAttempts: DEFAULT_RETRY_ATTEMPTS,
  retryDelay: DEFAULT_TIMEOUT_MS,
  maxRetries: DEFAULT_RETRY_ATTEMPTS,
  endpoints: {
    SEASONS: '/seasons',
    LEAGUES: '/leagues',
    GAMES: '/games',
    GAME_STATISTICS: '/games/statistics',
    TEAMS: '/teams',
    TEAM_STATISTICS: '/teams/statistics',
    PLAYERS: '/players',
    PLAYER_STATISTICS: '/players/statistics',
    STANDINGS: '/standings',
  },
  errorCodes: {
    UNAUTHORIZED: UNAUTHORIZED_STATUS,
  },
  rateLimit: {
    backoffMultiplier: RATE_LIMIT_BACKOFF_MULTIPLIER,
    baseDelay: RATE_LIMIT_BASE_DELAY,
    minDelay: RATE_LIMIT_MIN_DELAY,
    maxDelay: RATE_LIMIT_MIN_DELAY,
  },
  databaseSeeding: {
    CONCURRENT_OPERATIONS: 3,
    BATCH_SIZE: 15,
    MAX_RETRIES: 5,
    RETRY_DELAY: 2000,
    USER_COUNT: XLARGE,
    DEFAULT_SAMPLE_COUNT: MEDIUM,
  } as const,

  ranges: {
    FRIENDSHIP_RANGE: {
      min: 0,
      max: MEDIUM,
      getRandom: () => {
        const rand = Math.random();
        const normalizedValue = distributions.natural(rand);
        return Math.floor(Math.min(MEDIUM, normalizedValue * MEDIUM));
      },
    } satisfies IRangeConfig,

    GAME_LOG_RANGE: {
      min: 0,
      max: SMALL,
      getRandom: () => {
        const u1 = Math.random();
        const u2 = Math.random();
        const value = distributions.bellCurve(u1, u2);
        return Math.floor(Math.max(0, Math.min(SMALL, value)));
      },
    } satisfies IRangeConfig,

    COMMENT_RANGE: {
      min: 0,
      max: SMALL,
      getRandom: () => {
        const rand = Math.random();
        const paretoValue = distributions.pareto(rand);
        return Math.floor(Math.max(0, Math.min(SMALL, paretoValue * SMALL)));
      },
    } satisfies IRangeConfig,

    CHILD_COMMENT_RANGE: {
      min: 0,
      max: XSMALL,
      getRandom: () => {
        const rand = Math.random();
        const decayedValue = distributions.exponential(rand);
        return Math.floor(Math.max(0, Math.min(XSMALL, decayedValue * XSMALL)));
      },
    } satisfies IRangeConfig,

    REACTION_RANGE: {
      min: 0,
      max: SMALL,
      getRandom: () => {
        const rand = Math.random();
        const powerValue = distributions.powerLaw(rand);
        return Math.floor(Math.max(0, Math.min(SMALL, powerValue * SMALL)));
      },
    } satisfies IRangeConfig,
  } as const,

  classification: {
    CLASSIFICATION_WEIGHTS: {
      private: 0.1,
      protected: 0.6,
      public: 0.3,
    } satisfies IClassificationWeights,
  } as const,

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
  } as const satisfies IBatchSizeConfig,

  pagination: {
    DEFAULT_PAGE_SIZE: 15,
    HUGE_SIZE: 10000,
    MAX_CHILD_COMMENT_DEPTH: 3,
    DEFAULT_SORT_DIRECTION: 'DESC' as const,
  } as const satisfies IPaginationConfig,
} as const;

export function getRapidApiConfig() {
  const env = envSchema.parse(process.env);

  return {
    baseUrl: env.RAPIDAPI_BASE_URL,
    headers: {
      'X-RapidAPI-Key': env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': env.RAPIDAPI_HOST,
    },
  };
}
