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
import type { DynamicFormProps, FieldConfig } from '@/lib/types/ui.types';

// --- DynamicForm abstraction ---
export const DynamicForm = ({
  fields,
  onSubmit,
  loading,
  title,
  description,
  submitLabel,
  className = '',
}: DynamicFormProps) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    void onSubmit(e);
  };
  return (
    <form
      onSubmit={handleFormSubmit}
      className={`mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field: FieldConfig) => (
          <div key={field.id}>
            <Label htmlFor={field.id} required={field.required}>
              {field.label}
            </Label>
            <Input
              id={field.id}
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
            />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={loading} className="mt-4">
        {loading ? 'Loading...' : submitLabel}
      </Button>
    </form>
  );
};

export const Button = (props: ButtonProps) => {
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

export const Input = (props: InputProps) => {
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

export const Label = (props: LabelProps) => {
  const { children, htmlFor, className = '', required = false } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  );
};

export const GamesForm = (props: GamesFormProps) => {
  const { gameParams, setGameParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Game ID',
      id: 'game-id',
      type: 'number',
      placeholder: 'e.g. 12345',
      value: gameParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, id: e.target.value }),
    },
    {
      label: 'Date',
      id: 'game-date',
      type: 'date',
      value: gameParams.date,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, date: e.target.value }),
    },
    {
      label: 'Season',
      id: 'game-season',
      type: 'number',
      placeholder: 'YYYY',
      value: gameParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, season: e.target.value }),
    },
    {
      label: 'League',
      id: 'game-league',
      placeholder: 'e.g. standard',
      value: gameParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, league: e.target.value }),
    },
    {
      label: 'Team ID',
      id: 'game-team',
      type: 'number',
      placeholder: 'e.g. 1',
      value: gameParams.team,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, team: e.target.value }),
    },
    {
      label: 'Head-to-Head (h2h)',
      id: 'game-h2h',
      placeholder: 'e.g. 1-4',
      value: gameParams.h2h,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setGameParams({ ...gameParams, h2h: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Games Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Games"
    />
  );
};

export const GameStatsForm = (props: GameStatsFormProps) => {
  const { gameStatsId, setGameStatsId, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Game ID',
      id: 'game-stats-id',
      type: 'number',
      placeholder: 'e.g. 12345',
      value: gameStatsId,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGameStatsId(e.target.value),
      required: true,
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Game Statistics Query"
      submitLabel="Fetch Game Statistics"
    />
  );
};

export const TeamsForm = (props: TeamsFormProps) => {
  const { teamParams, setTeamParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Team ID',
      id: 'team-id',
      type: 'number',
      placeholder: 'e.g. 1',
      value: teamParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamParams({ ...teamParams, id: e.target.value }),
    },
    {
      label: 'Season',
      id: 'team-season',
      type: 'number',
      placeholder: 'YYYY',
      value: teamParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamParams({ ...teamParams, season: e.target.value }),
    },
    {
      label: 'League',
      id: 'team-league',
      placeholder: 'e.g. standard',
      value: teamParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamParams({ ...teamParams, league: e.target.value }),
    },
    {
      label: 'Conference',
      id: 'team-conference',
      placeholder: 'e.g. East',
      value: teamParams.conference,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamParams({ ...teamParams, conference: e.target.value }),
    },
    {
      label: 'Division',
      id: 'team-division',
      placeholder: 'e.g. Atlantic',
      value: teamParams.division,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamParams({ ...teamParams, division: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Teams Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Teams"
    />
  );
};

export const TeamStatsForm = (props: TeamStatsFormProps) => {
  const { teamStatsParams, setTeamStatsParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Team ID',
      id: 'team-stats-id',
      type: 'number',
      placeholder: 'e.g. 1',
      value: teamStatsParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamStatsParams({ ...teamStatsParams, id: e.target.value }),
      required: true,
    },
    {
      label: 'Season',
      id: 'team-stats-season',
      type: 'number',
      placeholder: 'YYYY',
      value: teamStatsParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamStatsParams({ ...teamStatsParams, season: e.target.value }),
      required: true,
    },
    {
      label: 'League',
      id: 'team-stats-league',
      placeholder: 'e.g. standard',
      value: teamStatsParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamStatsParams({ ...teamStatsParams, league: e.target.value }),
    },
    {
      label: 'Conference',
      id: 'team-stats-conference',
      placeholder: 'e.g. East',
      value: teamStatsParams.conference,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamStatsParams({ ...teamStatsParams, conference: e.target.value }),
    },
    {
      label: 'Division',
      id: 'team-stats-division',
      placeholder: 'e.g. Atlantic',
      value: teamStatsParams.division,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setTeamStatsParams({ ...teamStatsParams, division: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Team Statistics Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Team Statistics"
    />
  );
};

export const PlayersForm = (props: PlayersFormProps) => {
  const { playerParams, setPlayerParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Player ID',
      id: 'player-id',
      type: 'number',
      placeholder: 'e.g. 1',
      value: playerParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, id: e.target.value }),
    },
    {
      label: 'Season',
      id: 'player-season',
      type: 'number',
      placeholder: 'YYYY',
      value: playerParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, season: e.target.value }),
    },
    {
      label: 'League',
      id: 'player-league',
      placeholder: 'e.g. standard',
      value: playerParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, league: e.target.value }),
    },
    {
      label: 'Team ID',
      id: 'player-team',
      type: 'number',
      placeholder: 'e.g. 1',
      value: playerParams.team,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, team: e.target.value }),
    },
    {
      label: 'Conference',
      id: 'player-conference',
      placeholder: 'e.g. East',
      value: playerParams.conference,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, conference: e.target.value }),
    },
    {
      label: 'Division',
      id: 'player-division',
      placeholder: 'e.g. Atlantic',
      value: playerParams.division,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerParams({ ...playerParams, division: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Players Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Players"
    />
  );
};

export const PlayerStatsForm = (props: PlayerStatsFormProps) => {
  const { playerStatsParams, setPlayerStatsParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Player ID',
      id: 'player-stats-id',
      type: 'number',
      placeholder: 'e.g. 1',
      value: playerStatsParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, id: e.target.value }),
      required: true,
    },
    {
      label: 'Season',
      id: 'player-stats-season',
      type: 'number',
      placeholder: 'YYYY',
      value: playerStatsParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, season: e.target.value }),
    },
    {
      label: 'League',
      id: 'player-stats-league',
      placeholder: 'e.g. standard',
      value: playerStatsParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, league: e.target.value }),
    },
    {
      label: 'Team ID',
      id: 'player-stats-team',
      type: 'number',
      placeholder: 'e.g. 1',
      value: playerStatsParams.team,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, team: e.target.value }),
    },
    {
      label: 'Conference',
      id: 'player-stats-conference',
      placeholder: 'e.g. East',
      value: playerStatsParams.conference,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, conference: e.target.value }),
    },
    {
      label: 'Division',
      id: 'player-stats-division',
      placeholder: 'e.g. Atlantic',
      value: playerStatsParams.division,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, division: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Player Statistics Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Player Statistics"
    />
  );
};

export const StandingsForm = (props: StandingsFormProps) => {
  const { standingsParams, setStandingsParams, loading, onSubmit } = props;
  const fields = [
    {
      label: 'Season',
      id: 'standings-season',
      type: 'number',
      placeholder: 'YYYY',
      value: standingsParams.season,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setStandingsParams({ ...standingsParams, season: e.target.value }),
      required: true,
    },
    {
      label: 'League',
      id: 'standings-league',
      placeholder: 'e.g. standard',
      value: standingsParams.league,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setStandingsParams({ ...standingsParams, league: e.target.value }),
      required: true,
    },
    {
      label: 'Conference',
      id: 'standings-conference',
      placeholder: 'e.g. East',
      value: standingsParams.conference,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setStandingsParams({ ...standingsParams, conference: e.target.value }),
    },
    {
      label: 'Division',
      id: 'standings-division',
      placeholder: 'e.g. Atlantic',
      value: standingsParams.division,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setStandingsParams({ ...standingsParams, division: e.target.value }),
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Standings Query Parameters"
      description="At least one parameter is required."
      submitLabel="Fetch Standings"
    />
  );
};

export const DataDisplay = (props: DataDisplayProps) => {
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
