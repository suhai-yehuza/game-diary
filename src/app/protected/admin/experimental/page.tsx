'use client';

import React, { useEffect } from 'react';

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
} from './components';
import { useApiFetch, useFormState, useTabState } from './hooks';

function AdminExperimentalContent() {
  const { data, loading, error, handleFetch } = useApiFetch();
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
  } = useFormState();
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

  // Form handlers
  const handleFetchGames = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('games', gameParams);
  };

  const handleFetchGameStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('games/statistics', { id: gameStatsId }, ['id']);
  };

  const handleFetchTeams = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('teams', teamParams);
  };

  const handleFetchTeamStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('teams/statistics', teamStatsParams, ['id', 'season']);
  };

  const handleFetchPlayers = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('players', playerParams);
  };

  const handleFetchPlayerStats = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('players/statistics', playerStatsParams);
  };

  const handleFetchStandings = (e: React.FormEvent) => {
    e.preventDefault();
    void handleFetch('standings', standingsParams, ['league', 'season']);
  };

  // Auto-fetch seasons on mount
  useEffect(() => {
    const fetchData = async () => {
      await handleFetch('seasons', {});
    };
    void fetchData();
  }, [handleFetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Experimental Page</h1>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b mb-6">
        {['seasons', 'leagues', 'games', 'teams', 'players', 'standings'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium ${
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

      {/* Simple endpoints */}
      {['seasons', 'leagues'].includes(selectedTab) && (
        <div className="mb-6">
          <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold mb-4">
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Query
            </h3>
            <p className="text-sm text-gray-500 mb-4">Fetching all {selectedTab}...</p>
            <Button
              onClick={() => void handleFetch(selectedTab, {})}
              disabled={loading}
              className="mt-4"
            >
              {loading
                ? 'Fetching...'
                : `Fetch ${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`}
            </Button>
          </div>
        </div>
      )}

      {/* Games section */}
      {selectedTab === 'games' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                gamesSubTab === 'games'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setGamesSubTab('games')}
            >
              Games
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                gamesSubTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setGamesSubTab('stats')}
            >
              Game Stats
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                gamesSubTab === 'live'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setGamesSubTab('live')}
            >
              Live Games
            </button>
          </div>

          {gamesSubTab === 'games' && (
            <GamesForm
              gameParams={gameParams}
              setGameParams={setGameParams}
              loading={loading}
              onSubmit={handleFetchGames}
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
            <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold mb-1">Live Games</h3>
              <p className="text-sm text-gray-500 mb-4">Fetching all currently live games...</p>
            </div>
          )}
        </div>
      )}

      {/* Teams section */}
      {selectedTab === 'teams' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                teamsSubTab === 'teams'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setTeamsSubTab('teams')}
            >
              Teams
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                teamsSubTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setTeamsSubTab('stats')}
            >
              Team Stats
            </button>
          </div>

          {teamsSubTab === 'teams' && (
            <TeamsForm
              teamParams={teamParams}
              setTeamParams={setTeamParams}
              loading={loading}
              onSubmit={handleFetchTeams}
            />
          )}

          {teamsSubTab === 'stats' && (
            <TeamStatsForm
              teamStatsParams={teamStatsParams}
              setTeamStatsParams={setTeamStatsParams}
              loading={loading}
              onSubmit={handleFetchTeamStats}
            />
          )}
        </div>
      )}

      {/* Players section */}
      {selectedTab === 'players' && (
        <div className="mb-6">
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                playersSubTab === 'players'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setPlayersSubTab('players')}
            >
              Players
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                playersSubTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setPlayersSubTab('stats')}
            >
              Player Stats
            </button>
          </div>

          {playersSubTab === 'players' && (
            <PlayersForm
              playerParams={playerParams}
              setPlayerParams={setPlayerParams}
              loading={loading}
              onSubmit={handleFetchPlayers}
            />
          )}

          {playersSubTab === 'stats' && (
            <PlayerStatsForm
              playerStatsParams={playerStatsParams}
              setPlayerStatsParams={setPlayerStatsParams}
              loading={loading}
              onSubmit={handleFetchPlayerStats}
            />
          )}
        </div>
      )}

      {/* Standings section */}
      {selectedTab === 'standings' && (
        <div className="mb-6">
          <StandingsForm
            standingsParams={standingsParams}
            setStandingsParams={setStandingsParams}
            loading={loading}
            onSubmit={handleFetchStandings}
          />
        </div>
      )}

      {/* Data Display */}
      <DataDisplay data={data} loading={loading} error={error} selectedTab={selectedTab} />
    </div>
  );
}

export function AdminExperimentalPage() {
  return <AdminExperimentalContent />;
}
