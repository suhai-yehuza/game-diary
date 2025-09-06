'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Cache components removed
import { DbRefreshButtonSimple } from '@/app/components/admin/DbRefreshButtonSimple';
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
import { ErrorHandler } from '@/lib/utils/error-handler';
import type {
  SimpleEndpointsProps,
  AdminGamesSectionProps,
  AdminTabValue,
  AdminTeamsSectionProps,
  AdminPlayersSectionProps,
  IDbRefreshProgress,
} from '@/types';
import { ADMIN_TABS as TABS } from '@/types';

// Navigation Tabs Component
function NavigationTabs({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: AdminTabValue;
  setSelectedTab: (tab: AdminTabValue) => void;
}) {
  // const { selectedTab, setSelectedTab } = props;
  const tabs: AdminTabValue[] = [
    TABS.SEASONS,
    TABS.LEAGUES,
    TABS.GAMES,
    TABS.TEAMS,
    TABS.PLAYERS,
    TABS.STANDINGS,
    TABS.SEARCH,
    TABS.DATABASE,
    TABS.CACHE,
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
    handleFetch?.(endpoint, {}).catch(console.error);
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
              <CardDescription>
                {loading ? `Fetching all ${selectedTab}...` : `Ready to fetch ${selectedTab}`}
              </CardDescription>
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
function GamesSection(props: AdminGamesSectionProps) {
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
          onClick={() => setGamesSubTab?.(TABS.GAMES)}
        >
          Games
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            gamesSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setGamesSubTab?.('stats')}
        >
          Game Stats
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            gamesSubTab === 'live'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setGamesSubTab?.('live')}
        >
          Live Games
        </button>
      </div>
      {gamesSubTab === TABS.GAMES && (
        <GamesForm
          gameParams={gameParams || {}}
          setGameParams={
            setGameParams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchGames ||
            (() => {
              // Fallback function - should not be called
            })
          }
          seasons={seasons || []}
          teams={teams || []}
        />
      )}
      {gamesSubTab === 'stats' && (
        <GameStatsForm
          gameStatsId={gameStatsId || ''}
          setGameStatsId={
            setGameStatsId ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchGameStats ||
            (() => {
              // Fallback function - should not be called
            })
          }
        />
      )}
      {gamesSubTab === 'live' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Games</CardTitle>
                <CardDescription>
                  {loading ? 'Fetching all currently live games...' : 'Ready to fetch live games'}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  void handleFetch?.(API_CONFIG.endpoints.GAMES, { live: 'all' });
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
function TeamsSection(props: AdminTeamsSectionProps) {
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
          onClick={() => setTeamsSubTab?.(TABS.TEAMS)}
        >
          Teams
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            teamsSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setTeamsSubTab?.('stats')}
        >
          Team Stats
        </button>
      </div>
      {teamsSubTab === TABS.TEAMS && (
        <TeamsForm
          teamParams={teamParams || {}}
          setTeamParams={
            setTeamParams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchTeams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          seasons={seasons || []}
          teams={teams || []}
        />
      )}
      {teamsSubTab === 'stats' && (
        <TeamStatsForm
          teamStatsParams={teamStatsParams || {}}
          setTeamStatsParams={
            setTeamStatsParams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchTeamStats ||
            (() => {
              // Fallback function - should not be called
            })
          }
          seasons={seasons || []}
          teams={teams || []}
        />
      )}
    </div>
  );
}

// Players Section Component
function PlayersSection(props: AdminPlayersSectionProps) {
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
          onClick={() => setPlayersSubTab?.(TABS.PLAYERS)}
        >
          Players
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium cursor-pointer ${
            playersSubTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-blue-600'
          }`}
          onClick={() => setPlayersSubTab?.('stats')}
        >
          Player Stats
        </button>
      </div>
      {playersSubTab === TABS.PLAYERS && (
        <PlayersForm
          playerParams={playerParams || {}}
          setPlayerParams={
            setPlayerParams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchPlayers ||
            (() => {
              // Fallback function - should not be called
            })
          }
          seasons={seasons || []}
          teams={teams || []}
        />
      )}
      {playersSubTab === 'stats' && (
        <PlayerStatsForm
          playerStatsParams={playerStatsParams || {}}
          setPlayerStatsParams={
            setPlayerStatsParams ||
            (() => {
              // Fallback function - should not be called
            })
          }
          loading={loading || false}
          onSubmit={
            handleFetchPlayerStats ||
            (() => {
              // Fallback function - should not be called
            })
          }
          seasons={seasons || []}
          teams={teams || []}
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
      void handleFetch?.(API_CONFIG.endpoints.TEAMS, { search: searchValue });
    } else {
      // For players, use just the search parameter like the working Insomnia example
      void handleFetch?.(API_CONFIG.endpoints.PLAYERS, { search: searchValue });
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

  // Database progress state for conditional rendering
  const [databaseProgress, setDatabaseProgress] = useState<{
    isRefreshing: boolean;
    progress: IDbRefreshProgress;
    status: 'idle' | 'success' | 'error';
    message: string;
    onTerminate: () => void;
  } | null>(null);

  // Real-time elapsed time state
  const [elapsedTime, setElapsedTime] = useState(0);

  // Cache management state
  const [cacheKeys, setCacheKeys] = useState<
    Array<{
      key: string;
      type: string;
      ttl: string;
      value: unknown;
    }>
  >([]);
  const [cacheKeysLoading, setCacheKeysLoading] = useState(false);
  const [selectedCacheKey, setSelectedCacheKey] = useState<string | null>(null);
  const [showNuclearConfirm, setShowNuclearConfirm] = useState(false);
  const [showSelectiveConfirm, setShowSelectiveConfirm] = useState<{
    show: boolean;
    type: string;
    title: string;
    description: string;
  }>({ show: false, type: '', title: '', description: '' });
  const [collapsedSections, setCollapsedSections] = useState({
    cacheKeyViewer: true,
    selectiveDeletion: true,
    nuclearOption: true,
    manualWarming: true,
  });

  // Cache progress state removed

  // Memoized callback for database progress updates to prevent infinite re-renders
  const handleDatabaseProgressChange = useCallback((progress: IDbRefreshProgress) => {
    setDatabaseProgress({
      isRefreshing: false,
      progress,
      status: 'idle',
      message: 'Database refresh in progress',
      onTerminate: () => {
        // Termination logic not implemented yet
      },
    });
  }, []);

  // Real-time elapsed time timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (databaseProgress?.isRefreshing && databaseProgress.progress.startTime) {
      // Update elapsed time every second
      interval = setInterval(() => {
        const startTime = new Date(databaseProgress.progress.startTime || new Date()).getTime();
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      // Reset elapsed time when not refreshing
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [databaseProgress?.isRefreshing, databaseProgress?.progress.startTime]);

  // Cache progress change handler removed

  // Clear data and auto-fetch data when tab changes
  useEffect(() => {
    clearData();
    const fetchInitialData = () => {
      // Fetch initial data based on selected tab
      switch (selectedTab) {
        case TABS.SEASONS:
          void handleFetch?.(API_CONFIG.endpoints.SEASONS, {});
          break;
        case TABS.LEAGUES:
          void handleFetch?.(API_CONFIG.endpoints.LEAGUES, {});
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

  // Handle cache key refresh
  const handleRefreshCacheKeys = useCallback(async () => {
    setCacheKeysLoading(true);

    await ErrorHandler.getInstance().handleAsync(
      async () => {
        const response = await fetch('/api/cache?action=list');
        if (response.ok) {
          const data = await response.json();
          setCacheKeys(data.keys || []);
        }
      },
      {
        component: 'AdminExperimentalPage',
        action: 'handleRefreshCacheKeys',
      }
    );

    setCacheKeysLoading(false);
  }, []);

  // Load cache keys when the cache tab is selected
  useEffect(() => {
    if (selectedTab === TABS.CACHE) {
      void handleRefreshCacheKeys();
    }
  }, [selectedTab, handleRefreshCacheKeys]);

  // Handle cache key deletion
  const handleDeleteCacheKey = useCallback(
    async (key: string) => {
      await ErrorHandler.getInstance().handleAsync(
        async () => {
          console.log(`🗑️ Deleting cache key: ${key}...`);
          const response = await fetch(`/api/cache?action=delete&key=${encodeURIComponent(key)}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            void handleRefreshCacheKeys();
            console.log(`✅ Cache key deleted successfully: ${key}`);
          } else {
            console.error(`❌ Failed to delete cache key: ${key}`);
          }
        },
        {
          component: 'AdminExperimentalPage',
          action: 'handleDeleteCacheKey',
        }
      );
    },
    [handleRefreshCacheKeys]
  );

  // Handle selective cache deletion by tag
  const handleDeleteCacheByTag = useCallback(
    async (tag: string) => {
      await ErrorHandler.getInstance().handleAsync(
        async () => {
          console.log(`🗑️ Clearing cache for tag: ${tag}...`);
          const response = await fetch(`/api/cache?action=invalidate&tag=${tag}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            void handleRefreshCacheKeys();
            console.log(`✅ Cache cleared successfully for tag: ${tag}`);
          } else {
            console.error(`❌ Failed to clear cache for tag: ${tag}`);
          }
        },
        {
          component: 'AdminExperimentalPage',
          action: 'handleDeleteCacheByTag',
        }
      );
    },
    [handleRefreshCacheKeys]
  );

  // Handle nuclear option (clear all cache)
  const handleDeleteAllCache = useCallback(async () => {
    await ErrorHandler.getInstance().handleAsync(
      async () => {
        console.log('🚨 Clearing all caches (both in-memory and Redis)...');
        const response = await fetch('/api/cache?action=invalidate', {
          method: 'DELETE',
        });
        if (response.ok) {
          void handleRefreshCacheKeys();
          console.log('✅ All caches cleared successfully (in-memory + Redis)');
        } else {
          console.error('❌ Failed to clear caches:', response.statusText);
        }
      },
      {
        component: 'AdminExperimentalPage',
        action: 'handleDeleteAllCache',
      }
    );
  }, [handleRefreshCacheKeys]);

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

    void handleFetch?.(API_CONFIG.endpoints.GAMES, apiParams);
  };

  const handleFetchGameStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.GAME_STATISTICS, { id: gameStatsId }, ['id']);
  };

  const handleFetchTeams = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.TEAMS, teamParams);
  };

  const handleFetchTeamStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.TEAM_STATISTICS, teamStatsParams, ['id', 'season']);
  };

  const handleFetchPlayers = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.PLAYERS, playerParams);
  };

  const handleFetchPlayerStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.PLAYER_STATISTICS, playerStatsParams);
  };

  const handleStandingsFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch?.(API_CONFIG.endpoints.STANDINGS, standingsParams, ['league', 'season']);
  };

  // Clear data and auto-fetch data when tab changes
  useEffect(() => {
    clearData();
    const fetchInitialData = () => {
      // Fetch initial data based on selected tab
      switch (selectedTab) {
        case TABS.SEASONS:
          void handleFetch?.(API_CONFIG.endpoints.SEASONS, {});
          break;
        case TABS.LEAGUES:
          void handleFetch?.(API_CONFIG.endpoints.LEAGUES, {});
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

  // Cache warming function to preload all caches
  const warmAllCaches = useCallback(async () => {
    console.log('🔥 Warming all caches for optimal performance...');

    await ErrorHandler.getInstance().handleAsync(
      async () => {
        // Warm games cache for all seasons
        const currentYear = new Date().getFullYear();
        const seasons = Array.from({ length: 10 }, (_, i) => currentYear - i);

        for (const season of seasons) {
          await ErrorHandler.getInstance().handleAsync(
            () => fetch(`/api/games?season=${season}&limit=2000`),
            {
              component: 'AdminExperimentalPage',
              action: 'warmGamesCache',
            }
          );
          console.log(`✅ Games cache warmed for season ${season}`);
        }

        // Warm merged games cache for "All Seasons" view
        await ErrorHandler.getInstance().handleAsync(
          () => fetch('/api/games?season=all&limit=20000'),
          {
            component: 'AdminExperimentalPage',
            action: 'warmMergedGamesCache',
          }
        );
        console.log('✅ Merged games cache warmed for All Seasons view');

        // Warm players cache
        await ErrorHandler.getInstance().handleAsync(() => fetch('/api/players?limit=5000'), {
          component: 'AdminExperimentalPage',
          action: 'warmPlayersCache',
        });
        console.log('✅ Players cache warmed');

        // Warm teams cache
        await ErrorHandler.getInstance().handleAsync(() => fetch('/api/teams'), {
          component: 'AdminExperimentalPage',
          action: 'warmTeamsCache',
        });
        console.log('✅ Teams cache warmed');

        // Warm landing page cache
        await ErrorHandler.getInstance().handleAsync(() => fetch('/api/landing-page/data'), {
          component: 'AdminExperimentalPage',
          action: 'warmLandingPageCache',
        });
        console.log('✅ Landing page cache warmed');

        // Warm NBA Hub cache
        await ErrorHandler.getInstance().handleAsync(() => fetch('/api/nba-hub/counts'), {
          component: 'AdminExperimentalPage',
          action: 'warmNBAHubCache',
        });
        console.log('✅ NBA Hub cache warmed');

        // Warm game logs cache
        await ErrorHandler.getInstance().handleAsync(() => fetch('/api/game-logs?limit=2000'), {
          component: 'AdminExperimentalPage',
          action: 'warmGameLogsCache',
        });
        console.log('✅ Game logs cache warmed');

        console.log('🎉 All caches warmed successfully!');

        // Update last warming time
        const now = new Date();
        sessionStorage.setItem('lastCacheWarming', now.toISOString());
        sessionStorage.setItem('cacheWarmingStatus', 'success');
      },
      {
        component: 'AdminExperimentalPage',
        action: 'warmAllCaches',
      }
    );

    sessionStorage.setItem('cacheWarmingStatus', 'error');
  }, []);

  // Recurring cache warming with TTL-based scheduling
  useEffect(() => {
    const CACHE_WARMING_INTERVAL = 25 * 60 * 1000; // 25 minutes (ahead of 30-min TTL)

    // Function to check if warming is needed
    const shouldWarmCaches = () => {
      const lastWarming = sessionStorage.getItem('lastCacheWarming');
      if (!lastWarming) return true;

      const lastWarmingTime = new Date(lastWarming);
      const now = new Date();
      const timeSinceLastWarming = now.getTime() - lastWarmingTime.getTime();

      return timeSinceLastWarming >= CACHE_WARMING_INTERVAL;
    };

    // Initial warming check
    if (shouldWarmCaches()) {
      console.log('🚀 Initial cache warming triggered');
      void warmAllCaches();
    }

    // Set up recurring warming
    const warmingInterval = setInterval(() => {
      if (shouldWarmCaches()) {
        console.log('🔄 Recurring cache warming triggered');
        void warmAllCaches();
      } else {
        const lastWarming = sessionStorage.getItem('lastCacheWarming');
        if (lastWarming) {
          const lastWarmingTime = new Date(lastWarming);
          const now = new Date();
          const timeSinceLastWarming = now.getTime() - lastWarmingTime.getTime();
          const minutesUntilNextWarming = Math.ceil(
            (CACHE_WARMING_INTERVAL - timeSinceLastWarming) / (60 * 1000)
          );
          console.log(`⏰ Next cache warming in ~${minutesUntilNextWarming} minutes`);
        }
      }
    }, CACHE_WARMING_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(warmingInterval);
  }, [warmAllCaches]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Experimental Page</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This is an experimental admin page for testing and development purposes.
      </p>

      <NavigationTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {selectedTab === TABS.SEASONS && (
        <SimpleEndpoints
          selectedTab={selectedTab}
          loading={loading}
          handleFetch={handleFetch}
          endpoints={[{ name: 'Seasons', url: '/api/seasons', method: 'GET' }]}
        />
      )}

      {selectedTab === TABS.LEAGUES && (
        <SimpleEndpoints
          selectedTab={selectedTab}
          loading={loading}
          handleFetch={handleFetch}
          endpoints={[{ name: 'Leagues', url: '/api/leagues', method: 'GET' }]}
        />
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
          handleFetchGames={() => Promise.resolve(handleFetchGames?.({} as React.FormEvent))}
          handleFetchGameStats={() =>
            Promise.resolve(handleFetchGameStats?.({} as React.FormEvent))
          }
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
          handleFetchTeams={() => Promise.resolve(handleFetchTeams?.({} as React.FormEvent))}
          handleFetchTeamStats={() =>
            Promise.resolve(handleFetchTeamStats?.({} as React.FormEvent))
          }
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
          handleFetchPlayers={() => Promise.resolve(handleFetchPlayers?.({} as React.FormEvent))}
          handleFetchPlayerStats={() =>
            Promise.resolve(handleFetchPlayerStats?.({} as React.FormEvent))
          }
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

      {selectedTab === TABS.DATABASE && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Refresh the database with the latest data from external APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DbRefreshButtonSimple
                onRefresh={() => {
                  // Refresh functionality not implemented yet
                }}
                onProgressChange={handleDatabaseProgressChange}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === TABS.CACHE && (
        <div className="mb-6 space-y-6">
          {/* Cache Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
              <CardDescription>Overview of current cached data volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">14.5K</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Games</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.6K</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Total Players</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">66</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Total Teams</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Key Viewer */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setCollapsedSections(prev => ({ ...prev, cacheKeyViewer: !prev.cacheKeyViewer }))
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cache Key Viewer</CardTitle>
                  <CardDescription>View all currently cached keys and their values</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-2 border-gray-500 dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md flex items-center justify-center text-lg font-bold"
                  onClick={() => {
                    setCollapsedSections(prev => ({
                      ...prev,
                      cacheKeyViewer: !prev.cacheKeyViewer,
                    }));
                  }}
                >
                  {collapsedSections.cacheKeyViewer ? '▼' : '▲'}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.cacheKeyViewer && (
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => void handleRefreshCacheKeys()}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Keys
                    </Button>
                    <div className="text-sm text-gray-500">
                      {cacheKeys.length} key{cacheKeys.length > 1 ? 's' : ''} found
                    </div>
                  </div>

                  {cacheKeysLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-500" />
                      <p className="mt-2 text-gray-500">Loading cache keys...</p>
                    </div>
                  ) : cacheKeys.length > 0 ? (
                    <div className="space-y-3">
                      {cacheKeys.map(keyInfo => (
                        <div
                          key={keyInfo.key}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                                {keyInfo.key}
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                                {keyInfo.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">TTL: {keyInfo.ttl}</span>
                              <Button
                                onClick={() => void handleDeleteCacheKey(keyInfo.key)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {selectedCacheKey === keyInfo.key ? (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Cache Value:
                                </span>
                                <Button
                                  onClick={() => setSelectedCacheKey(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Hide
                                </Button>
                              </div>
                              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                                <pre>{JSON.stringify(keyInfo.value, null, 2)}</pre>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setSelectedCacheKey(keyInfo.key)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                            >
                              View Value
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No cache keys found</div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
          {/* Manual Cache Warming */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setCollapsedSections(prev => ({ ...prev, manualWarming: !prev.manualWarming }))
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manual Cache Warming</CardTitle>
                  <CardDescription>Warm specific caches manually to preload data</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-2 border-gray-500 dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md flex items-center justify-center text-lg font-bold"
                  onClick={() => {
                    setCollapsedSections(prev => ({
                      ...prev,
                      manualWarming: !prev.manualWarming,
                    }));
                  }}
                >
                  {collapsedSections.manualWarming ? '▼' : '▲'}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.manualWarming && (
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                          Force Immediate Cache Warming
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          Manually trigger cache warming now, bypassing the automatic schedule
                        </div>
                      </div>
                      <Button
                        onClick={() => void warmAllCaches()}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        🔥 Force Warm Now
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      onClick={() => void warmAllCaches()}
                      className="bg-green-100 text-green-900 border border-green-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-green-200 active:shadow focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 dark:bg-green-900 dark:text-green-100 dark:border-green-700 dark:hover:bg-green-800"
                    >
                      Warm All Caches
                    </Button>
                    <Button
                      onClick={() => {
                        const currentYear = new Date().getFullYear();
                        const seasons = Array.from({ length: 10 }, (_, i) => currentYear - i);
                        for (const season of seasons) {
                          void fetch(`/api/games?season=${season}&limit=2000`);
                        }
                        console.log('✅ Games cache warmed for last 10 seasons');
                      }}
                      className="bg-blue-100 text-blue-900 border border-blue-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-blue-200 active:shadow focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 dark:hover:bg-blue-800"
                    >
                      Warm Last 10 Seasons Games
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/games?season=all&limit=20000');
                        console.log('✅ Merged games cache warmed for All Seasons view');
                      }}
                      className="bg-purple-100 text-purple-900 border border-purple-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-purple-200 active:shadow focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 dark:bg-purple-900 dark:text-purple-100 dark:border-purple-700 dark:hover:bg-purple-800"
                    >
                      Warm All Seasons Merged Games
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/players?limit=5000');
                        console.log('✅ Players cache warmed');
                      }}
                      className="bg-yellow-100 text-yellow-900 border border-yellow-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-yellow-200 active:shadow focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-800"
                    >
                      Warm Players Cache
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/teams');
                        console.log('✅ Teams cache warmed');
                      }}
                      className="bg-indigo-100 text-indigo-900 border border-indigo-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-indigo-200 active:shadow focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 dark:bg-indigo-900 dark:text-indigo-100 dark:border-indigo-700 dark:hover:bg-indigo-800"
                    >
                      Warm Teams Cache
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/landing-page/data');
                        console.log('✅ Landing page cache warmed');
                      }}
                      className="bg-teal-100 text-teal-900 border border-teal-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-teal-200 active:shadow focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 dark:bg-teal-900 dark:text-teal-100 dark:border-teal-700 dark:hover:bg-teal-800"
                    >
                      Warm Landing Page Cache
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/nba-hub/counts');
                        console.log('✅ NBA Hub cache warmed');
                      }}
                      className="bg-orange-100 text-orange-900 border border-orange-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-orange-200 active:shadow focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700 dark:hover:bg-orange-800"
                    >
                      Warm NBA Hub Cache
                    </Button>
                    <Button
                      onClick={() => {
                        void fetch('/api/game-logs?limit=2000');
                        console.log('✅ Game logs cache warmed');
                      }}
                      className="bg-pink-100 text-pink-900 border border-pink-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-pink-200 active:shadow focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 dark:bg-pink-900 dark:text-pink-100 dark:border-pink-700 dark:hover:bg-pink-800"
                    >
                      Warm Game Logs Cache
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Selective Cache Deletion */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() =>
                setCollapsedSections(prev => ({
                  ...prev,
                  selectiveDeletion: !prev.selectiveDeletion,
                }))
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Selective Cache Deletion</CardTitle>
                  <CardDescription>Clear specific types of cached data</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-2 border-gray-500 dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md flex items-center justify-center text-lg font-bold"
                  onClick={() => {
                    setCollapsedSections(prev => ({
                      ...prev,
                      selectiveDeletion: !prev.selectiveDeletion,
                    }));
                  }}
                >
                  {collapsedSections.selectiveDeletion ? '▼' : '▲'}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.selectiveDeletion && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'games',
                        title: 'Clear Games Cache',
                        description:
                          'This will delete all cached game data including season data, game results, and statistics. Games will need to be re-fetched from the database.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear Games Cache
                  </Button>
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'players',
                        title: 'Clear Players Cache',
                        description:
                          'This will delete all cached player data including profiles, statistics, and team affiliations. Player data will need to be re-fetched from the database.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear Players Cache
                  </Button>
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'teams',
                        title: 'Clear Teams Cache',
                        description:
                          'This will delete all cached team data including rosters, logos, and team information. Team data will need to be re-fetched from the database.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear Teams Cache
                  </Button>
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'landingPage',
                        title: 'Clear Landing Page Cache',
                        description:
                          'This will delete all cached landing page data including featured games, popular content, and performance metrics. The landing page will need to rebuild its cache.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear Landing Page Cache
                  </Button>
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'nbaHub',
                        title: 'Clear NBA Hub Cache',
                        description:
                          'This will delete all cached NBA Hub data including counts, statistics, and aggregated information. The NBA Hub will need to rebuild its cache.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear NBA Hub Cache
                  </Button>
                  <Button
                    onClick={() =>
                      setShowSelectiveConfirm({
                        show: true,
                        type: 'gameLogs',
                        title: 'Clear Game Logs Cache',
                        description:
                          'This will delete all cached game log data including detailed game statistics and performance metrics. Game logs will need to be re-fetched from the database.',
                      })
                    }
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear Game Logs Cache
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Nuclear Option */}
          <Card>
            <CardHeader className="cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nuclear Option</CardTitle>
                  <CardDescription>
                    Clear all cached data across the entire application
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 border-2 border-gray-500 dark:border-gray-400 hover:border-gray-600 dark:hover:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md flex items-center justify-center text-lg font-bold"
                  onClick={() => {
                    setCollapsedSections(prev => ({
                      ...prev,
                      nuclearOption: !prev.nuclearOption,
                    }));
                  }}
                >
                  {collapsedSections.nuclearOption ? '▼' : '▲'}
                </Button>
              </div>
            </CardHeader>
            {!collapsedSections.nuclearOption && (
              <CardContent>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-200">
                      Clear All Cache
                    </span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    This will delete ALL cached data across the entire application, including both
                    in-memory cache and Redis cache. Use with extreme caution.
                  </p>
                  <Button
                    onClick={() => setShowNuclearConfirm(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    🚨 Nuke All Cache
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Custom Nuclear Confirmation Modal */}
      {showNuclearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Nuclear Option Confirmation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You are about to delete <strong>ALL cached data</strong> across the entire
                application. This includes:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                <li>• All game data cache (in-memory + Redis)</li>
                <li>• All player data cache (in-memory + Redis)</li>
                <li>• All team data cache (in-memory + Redis)</li>
                <li>• Landing page cache (in-memory + Redis)</li>
                <li>• NBA Hub cache (in-memory + Redis)</li>
                <li>• Game logs cache (in-memory + Redis)</li>
              </ul>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                This will significantly impact application performance until caches are rebuilt.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowNuclearConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowNuclearConfirm(false);
                  void handleDeleteAllCache();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                🚨 Yes, Nuke All Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Selective Cache Deletion Confirmation Modal */}
      {showSelectiveConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {showSelectiveConfirm.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {showSelectiveConfirm.description}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Are you absolutely sure you want to clear{' '}
                <strong>{showSelectiveConfirm.title}?</strong>
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowSelectiveConfirm({ ...showSelectiveConfirm, show: false })}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSelectiveConfirm({ ...showSelectiveConfirm, show: false });
                  if (showSelectiveConfirm.type === 'games') {
                    void handleDeleteCacheByTag('games');
                  } else if (showSelectiveConfirm.type === 'players') {
                    void handleDeleteCacheByTag('players');
                  } else if (showSelectiveConfirm.type === 'teams') {
                    void handleDeleteCacheByTag('teams');
                  } else if (showSelectiveConfirm.type === 'landingPage') {
                    void handleDeleteCacheByTag('landingPage');
                  } else if (showSelectiveConfirm.type === 'nbaHub') {
                    void handleDeleteCacheByTag('nbaHub');
                  } else if (showSelectiveConfirm.type === 'gameLogs') {
                    void handleDeleteCacheByTag('gameLogs');
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                🚨 Yes, Clear Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      {selectedTab !== TABS.SEARCH && (
        <>
          {/* Show database progress when available */}
          {selectedTab === TABS.DATABASE && databaseProgress?.isRefreshing && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Database Refresh Progress</CardTitle>
                      <CardDescription>
                        Current status of database refresh operation
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Step {databaseProgress.progress.stepNumber} of{' '}
                        {databaseProgress.progress.totalSteps || 5}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(databaseProgress.progress.progress || 0)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${databaseProgress.progress.progress || 0}%` }}
                      />
                    </div>

                    {/* Current Operation Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {databaseProgress.progress.currentStep}
                        </div>
                        <button
                          onClick={() => {
                            if (databaseProgress?.onTerminate) {
                              databaseProgress.onTerminate();
                            }
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                          title="Terminate the running database refresh job"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Terminate Job
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {databaseProgress.progress.message}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {databaseProgress.progress.details}
                      </div>
                    </div>

                    {/* Steps Checklist */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Steps</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['Leagues', 'Seasons', 'Teams', 'Games', 'Players'].map((step, index) => {
                          const stepNumber = index + 1;
                          const isCompleted =
                            stepNumber < (databaseProgress.progress.stepNumber || 0);
                          const isCurrent =
                            stepNumber === (databaseProgress.progress.stepNumber || 0);
                          const _isPending =
                            stepNumber > (databaseProgress.progress.stepNumber || 0);

                          return (
                            <div key={step} className="flex items-center gap-3">
                              {isCompleted ? (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✔</span>
                                </div>
                              ) : isCurrent ? (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <RefreshCw className="w-3 h-3 text-white animate-spin" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                              )}
                              <span
                                className={`text-sm ${
                                  isCompleted
                                    ? 'text-green-600 dark:text-green-400'
                                    : isCurrent
                                      ? 'text-blue-600 dark:text-blue-400'
                                      : 'text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timing Information */}
                    {databaseProgress.progress.startTime && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Elapsed: {elapsedTime}s
                      </div>
                    )}

                    {/* Status Message */}
                    {databaseProgress.message && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-200">
                        {databaseProgress.message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cache progress display removed */}

          {/* Default data display for other tabs - hide when database refresh is active or when on cache tab */}
          {!(selectedTab === TABS.DATABASE && databaseProgress?.isRefreshing) &&
            selectedTab !== TABS.CACHE && (
              <DataDisplay data={data} loading={loading} error={error} selectedTab={selectedTab} />
            )}
        </>
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
