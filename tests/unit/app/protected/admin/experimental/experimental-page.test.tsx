import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import AdminExperimentalPage from '@/app/protected/admin/experimental/page';

// Mock the hooks
vi.mock('@/app/protected/admin/experimental/hooks', () => ({
  useTeamsData: () => ({
    teams: [
      { value: '', label: 'All Teams' },
      { value: '1', label: 'Team A' },
      { value: '2', label: 'Team B' },
    ],
    loadingTeams: false,
    teamsError: null,
  }),
  useSeasonsData: () => ({
    seasons: [
      { value: '2023', label: '2023' },
      { value: '2022', label: '2022' },
    ],
    loadingSeasons: false,
    seasonsError: null,
  }),
  useApiFetch: () => ({
    data: null,
    loading: false,
    error: null,
    handleFetch: vi.fn(),
    clearData: vi.fn(),
  }),
  useFormState: () => ({
    gameParams: { id: '', date: '', season: '', league: '', team: '', h2h: '' },
    setGameParams: vi.fn(),
    gameStatsId: '',
    setGameStatsId: vi.fn(),
    teamParams: {
      id: '',
      name: '',
      code: '',
      league: '',
      conference: '',
      division: '',
      search: '',
    },
    setTeamParams: vi.fn(),
    teamStatsParams: { id: '', season: '', stage: '' },
    setTeamStatsParams: vi.fn(),
    playerParams: { id: '', name: '', team: '', season: '', country: '', search: '' },
    setPlayerParams: vi.fn(),
    playerStatsParams: { id: '', game: '', team: '', season: '' },
    setPlayerStatsParams: vi.fn(),
    standingsParams: { league: '', season: '', team: '', conference: '', division: '' },
    setStandingsParams: vi.fn(),
  }),
  useTabState: () => ({
    selectedTab: 'seasons',
    setSelectedTab: vi.fn(),
    gamesSubTab: 'games',
    setGamesSubTab: vi.fn(),
    teamsSubTab: 'teams',
    setTeamsSubTab: vi.fn(),
    playersSubTab: 'players',
    setPlayersSubTab: vi.fn(),
  }),
}));

// Mock the config
vi.mock('@/lib/config/app.config', () => ({
  API_CONFIG: {
    endpoints: {
      SEASONS: '/api/seasons',
      LEAGUES: '/api/leagues',
      GAMES: '/api/games',
      TEAMS: '/api/teams',
      PLAYERS: '/api/players',
      STANDINGS: '/api/standings',
      GAME_STATISTICS: '/api/game-statistics',
      TEAM_STATISTICS: '/api/team-statistics',
      PLAYER_STATISTICS: '/api/player-statistics',
    },
  },
}));

// Mock the types
vi.mock('@/lib/types/constant.types', () => ({
  TABS: {
    SEASONS: 'seasons',
    LEAGUES: 'leagues',
    GAMES: 'games',
    TEAMS: 'teams',
    PLAYERS: 'players',
    STANDINGS: 'standings',
    SEARCH: 'search',
  },
  CLASSIFICATION: {
    PRIVATE: 'PRIVATE',
    PROTECTED: 'PROTECTED',
    PUBLIC: 'PUBLIC',
  },
}));

describe('AdminExperimentalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the admin experimental page', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('Admin Experimental Page')).toBeInTheDocument();
    expect(
      screen.getByText('This is an experimental admin page for testing and development purposes.')
    ).toBeInTheDocument();
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

  it('renders the seasons section when selected', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('Seasons Query')).toBeInTheDocument();
    expect(screen.getByText('Fetching all seasons...')).toBeInTheDocument();
  });

  it('renders the fetch button', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('Fetch Seasons')).toBeInTheDocument();
  });

  it('renders the no data section', () => {
    render(<AdminExperimentalPage />);

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByText('No data available for seasons')).toBeInTheDocument();
  });

  it('handles button clicks', () => {
    render(<AdminExperimentalPage />);

    const fetchButton = screen.getByText('Fetch Seasons');
    expect(fetchButton).toBeInTheDocument();

    // Test that button is clickable
    fireEvent.click(fetchButton);
  });

  it('renders with proper structure', () => {
    const { container } = render(<AdminExperimentalPage />);

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.getByText('Admin Experimental Page')).toBeInTheDocument();
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  it('maintains component hierarchy', () => {
    const { container } = render(<AdminExperimentalPage />);

    const title = container.querySelector('h1');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Admin Experimental Page');

    const h3Elements = container.querySelectorAll('h3');
    expect(h3Elements.length).toBeGreaterThan(0);

    // Check that we have both the "Seasons Query" and "No Data" sections
    const h3Texts = Array.from(h3Elements).map(el => el.textContent);
    expect(h3Texts).toContain('Seasons Query');
    expect(h3Texts).toContain('No Data');
  });

  it('renders navigation tabs with correct styling', () => {
    render(<AdminExperimentalPage />);

    const seasonsButton = screen.getByText('Seasons');
    expect(seasonsButton).toBeInTheDocument();
    expect(seasonsButton).toHaveClass('px-4', 'py-2', 'text-sm', 'font-medium', 'cursor-pointer');
  });
});
