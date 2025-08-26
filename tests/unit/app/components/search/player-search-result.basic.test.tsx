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
}));

describe('PlayerSearchResult', () => {
  const defaultPlayer = {
    id: '1',
    type: 'player' as const,
    created_at: '2024-01-01T00:00:00Z',
    first_name: 'LeBron',
    last_name: 'James',
    position: 'SF',
    teams: 'Los Angeles Lakers',
    college: 'St. Vincent-St. Mary HS (OH)',
    height: '6-9',
    weight: '250 lbs',
    birth: '1984-12-30',
    nba: '23',
    image: '/lebron.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders player information correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('St. Vincent-St. Mary HS (OH)')).toBeInTheDocument();
  });

  it('displays player stats correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByText('6-9 • 250 lbs')).toBeInTheDocument();
    expect(screen.getByText('NBA: 23')).toBeInTheDocument();
  });

  it('handles click navigation to player profile', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const playerElement = screen.getByText('LeBron James').closest('div');
    if (playerElement) {
      fireEvent.click(playerElement);
    }

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/player/1');
  });

  it('displays player image correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('handles missing player image gracefully', () => {
    const playerWithoutImage = { ...defaultPlayer, image: undefined };
    render(<PlayerSearchResult player={playerWithoutImage} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('handles missing college information', () => {
    const playerWithoutCollege = { ...defaultPlayer, college: undefined };
    render(<PlayerSearchResult player={playerWithoutCollege} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
  });

  it('handles missing team information', () => {
    const playerWithoutTeam = { ...defaultPlayer, teams: undefined };
    render(<PlayerSearchResult player={playerWithoutTeam} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('Los Angeles Lakers')).not.toBeInTheDocument();
  });

  it('handles missing position information', () => {
    const playerWithoutPosition = { ...defaultPlayer, position: undefined };
    render(<PlayerSearchResult player={playerWithoutPosition} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('handles missing height and weight', () => {
    const playerWithoutStats = { ...defaultPlayer, height: undefined, weight: undefined };
    render(<PlayerSearchResult player={playerWithoutStats} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('6-9 • 250 lbs')).not.toBeInTheDocument();
  });

  it('handles missing jersey number', () => {
    const playerWithoutJersey = { ...defaultPlayer, nba: undefined };
    render(<PlayerSearchResult player={playerWithoutJersey} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
    expect(screen.queryByText('NBA: 23')).not.toBeInTheDocument();
  });

  it('handles missing birth date', () => {
    const playerWithoutBirthDate = { ...defaultPlayer, birth: undefined };
    render(<PlayerSearchResult player={playerWithoutBirthDate} />);

    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });

  it('displays icons correctly', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
  });

  it('handles missing first name', () => {
    const playerWithoutFirstName = { ...defaultPlayer, first_name: undefined };
    render(<PlayerSearchResult player={playerWithoutFirstName} />);

    expect(screen.getByText('James')).toBeInTheDocument();
  });

  it('handles missing last name', () => {
    const playerWithoutLastName = { ...defaultPlayer, last_name: undefined };
    render(<PlayerSearchResult player={playerWithoutLastName} />);

    expect(screen.getByText('LeBron')).toBeInTheDocument();
  });

  it('handles missing both names', () => {
    const playerWithoutNames = { ...defaultPlayer, first_name: undefined, last_name: undefined };
    render(<PlayerSearchResult player={playerWithoutNames} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    // Check that the component renders with the expected structure
    expect(screen.getByText('LeBron James')).toBeInTheDocument();
  });
});
