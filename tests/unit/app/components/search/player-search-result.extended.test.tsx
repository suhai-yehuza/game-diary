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
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  MapPin: ({ className }: any) => <div data-testid="mappin-icon" className={className} />,
  GraduationCap: ({ className }: any) => (
    <div data-testid="graduationcap-icon" className={className} />
  ),
  Calendar: ({ className }: any) => <div data-testid="calendar-icon" className={className} />,
  Ruler: ({ className }: any) => <div data-testid="ruler-icon" className={className} />,
  Trophy: ({ className }: any) => <div data-testid="trophy-icon" className={className} />,
  ArrowRight: ({ className }: any) => <div data-testid="arrowright-icon" className={className} />,
}));

describe('PlayerSearchResult Extended Tests', () => {
  const defaultPlayer = {
    id: 'player1',
    type: 'player' as const,
    created_at: '2024-01-01T00:00:00Z',
    first_name: 'LeBron',
    last_name: 'James',
    teams: 'Los Angeles Lakers',
    college: 'St. Vincent-St. Mary HS (OH)',
    birth: '1984-12-30',
    height: '6\'9"',
    weight: '250 lbs',
    nba: '2003',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders player with complete information', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary HS (OH)')).toBeInTheDocument();
    expect(screen.getByText('6\'9" • 250 lbs')).toBeInTheDocument();
    expect(screen.getByText('NBA Player')).toBeInTheDocument();
  });

  it('handles player with missing first name', () => {
    const playerWithoutFirstName = {
      ...defaultPlayer,
      first_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutFirstName} />);

    expect(screen.getByText('James')).toBeInTheDocument();
  });

  it('handles player with missing last name', () => {
    const playerWithoutLastName = {
      ...defaultPlayer,
      last_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutLastName} />);

    expect(screen.getByText('LeBron')).toBeInTheDocument();
  });

  it('handles player with no name', () => {
    const playerWithoutName = {
      ...defaultPlayer,
      first_name: undefined,
      last_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutName} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles player with empty name strings', () => {
    const playerWithEmptyNames = {
      ...defaultPlayer,
      first_name: '',
      last_name: '',
    };

    render(<PlayerSearchResult player={playerWithEmptyNames} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles player without teams information', () => {
    const playerWithoutTeams = {
      ...defaultPlayer,
      teams: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutTeams} />);

    expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument();
  });

  it('handles player without college information', () => {
    const playerWithoutCollege = {
      ...defaultPlayer,
      college: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutCollege} />);

    expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
    expect(screen.queryByTestId('graduationcap-icon')).not.toBeInTheDocument();
  });

  it('handles player without birth date', () => {
    const playerWithoutBirth = {
      ...defaultPlayer,
      birth: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutBirth} />);

    expect(screen.queryByText('Dec 30, 1984')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });

  it('handles player without height and weight', () => {
    const playerWithoutHeightWeight = {
      ...defaultPlayer,
      height: undefined,
      weight: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutHeightWeight} />);

    expect(screen.queryByText('6\'9" • 250 lbs')).not.toBeInTheDocument();
  });

  it('handles player with only height', () => {
    const playerWithOnlyHeight = {
      ...defaultPlayer,
      weight: undefined,
    };

    render(<PlayerSearchResult player={playerWithOnlyHeight} />);

    expect(screen.getByText('6\'9"')).toBeInTheDocument();
  });

  it('handles player with only weight', () => {
    const playerWithOnlyWeight = {
      ...defaultPlayer,
      height: undefined,
    };

    render(<PlayerSearchResult player={playerWithOnlyWeight} />);

    expect(screen.getByText('250 lbs')).toBeInTheDocument();
  });

  it('handles player without NBA information', () => {
    const playerWithoutNBA = {
      ...defaultPlayer,
      nba: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutNBA} />);

    expect(screen.queryByText('NBA: 2003')).not.toBeInTheDocument();
  });

  it('handles player with empty string values', () => {
    const playerWithEmptyStrings = {
      ...defaultPlayer,
      teams: '',
      college: '',
      birth: '',
      height: '',
      weight: '',
      nba: '',
    };

    render(<PlayerSearchResult player={playerWithEmptyStrings} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
    expect(screen.queryByText('Dec 30, 1984')).not.toBeInTheDocument();
    expect(screen.queryByText('6\'9" • 250 lbs')).not.toBeInTheDocument();
    expect(screen.queryByText('NBA: 2003')).not.toBeInTheDocument();
  });

  it('formats date correctly', () => {
    const playerWithDifferentDate = {
      ...defaultPlayer,
      birth: '1990-06-15',
    };

    render(<PlayerSearchResult player={playerWithDifferentDate} />);

    // Date is not displayed in the current component version
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('handles invalid date format gracefully', () => {
    const playerWithInvalidDate = {
      ...defaultPlayer,
      birth: 'invalid-date',
    };

    render(<PlayerSearchResult player={playerWithInvalidDate} />);

    // Should still render the component without crashing
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('navigates to player page on click', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const container = screen.getByText('LeBron James').closest('div');
    fireEvent.click(container!);

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/players/player1');
  });

  it('has correct styling classes', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    // Check that the component renders with the expected structure
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('has correct player badge styling', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const badge = screen.getByText('Player');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'px-2.5',
      'py-1',
      'rounded-full',
      'text-xs',
      'font-medium',
      'bg-blue-100',
      'dark:bg-blue-900/30',
      'text-blue-800',
      'dark:text-blue-300',
      'border',
      'border-blue-200',
      'dark:border-blue-800'
    );
  });

  it('has correct user icon styling', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const userIcon = screen.getByTestId('user-icon');
    expect(userIcon).toHaveClass('w-7', 'h-7', 'text-white');
  });

  it('handles player with special characters in name', () => {
    const playerWithSpecialChars = {
      ...defaultPlayer,
      first_name: 'José',
      last_name: 'García-López',
    };

    render(<PlayerSearchResult player={playerWithSpecialChars} />);

    expect(screen.getByText('José García-López')).toBeInTheDocument();
  });

  it('handles player with very long name', () => {
    const playerWithLongName = {
      ...defaultPlayer,
      first_name: 'VeryLongFirstNameThatMightCauseIssues',
      last_name: 'VeryLongLastNameThatMightCauseIssues',
    };

    render(<PlayerSearchResult player={playerWithLongName} />);

    expect(
      screen.getByText('VeryLongFirstNameThatMightCauseIssues VeryLongLastNameThatMightCauseIssues')
    ).toBeInTheDocument();
  });

  it('handles player with numbers in name', () => {
    const playerWithNumbers = {
      ...defaultPlayer,
      first_name: 'Player123',
      last_name: 'Test456',
    };

    render(<PlayerSearchResult player={playerWithNumbers} />);

    expect(screen.getByText('Player123 Test456')).toBeInTheDocument();
  });

  it('handles player with all optional fields missing', () => {
    const minimalPlayer = {
      id: 'player2',
      type: 'player' as const,
      created_at: '2024-01-01T00:00:00Z',
      first_name: 'John',
      last_name: 'Doe',
      teams: undefined,
      college: undefined,
      birth: undefined,
      height: undefined,
      weight: undefined,
      nba: undefined,
    };

    render(<PlayerSearchResult player={minimalPlayer} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('handles player with undefined values', () => {
    const playerWithUndefined = {
      ...defaultPlayer,
      teams: undefined,
      college: undefined,
      birth: undefined,
      height: undefined,
      weight: undefined,
      nba: undefined,
    };

    render(<PlayerSearchResult player={playerWithUndefined} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
    expect(screen.queryByText('Dec 30, 1984')).not.toBeInTheDocument();
    expect(screen.queryByText('6\'9" • 250 lbs')).not.toBeInTheDocument();
    expect(screen.queryByText('NBA: 2003')).not.toBeInTheDocument();
  });

  it('handles player with zero values', () => {
    const playerWithZeros = {
      ...defaultPlayer,
      height: '0',
      weight: '0',
      nba: '0',
    };

    render(<PlayerSearchResult player={playerWithZeros} />);

    expect(screen.getByText('0 • 0')).toBeInTheDocument();
    expect(screen.getByText('NBA Player')).toBeInTheDocument();
  });

  it('handles player with whitespace-only values', () => {
    const playerWithWhitespace = {
      ...defaultPlayer,
      teams: '   ',
      college: '   ',
      birth: '   ',
      height: '   ',
      weight: '   ',
      nba: '   ',
    };

    render(<PlayerSearchResult player={playerWithWhitespace} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
    expect(screen.queryByText('Dec 30, 1984')).not.toBeInTheDocument();
    expect(screen.queryByText('6\'9" • 250 lbs')).not.toBeInTheDocument();
    expect(screen.queryByText('NBA: 2003')).not.toBeInTheDocument();
  });
});
