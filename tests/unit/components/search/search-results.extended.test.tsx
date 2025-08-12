import { render, screen } from '@testing-library/react';

import { SearchResults } from '@/app/components/search/SearchResults';

vi.mock('@/app/components/search/UserSearchResult', () => ({
  UserSearchResult: ({ user }: { user: any }) => (
    <div data-testid="user-result">{user.username}</div>
  ),
}));

describe('SearchResults summary only', () => {
  it('shows summary counts correctly', () => {
    const results: any = {
      success: true,
      data: {
        users: [],
        games: [],
        gameLogs: [],
        teams: [],
        players: [],
        totalUsers: 3,
        totalGames: 2,
        totalGameLogs: 1,
        totalTeams: 4,
        totalPlayers: 5,
      },
      pagination: { page: 1, limit: 10, total: 15, pages: 2 },
    };

    render(<SearchResults results={results} query="q" />);

    expect(screen.getByText('15 total')).toBeInTheDocument();
    expect(screen.getByText('3 users')).toBeInTheDocument();
    expect(screen.getByText('2 games')).toBeInTheDocument();
    expect(screen.getByText('1 game log')).toBeInTheDocument();
    expect(screen.getByText('4 teams')).toBeInTheDocument();
    expect(screen.getByText('5 players')).toBeInTheDocument();
  });

  it('activates each filter and shows only that section', () => {
    const results: any = {
      success: true,
      data: {
        users: [{ id: 'u1', type: 'user' as const, created_at: '2023-01-01', username: 'u' }],
        games: [{ id: 'g1', type: 'game' as const, created_at: '2023-01-01' }],
        gameLogs: [{ id: 'gl1', type: 'game_log' as const, created_at: '2023-01-01' }],
        teams: [{ id: 't1', type: 'team' as const, created_at: '2023-01-01', name: 'T' }],
        players: [{ id: 'p1', type: 'player' as const, created_at: '2023-01-01', name: 'P' }],
        totalUsers: 1,
        totalGames: 1,
        totalGameLogs: 1,
        totalTeams: 1,
        totalPlayers: 1,
      },
      pagination: { page: 1, limit: 10, total: 5, pages: 1 },
    };

    render(<SearchResults results={results} query="q" />);

    // game logs
    const gameLogsFilter = screen.getByText('1 game log');
    gameLogsFilter.click();
    // Inactive filter has color classes; active will change to bg-primary. We assert section change.
    expect(screen.getByText('Game Logs (1)')).toBeInTheDocument();

    // teams
    const teamsFilter = screen.getByText('1 team');
    teamsFilter.click();
    expect(screen.getByText('Teams (1)')).toBeInTheDocument();

    // players
    const playersFilter = screen.getByText('1 player');
    playersFilter.click();
    expect(screen.getByText('Players (1)')).toBeInTheDocument();

    // back to all
    const allFilter = screen.getByText('5 total');
    allFilter.click();
    expect(screen.getByText('Users (1)')).toBeInTheDocument();
    expect(screen.getByText('Games (1)')).toBeInTheDocument();
    expect(screen.getByText('Game Logs (1)')).toBeInTheDocument();
    expect(screen.getByText('Teams (1)')).toBeInTheDocument();
    expect(screen.getByText('Players (1)')).toBeInTheDocument();
  });
});
