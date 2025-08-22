import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
  DynamicForm,
  Button,
  Input,
  Select,
  Label,
  GamesForm,
  GameStatsForm,
  TeamsForm,
  TeamStatsForm,
  PlayersForm,
  PlayerStatsForm,
  StandingsForm,
  DataDisplay,
} from '@/app/protected/admin/experimental/components';

describe('experimental components basics', () => {
  it('renders Button, Input, Select, Label', () => {
    render(
      <div>
        <Label htmlFor="x" required>
          L
        </Label>
        <Input id="x" value="v" onChange={() => {}} />
        <Select id="s" value="1" onChange={() => {}} options={[{ value: '1', label: 'One' }]} />
        <Button>Click</Button>
      </div>
    );

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByDisplayValue('v')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('submits DynamicForm and calls onSubmit', () => {
    const onSubmit = vi.fn();
    render(
      <DynamicForm
        title="T"
        description="D"
        submitLabel="Go"
        loading={false}
        onSubmit={onSubmit}
        fields={[{ id: 'a', label: 'A', value: 'val', onChange: () => {} }]}
      />
    );
    fireEvent.click(screen.getByText('Go'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders DataDisplay states', () => {
    const { rerender } = render(
      <DataDisplay data={null} loading={true} error={null} selectedTab="seasons" />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<DataDisplay data={null} loading={false} error={'err'} selectedTab="seasons" />);
    expect(screen.getByText('Error')).toBeInTheDocument();

    rerender(<DataDisplay data={null} loading={false} error={null} selectedTab="teams" />);
    expect(screen.getByText('No Data')).toBeInTheDocument();

    rerender(<DataDisplay data={{ ok: true }} loading={false} error={null} selectedTab="teams" />);
    expect(screen.getByText('API Response')).toBeInTheDocument();
  });

  it('renders forms with provided options and values', () => {
    const seasons = [{ value: '2024', label: '2024' }];
    const teams = [{ value: '10', label: 'A' }];
    const noop = () => {};

    const { container } = render(
      <div>
        <GamesForm
          gameParams={{ id: '', date: '', season: '', league: '', team: '10', h2h: '' }}
          setGameParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
          teams={teams}
        />
        <GameStatsForm
          gameStatsId={''}
          setGameStatsId={noop as any}
          loading={false}
          onSubmit={noop as any}
        />
        <TeamsForm
          teamParams={{
            id: '',
            season: '',
            league: '',
            conference: '',
            division: '',
            name: '',
            code: '',
            search: '',
          }}
          setTeamParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
          teams={teams}
        />
        <TeamStatsForm
          teamStatsParams={{ id: '', season: '', stage: '' }}
          setTeamStatsParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
          teams={teams}
        />
        <PlayersForm
          playerParams={{ id: '', name: '', team: '', season: '', country: '', search: '' }}
          setPlayerParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
          teams={teams}
        />
        <PlayerStatsForm
          playerStatsParams={{ id: '', game: '', team: '', season: '' }}
          setPlayerStatsParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
          teams={teams}
        />
        <StandingsForm
          standingsParams={{ league: '', season: '', team: '', conference: '', division: '' }}
          setStandingsParams={noop as any}
          loading={false}
          onSubmit={noop as any}
          seasons={seasons}
        />
      </div>
    );

    expect(screen.getAllByText(/Query Parameters|Query|Statistics Query/i).length).toBeGreaterThan(
      0
    );

    // Trigger some onChange handlers to cover field functions
    const gameId = screen.getByLabelText('Game ID');
    fireEvent.change(gameId, { target: { value: '123' } });
    const gameSeason = screen.getAllByLabelText('Season')[0] as HTMLSelectElement;
    fireEvent.change(gameSeason, { target: { value: '2024' } });

    const teamSelects = screen.getAllByLabelText('Team');
    if (teamSelects.length > 0) {
      fireEvent.change(teamSelects[0], { target: { value: '10' } });
    }

    const playerId = screen.getByLabelText('Player ID');
    fireEvent.change(playerId, { target: { value: '7' } });

    const standingsLeague = container.querySelector('#standings-league') as HTMLSelectElement;
    expect(standingsLeague).toBeTruthy();
    fireEvent.change(standingsLeague, { target: { value: 'standard' } });
  });
});
