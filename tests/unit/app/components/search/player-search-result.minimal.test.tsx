import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  GraduationCap: () => <div data-testid="graduationcap-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}));

describe('PlayerSearchResult', () => {
  const defaultPlayer = {
    id: '1',
    type: 'player' as const,
    created_at: '2024-01-01T00:00:00Z',
    first_name: 'LeBron',
    last_name: 'James',
    position: 'SF',
    team: 'Lakers',
    college: 'St. Vincent-St. Mary HS (OH)',
    height: '6-9',
    weight: '250',
    birth_date: '1984-12-30',
    jersey_number: '23',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders player information correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary HS (OH)')).toBeInTheDocument();
    expect(screen.getByText('6-9 • 250')).toBeInTheDocument();
  });

  it('handles click navigation', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const clickableElement = screen.getByText('LeBron James').closest('div');
    if (clickableElement) {
      fireEvent.click(clickableElement);
      expect(mockPush).toHaveBeenCalledWith('/sports/nba/player/1');
    }
  });

  it('displays player details correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary HS (OH)')).toBeInTheDocument();
    expect(screen.getByText('6-9 • 250')).toBeInTheDocument();
  });

  it('handles missing player data gracefully', () => {
    const incompletePlayer = {
      id: '2',
      type: 'player' as const,
      created_at: '2024-01-01T00:00:00Z',
      first_name: 'John',
      last_name: 'Doe',
      position: undefined,
      team: undefined,
      college: undefined,
      height: undefined,
      weight: undefined,
      birth_date: undefined,
      jersey_number: undefined,
    };

    render(<PlayerSearchResult player={incompletePlayer} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles empty strings gracefully', () => {
    const emptyPlayer = {
      id: '3',
      type: 'player' as const,
      created_at: '2024-01-01T00:00:00Z',
      first_name: '',
      last_name: '',
      position: '',
      team: '',
      college: '',
      height: '',
      weight: '',
      birth_date: '',
      jersey_number: '',
    };

    render(<PlayerSearchResult player={emptyPlayer} />);

    // Should still render without crashing
    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('displays icons correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
  });

  it('handles different player positions', () => {
    const pointGuard = { ...defaultPlayer, position: 'PG' };
    render(<PlayerSearchResult player={pointGuard} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('handles different teams', () => {
    const celticsPlayer = { ...defaultPlayer, team: 'Celtics' };
    render(<PlayerSearchResult player={celticsPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('handles different colleges', () => {
    const dukePlayer = { ...defaultPlayer, college: 'Duke' };
    render(<PlayerSearchResult player={dukePlayer} />);

    expect(screen.getByText('Duke')).toBeInTheDocument();
  });

  it('handles different heights', () => {
    const tallPlayer = { ...defaultPlayer, height: '7-0' };
    render(<PlayerSearchResult player={tallPlayer} />);

    expect(screen.getByText('7-0 • 250')).toBeInTheDocument();
  });

  it('handles different weights', () => {
    const heavyPlayer = { ...defaultPlayer, weight: '300' };
    render(<PlayerSearchResult player={heavyPlayer} />);

    expect(screen.getByText('6-9 • 300')).toBeInTheDocument();
  });

  it('handles different jersey numbers', () => {
    const numberPlayer = { ...defaultPlayer, jersey_number: '10' };
    render(<PlayerSearchResult player={numberPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });
});
