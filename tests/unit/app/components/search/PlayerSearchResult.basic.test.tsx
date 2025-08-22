import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

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
  Calendar: ({ className, ...props }: any) => (
    <div data-testid="calendar-icon" className={className} {...props}>
      Calendar
    </div>
  ),
  GraduationCap: ({ className, ...props }: any) => (
    <div data-testid="graduationcap-icon" className={className} {...props}>
      GraduationCap
    </div>
  ),
  MapPin: ({ className, ...props }: any) => (
    <div data-testid="mappin-icon" className={className} {...props}>
      MapPin
    </div>
  ),
  User: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props}>
      User
    </div>
  ),
}));

describe('PlayerSearchResult', () => {
  const mockPlayer = {
    id: 'player-1',
    type: 'player' as const,
    created_at: '2024-01-01T00:00:00Z',
    first_name: 'LeBron',
    last_name: 'James',
    teams: 'Los Angeles Lakers',
    college: 'St. Vincent-St. Mary High School',
    birth: '1984-12-30T00:00:00Z',
    height: '6\'9"',
    weight: '250 lbs',
    nba: '20',
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders player information correctly', () => {
    render(<PlayerSearchResult player={mockPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary High School')).toBeInTheDocument();
    expect(screen.getByText(/Dec 30, 1984/)).toBeInTheDocument();
    expect(screen.getByText('6\'9" • 250 lbs')).toBeInTheDocument();
    expect(screen.getByText('NBA: 20')).toBeInTheDocument();
  });

  it('handles player with missing first name', () => {
    const playerWithoutFirstName = {
      ...mockPlayer,
      first_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutFirstName} />);

    expect(screen.getByText('James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('handles player with missing last name', () => {
    const playerWithoutLastName = {
      ...mockPlayer,
      last_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutLastName} />);

    expect(screen.getByText('LeBron')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
  });

  it('handles player with no name', () => {
    const playerWithoutName = {
      ...mockPlayer,
      first_name: undefined,
      last_name: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutName} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles player with empty string names', () => {
    const playerWithEmptyNames = {
      ...mockPlayer,
      first_name: '',
      last_name: '',
    };

    render(<PlayerSearchResult player={playerWithEmptyNames} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles player without teams information', () => {
    const playerWithoutTeams = {
      ...mockPlayer,
      teams: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutTeams} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary High School')).toBeInTheDocument();
    expect(screen.getByText(/Dec 30, 1984/)).toBeInTheDocument();
  });

  it('handles player without college information', () => {
    const playerWithoutCollege = {
      ...mockPlayer,
      college: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutCollege} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText(/Dec 30, 1984/)).toBeInTheDocument();
  });

  it('handles player without birth date', () => {
    const playerWithoutBirth = {
      ...mockPlayer,
      birth: undefined,
    };

    render(<PlayerSearchResult player={playerWithoutBirth} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary High School')).toBeInTheDocument();
  });

  it('formats birth date correctly', () => {
    render(<PlayerSearchResult player={mockPlayer} />);

    expect(screen.getByText(/Dec 30, 1984/)).toBeInTheDocument();
  });

  it('navigates to player page when clicked', () => {
    render(<PlayerSearchResult player={mockPlayer} />);

    const playerCard = screen.getByText('LeBron James').closest('div');
    expect(playerCard).toBeInTheDocument();

    if (playerCard) {
      playerCard.click();
      expect(mockPush).toHaveBeenCalledWith('/sports/nba/player/player-1');
    }
  });

  it('has correct styling classes', () => {
    const { container } = render(<PlayerSearchResult player={mockPlayer} />);

    const playerCard = container.firstChild as HTMLElement;
    expect(playerCard).toHaveClass(
      'flex',
      'items-center',
      'space-x-4',
      'p-4',
      'bg-neutral-50',
      'border',
      'rounded-lg',
      'hover:bg-neutral-100',
      'transition-colors',
      'cursor-pointer'
    );
  });

  it('displays all icons when all data is present', () => {
    const { container } = render(<PlayerSearchResult player={mockPlayer} />);

    // Check for all the expected icons
    expect(container.querySelector('[data-testid="user-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="mappin-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="graduationcap-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="calendar-icon"]')).toBeInTheDocument();
  });
});
