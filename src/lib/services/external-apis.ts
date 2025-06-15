import { apiLogger } from '@lib/core/logger';
import { API_CONFIG, getRapidApiConfig, validateAPIKey } from '@src/lib/config/api.config';
import { APIError } from '@src/lib/errors/api.error';
import type {
  IPlayerApiResponse,
  IGameApiResponse,
  ITeamApiResponse,
  ISeasonApiResponse,
} from '@src/lib/types';
import type { ITeamStats } from '@src/lib/types/generated/graphql';
import type { IAPIConfigOptions } from '@src/lib/types/shared.types';
import { sleep } from '@src/lib/utils/time';

// ============================================================================
// Generic API Utilities
// ============================================================================

/**
 * Generic fetch function with retry logic
 */
export async function fetchWithRetry(
  url: string,
  config: IAPIConfigOptions,
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
function createNbaApiConfig(): IAPIConfigOptions {
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
export async function fetchNbaSeasons(): Promise<ISeasonApiResponse> {
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
 * Fetch NBA games with optional query parameters
 */
export async function fetchNbaGames(queryParams: string): Promise<IGameApiResponse> {
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
 * Fetch a specific NBA game by ID
 */
export async function fetchNbaGameById(id: string): Promise<IGameApiResponse> {
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
export async function fetchNbaLiveGames(): Promise<IGameApiResponse> {
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
export async function fetchNbaTeams(queryParams?: string): Promise<ITeamApiResponse> {
  const url = `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}${queryParams ? `?${queryParams}` : ''}`;

  const config = createNbaApiConfig();

  try {
    const res = await fetchWithRetry(
      url,
      config,
      API_CONFIG.rateLimit.MAX_RETRIES,
      API_CONFIG.rateLimit.BASE_DELAY
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch NBA teams. Error: ${res}`);
    }

    return res.json();
  } catch (error) {
    handleAPIError(error);
  }
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
export async function fetchNbaPlayers(queryParams: string): Promise<IPlayerApiResponse> {
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
  } as IPlayerApiResponse;
}

/**
 * Fetch NBA team statistics with query parameters
 */
export async function fetchNbaTeamStats(queryParams: string): Promise<ITeamStats> {
  const res = await fetchWithRetry(
    `${getNbaApiBaseUrl()}/${API_CONFIG.endpoints.TEAMS}/statistics?${queryParams}`,
    createNbaApiConfig(),
    API_CONFIG.rateLimit.MAX_RETRIES,
    API_CONFIG.rateLimit.BASE_DELAY
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch team statistics: ${res.statusText}`);
  }

  const data = await res.json();

  // Check if we have a valid response
  if (!data || !data.response || !Array.isArray(data.response) || data.response.length === 0) {
    throw new Error('Invalid or empty response from team statistics API');
  }

  return data.response[0];
}
