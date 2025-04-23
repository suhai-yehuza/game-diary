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
const RAPID_API_HOST = `${process.env.NEXT_PUBLIC_RAPID_API_HOST}`;
const RAPID_API_KEY = `${process.env.NEXT_PUBLIC_RAPID_API_KEY}`;
const RAPID_API_BASE_URL = `${process.env.NEXT_PUBLIC_RAPID_API_BASE_URL}`;

export const headers = {
  'x-rapidapi-host': RAPID_API_HOST,
  'x-rapidapi-key': RAPID_API_KEY,
};

// Utility function for API requests with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  if (!RAPID_API_HOST || !RAPID_API_KEY) {
    throw new Error('RapidAPI credentials are not properly configured');
  }

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
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/seasons`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA seasons');
  }

  return res.json();
}

// Leagues (/leagues)
export async function fetchNbaLeagues(): Promise<LeagueApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/leagues`, {
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
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/games${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA games');
  }

  return res.json();
}

export async function fetchNbaGamesH2H(team1: number, team2: number): Promise<GameApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/games?h2h=${team1}-${team2}`, {
    headers,
  });

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
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/games?live=all`, {
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
    ? `${RAPID_API_BASE_URL}/teams?${queryParams}`
    : `${RAPID_API_BASE_URL}/teams`;

  const res = await fetchWithRetry(url, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA teams');
  }

  return res.json();
}

export async function fetchNbaTeamById(teamId: string) {
  const response = await fetch(`${RAPID_API_BASE_URL}/teams?id=${teamId}`, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch team data');
  }

  return response.json();
}

// Players
export async function fetchNbaPlayers(queryParams: string): Promise<PlayersApiResponse> {
  // Remove any leading '?' from queryParams
  const cleanQueryParams = queryParams.startsWith('?') ? queryParams.slice(1) : queryParams;
  const url = `${RAPID_API_BASE_URL}/players${cleanQueryParams ? `?${cleanQueryParams}` : ''}`;
  const res = await fetchWithRetry(url, {
    headers: {
      'x-rapidapi-host': RAPID_API_HOST || '',
      'x-rapidapi-key': RAPID_API_KEY || '',
    },
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA players');
  }

  return res.json();
}

export async function fetchNbaPlayerById(id: string): Promise<PlayersApiResponse> {
  return fetchNbaPlayers(`id=${id}`);
}

// Standings
export async function fetchNbaStandings(queryParams: string): Promise<StandingsApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/standings?${queryParams}`, { headers });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA standings');
  }

  return res.json();
}

// Stats
export async function fetchNbaGameStats(queryParams: string): Promise<GameStatisticsApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/games/statistics?${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA stats');
  }

  return res.json();
}

export async function fetchNbaTeamStats(queryParams: string): Promise<TeamStatisticsApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/teams/statistics?${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.error('Failed to fetch NBA team stats:', res.status, res.statusText);
    throw new Error('Failed to fetch NBA team stats');
  }

  return res.json();
}

export async function fetchNbaPlayerStats(
  queryParams: string
): Promise<PlayerStatisticsApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/players/statistics?${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to fetch NBA player stats');
  }

  return res.json();
}

export async function searchNbaPlayers(queryParams: string): Promise<PlayersApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/players?search=${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to search NBA player');
  }

  return res.json();
}

export async function searchNbaTeams(queryParams: string): Promise<TeamSearchApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/teams?search=${queryParams}`, {
    headers,
  });

  if (!res.ok) {
    console.log({ res });
    throw new Error('Failed to search NBA team');
  }

  return res.json();
}

// Game Statistics
export async function fetchNbaGameStatistics(game_id: string): Promise<GameStatisticsApiResponse> {
  const res = await fetchWithRetry(`${RAPID_API_BASE_URL}/games/statistics?id=${game_id}`, {
    headers,
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

  return await res.json();
}
