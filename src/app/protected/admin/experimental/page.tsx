'use client';

import React, { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import {
  Button,
  GamesForm,
  GameStatsForm,
  TeamsForm,
  TeamStatsForm,
  PlayersForm,
  PlayerStatsForm,
  StandingsForm,
  DataDisplay,
} from '@/app/protected/admin/experimental/components';
import {
  useApiFetch,
  useFormState,
  useTabState,
  useSeasonsData,
  useTeamsData,
} from '@/app/protected/admin/experimental/hooks';
import { API_CONFIG } from '@/lib/config/app.config';
import type {
  NavigationTabsProps,
  SimpleEndpointsProps,
  GamesSectionProps,
  TabValue,
  TeamsSectionProps,
  PlayersSectionProps,
} from '@/lib/types';
import { TABS } from '@/lib/types/constant.types';

// Navigation Tabs Component
function NavigationTabs(props: NavigationTabsProps) {
  const { selectedTab, setSelectedTab } = props;
  const tabs: TabValue[] = [
    TABS.SEASONS as TabValue,
    TABS.LEAGUES as TabValue,
    TABS.GAMES as TabValue,
    TABS.TEAMS as TabValue,
    TABS.PLAYERS as TabValue,
    TABS.STANDINGS as TabValue,
    TABS.SEARCH as TabValue,
  ];
  return (
    <div className="flex flex-wrap gap-2 border-b mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            selectedTab === tab
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setSelectedTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}

// Simple Endpoints Component
function SimpleEndpoints(props: SimpleEndpointsProps) {
  const { selectedTab, loading, handleFetch } = props;
  if (!(selectedTab === TABS.SEASONS || selectedTab === TABS.LEAGUES)) return null;
  const handleClick = () => {
    const endpoint =
      selectedTab === TABS.SEASONS ? API_CONFIG.endpoints.SEASONS : API_CONFIG.endpoints.LEAGUES;
    void handleFetch(endpoint, {});
  };
  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Query
              </CardTitle>
              <CardDescription>Fetching all {selectedTab}...</CardDescription>
            </div>
            <Button
              onClick={handleClick}
              disabled={loading}
              className="bg-rose-100 text-rose-900 border border-rose-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800"
            >
              {loading
                ? 'Fetching...'
                : `Fetch ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`}
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

// Games Section Component
function GamesSection(props: GamesSectionProps) {
  const {
    gamesSubTab,
    setGamesSubTab,
    gameParams,
    setGameParams,
    gameStatsId,
    setGameStatsId,
    loading,
    handleFetchGames,
    handleFetchGameStats,
    handleFetch,
    seasons,
    teams,
  } = props;
  return (
    <div className="mb-6">
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            gamesSubTab === TABS.GAMES
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setGamesSubTab(TABS.GAMES)}
        >
          Games
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            gamesSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setGamesSubTab('stats')}
        >
          Game Stats
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            gamesSubTab === 'live'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setGamesSubTab('live')}
        >
          Live Games
        </button>
      </div>
      {gamesSubTab === TABS.GAMES && (
        <GamesForm
          gameParams={gameParams}
          setGameParams={setGameParams}
          loading={loading}
          onSubmit={handleFetchGames}
          seasons={seasons}
          teams={teams}
        />
      )}
      {gamesSubTab === 'stats' && (
        <GameStatsForm
          gameStatsId={gameStatsId}
          setGameStatsId={setGameStatsId}
          loading={loading}
          onSubmit={handleFetchGameStats}
        />
      )}
      {gamesSubTab === 'live' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Games</CardTitle>
                <CardDescription>Fetching all currently live games...</CardDescription>
              </div>
              <Button
                onClick={() => {
                  void handleFetch(API_CONFIG.endpoints.GAMES, { live: 'all' });
                }}
                disabled={loading}
                className="bg-rose-100 text-rose-900 border border-rose-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800"
              >
                {loading ? 'Fetching...' : 'Refetch Live Games'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

// Teams Section Component
function TeamsSection(props: TeamsSectionProps) {
  const {
    teamsSubTab,
    setTeamsSubTab,
    teamParams,
    setTeamParams,
    teamStatsParams,
    setTeamStatsParams,
    loading,
    handleFetchTeams,
    handleFetchTeamStats,
    seasons,
    teams,
  } = props;
  return (
    <div className="mb-6">
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            teamsSubTab === TABS.TEAMS
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setTeamsSubTab(TABS.TEAMS)}
        >
          Teams
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            teamsSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setTeamsSubTab('stats')}
        >
          Team Stats
        </button>
      </div>
      {teamsSubTab === TABS.TEAMS && (
        <TeamsForm
          teamParams={teamParams}
          setTeamParams={setTeamParams}
          loading={loading}
          onSubmit={handleFetchTeams}
          seasons={seasons}
          teams={teams}
        />
      )}
      {teamsSubTab === 'stats' && (
        <TeamStatsForm
          teamStatsParams={teamStatsParams}
          setTeamStatsParams={setTeamStatsParams}
          loading={loading}
          onSubmit={handleFetchTeamStats}
          seasons={seasons}
          teams={teams}
        />
      )}
    </div>
  );
}

// Players Section Component
function PlayersSection(props: PlayersSectionProps) {
  const {
    playersSubTab,
    setPlayersSubTab,
    playerParams,
    setPlayerParams,
    playerStatsParams,
    setPlayerStatsParams,
    loading,
    handleFetchPlayers,
    handleFetchPlayerStats,
    seasons,
    teams,
  } = props;
  return (
    <div className="mb-6">
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            playersSubTab === TABS.PLAYERS
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setPlayersSubTab(TABS.PLAYERS)}
        >
          Players
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            playersSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setPlayersSubTab('stats')}
        >
          Player Stats
        </button>
      </div>
      {playersSubTab === TABS.PLAYERS && (
        <PlayersForm
          playerParams={playerParams}
          setPlayerParams={setPlayerParams}
          loading={loading}
          onSubmit={handleFetchPlayers}
          seasons={seasons}
          teams={teams}
        />
      )}
      {playersSubTab === 'stats' && (
        <PlayerStatsForm
          playerStatsParams={playerStatsParams}
          setPlayerStatsParams={setPlayerStatsParams}
          loading={loading}
          onSubmit={handleFetchPlayerStats}
          seasons={seasons}
          teams={teams}
        />
      )}
    </div>
  );
}

// Search Section Component
function SearchSection({
  loading,
  handleFetch,
  data,
}: {
  loading: boolean;
  handleFetch: (endpoint: string, params: Record<string, string>) => Promise<void>;
  data: unknown;
}) {
  const [subTab, setSubTab] = useState<'teams' | 'players'>('teams');
  const [searchValue, setSearchValue] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

  // Clear search results when switching sub-tabs
  const handleSubTabChange = (newSubTab: 'teams' | 'players') => {
    setSubTab(newSubTab);
    setSearchClicked(false);
  };

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchClicked(true);
    if (subTab === 'teams') {
      void handleFetch(API_CONFIG.endpoints.TEAMS, { search: searchValue });
    } else {
      // For players, use just the search parameter like the working Insomnia example
      void handleFetch(API_CONFIG.endpoints.PLAYERS, { search: searchValue });
    }
  }

  return (
    <div className="mb-6">
      <div className="flex gap-2 border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${subTab === 'teams' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => handleSubTabChange('teams')}
        >
          Teams
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${subTab === 'players' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => handleSubTabChange('players')}
        >
          Players
        </button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search {subTab.charAt(0).toUpperCase() + subTab.slice(1)}</CardTitle>
              <CardDescription>Search for {subTab} by name or other criteria</CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
              <input
                type="text"
                className="border rounded px-3 py-2 w-64"
                placeholder={`Search ${subTab.charAt(0).toUpperCase() + subTab.slice(1)}`}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-100 text-rose-900 border border-rose-300 shadow rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800 disabled:opacity-50"
                disabled={loading || !searchValue.trim()}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </CardHeader>
        {searchClicked && (
          <CardContent>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Results</h3>
              <pre className="text-sm overflow-auto max-h-96 bg-white dark:bg-gray-800 p-4 rounded border">
                {data ? JSON.stringify(data, null, 2) : 'No results'}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Main Content Component
function AdminExperimentalContent() {
  const { data, loading, error, handleFetch, clearData } = useApiFetch();
  const { seasons } = useSeasonsData();
  const { teams } = useTeamsData();
  const {
    selectedTab,
    setSelectedTab,
    gamesSubTab,
    setGamesSubTab,
    teamsSubTab,
    setTeamsSubTab,
    playersSubTab,
    setPlayersSubTab,
  } = useTabState();
  const {
    gameParams,
    setGameParams,
    gameStatsId,
    setGameStatsId,
    teamParams,
    setTeamParams,
    teamStatsParams,
    setTeamStatsParams,
    playerParams,
    setPlayerParams,
    playerStatsParams,
    setPlayerStatsParams,
    standingsParams,
    setStandingsParams,
  } = useFormState(seasons);

  // Clear data when tab changes
  useEffect(() => {
    clearData();
  }, [selectedTab, clearData]);

  const handleFetchGames = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that h2h team is different from main team
    if (gameParams.team && gameParams.h2h && gameParams.team === gameParams.h2h) {
      alert(
        'Head-to-Head teams must be different. Please select a different team for the Head-to-Head field.'
      );
      return;
    }

    // Format parameters correctly for API
    const apiParams = { ...gameParams };

    // If both team and h2h are selected, combine them into h2h parameter and remove team
    if (apiParams.team && apiParams.h2h) {
      apiParams.h2h = `${apiParams.team}-${apiParams.h2h}`;
      delete apiParams.team;
    }

    void handleFetch(API_CONFIG.endpoints.GAMES, apiParams);
  };

  const handleFetchGameStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.GAME_STATISTICS, { id: gameStatsId }, ['id']);
  };

  const handleFetchTeams = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.TEAMS, teamParams);
  };

  const handleFetchTeamStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.TEAM_STATISTICS, teamStatsParams, ['id', 'season']);
  };

  const handleFetchPlayers = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.PLAYERS, playerParams);
  };

  const handleFetchPlayerStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.PLAYER_STATISTICS, playerStatsParams);
  };

  const handleStandingsFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch(API_CONFIG.endpoints.STANDINGS, standingsParams, ['league', 'season']);
  };

  // Clear data and auto-fetch data when tab changes
  useEffect(() => {
    clearData();
    const fetchInitialData = () => {
      // Fetch initial data based on selected tab
      switch (selectedTab) {
        case TABS.SEASONS:
          void handleFetch(API_CONFIG.endpoints.SEASONS, {});
          break;
        case TABS.LEAGUES:
          void handleFetch(API_CONFIG.endpoints.LEAGUES, {});
          break;
        case TABS.GAMES:
          // Don't auto-fetch games as they require parameters
          break;
        case TABS.TEAMS:
          // Don't auto-fetch teams as they require parameters
          break;
        case TABS.PLAYERS:
          // Don't auto-fetch players as they require parameters
          break;
        case TABS.STANDINGS:
          // Don't auto-fetch standings as they require parameters
          break;
        case TABS.SEARCH:
          // Don't auto-fetch search as it requires user input
          break;
        default:
          break;
      }
    };

    fetchInitialData();
  }, [selectedTab, handleFetch, clearData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Experimental Page</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This is an experimental admin page for testing and development purposes.
      </p>

      <NavigationTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {selectedTab === TABS.SEASONS && (
        <SimpleEndpoints selectedTab={selectedTab} loading={loading} handleFetch={handleFetch} />
      )}

      {selectedTab === TABS.LEAGUES && (
        <SimpleEndpoints selectedTab={selectedTab} loading={loading} handleFetch={handleFetch} />
      )}

      {selectedTab === TABS.GAMES && (
        <GamesSection
          gamesSubTab={gamesSubTab}
          setGamesSubTab={setGamesSubTab}
          gameParams={gameParams}
          setGameParams={setGameParams}
          gameStatsId={gameStatsId}
          setGameStatsId={setGameStatsId}
          loading={loading}
          handleFetchGames={handleFetchGames}
          handleFetchGameStats={handleFetchGameStats}
          handleFetch={handleFetch}
          seasons={seasons}
          teams={teams}
        />
      )}

      {selectedTab === TABS.TEAMS && (
        <TeamsSection
          teamsSubTab={teamsSubTab}
          setTeamsSubTab={setTeamsSubTab}
          teamParams={teamParams}
          setTeamParams={setTeamParams}
          teamStatsParams={teamStatsParams}
          setTeamStatsParams={setTeamStatsParams}
          loading={loading}
          handleFetchTeams={handleFetchTeams}
          handleFetchTeamStats={handleFetchTeamStats}
          seasons={seasons}
          teams={teams}
        />
      )}

      {selectedTab === TABS.PLAYERS && (
        <PlayersSection
          playersSubTab={playersSubTab}
          setPlayersSubTab={setPlayersSubTab}
          playerParams={playerParams}
          setPlayerParams={setPlayerParams}
          playerStatsParams={playerStatsParams}
          setPlayerStatsParams={setPlayerStatsParams}
          loading={loading}
          handleFetchPlayers={handleFetchPlayers}
          handleFetchPlayerStats={handleFetchPlayerStats}
          seasons={seasons}
          teams={teams}
        />
      )}

      {selectedTab === TABS.STANDINGS && (
        <StandingsForm
          standingsParams={standingsParams}
          setStandingsParams={setStandingsParams}
          loading={loading}
          onSubmit={handleStandingsFormSubmit}
          seasons={seasons}
        />
      )}

      {selectedTab === TABS.SEARCH && (
        <SearchSection loading={loading} handleFetch={handleFetch} data={data} />
      )}

      {selectedTab !== TABS.SEARCH && (
        <DataDisplay data={data} loading={loading} error={error} selectedTab={selectedTab} />
      )}
    </div>
  );
}

export default function AdminExperimentalPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminExperimentalContent />
    </div>
  );
}
