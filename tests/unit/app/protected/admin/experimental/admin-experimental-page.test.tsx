import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the components
vi.mock('@/app/protected/admin/experimental/components', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
      {children}
    </button>
  ),
  GamesForm: ({ gameParams, setGameParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="games-form">
      <input
        data-testid="game-params-input"
        value={JSON.stringify(gameParams)}
        onChange={e => setGameParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Games
      </button>
    </form>
  ),
  GameStatsForm: ({ gameStatsId, setGameStatsId, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="game-stats-form">
      <input
        data-testid="game-stats-id-input"
        value={gameStatsId}
        onChange={e => setGameStatsId(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Submit Game Stats
      </button>
    </form>
  ),
  TeamsForm: ({ teamParams, setTeamParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="teams-form">
      <input
        data-testid="team-params-input"
        value={JSON.stringify(teamParams)}
        onChange={e => setTeamParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Teams
      </button>
    </form>
  ),
  TeamStatsForm: ({ teamStatsParams, setTeamStatsParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="team-stats-form">
      <input
        data-testid="team-stats-params-input"
        value={JSON.stringify(teamStatsParams)}
        onChange={e => setTeamStatsParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Team Stats
      </button>
    </form>
  ),
  PlayersForm: ({ playerParams, setPlayerParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="players-form">
      <input
        data-testid="player-params-input"
        value={JSON.stringify(playerParams)}
        onChange={e => setPlayerParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Players
      </button>
    </form>
  ),
  PlayerStatsForm: ({ playerStatsParams, setPlayerStatsParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="player-stats-form">
      <input
        data-testid="player-stats-params-input"
        value={JSON.stringify(playerStatsParams)}
        onChange={e => setPlayerStatsParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Player Stats
      </button>
    </form>
  ),
  StandingsForm: ({ standingsParams, setStandingsParams, loading, onSubmit }: any) => (
    <form onSubmit={onSubmit} data-testid="standings-form">
      <input
        data-testid="standings-params-input"
        value={JSON.stringify(standingsParams)}
        onChange={e => setStandingsParams(JSON.parse(e.target.value))}
      />
      <button type="submit" disabled={loading}>
        Submit Standings
      </button>
    </form>
  ),
  DataDisplay: ({ data }: any) => (
    <div data-testid="data-display">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  ),
}));

// Mock the hooks
vi.mock('@/app/protected/admin/experimental/hooks', () => ({
  useApiFetch: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    fetchData: vi.fn(),
  })),
  useFormState: vi.fn(() => ({
    gameParams: {},
    setGameParams: vi.fn(),
    gameStatsId: '',
    setGameStatsId: vi.fn(),
    teamParams: {},
    setTeamParams: vi.fn(),
    teamStatsParams: {},
    setTeamStatsParams: vi.fn(),
    playerParams: {},
    setPlayerParams: vi.fn(),
    playerStatsParams: {},
    setPlayerStatsParams: vi.fn(),
    standingsParams: {},
    setStandingsParams: vi.fn(),
  })),
  useTabState: vi.fn(() => ({
    selectedTab: 'seasons',
    setSelectedTab: vi.fn(),
    gamesSubTab: 'games',
    setGamesSubTab: vi.fn(),
    teamsSubTab: 'teams',
    setTeamsSubTab: vi.fn(),
    playersSubTab: 'players',
    setPlayersSubTab: vi.fn(),
  })),
}));

import AdminExperimentalPage from '@/app/protected/admin/experimental/page';

// Mock the API config
vi.mock('@/lib/config/api.config', () => ({
  API_CONFIG: {
    endpoints: {
      SEASONS: '/api/seasons',
      LEAGUES: '/api/leagues',
      GAMES: '/api/games',
      TEAMS: '/api/teams',
      PLAYERS: '/api/players',
      STANDINGS: '/api/standings',
    },
  },
}));

// Mock the types
vi.mock('@/lib/types', () => ({
  TABS: {
    SEASONS: 'seasons',
    LEAGUES: 'leagues',
    GAMES: 'games',
    TEAMS: 'teams',
    PLAYERS: 'players',
    STANDINGS: 'standings',
    SEARCH: 'search',
  },
}));

describe('AdminExperimentalPage', () => {
  const mockUseApiFetch = vi.mocked(
    require('@/app/protected/admin/experimental/hooks').useApiFetch
  );
  const mockUseTabState = vi.mocked(
    require('@/app/protected/admin/experimental/hooks').useTabState
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the admin experimental page', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('Admin Experimental')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('Seasons')).toBeInTheDocument();
    expect(screen.getByText('Leagues')).toBeInTheDocument();
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Standings')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('handles tab selection', () => {
    render(<AdminExperimentalPage />);

    const gamesTab = screen.getByText('Games');
    fireEvent.click(gamesTab);

    expect(gamesTab).toBeInTheDocument();
  });

  it('renders data display when data is available', () => {
    mockUseApiFetch.mockReturnValue({
      data: { test: 'data' },
      loading: false,
      error: null,
      fetchData: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByTestId('data-display')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseApiFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      fetchData: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseApiFetch.mockReturnValue({
      data: null,
      loading: false,
      error: 'Test error',
      fetchData: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });

  it('renders simple endpoints for seasons tab', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'seasons',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByText('Seasons Query')).toBeInTheDocument();
    expect(screen.getByText('Fetching all seasons...')).toBeInTheDocument();
  });

  it('renders simple endpoints for leagues tab', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'leagues',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByText('Leagues Query')).toBeInTheDocument();
    expect(screen.getByText('Fetching all leagues...')).toBeInTheDocument();
  });

  it('renders games section when games tab is selected', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'games',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByTestId('games-form')).toBeInTheDocument();
  });

  it('renders teams section when teams tab is selected', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'teams',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByTestId('teams-form')).toBeInTheDocument();
  });

  it('renders players section when players tab is selected', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'players',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByTestId('players-form')).toBeInTheDocument();
  });

  it('renders standings section when standings tab is selected', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'standings',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByTestId('standings-form')).toBeInTheDocument();
  });

  it('renders search section when search tab is selected', () => {
    mockUseTabState.mockReturnValue({
      selectedTab: 'search',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    });

    render(<AdminExperimentalPage />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter search term...')).toBeInTheDocument();
  });
});
