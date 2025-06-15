import { APIError } from '@src/lib/errors/api.error';
import type {
  IRangeConfig,
  IBatchSizeConfig,
  IRateLimitConfig,
  IClassificationWeights,
  IPaginationConfig,
  IDistributionFunctions,
} from '@src/lib/types/config.types';
import type { IDatabaseSeedingConfig } from '@src/lib/types/database.types';
import type { ISortDirection } from '@src/lib/types/shared.types';

const XSMALL = 10;
const SMALL = 10 * XSMALL;
const MEDIUM = 10 * SMALL;
const LARGE = 10 * MEDIUM;
const XLARGE = 10 * LARGE;

export function validateAPIKey(key: string | undefined): string {
  if (!key) {
    throw new APIError(
      API_CONFIG.errors.MISSING_API_KEY,
      401,
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
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const mean = 50;
    const stdDev = 16.67;
    return z0 * stdDev + mean;
  },
  pareto: (rand: number, alpha = 1.16) => Math.pow(rand, -1 / alpha),
  exponential: (rand: number) => Math.exp(-2 * rand),
  powerLaw: (rand: number, exponent = -2) => Math.pow(rand, exponent),
} as const satisfies IDistributionFunctions;

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
    CONCURRENT_OPERATIONS: 3,
    BATCH_SIZE: 15,
    MAX_RETRIES: 5,
    RETRY_DELAY: 2000,
    USER_COUNT: XLARGE,
    DEFAULT_SAMPLE_COUNT: MEDIUM,
  } as const satisfies IDatabaseSeedingConfig,

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

  rateLimit: {
    MAX_RETRIES: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 5000,
    RATE_LIMIT_DELAY: 60000,
  } as const satisfies IRateLimitConfig,

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
    DEFAULT_SORT_DIRECTION: 'desc' as ISortDirection,
  } as const satisfies IPaginationConfig,
} as const;

export function getRapidApiConfig() {
  return {
    apiKey: validateAPIKey(process.env.NEXT_PUBLIC_RAPID_API_KEY),
    baseUrl: process.env.NEXT_PUBLIC_RAPID_API_BASE_URL || '',
    host: process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
    headers: {
      'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
    },
  };
}
