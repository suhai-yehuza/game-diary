'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import type { FormEvent, ChangeEvent } from 'react';
import React, { useEffect, Suspense, useState } from 'react';

import type {
  IGamesApiResponse,
  ISeasonsApiResponse,
  ITeamsApiResponse,
  IPlayersApiResponse,
  IStandingsApiResponse,
} from '@/lib/types/external.api.types';
import { API_CONFIG, getRapidApiConfig } from '@src/lib/config/api.config';

// API Client function
const createRapidAPIClient = () => {
  const config = getRapidApiConfig();

  return {
    async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
      const url = new URL(`${config.baseUrl}${endpoint}`);

      // Add query parameters
      Object.entries(params).forEach(([key, value]: Readonly<[string, string]>) => {
        if (value && value.trim() !== '') {
          url.searchParams.append(key, value);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          ...config.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      return data;
    },
  };
};

// Simple inline components
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${size === 'sm' ? 'h-9 px-3' : 'h-10 px-4 py-2'} ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({
  className = '',
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  id,
  required = false,
  ...props
}: {
  className?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  required?: boolean;
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label = ({
  children,
  htmlFor,
  className = '',
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

const NAV_ITEMS = [
  {
    key: 'seasons',
    label: 'Seasons',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Seasons',
    endpoint: API_CONFIG.endpoints.SEASONS,
  },
  {
    key: 'leagues',
    label: 'Leagues',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Leagues',
    endpoint: API_CONFIG.endpoints.LEAGUES,
  },
  {
    key: 'games',
    label: 'Games',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Games',
    endpoint: API_CONFIG.endpoints.GAMES,
  },
  {
    key: 'teams',
    label: 'Teams',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Teams',
    endpoint: API_CONFIG.endpoints.TEAMS,
  },
  {
    key: 'players',
    label: 'Players',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Players',
    endpoint: API_CONFIG.endpoints.PLAYERS,
  },
  {
    key: 'standings',
    label: 'Standings',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Standings',
    endpoint: API_CONFIG.endpoints.STANDINGS,
  },
];

function isSeasonsApiResponse(data: unknown): data is ISeasonsApiResponse {
  return typeof data === 'object' && data !== null && 'results' in data && 'response' in data;
}
function isTeamsApiResponse(data: unknown): data is ITeamsApiResponse {
  return typeof data === 'object' && data !== null && 'results' in data && 'response' in data;
}
function isGamesApiResponse(data: unknown): data is IGamesApiResponse {
  return typeof data === 'object' && data !== null && 'results' in data && 'response' in data;
}
function isPlayersApiResponse(data: unknown): data is IPlayersApiResponse {
  return typeof data === 'object' && data !== null && 'results' in data && 'response' in data;
}
function isStandingsApiResponse(data: unknown): data is IStandingsApiResponse {
  return typeof data === 'object' && data !== null && 'results' in data && 'response' in data;
}

function AdminExperimentalContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('seasons');
  const [gamesSubTab, setGamesSubTab] = useState('games');
  const [teamsSubTab, setTeamsSubTab] = useState('teams');
  const [playersSubTab, setPlayersSubTab] = useState('players');
  const [data, setData] = useState<
    | ISeasonsApiResponse
    | ITeamsApiResponse
    | IGamesApiResponse
    | IPlayersApiResponse
    | IStandingsApiResponse
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [gameParams, setGameParams] = useState({
    id: '',
    date: '',
    league: '',
    season: '',
    team: '',
    h2h: '',
  });
  const [gameStatsId, setGameStatsId] = useState('');
  const [teamParams, setTeamParams] = useState({
    id: '',
    name: '',
    code: '',
    league: '',
    conference: '',
    division: '',
    search: '',
  });
  const [teamStatsParams, setTeamStatsParams] = useState({ id: '', season: '', stage: '' });
  const [playerParams, setPlayerParams] = useState({
    id: '',
    name: '',
    team: '',
    season: '',
    country: '',
    search: '',
  });
  const [playerStatsParams, setPlayerStatsParams] = useState({
    id: '',
    game: '',
    team: '',
    season: '',
  });
  const [standingsParams, setStandingsParams] = useState({
    league: '',
    season: '',
    team: '',
    conference: '',
    division: '',
  });

  useEffect(() => {
    if (!isLoaded) return;
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') ?? [];
    const emailAddress = user?.emailAddresses[0].emailAddress;
    if (!emailAddress || !adminEmails.includes(emailAddress)) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  const handleFetch = async (
    endpoint: Readonly<string>,
    params: Readonly<Record<string, string>>,
    requiredParams: ReadonlyArray<string> = []
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    const missingParams = requiredParams.filter(p => !params[p] || params[p].trim() === '');
    if (missingParams.length > 0) {
      setError(`Required parameters are missing: ${missingParams.join(', ')}`);
      setLoading(false);
      return;
    }

    const activeParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value && value.trim() !== '')
    );
    if (Object.keys(activeParams).length === 0 && requiredParams.length === 0) {
      setError('At least one parameter is required.');
      setLoading(false);
      return;
    }

    try {
      const client = createRapidAPIClient();

      // Determine the response type based on the endpoint
      let data: unknown;
      if (endpoint.includes('/seasons')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isSeasonsApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/leagues')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isTeamsApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/games/statistics')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isGamesApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/games')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isGamesApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/teams/statistics')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isTeamsApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/teams')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isTeamsApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/players/statistics')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isGamesApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/players')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isPlayersApiResponse(data)) setData(data);
        else setData(null);
      } else if (endpoint.includes('/standings')) {
        data = await client.fetch<unknown>(endpoint, activeParams);
        if (isStandingsApiResponse(data)) setData(data);
        else setData(null);
      } else {
        throw new Error(`Unknown endpoint: ${endpoint}`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Unknown error');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGames = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.GAMES, gameParams);
  };
  const handleFetchGameStats = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.GAME_STATISTICS, { id: gameStatsId }, ['id']);
  };
  const handleFetchTeams = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.TEAMS, teamParams);
  };
  const handleFetchTeamStats = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.TEAM_STATISTICS, teamStatsParams, ['id', 'season']);
  };
  const handleFetchPlayers = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.PLAYERS, playerParams);
  };
  const handleFetchPlayerStats = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.PLAYER_STATISTICS, playerStatsParams);
  };
  const handleFetchStandings = (e: Readonly<FormEvent>) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.STANDINGS, standingsParams, ['league', 'season']);
  };

  useEffect(() => {
    if (selectedTab === 'games' && gamesSubTab === 'live') {
      void handleFetch(API_CONFIG.endpoints.GAMES, { live: 'all' });
    }
  }, [selectedTab, gamesSubTab]);

  useEffect(() => {
    const tabsWithForms = ['games', 'teams', 'players', 'standings'];
    if (tabsWithForms.includes(selectedTab)) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const selectedItem = NAV_ITEMS.find(item => item.key === selectedTab);
        if (!selectedItem) throw new Error('Invalid tab selected');

        const client = createRapidAPIClient();

        // Determine the response type based on the selected tab
        let data;
        if (selectedTab === 'seasons') {
          data = await client.fetch<ISeasonsApiResponse>(selectedItem.endpoint);
        } else if (selectedTab === 'leagues') {
          data = await client.fetch<ITeamsApiResponse>(selectedItem.endpoint);
        } else {
          throw new Error(`Unexpected tab: ${selectedTab}`);
        }

        setData(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [selectedTab]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Experimental</h1>
      </div>
      <div className="mb-6 flex gap-2 border-b pb-2 overflow-x-auto">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`px-4 py-2 rounded-t font-medium transition-colors border-b-2 whitespace-nowrap ${
              selectedTab === item.key
                ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-gray-800'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600'
            }`}
            onClick={() => setSelectedTab(item.key)}
            title={item.label}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {selectedTab === 'games' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${gamesSubTab === 'games' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => {
                setGamesSubTab('games');
                setData(null);
                setError(null);
              }}
            >
              Games
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${gamesSubTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => {
                setGamesSubTab('stats');
                setData(null);
                setError(null);
              }}
            >
              Game Stats
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${gamesSubTab === 'live' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => {
                setGamesSubTab('live');
                setData(null);
                setError(null);
              }}
            >
              Live Games
            </button>
          </div>
          {gamesSubTab === 'games' && (
            <form
              onSubmit={handleFetchGames}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-1">Games Query Parameters</h3>
              <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="game-id">Game ID</Label>
                  <Input
                    id="game-id"
                    type="number"
                    placeholder="e.g. 12345"
                    value={gameParams.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="game-date">Date</Label>
                  <Input
                    id="game-date"
                    type="date"
                    value={gameParams.date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="game-season">Season</Label>
                  <Input
                    id="game-season"
                    type="number"
                    placeholder="YYYY"
                    value={gameParams.season}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, season: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="game-league">League</Label>
                  <Input
                    id="game-league"
                    placeholder="e.g. standard"
                    value={gameParams.league}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, league: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="game-team">Team ID</Label>
                  <Input
                    id="game-team"
                    type="number"
                    placeholder="e.g. 1"
                    value={gameParams.team}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, team: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="game-h2h">Head-to-Head (h2h)</Label>
                  <Input
                    id="game-h2h"
                    placeholder="e.g. 1-4"
                    value={gameParams.h2h}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setGameParams({ ...gameParams, h2h: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Games'}
              </Button>
            </form>
          )}
          {gamesSubTab === 'stats' && (
            <form
              onSubmit={handleFetchGameStats}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-4">Game Statistics Query</h3>
              <div>
                <Label htmlFor="game-stats-id">
                  Game ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="game-stats-id"
                  type="number"
                  placeholder="Enter Game ID"
                  value={gameStatsId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setGameStatsId(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Stats'}
              </Button>
            </form>
          )}
          {gamesSubTab === 'live' && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold mb-1">Live Games</h3>
              <p className="text-sm text-gray-500 mb-4">Fetching all currently live games...</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'teams' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${teamsSubTab === 'teams' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setTeamsSubTab('teams')}
            >
              Teams
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${teamsSubTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setTeamsSubTab('stats')}
            >
              Team Stats
            </button>
          </div>

          {teamsSubTab === 'teams' && (
            <form
              onSubmit={handleFetchTeams}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-1">Teams Query Parameters</h3>
              <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="team-id">ID</Label>
                  <Input
                    id="team-id"
                    placeholder="ID"
                    value={teamParams.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-name">Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Name"
                    value={teamParams.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-code">Code</Label>
                  <Input
                    id="team-code"
                    placeholder="Code"
                    value={teamParams.code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, code: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-league">League</Label>
                  <Input
                    id="team-league"
                    placeholder="League"
                    value={teamParams.league}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, league: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-conference">Conference</Label>
                  <Input
                    id="team-conference"
                    placeholder="Conference"
                    value={teamParams.conference}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, conference: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-division">Division</Label>
                  <Input
                    id="team-division"
                    placeholder="Division"
                    value={teamParams.division}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, division: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="team-search">Search</Label>
                  <Input
                    id="team-search"
                    placeholder="Search"
                    value={teamParams.search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamParams({ ...teamParams, search: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Teams'}
              </Button>
            </form>
          )}

          {teamsSubTab === 'stats' && (
            <form
              onSubmit={handleFetchTeamStats}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-4">Team Statistics Query</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="team-stats-id">
                    Team ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="team-stats-id"
                    placeholder="Team ID"
                    value={teamStatsParams.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamStatsParams({ ...teamStatsParams, id: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team-stats-season">
                    Season <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="team-stats-season"
                    placeholder="YYYY"
                    value={teamStatsParams.season}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamStatsParams({ ...teamStatsParams, season: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="team-stats-stage">Stage</Label>
                  <Input
                    id="team-stats-stage"
                    placeholder="Stage"
                    value={teamStatsParams.stage}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTeamStatsParams({ ...teamStatsParams, stage: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Team Stats'}
              </Button>
            </form>
          )}
        </div>
      )}

      {selectedTab === 'players' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${playersSubTab === 'players' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setPlayersSubTab('players')}
            >
              Players
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${playersSubTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setPlayersSubTab('stats')}
            >
              Player Stats
            </button>
          </div>

          {playersSubTab === 'players' && (
            <form
              onSubmit={handleFetchPlayers}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-1">Players Query Parameters</h3>
              <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="player-id">ID</Label>
                  <Input
                    id="player-id"
                    placeholder="ID"
                    value={playerParams.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-name">Name</Label>
                  <Input
                    id="player-name"
                    placeholder="Name"
                    value={playerParams.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-team">Team ID</Label>
                  <Input
                    id="player-team"
                    placeholder="Team ID"
                    value={playerParams.team}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, team: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-season">Season</Label>
                  <Input
                    id="player-season"
                    placeholder="YYYY"
                    value={playerParams.season}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, season: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-country">Country</Label>
                  <Input
                    id="player-country"
                    placeholder="Country"
                    value={playerParams.country}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-search">Search</Label>
                  <Input
                    id="player-search"
                    placeholder="Search"
                    value={playerParams.search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerParams({ ...playerParams, search: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Players'}
              </Button>
            </form>
          )}

          {playersSubTab === 'stats' && (
            <form
              onSubmit={handleFetchPlayerStats}
              className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
            >
              <h3 className="text-lg font-semibold mb-1">Player Statistics Query</h3>
              <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="player-stats-id">Player ID</Label>
                  <Input
                    id="player-stats-id"
                    placeholder="Player ID"
                    value={playerStatsParams.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerStatsParams({ ...playerStatsParams, id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-stats-game">Game ID</Label>
                  <Input
                    id="player-stats-game"
                    placeholder="Game ID"
                    value={playerStatsParams.game}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerStatsParams({ ...playerStatsParams, game: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-stats-team">Team ID</Label>
                  <Input
                    id="player-stats-team"
                    placeholder="Team ID"
                    value={playerStatsParams.team}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerStatsParams({ ...playerStatsParams, team: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="player-stats-season">Season</Label>
                  <Input
                    id="player-stats-season"
                    placeholder="YYYY"
                    value={playerStatsParams.season}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPlayerStatsParams({ ...playerStatsParams, season: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Fetching...' : 'Fetch Player Stats'}
              </Button>
            </form>
          )}
        </div>
      )}

      {selectedTab === 'standings' && (
        <div className="mb-6">
          <form
            onSubmit={handleFetchStandings}
            className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50"
          >
            <h3 className="text-lg font-semibold mb-4">Standings Query Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="standings-league">
                  League <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="standings-league"
                  placeholder="League"
                  value={standingsParams.league}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStandingsParams({ ...standingsParams, league: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="standings-season">
                  Season <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="standings-season"
                  placeholder="YYYY"
                  value={standingsParams.season}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStandingsParams({ ...standingsParams, season: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="standings-team">Team ID</Label>
                <Input
                  id="standings-team"
                  placeholder="Team ID"
                  value={standingsParams.team}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStandingsParams({ ...standingsParams, team: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="standings-conference">Conference</Label>
                <Input
                  id="standings-conference"
                  placeholder="Conference"
                  value={standingsParams.conference}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStandingsParams({ ...standingsParams, conference: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="standings-division">Division</Label>
                <Input
                  id="standings-division"
                  placeholder="Division"
                  value={standingsParams.division}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStandingsParams({ ...standingsParams, division: e.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="mt-4">
              {loading ? 'Fetching...' : 'Fetch Standings'}
            </Button>
          </form>
        </div>
      )}

      <div className="rounded-md border p-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is an experimental admin page for testing and development purposes.
          </p>
          <div className="mb-4">
            <a
              href={NAV_ITEMS.find(i => i.key === selectedTab)?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              View API Docs for {NAV_ITEMS.find(i => i.key === selectedTab)?.label}
            </a>
          </div>
          <div className="text-left max-w-full overflow-x-auto bg-gray-100 dark:bg-gray-900 rounded p-4 mt-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <span className="ml-2">Loading data...</span>
              </div>
            )}
            {error && (
              <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
                <strong>Error:</strong> {error}
              </div>
            )}
            {!loading && !error && data && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  API Response
                </h3>
                <pre className="text-xs whitespace-pre-wrap break-all bg-white dark:bg-gray-800 p-4 rounded border overflow-auto max-h-96">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminExperimentalPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
          </div>
        </div>
      }
    >
      <AdminExperimentalContent />
    </Suspense>
  );
}
