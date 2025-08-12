// This file will be populated with components as needed

import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import type {
  ButtonProps,
  InputProps,
  LabelProps,
  SelectProps,
  GamesFormProps,
  GameStatsFormProps,
  TeamsFormProps,
  TeamStatsFormProps,
  PlayersFormProps,
  PlayerStatsFormProps,
  StandingsFormProps,
  DataDisplayProps,
  IDynamicFormProps as DynamicFormProps,
  IFieldConfig as FieldConfig,
} from '@/lib/types';

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
    e.preventDefault();
    void onSubmit(e);
  };
  return (
    <Card className={className}>
      <form onSubmit={handleFormSubmit}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : submitLabel}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field: FieldConfig) => (
              <div key={field.id}>
                <Label htmlFor={field.id} required={field.required}>
                  {field.label}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    id={field.id}
                    value={field.value}
                    onChange={field.onChange}
                    required={field.required}
                    options={field.options ?? []}
                  />
                ) : (
                  <Input
                    id={field.id}
                    type={field.type ?? 'text'}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </form>
    </Card>
  );
};

export const Button = (props: ButtonProps) => {
  const {
    children,
    variant = 'default',
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
          : 'bg-rose-100 text-rose-900 border border-rose-300 shadow px-5 py-2 rounded-md transition-all duration-200 hover:bg-rose-200 active:shadow focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:bg-rose-900 dark:text-rose-100 dark:border-rose-700 dark:hover:bg-rose-800'
      } h-11 px-4 py-2 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export const Input = (props: InputProps) => {
  const {
    id,
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    className = '',
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
      className={`flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
};

export const Select = (props: SelectProps) => {
  const { id, value, onChange, required = false, className = '', options = [], ...rest } = props;

  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className={`flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {options?.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const Label = (props: LabelProps) => {
  const { children, htmlFor, className = '', required = false, ...rest } = props;

  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...rest}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Common options for different parameters
const LEAGUE_OPTIONS = [
  { value: '', label: 'All Leagues' },
  { value: 'standard', label: 'Standard' },
  { value: 'africa', label: 'Africa' },
  { value: 'orlando', label: 'Orlando' },
  { value: 'utah', label: 'Utah' },
  { value: 'sacramento', label: 'Sacramento' },
];

const CONFERENCE_OPTIONS = [
  { value: '', label: 'All Conferences' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
];

const DIVISION_OPTIONS = [
  { value: '', label: 'All Divisions' },
  { value: 'atlantic', label: 'Atlantic' },
  { value: 'central', label: 'Central' },
  { value: 'southeast', label: 'Southeast' },
  { value: 'northwest', label: 'Northwest' },
  { value: 'pacific', label: 'Pacific' },
  { value: 'southwest', label: 'Southwest' },
];

export const GamesForm = (props: GamesFormProps) => {
  const { gameParams, setGameParams, loading, onSubmit, seasons, teams } = props;

  // Filter out the selected team from h2h options to prevent duplicate selection
  const h2hTeamOptions = teams.filter(team => team.value !== gameParams.team);

  const fields = [
    {
      label: 'Game ID',
      id: 'game-id',
      type: 'number',
      placeholder: 'e.g. 12345',
      value: gameParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, id: e.target.value }),
    },
    {
      label: 'Date',
      id: 'game-date',
      type: 'date',
      value: gameParams.date,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, date: e.target.value }),
    },
    {
      label: 'Season',
      id: 'game-season',
      type: 'select',
      value: gameParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, season: e.target.value }),
      options: seasons,
    },
    {
      label: 'League',
      id: 'game-league',
      type: 'select',
      value: gameParams.league ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
    },
    {
      label: 'Team',
      id: 'game-team',
      type: 'select',
      value: gameParams.team ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, team: e.target.value }),
      options: teams,
    },
    {
      label: 'Head-to-Head Team',
      id: 'game-h2h',
      type: 'select',
      value: gameParams.h2h ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameParams({ ...gameParams, h2h: e.target.value }),
      options: h2hTeamOptions,
    },
  ];
  return (
    <DynamicForm
      fields={fields}
      onSubmit={e => void onSubmit(e)}
      loading={loading}
      title="Games Query Parameters"
      description="At least one parameter is required. For Head-to-Head, select a team in 'Team' field and a different team in 'Head-to-Head Team' field."
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
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setGameStatsId(e.target.value),
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
  const { teamParams, setTeamParams, loading, onSubmit, seasons, teams } = props;
  const fields = [
    {
      label: 'Team',
      id: 'team-id',
      type: 'select',
      value: teamParams.id ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamParams({ ...teamParams, id: e.target.value }),
      options: teams,
    },
    {
      label: 'Season',
      id: 'team-season',
      type: 'select',
      value: teamParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamParams({ ...teamParams, season: e.target.value }),
      options: seasons,
    },
    {
      label: 'League',
      id: 'team-league',
      type: 'select',
      value: teamParams.league ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamParams({ ...teamParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
    },
    {
      label: 'Conference',
      id: 'team-conference',
      type: 'select',
      value: teamParams.conference ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamParams({ ...teamParams, conference: e.target.value }),
      options: CONFERENCE_OPTIONS,
    },
    {
      label: 'Division',
      id: 'team-division',
      type: 'select',
      value: teamParams.division ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamParams({ ...teamParams, division: e.target.value }),
      options: DIVISION_OPTIONS,
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
  const { teamStatsParams, setTeamStatsParams, loading, onSubmit, seasons, teams } = props;
  const fields = [
    {
      label: 'Team',
      id: 'team-stats-id',
      type: 'select',
      value: teamStatsParams.id ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamStatsParams({ ...teamStatsParams, id: e.target.value }),
      options: teams,
      required: true,
    },
    {
      label: 'Season',
      id: 'team-stats-season',
      type: 'select',
      value: teamStatsParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamStatsParams({ ...teamStatsParams, season: e.target.value }),
      options: seasons,
    },
    {
      label: 'League',
      id: 'team-stats-league',
      type: 'select',
      value: teamStatsParams.league ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamStatsParams({ ...teamStatsParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
    },
    {
      label: 'Conference',
      id: 'team-stats-conference',
      type: 'select',
      value: teamStatsParams.conference ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamStatsParams({ ...teamStatsParams, conference: e.target.value }),
      options: CONFERENCE_OPTIONS,
    },
    {
      label: 'Division',
      id: 'team-stats-division',
      type: 'select',
      value: teamStatsParams.division ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setTeamStatsParams({ ...teamStatsParams, division: e.target.value }),
      options: DIVISION_OPTIONS,
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
  const { playerParams, setPlayerParams, loading, onSubmit, seasons, teams } = props;
  const fields = [
    {
      label: 'Player ID',
      id: 'player-id',
      type: 'number',
      placeholder: 'e.g. 12345',
      value: playerParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, id: e.target.value }),
    },
    {
      label: 'Season',
      id: 'player-season',
      type: 'select',
      value: playerParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, season: e.target.value }),
      options: seasons,
    },
    {
      label: 'League',
      id: 'player-league',
      type: 'select',
      value: playerParams.league ?? 'standard',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
    },
    {
      label: 'Team',
      id: 'player-team',
      type: 'select',
      value: playerParams.team ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, team: e.target.value }),
      options: teams,
    },
    {
      label: 'Conference',
      id: 'player-conference',
      type: 'select',
      value: playerParams.conference ?? 'east',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, conference: e.target.value }),
      options: CONFERENCE_OPTIONS,
    },
    {
      label: 'Division',
      id: 'player-division',
      type: 'select',
      value: playerParams.division ?? 'atlantic',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerParams({ ...playerParams, division: e.target.value }),
      options: DIVISION_OPTIONS,
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
  const { playerStatsParams, setPlayerStatsParams, loading, onSubmit, seasons, teams } = props;
  const fields = [
    {
      label: 'Player ID',
      id: 'player-stats-id',
      type: 'number',
      placeholder: 'e.g. 12345',
      value: playerStatsParams.id,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, id: e.target.value }),
      required: true,
    },
    {
      label: 'Season',
      id: 'player-stats-season',
      type: 'select',
      value: playerStatsParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, season: e.target.value }),
      options: seasons,
    },
    {
      label: 'League',
      id: 'player-stats-league',
      type: 'select',
      value: playerStatsParams.league ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
    },
    {
      label: 'Team',
      id: 'player-stats-team',
      type: 'select',
      value: playerStatsParams.team ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, team: e.target.value }),
      options: teams,
    },
    {
      label: 'Conference',
      id: 'player-stats-conference',
      type: 'select',
      value: playerStatsParams.conference ?? 'east',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, conference: e.target.value }),
      options: CONFERENCE_OPTIONS,
    },
    {
      label: 'Division',
      id: 'player-stats-division',
      type: 'select',
      value: playerStatsParams.division ?? 'atlantic',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setPlayerStatsParams({ ...playerStatsParams, division: e.target.value }),
      options: DIVISION_OPTIONS,
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
  const { standingsParams, setStandingsParams, loading, onSubmit, seasons } = props;
  const fields = [
    {
      label: 'Season',
      id: 'standings-season',
      type: 'select',
      value: standingsParams.season ?? seasons[0]?.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setStandingsParams({ ...standingsParams, season: e.target.value }),
      options: seasons,
      required: true,
    },
    {
      label: 'League',
      id: 'standings-league',
      type: 'select',
      value: standingsParams.league ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setStandingsParams({ ...standingsParams, league: e.target.value }),
      options: LEAGUE_OPTIONS,
      required: true,
    },
    {
      label: 'Conference',
      id: 'standings-conference',
      type: 'select',
      value: standingsParams.conference ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setStandingsParams({ ...standingsParams, conference: e.target.value }),
      options: CONFERENCE_OPTIONS,
    },
    {
      label: 'Division',
      id: 'standings-division',
      type: 'select',
      value: standingsParams.division ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setStandingsParams({ ...standingsParams, division: e.target.value }),
      options: DIVISION_OPTIONS,
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
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">No data available for {selectedTab}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Response</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-md overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};
