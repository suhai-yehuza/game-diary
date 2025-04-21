// This file contains functions to fetch data from external APIs.
import type {
  SeasonApiResponse,
  LeagueApiResponse,
  GameApiResponse,
  TeamSearchApiResponse,
  PlayersApiResponse,
  StandingsApiResponse,
  GameStatisticsApiResponse,
  TeamStatisticsApiResponse,
  PlayerStatisticsApiResponse,
} from './types/types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const headers = {
  'x-rapidapi-host': `${process.env.NEXT_PUBLIC_RAPID_API_HOST}`,
  'x-rapidapi-key': `${process.env.NEXT_PUBLIC_RAPID_API_KEY}`,
};

// Utility function for API requests with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (retries > 0) {
        console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}\n${errorText}`
      );
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Seasons (/seasons)
export async function fetchNbaSeasons(): Promise<SeasonApiResponse> {
  try {
    const res = await fetchWithRetry(`${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/seasons`, {
      headers,
    });
    const data = await res.json();
    if (data.errors?.length > 0) {
      throw new Error(`API returned errors: ${data.errors.join(', ')}`);
    }
    return data;
  } catch (error) {
    console.error('Error fetching NBA seasons:', error);
    throw new Error('Failed to fetch NBA seasons');
  }
}

// Leagues (/leagues)
export async function fetchNbaLeagues(): Promise<LeagueApiResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/leagues`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA leagues');
  }

  return res.json();
}

// Games (/games)
export async function fetchNbaGames(queryParams: string): Promise<GameApiResponse> {
  try {
    const url = `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/games${queryParams}`;
    console.log('Fetching games from:', url);
    console.log('Using headers:', {
      'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
      'x-rapidapi-key': '***',
    });

    if (!process.env.NEXT_PUBLIC_RAPID_API_HOST || !process.env.NEXT_PUBLIC_RAPID_API_KEY) {
      throw new Error('RapidAPI credentials are not properly configured');
    }

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY,
      },
    });

    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') || '60';
      console.log(`Rate limit hit. Waiting ${retryAfter} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return fetchNbaGames(queryParams);
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch NBA games: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Games API Response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchNbaGames:', error);
    throw error;
  }
}

export async function fetchNbaGamesH2H(team1: number, team2: number): Promise<GameApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/games?h2h=${team1}-${team2}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA games');
  }

  return res.json();
}

export async function fetchNbaGameById(id: string): Promise<GameApiResponse> {
  return fetchNbaGames(`?id=${id}`);
}

export async function fetchNbaLiveGames(): Promise<GameApiResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/games?live=all`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA live games');
  }

  return res.json();
}

// Teams
export async function fetchNbaTeams(queryParams?: string): Promise<TeamSearchApiResponse> {
  const url = queryParams
    ? `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/teams?${queryParams}`
    : `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/teams`;

  const res = await fetch(url, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA teams');
  }

  return res.json();
}

export async function fetchNbaTeamById(id: string): Promise<TeamSearchApiResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/teams/?id=${id}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA team by id');
  }

  return res.json();
}

// Players
export async function fetchNbaPlayers(queryParams: string): Promise<PlayersApiResponse> {
  try {
    // Remove any leading '?' from queryParams
    const cleanQueryParams = queryParams.startsWith('?') ? queryParams.slice(1) : queryParams;
    const url = `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/players${cleanQueryParams ? `?${cleanQueryParams}` : ''}`;
    console.log('Fetching players from:', url);
    console.log('Using headers:', {
      'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY ? '***' : 'missing',
    });

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
      },
    });

    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const html = await res.text();
        console.error('API returned HTML error page:', html);
        throw new Error(
          'API returned an HTML error page. Check API configuration and credentials.'
        );
      }

      const errorText = await res.text();
      console.error('API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch NBA players: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('API returned non-JSON response:', text);
      throw new Error('API returned a non-JSON response');
    }

    const data = await res.json();
    console.log('Players API Response:', {
      get: data.get,
      parameters: data.parameters,
      results: data.results,
      responseLength: data.response?.length,
      firstPlayer: data.response?.[0],
      errors: data.errors,
    });
    return data;
  } catch (error) {
    console.error('Error in fetchNbaPlayers:', error);
    throw error;
  }
}

export async function fetchNbaPlayerById(id: string): Promise<PlayersApiResponse> {
  return fetchNbaPlayers(`id=${id}`);
}

// Standings
export async function fetchNbaStandings(queryParams: string): Promise<StandingsApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/standings?${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA standings');
  }

  return res.json();
}

// Stats
export async function fetchNbaGameStats(queryParams: string): Promise<GameStatisticsApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/games/statistics?${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA stats');
  }

  return res.json();
}

export async function fetchNbaTeamStats(queryParams: string): Promise<TeamStatisticsApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/teams/statistics?${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA team stats');
  }

  return res.json();
}

export async function fetchNbaPlayerStats(
  queryParams: string
): Promise<PlayerStatisticsApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/players/statistics?${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA player stats');
  }

  return res.json();
}

export async function searchNbaPlayers(queryParams: string): Promise<PlayersApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/players?search=${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to search NBA player');
  }

  return res.json();
}

export async function searchNbaTeams(queryParams: string): Promise<TeamSearchApiResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/teams?search=${queryParams}`,
    {
      headers,
    }
  );

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to search NBA team');
  }

  return res.json();
}

// Game Statistics
export async function fetchNbaGameStatistics(game_id: string): Promise<GameStatisticsApiResponse> {
  try {
    const url = `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}/games/statistics?id=${game_id}`;
    console.log('Fetching game statistics from:', url);
    console.log('Using headers:', {
      'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
      'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY ? '***' : 'missing',
    });

    const res = await fetch(url, {
      headers: {
        'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST || '',
        'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY || '',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText,
      });
      throw new Error(`Failed to fetch NBA game statistics: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Game Statistics API Response:', {
      get: data.get,
      parameters: data.parameters,
      results: data.results,
      responseLength: data.response?.length,
      errors: data.errors,
    });
    return data;
  } catch (error) {
    console.error('Error in fetchNbaGameStatistics:', error);
    throw error;
  }
}
