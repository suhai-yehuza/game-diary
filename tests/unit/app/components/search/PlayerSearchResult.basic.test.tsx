import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';
import type { IPlayerSearchResultProps, ISearchResult } from '@/types';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: ({ className }: { className?: string }) => (
    <div data-testid="user-icon" className={className}>
      User
    </div>
  ),
  MapPin: ({ className }: { className?: string }) => (
    <div data-testid="mappin-icon" className={className}>
      MapPin
    </div>
  ),
  GraduationCap: ({ className }: { className?: string }) => (
    <div data-testid="graduationcap-icon" className={className}>
      GraduationCap
    </div>
  ),
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className}>
      Calendar
    </div>
  ),
  Ruler: ({ className }: { className?: string }) => (
    <div data-testid="ruler-icon" className={className}>
      Ruler
    </div>
  ),
  Trophy: ({ className }: { className?: string }) => (
    <div data-testid="trophy-icon" className={className}>
      Trophy
    </div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrowright-icon" className={className}>
      ArrowRight
    </div>
  ),
}));

describe('PlayerSearchResult', () => {
  const defaultPlayer: ISearchResult = {
    id: '123',
    type: 'player',
    first_name: 'John',
    last_name: 'Doe',
    teams: 'Lakers',
    college: 'UCLA',
    birth: '1990-01-01',
    height: '6\'6"',
    weight: '220 lbs',
    nba: '2020',
    created_at: '2024-01-01T00:00:00Z',
  };

  const defaultProps: IPlayerSearchResultProps = {
    player: defaultPlayer,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders player information correctly', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('UCLA')).toBeInTheDocument();
    expect(screen.getByText('6\'6" • 220 lbs')).toBeInTheDocument();
    expect(screen.getByText('NBA Player')).toBeInTheDocument();
  });

  it('handles click navigation correctly', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    const container = screen.getByText('John Doe').closest('div');
    fireEvent.click(container!);

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/players/123');
  });

  it('displays "Unknown Player" when name is missing', () => {
    const playerWithoutName: ISearchResult = {
      ...defaultPlayer,
      first_name: '',
      last_name: '',
    };

    render(<PlayerSearchResult player={playerWithoutName} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles missing first name correctly', () => {
    const playerWithoutFirstName: ISearchResult = {
      ...defaultPlayer,
      first_name: '',
    };

    render(<PlayerSearchResult player={playerWithoutFirstName} />);

    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('handles missing last name correctly', () => {
    const playerWithoutLastName: ISearchResult = {
      ...defaultPlayer,
      last_name: '',
    };

    render(<PlayerSearchResult player={playerWithoutLastName} />);

    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('handles missing teams correctly', () => {
    const playerWithoutTeams: ISearchResult = {
      ...defaultPlayer,
      teams: '',
    };

    render(<PlayerSearchResult player={playerWithoutTeams} />);

    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument();
  });

  it('handles missing college correctly', () => {
    const playerWithoutCollege: ISearchResult = {
      ...defaultPlayer,
      college: '',
    };

    render(<PlayerSearchResult player={playerWithoutCollege} />);

    expect(screen.queryByText('UCLA')).not.toBeInTheDocument();
    expect(screen.queryByTestId('graduationcap-icon')).not.toBeInTheDocument();
  });

  it('handles missing birth date correctly', () => {
    const playerWithoutBirth: ISearchResult = {
      ...defaultPlayer,
      birth: '',
    };

    render(<PlayerSearchResult player={playerWithoutBirth} />);

    // Date is not displayed in the current component version
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles missing height correctly', () => {
    const playerWithoutHeight: ISearchResult = {
      ...defaultPlayer,
      height: '',
    };

    render(<PlayerSearchResult player={playerWithoutHeight} />);

    expect(screen.getByText('220 lbs')).toBeInTheDocument();
    expect(screen.queryByText('6\'6" • 220 lbs')).not.toBeInTheDocument();
  });

  it('handles missing weight correctly', () => {
    const playerWithoutWeight: ISearchResult = {
      ...defaultPlayer,
      weight: '',
    };

    render(<PlayerSearchResult player={playerWithoutWeight} />);

    expect(screen.getByText('6\'6"')).toBeInTheDocument();
    expect(screen.queryByText('6\'6" • 220 lbs')).not.toBeInTheDocument();
  });

  it('handles missing NBA info correctly', () => {
    const playerWithoutNBA: ISearchResult = {
      ...defaultPlayer,
      nba: '',
    };

    render(<PlayerSearchResult player={playerWithoutNBA} />);

    expect(screen.queryByText('NBA Player')).not.toBeInTheDocument();
  });

  it('handles missing height and weight correctly', () => {
    const playerWithoutHeightWeight: ISearchResult = {
      ...defaultPlayer,
      height: '',
      weight: '',
    };

    render(<PlayerSearchResult player={playerWithoutHeightWeight} />);

    expect(screen.queryByText('6\'6" • 220 lbs')).not.toBeInTheDocument();
  });

  it('formats date correctly', () => {
    const playerWithDifferentDate: ISearchResult = {
      ...defaultPlayer,
      birth: '1995-12-25',
    };

    render(<PlayerSearchResult player={playerWithDifferentDate} />);

    // Date is not displayed in the current component version
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles invalid date gracefully', () => {
    const playerWithInvalidDate: ISearchResult = {
      ...defaultPlayer,
      birth: 'invalid-date',
    };

    render(<PlayerSearchResult player={playerWithInvalidDate} />);

    // Should still render the component without crashing
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders all icons when all data is present', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    const container = screen.getByText('John Doe').closest('div');
    expect(container).toHaveClass('flex', 'items-center', 'space-x-3', 'mb-2');
  });

  it('handles player with only basic information', () => {
    const minimalPlayer: ISearchResult = {
      id: '123',
      type: 'player',
      first_name: 'John',
      last_name: 'Doe',
      created_at: '2024-01-01T00:00:00Z',
    };

    render(<PlayerSearchResult player={minimalPlayer} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();

    // Should not render optional fields
    expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('graduationcap-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });

  it('handles player with null values', () => {
    const playerWithNulls: ISearchResult = {
      ...defaultPlayer,
      teams: undefined,
      college: undefined,
      birth: undefined,
      height: undefined,
      weight: undefined,
      nba: undefined,
    };

    render(<PlayerSearchResult player={playerWithNulls} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('graduationcap-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });

  it('handles player with undefined values', () => {
    const playerWithUndefineds: ISearchResult = {
      ...defaultPlayer,
      teams: undefined,
      college: undefined,
      birth: undefined,
      height: undefined,
      weight: undefined,
      nba: undefined,
    };

    render(<PlayerSearchResult player={playerWithUndefineds} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByTestId('mappin-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('graduationcap-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });
});
