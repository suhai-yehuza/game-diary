import { API_CONFIG, getRapidApiConfig, validateAPIKey } from '@/lib/config/api.config';
import { APIError } from '@/lib/errors/api.error';
import { apiLogger } from '@/lib/logger';
import type { SeasonApiResponse } from '@/lib/types/api.types';
import type {
  PlayerApiResponse,
  GameApiResponse,
  ApiTeamResponse,
} from '@/lib/types/consolidated.types';
import type { TeamStats, PlayerStats } from '@/lib/types/generated/graphql';
import type {
  APIConfigOptions,
  StandingApiResponse,
  LeaguesApiResponse,
} from '@/lib/types/shared.types';
import { sleep } from '@/lib/utils/index.time';

// ============================================================================
// Generic API Utilities
// ============================================================================

/**
 * Generic fetch function with retry logic
 */
export async function fetchWithRetry(
  url: string,
  config: APIConfigOptions,
  attempts: number = config.retryAttempts ?? API_CONFIG.request.retryAttempts,
  delayBetweenBatches: number = API_CONFIG.rateLimit.BASE_DELAY
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? API_CONFIG.request.timeout
    );

    const response = await fetch(url, {
      headers: config.headers,
      signal: controller.signal,
      method: config.method ?? API_CONFIG.request.method,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        apiLogger.warn('Rate limit hit, waiting before retry...');
        await sleep(API_CONFIG.rateLimit.RATE_LIMIT_DELAY);
        return fetchWithRetry(url, config, attempts, delayBetweenBatches);
      }

      throw new APIError(
        `${API_CONFIG.errors.REQUEST_FAILED}: ${response.statusText}`,
        response.status,
        response.statusText,
        'REQUEST_FAILED'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof APIError) throw error;
    if (attempts <= 1)
      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        undefined,
        'UNKNOWN_ERROR'
      );

    const backoffDelay =
      (config.retryDelay ?? API_CONFIG.request.retryDelay) *
      Math.pow(2, API_CONFIG.rateLimit.MAX_RETRIES - attempts);
    apiLogger.info(`Retrying in ${backoffDelay}ms... (${attempts} attempts remaining)`);
    await sleep(backoffDelay);
    return fetchWithRetry(url, config, attempts - 1, delayBetweenBatches);
  }
}

/**
 * Create a generic API client with default configuration
 */
export function createAPIClient(config: Partial<APIConfigOptions> & { apiKey: string }) {
  const rapidApiConfig = getRapidApiConfig();
  const finalConfig: APIConfigOptions = {
    baseUrl: config.baseUrl ?? rapidApiConfig.baseUrl,
    apiKey: config.apiKey,
    host: config.host ?? rapidApiConfig.host,
    headers: config.headers ?? rapidApiConfig.headers,
    timeout: config.timeout ?? API_CONFIG.request.timeout,
    retryAttempts: config.retryAttempts ?? API_CONFIG.request.retryAttempts,
    retryDelay: config.retryDelay ?? API_CONFIG.request.retryDelay,
    method: config.method ?? API_CONFIG.request.method,
  };

  return {
    async get<T>(endpoint: string): Promise<T> {
      const url = `${finalConfig.baseUrl}${endpoint}`;
      const response = await fetchWithRetry(
        url,
        {
          ...finalConfig,
          body: undefined,
        },
        API_CONFIG.rateLimit.MAX_RETRIES,
        API_CONFIG.rateLimit.BASE_DELAY
      );
      return response.json();
    },

    async post<T>(endpoint: string, data: unknown): Promise<T> {
      const url = `${finalConfig.baseUrl}${endpoint}`;
      const response = await fetchWithRetry(
        url,
        {
          ...finalConfig,
          headers: {
            ...finalConfig.headers,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(data),
        },
        API_CONFIG.rateLimit.MAX_RETRIES,
        API_CONFIG.rateLimit.BASE_DELAY
      );
      return response.json();
    },
  };
}

// ============================================================================
// NBA API Client
// ============================================================================

/**
 * Create a RapidAPI client specifically for NBA data
 */
export function createRapidAPIClient(apiKey: string) {
  const rapidApiConfig = getRapidApiConfig();
  const validatedKey = validateAPIKey(apiKey);

  return {
    get: async <T>(
      endpoint: string,
      options: { params?: Record<string, string> } = {}
    ): Promise<T> => {
      const queryParams = options.params ? new URLSearchParams(options.params).toString() : '';
      const url = `${rapidApiConfig.baseUrl}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
      apiLogger.info('Making API request to:', url);

      try {
        const response = await fetchWithRetry(
          url,
          {
            baseUrl: rapidApiConfig.baseUrl,
            apiKey: validatedKey,
            host: rapidApiConfig.host,
            headers: rapidApiConfig.headers,
          },
          API_CONFIG.rateLimit.MAX_RETRIES,
          API_CONFIG.rateLimit.BASE_DELAY
        );

        if (!response.ok) {
          throw new Error(
            `API request failed with status ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        handleAPIError(error);
      }
    },
  };
}

/**
 * Validate API key
 */

/**
 * Handle API errors consistently
 */
export function handleAPIError(error: unknown): never {
  if (error instanceof Error) {
    if (error instanceof APIError) {
      apiLogger.error(`API Error (${error.status}): ${error.message}`);
    } else {
      apiLogger.error('Unexpected error:', error.message);
    }
  } else {
    apiLogger.error('Unexpected error:', error);
  }
  throw error;
}

// ============================================================================
// NBA API Endpoints
// ============================================================================

/**
 * Create a config object for NBA API calls
 */
function createNbaApiConfig(): APIConfigOptions {
  const rapidApiConfig = {
    baseUrl: process.env.NEXT_PUBLIC_RAPID_API_BASE_URL || '',
    host: process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
    headers: {
      'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
    },
  };

  return {
    baseUrl: rapidApiConfig.baseUrl,
    apiKey: rapidApiConfig.headers['x-rapidapi-key'],
    host: rapidApiConfig.host,
    headers: rapidApiConfig.headers,
    timeout: API_CONFIG.request.timeout,
    retryAttempts: API_CONFIG.request.retryAttempts,
    retryDelay: API_CONFIG.request.retryDelay,
    method: API_CONFIG.request.method,
  };
}

/**
 * Get the base URL for NBA API endpoints
 */
function getNbaApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_RAPID_API_BASE_URL || '';
}

/**
 * Fetch NBA seasons
 */
export async function fetchNbaSeasons(): Promise<SeasonApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.SEASONS}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const response = await res.json();
  return {
    ...response,
    status: res.status,
  };
}

/**
 * Fetch NBA leagues
 */
export async function fetchNbaLeagues(): Promise<LeaguesApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.LEAGUES}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  return await res.json();
}

/**
 * Fetch NBA games with optional query parameters
 */
export async function fetchNbaGames(queryParams: string): Promise<GameApiResponse> {
  const cleanQueryParams = queryParams.startsWith('?') ? queryParams.slice(1) : queryParams;
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}${cleanQueryParams ? `?${cleanQueryParams}` : ''}`;

  const res = await fetchWithRetry(
    url,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch NBA games. Error: ${res}`);
  }

  return await res.json();
}

/**
 * Fetch head-to-head games between two teams
 */
export async function fetchNbaGamesH2H(team1: number, team2: number): Promise<GameApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}?h2h=${team1}-${team2}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch NBA games. Error: ${res}`);
  }

  return res.json();
}

/**
 * Fetch a specific NBA game by ID
 */
export async function fetchNbaGameById(id: string): Promise<GameApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}?id=${id}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch NBA game ${id}. Error: ${res}`);
  }

  return res.json();
}

/**
 * Fetch currently live NBA games
 */
export async function fetchNbaLiveGames(): Promise<GameApiResponse> {
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}?live=all`;

  const config = createNbaApiConfig();

  try {
    const res = await fetchWithRetry(
      url,
      config,
      API_CONFIG.rateLimit.MAX_RETRIES,
      API_CONFIG.rateLimit.BASE_DELAY
    );

    if (!res.ok) {
      apiLogger.error('Live games request failed:', {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
      });
      throw new Error(
        `Failed to fetch NBA live games. Status: ${res.status}, StatusText: ${res.statusText}`
      );
    }

    const data = await res.json();

    // Handle empty response gracefully
    if (!data || !data.response) {
      apiLogger.info('No live games currently available');
      return {
        get: 'games/',
        parameters: { live: 'all' },
        errors: [],
        results: 0,
        response: [],
        data: [], // Add this to match GameApiResponse type
      };
    }

    return {
      ...data,
      data: data.response, // Add this to match GameApiResponse type
    };
  } catch (error) {
    apiLogger.error('Error in fetchNbaLiveGames:', error);
    throw error;
  }
}

/**
 * Fetch NBA teams with optional query parameters
 */
export async function fetchNbaTeams(queryParams?: string): Promise<ApiTeamResponse> {
  const url = queryParams
    ? `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}?${queryParams}`
    : `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}`;
  apiLogger.info('Fetching NBA teams from URL:', url);

  const res = await fetchWithRetry(
    url,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch NBA teams. Status: ${res.status}, StatusText: ${res.statusText}`
    );
  }

  const data = await res.json();
  apiLogger.info('Raw NBA teams response:', JSON.stringify(data, null, 2));

  // Validate response structure
  if (!data || !data.response || !Array.isArray(data.response)) {
    throw new Error('Invalid response structure from NBA teams API');
  }

  // Filter for valid teams (must have ID and name)
  const validTeams = data.response.filter(
    (team: { id?: number; name?: string; nbaFranchise?: boolean }) => {
      if (!team.id) {
        apiLogger.warn('Team missing ID:', team);
        return false;
      }
      if (!team.name) {
        apiLogger.warn('Team missing name:', team);
        return false;
      }
      return true;
    }
  );

  if (validTeams.length === 0) {
    throw new Error('No valid teams found in API response');
  }

  // Log team IDs for verification
  apiLogger.info(
    'Team IDs from API:',
    validTeams.map((team: { id: number }) => team.id).join(', ')
  );
  apiLogger.info(
    'NBA Franchise teams:',
    validTeams.filter((team: { nbaFranchise?: boolean }) => team.nbaFranchise).length
  );
  apiLogger.info(
    'Non-NBA Franchise teams:',
    validTeams.filter((team: { nbaFranchise?: boolean }) => !team.nbaFranchise).length
  );

  return {
    get: 'teams',
    parameters: {},
    errors: [],
    results: validTeams.length,
    response: validTeams,
  } as ApiTeamResponse;
}

/**
 * Fetch a specific NBA team by ID
 */
export async function fetchNbaTeamById(teamId: string) {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}?id=${teamId}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  return res.json();
}

/**
 * Fetch NBA players with optional query parameters
 */
export async function fetchNbaPlayers(queryParams: string): Promise<PlayerApiResponse> {
  const cleanQueryParams = queryParams.startsWith('?') ? queryParams.slice(1) : queryParams;
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.PLAYERS}${cleanQueryParams ? `?${cleanQueryParams}` : ''}`;
  const res = await fetchWithRetry(
    url,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  const data = await res.json();
  return {
    response: data,
  } as PlayerApiResponse;
}

/**
 * Fetch NBA game statistics with query parameters
 */
export async function fetchNbaGameStats(queryParams: string): Promise<StandingApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}/statistics?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await res.json();
  return {
    response: data,
  } as StandingApiResponse;
}

/**
 * Fetch NBA team statistics with query parameters
 */
export async function fetchNbaTeamStats(queryParams: string): Promise<TeamStats> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}/statistics?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await res.json();
  return data.data[0];
}

/**
 * Fetch NBA player statistics with query parameters
 */
export async function fetchNbaPlayerStats(queryParams: string): Promise<PlayerStats> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.PLAYERS}/statistics?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await res.json();
  return data.data[0];
}

/**
 * Search NBA players with query parameters
 */
export async function searchNbaPlayers(queryParams: string): Promise<PlayerApiResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.PLAYERS}?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await res.json();
  return {
    response: data,
  } as PlayerApiResponse;
}

/**
 * Search NBA teams with query parameters
 */
export async function searchNbaTeams(queryParams: string): Promise<ApiTeamResponse> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await res.json();
  return {
    response: data,
  } as ApiTeamResponse;
}

/**
 * Fetch NBA game statistics for a specific game
 */
export async function fetchNbaGameStatistics(gameId: string): Promise<GameApiResponse> {
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.GAMES}/statistics?id=${gameId}`;
  const response = await fetchWithRetry(
    url,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );
  const data = await response.json();
  return {
    response: data.response || data,
  };
}

export async function fetchNbaPlayerStatistics(playerId: string) {
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.PLAYERS}/statistics?id=${playerId}`;
  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch player statistics: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function fetchNbaTeamStatistics(teamId: string) {
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}/statistics?id=${teamId}`;
  const response = await fetch(url, {
    headers: {
      'x-rapidapi-host': 'api-nba-v1.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch team statistics: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export interface APIResponse<T = unknown> {
  response?: T[];
  data?: T[];
  get?: string;
  parameters?: Record<string, string>;
  errors?: string[];
  results?: number;
}
