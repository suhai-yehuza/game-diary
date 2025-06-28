// This file will be populated with components as needed

import type { ChangeEvent, FormEvent } from 'react';
import React from 'react';

export const Button = (
  props: Readonly<{
    readonly children: React.ReactNode;
    readonly variant?: 'default' | 'outline';
    readonly size?: 'default' | 'sm';
    readonly className?: string;
    readonly disabled?: boolean;
    readonly type?: 'button' | 'submit' | 'reset';
    readonly onClick?: () => void;
  }>
) => {
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

export const Input = (
  props: Readonly<{
    readonly className?: string;
    readonly type?: string;
    readonly placeholder?: string;
    readonly value?: string;
    readonly onChange?: (e: Readonly<ChangeEvent<HTMLInputElement>>) => void;
    readonly id?: string;
    readonly required?: boolean;
  }>
) => {
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

export const Label = (
  props: Readonly<{
    readonly children: React.ReactNode;
    readonly htmlFor?: string;
    readonly className?: string;
  }>
) => {
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

export const GamesForm = (
  props: Readonly<{
    readonly gameParams: Record<string, string>;
    readonly setGameParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setGameParams({ ...gameParams, h2h: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Games'}
      </Button>
    </form>
  );
};

export const GameStatsForm = (
  props: Readonly<{
    readonly gameStatsId: string;
    readonly setGameStatsId: (id: Readonly<string>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { gameStatsId, setGameStatsId, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
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
          onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) => setGameStatsId(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Stats'}
      </Button>
    </form>
  );
};

export const TeamsForm = (
  props: Readonly<{
    readonly teamParams: Record<string, string>;
    readonly setTeamParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { teamParams, setTeamParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Teams Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="team-id">ID</Label>
          <Input
            id="team-id"
            placeholder="ID"
            value={teamParams.id}
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setTeamParams({ ...teamParams, search: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Teams'}
      </Button>
    </form>
  );
};

export const TeamStatsForm = (
  props: Readonly<{
    readonly teamStatsParams: Record<string, string>;
    readonly setTeamStatsParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { teamStatsParams, setTeamStatsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setTeamStatsParams({ ...teamStatsParams, stage: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Team Stats'}
      </Button>
    </form>
  );
};

export const PlayersForm = (
  props: Readonly<{
    readonly playerParams: Record<string, string>;
    readonly setPlayerParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { playerParams, setPlayerParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Players Query Parameters</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="player-id">ID</Label>
          <Input
            id="player-id"
            placeholder="ID"
            value={playerParams.id}
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setPlayerParams({ ...playerParams, name: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="player-team">Team</Label>
          <Input
            id="player-team"
            placeholder="Team"
            value={playerParams.team}
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setPlayerParams({ ...playerParams, team: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="player-season">Season</Label>
          <Input
            id="player-season"
            placeholder="Season"
            value={playerParams.season}
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setPlayerParams({ ...playerParams, search: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Players'}
      </Button>
    </form>
  );
};

export const PlayerStatsForm = (
  props: Readonly<{
    readonly playerStatsParams: Record<string, string>;
    readonly setPlayerStatsParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { playerStatsParams, setPlayerStatsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
      <h3 className="text-lg font-semibold mb-1">Player Statistics Query</h3>
      <p className="text-sm text-gray-500 mb-4">At least one parameter is required.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="player-stats-id">Player ID</Label>
          <Input
            id="player-stats-id"
            placeholder="Player ID"
            value={playerStatsParams.id}
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setPlayerStatsParams({ ...playerStatsParams, season: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Player Stats'}
      </Button>
    </form>
  );
};

export const StandingsForm = (
  props: Readonly<{
    readonly standingsParams: Record<string, string>;
    readonly setStandingsParams: (params: Readonly<Record<string, string>>) => void;
    readonly loading: boolean;
    readonly onSubmit: (e: Readonly<FormEvent>) => void;
  }>
) => {
  const { standingsParams, setStandingsParams, loading, onSubmit } = props;

  return (
    <form onSubmit={onSubmit} className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
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
            onChange={(e: Readonly<ChangeEvent<HTMLInputElement>>) =>
              setStandingsParams({ ...standingsParams, division: e.target.value })
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Fetching...' : 'Fetch Standings'}
      </Button>
    </form>
  );
};

export const DataDisplay = (
  props: Readonly<{
    readonly data: unknown;
    readonly loading: boolean;
    readonly error: string | null;
    readonly selectedTab: string;
  }>
) => {
  const { data, loading, error, selectedTab } = props;

  return (
    <div className="rounded-md border p-8">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This is an experimental admin page for testing and development purposes.
        </p>
        <div className="mb-4">
          <a
            href={
              NAV_ITEMS.find(
                (
                  i: Readonly<{
                    readonly key: string;
                    readonly url: string;
                    readonly label: string;
                  }>
                ) => i.key === selectedTab
              )?.url
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            View API Docs for{' '}
            {
              NAV_ITEMS.find(
                (
                  i: Readonly<{
                    readonly key: string;
                    readonly url: string;
                    readonly label: string;
                  }>
                ) => i.key === selectedTab
              )?.label
            }
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
          {!loading && !error && data !== null && data !== undefined && (
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
  );
};

export const NAV_ITEMS = [
  {
    key: 'seasons',
    label: 'Seasons',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Seasons',
    endpoint: 'seasons',
  },
  {
    key: 'leagues',
    label: 'Leagues',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Leagues',
    endpoint: 'leagues',
  },
  {
    key: 'games',
    label: 'Games',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Games',
    endpoint: 'games',
  },
  {
    key: 'teams',
    label: 'Teams',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Teams',
    endpoint: 'teams',
  },
  {
    key: 'players',
    label: 'Players',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Players',
    endpoint: 'players',
  },
  {
    key: 'standings',
    label: 'Standings',
    url: 'https://api-sports.io/documentation/nba/v2#tag/Standings',
    endpoint: 'standings',
  },
] as const;
