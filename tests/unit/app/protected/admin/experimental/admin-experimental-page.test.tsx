import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useApiFetch, useTabState } from '@/app/protected/admin/experimental/hooks';

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
  DataDisplay: ({ data, error }: any) => (
    <div data-testid="data-display">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  ),
}));

// Mock the hooks
let mockUseApiFetch: ReturnType<typeof vi.fn>;
let mockUseTabState: ReturnType<typeof vi.fn>;
vi.mock('@/app/protected/admin/experimental/hooks', () => ({
  useApiFetch: (...args: any[]) => mockUseApiFetch(...args),
  useTabState: (...args: any[]) => mockUseTabState(...args),
  useFormState: () => ({
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
    clearData: vi.fn(),
  }),
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApiFetch = vi.fn(() => ({
      data: null,
      loading: false,
      error: null,
      fetchData: vi.fn(),
      clearData: vi.fn(),
      handleFetch: vi.fn(),
    }));
    mockUseTabState = vi.fn(() => ({
      selectedTab: 'seasons',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
  });

  it('renders the admin experimental page', () => {
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Admin Experimental Page')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Seasons')).toBeInTheDocument();
    expect(screen.getByText('Leagues')).toBeInTheDocument();
    expect(screen.getAllByText('Games').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Teams').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Players').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Standings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Search').length).toBeGreaterThan(0);
  });

  it('handles tab selection', () => {
    render(<AdminExperimentalPage />);

    const gamesTab = screen.getByText('Games');
    fireEvent.click(gamesTab);

    expect(gamesTab).toBeInTheDocument();
  });

  it('renders data display when data is available', () => {
    mockUseApiFetch = vi.fn(() => ({
      data: { test: 'data' },
      loading: false,
      error: null,
      fetchData: vi.fn(),
      handleFetch: vi.fn(),
      clearData: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getByTestId('data-display')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseApiFetch = vi.fn(() => ({
      data: null,
      loading: true,
      error: null,
      fetchData: vi.fn(),
      handleFetch: vi.fn(),
      clearData: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Fetching...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseApiFetch = vi.fn(() => ({
      data: null,
      loading: false,
      error: 'Error: Failed to fetch data',
      fetchData: vi.fn(),
      handleFetch: vi.fn().mockImplementation(() => Promise.resolve()),
      clearData: vi.fn(),
    }));
    mockUseTabState = vi.fn(() => ({
      selectedTab: 'games',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(
      screen.getByText((content, node) => {
        const hasText = (node: Element | null) =>
          !!node && node.textContent?.includes('Error: Failed to fetch data');
        const nodeHasText = hasText(node as Element);
        const childrenDontHaveText = Array.from((node as Element)?.children || []).every(
          child => !hasText(child)
        );
        return Boolean(nodeHasText && childrenDontHaveText);
      })
    ).toBeInTheDocument();
  });

  it('renders simple endpoints for seasons tab', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'seasons',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Seasons')).toBeInTheDocument();
  });

  it('renders simple endpoints for leagues tab', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'leagues',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Leagues')).toBeInTheDocument();
  });

  it('renders games section when games tab is selected', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'games',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getAllByText('Games').length).toBeGreaterThan(0);
  });

  it('renders teams section when teams tab is selected', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'teams',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getAllByText('Teams').length).toBeGreaterThan(0);
  });

  it('renders players section when players tab is selected', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'players',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getAllByText('Players').length).toBeGreaterThan(0);
  });

  it('renders standings section when standings tab is selected', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'standings',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getByText('Standings')).toBeInTheDocument();
  });

  it('renders search section when search tab is selected', () => {
    mockUseTabState.mockImplementation(() => ({
      selectedTab: 'search',
      setSelectedTab: vi.fn(),
      gamesSubTab: 'games',
      setGamesSubTab: vi.fn(),
      teamsSubTab: 'teams',
      setTeamsSubTab: vi.fn(),
      playersSubTab: 'players',
      setPlayersSubTab: vi.fn(),
    }));
    render(<AdminExperimentalPage />);
    expect(screen.getAllByText('Search').length).toBeGreaterThan(0);
  });
});
