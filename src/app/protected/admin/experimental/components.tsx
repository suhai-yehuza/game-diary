// This file will be populated with components as needed

import React from 'react';

import type {
  ButtonProps,
  InputProps,
  LabelProps,
  GamesFormProps,
  GameStatsFormProps,
  TeamsFormProps,
  TeamStatsFormProps,
  PlayersFormProps,
  PlayerStatsFormProps,
  StandingsFormProps,
  DataDisplayProps,
} from '@/lib/types/admin-experimental.types';

export const Button = (props: Readonly<ButtonProps>) => {
  const {
    children,
    variant = 'default',
    size = 'default',
    className = '',
    disabled = false,
    type = 'button',
    ...rest
  } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        variant === 'outline'
          ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      } ${size === 'sm' ? 'h-9 px-3' : 'h-10 px-4 py-2'} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Input = (props: Readonly<InputProps>) => {
  const {
    className = '',
    type = 'text',
    placeholder = '',
    value = '',
    onChange,
    id,
    required = false,
    ...rest
  } = props;

  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
};

export const Label = (props: Readonly<LabelProps>) => {
  const { children, htmlFor, className = '' } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
};

export const GamesForm = (props: Readonly<GamesFormProps>) => {
  const { gameParams, setGameParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
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
            onChange={e => setGameParams({ ...gameParams, id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="game-date">Date</Label>
          <Input
            id="game-date"
            type="date"
            value={gameParams.date}
            onChange={e => setGameParams({ ...gameParams, date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="game-season">Season</Label>
          <Input
            id="game-season"
            type="number"
            placeholder="YYYY"
            value={gameParams.season}
            onChange={e => setGameParams({ ...gameParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="game-league">League</Label>
          <Input
            id="game-league"
            placeholder="e.g. standard"
            value={gameParams.league}
            onChange={e => setGameParams({ ...gameParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="game-team">Team ID</Label>
          <Input
            id="game-team"
            type="number"
            placeholder="e.g. 1"
            value={gameParams.team}
            onChange={e => setGameParams({ ...gameParams, team: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="game-h2h">Head-to-Head (h2h)</Label>
          <Input
            id="game-h2h"
            placeholder="e.g. 1-4"
            value={gameParams.h2h}
            onChange={e => setGameParams({ ...gameParams, h2h: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Games'}
      </Button>
    </form>
  );
};

export const GameStatsForm = (props: Readonly<GameStatsFormProps>) => {
  const { gameStatsId, setGameStatsId, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-4">Game Statistics Query</h3>
      <div>
        <Label htmlFor="game-stats-id">Game ID</Label>
        <Input
          id="game-stats-id"
          type="number"
          placeholder="e.g. 12345"
          value={gameStatsId}
          onChange={e => setGameStatsId(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Game Statistics'}
      </Button>
    </form>
  );
};

export const TeamsForm = (props: Readonly<TeamsFormProps>) => {
  const { teamParams, setTeamParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Teams Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="team-id">Team ID</Label>
          <Input
            id="team-id"
            type="number"
            placeholder="e.g. 1"
            value={teamParams.id}
            onChange={e => setTeamParams({ ...teamParams, id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-season">Season</Label>
          <Input
            id="team-season"
            type="number"
            placeholder="YYYY"
            value={teamParams.season}
            onChange={e => setTeamParams({ ...teamParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-league">League</Label>
          <Input
            id="team-league"
            placeholder="e.g. standard"
            value={teamParams.league}
            onChange={e => setTeamParams({ ...teamParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-conference">Conference</Label>
          <Input
            id="team-conference"
            placeholder="e.g. East"
            value={teamParams.conference}
            onChange={e => setTeamParams({ ...teamParams, conference: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-division">Division</Label>
          <Input
            id="team-division"
            placeholder="e.g. Atlantic"
            value={teamParams.division}
            onChange={e => setTeamParams({ ...teamParams, division: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Teams'}
      </Button>
    </form>
  );
};

export const TeamStatsForm = (props: Readonly<TeamStatsFormProps>) => {
  const { teamStatsParams, setTeamStatsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Team Statistics Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="team-stats-id">Team ID</Label>
          <Input
            id="team-stats-id"
            type="number"
            placeholder="e.g. 1"
            value={teamStatsParams.id}
            onChange={e => setTeamStatsParams({ ...teamStatsParams, id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-stats-season">Season</Label>
          <Input
            id="team-stats-season"
            type="number"
            placeholder="YYYY"
            value={teamStatsParams.season}
            onChange={e => setTeamStatsParams({ ...teamStatsParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-stats-league">League</Label>
          <Input
            id="team-stats-league"
            placeholder="e.g. standard"
            value={teamStatsParams.league}
            onChange={e => setTeamStatsParams({ ...teamStatsParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-stats-conference">Conference</Label>
          <Input
            id="team-stats-conference"
            placeholder="e.g. East"
            value={teamStatsParams.conference}
            onChange={e => setTeamStatsParams({ ...teamStatsParams, conference: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="team-stats-division">Division</Label>
          <Input
            id="team-stats-division"
            placeholder="e.g. Atlantic"
            value={teamStatsParams.division}
            onChange={e => setTeamStatsParams({ ...teamStatsParams, division: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Team Statistics'}
      </Button>
    </form>
  );
};

export const PlayersForm = (props: Readonly<PlayersFormProps>) => {
  const { playerParams, setPlayerParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Players Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="player-id">Player ID</Label>
          <Input
            id="player-id"
            type="number"
            placeholder="e.g. 1"
            value={playerParams.id}
            onChange={e => setPlayerParams({ ...playerParams, id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-season">Season</Label>
          <Input
            id="player-season"
            type="number"
            placeholder="YYYY"
            value={playerParams.season}
            onChange={e => setPlayerParams({ ...playerParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-league">League</Label>
          <Input
            id="player-league"
            placeholder="e.g. standard"
            value={playerParams.league}
            onChange={e => setPlayerParams({ ...playerParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-team">Team ID</Label>
          <Input
            id="player-team"
            type="number"
            placeholder="e.g. 1"
            value={playerParams.team}
            onChange={e => setPlayerParams({ ...playerParams, team: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-conference">Conference</Label>
          <Input
            id="player-conference"
            placeholder="e.g. East"
            value={playerParams.conference}
            onChange={e => setPlayerParams({ ...playerParams, conference: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-division">Division</Label>
          <Input
            id="player-division"
            placeholder="e.g. Atlantic"
            value={playerParams.division}
            onChange={e => setPlayerParams({ ...playerParams, division: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Players'}
      </Button>
    </form>
  );
};

export const PlayerStatsForm = (props: Readonly<PlayerStatsFormProps>) => {
  const { playerStatsParams, setPlayerStatsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Player Statistics Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="player-stats-id">Player ID</Label>
          <Input
            id="player-stats-id"
            type="number"
            placeholder="e.g. 1"
            value={playerStatsParams.id}
            onChange={e => setPlayerStatsParams({ ...playerStatsParams, id: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-stats-season">Season</Label>
          <Input
            id="player-stats-season"
            type="number"
            placeholder="YYYY"
            value={playerStatsParams.season}
            onChange={e => setPlayerStatsParams({ ...playerStatsParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-stats-league">League</Label>
          <Input
            id="player-stats-league"
            placeholder="e.g. standard"
            value={playerStatsParams.league}
            onChange={e => setPlayerStatsParams({ ...playerStatsParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-stats-team">Team ID</Label>
          <Input
            id="player-stats-team"
            type="number"
            placeholder="e.g. 1"
            value={playerStatsParams.team}
            onChange={e => setPlayerStatsParams({ ...playerStatsParams, team: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="player-stats-conference">Conference</Label>
          <Input
            id="player-stats-conference"
            placeholder="e.g. East"
            value={playerStatsParams.conference}
            onChange={e =>
              setPlayerStatsParams({ ...playerStatsParams, conference: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="player-stats-division">Division</Label>
          <Input
            id="player-stats-division"
            placeholder="e.g. Atlantic"
            value={playerStatsParams.division}
            onChange={e => setPlayerStatsParams({ ...playerStatsParams, division: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Player Statistics'}
      </Button>
    </form>
  );
};

export const StandingsForm = (props: Readonly<StandingsFormProps>) => {
  const { standingsParams, setStandingsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Standings Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="standings-season">Season</Label>
          <Input
            id="standings-season"
            type="number"
            placeholder="YYYY"
            value={standingsParams.season}
            onChange={e => setStandingsParams({ ...standingsParams, season: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="standings-league">League</Label>
          <Input
            id="standings-league"
            placeholder="e.g. standard"
            value={standingsParams.league}
            onChange={e => setStandingsParams({ ...standingsParams, league: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="standings-conference">Conference</Label>
          <Input
            id="standings-conference"
            placeholder="e.g. East"
            value={standingsParams.conference}
            onChange={e => setStandingsParams({ ...standingsParams, conference: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="standings-division">Division</Label>
          <Input
            id="standings-division"
            placeholder="e.g. Atlantic"
            value={standingsParams.division}
            onChange={e => setStandingsParams({ ...standingsParams, division: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Standings'}
      </Button>
    </form>
  );
};

export const DataDisplay = (props: Readonly<DataDisplayProps>) => {
  const { data, loading, error, selectedTab } = props;

  if (loading) {
    return (
      <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
        <h3 className="text-lg font-semibold mb-2">No Data</h3>
        <p className="text-gray-500">Select a tab and fetch data to see results.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-4">
        {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Data
      </h3>
      <pre className="text-sm overflow-auto max-h-96 bg-white dark:bg-gray-800 p-4 rounded border">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
