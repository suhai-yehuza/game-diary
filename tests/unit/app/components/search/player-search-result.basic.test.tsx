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

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    ui: vi.fn(),
  },
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
    expect(screen.getByText('NBA Player')).toBeInTheDocument();
  });

  it('handles click navigation to player profile', () => {
    render(<PlayerSearchResult player={defaultPlayer} />);

    const playerElement = screen.getByText('LeBron James').closest('div');
    if (playerElement) {
      fireEvent.click(playerElement);
    }

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/players/1');
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
    expect(screen.queryByText('NBA Player')).not.toBeInTheDocument();
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

  // Enhanced tests for height parsing
  describe('height parsing', () => {
    it('handles height as JSON string with feet and inches', () => {
      const playerWithJsonHeight = {
        ...defaultPlayer,
        height: '{"feets": 6, "inches": 9}',
      };
      render(<PlayerSearchResult player={playerWithJsonHeight} />);

      expect(screen.getByText('6\'9" • 250 lbs')).toBeInTheDocument();
    });

    it('handles height as JSON string with meters', () => {
      const playerWithMetersHeight = {
        ...defaultPlayer,
        height: '{"meters": 2.06}',
      };
      render(<PlayerSearchResult player={playerWithMetersHeight as any} />);

      expect(screen.getByText('2.06m • 250 lbs')).toBeInTheDocument();
    });

    it('handles height as object with feet and inches', () => {
      const playerWithObjectHeight = {
        ...defaultPlayer,
        height: { feets: 6, inches: 9 },
      };
      render(<PlayerSearchResult player={playerWithObjectHeight as any} />);

      expect(screen.getByText('6\'9" • 250 lbs')).toBeInTheDocument();
    });

    it('handles height as object with meters', () => {
      const playerWithObjectMetersHeight = {
        ...defaultPlayer,
        height: { meters: 2.06 },
      };
      render(<PlayerSearchResult player={playerWithObjectMetersHeight as any} />);

      expect(screen.getByText('2.06m • 250 lbs')).toBeInTheDocument();
    });

    it('handles height as direct properties', () => {
      const playerWithDirectHeight = {
        ...defaultPlayer,
        feets: 6,
        inches: 9,
      };
      render(<PlayerSearchResult player={playerWithDirectHeight} />);

      expect(screen.getByText('6\'9" • 250 lbs')).toBeInTheDocument();
    });

    it('handles height as direct meters property', () => {
      const playerWithDirectMeters = {
        ...defaultPlayer,
        meters: 2.06,
      };
      render(<PlayerSearchResult player={playerWithDirectMeters} />);

      expect(screen.getByText('2.06m • 250 lbs')).toBeInTheDocument();
    });

    it('handles invalid JSON height gracefully', () => {
      const playerWithInvalidJsonHeight = {
        ...defaultPlayer,
        height: '{"invalid": "json"',
      };
      render(<PlayerSearchResult player={playerWithInvalidJsonHeight} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('handles null height', () => {
      const playerWithNullHeight = {
        ...defaultPlayer,
        height: null,
      };
      render(<PlayerSearchResult player={playerWithNullHeight as any} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  // Enhanced tests for weight parsing
  describe('weight parsing', () => {
    it('handles weight as JSON string with pounds', () => {
      const playerWithJsonWeight = {
        ...defaultPlayer,
        weight: '{"pounds": 250}',
      };
      render(<PlayerSearchResult player={playerWithJsonWeight} />);

      expect(screen.getByText('6-9 • 250 lbs')).toBeInTheDocument();
    });

    it('handles weight as JSON string with kilograms', () => {
      const playerWithKgWeight = {
        ...defaultPlayer,
        weight: '{"kilograms": 113}',
      };
      render(<PlayerSearchResult player={playerWithKgWeight} />);

      expect(screen.getByText('6-9 • 113 kg')).toBeInTheDocument();
    });

    it('handles weight as object with pounds', () => {
      const playerWithObjectWeight = {
        ...defaultPlayer,
        weight: { pounds: 250 },
      };
      render(<PlayerSearchResult player={playerWithObjectWeight as any} />);

      expect(screen.getByText('6-9 • 250 lbs')).toBeInTheDocument();
    });

    it('handles weight as object with kilograms', () => {
      const playerWithObjectKgWeight = {
        ...defaultPlayer,
        weight: { kilograms: 113 },
      };
      render(<PlayerSearchResult player={playerWithObjectKgWeight as any} />);

      expect(screen.getByText('6-9 • 113 kg')).toBeInTheDocument();
    });

    it('handles weight as direct properties', () => {
      const playerWithDirectWeight = {
        ...defaultPlayer,
        pounds: 250,
      };
      render(<PlayerSearchResult player={playerWithDirectWeight} />);

      expect(screen.getByText('6-9 • 250 lbs')).toBeInTheDocument();
    });

    it('handles weight as direct kilograms property', () => {
      const playerWithDirectKg = {
        ...defaultPlayer,
        kilograms: 113,
      };
      render(<PlayerSearchResult player={playerWithDirectKg} />);

      expect(screen.getByText('6-9 • 113 kg')).toBeInTheDocument();
    });

    it('handles invalid JSON weight gracefully', () => {
      const playerWithInvalidJsonWeight = {
        ...defaultPlayer,
        weight: '{"invalid": "json"',
      };
      render(<PlayerSearchResult player={playerWithInvalidJsonWeight} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('handles null weight', () => {
      const playerWithNullWeight = {
        ...defaultPlayer,
        weight: null,
      };
      render(<PlayerSearchResult player={playerWithNullWeight as any} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  // Enhanced tests for teams parsing
  describe('teams parsing', () => {
    it('handles teams as JSON string array', () => {
      const playerWithJsonTeams = {
        ...defaultPlayer,
        teams: '[{"team_name": "Los Angeles Lakers"}, {"team_name": "Miami Heat"}]',
      };
      render(<PlayerSearchResult player={playerWithJsonTeams} />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('handles teams as JSON string array with name property', () => {
      const playerWithJsonTeamsName = {
        ...defaultPlayer,
        teams: '[{"name": "Los Angeles Lakers"}, {"name": "Miami Heat"}]',
      };
      render(<PlayerSearchResult player={playerWithJsonTeamsName} />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('handles teams as direct array', () => {
      const playerWithArrayTeams = {
        ...defaultPlayer,
        teams: [{ team_name: 'Los Angeles Lakers' }, { team_name: 'Miami Heat' }],
      };
      render(<PlayerSearchResult player={playerWithArrayTeams as any} />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('handles teams as direct array with name property', () => {
      const playerWithArrayTeamsName = {
        ...defaultPlayer,
        teams: [{ name: 'Los Angeles Lakers' }, { name: 'Miami Heat' }],
      };
      render(<PlayerSearchResult player={playerWithArrayTeamsName as any} />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('handles teams as simple string', () => {
      const playerWithStringTeams = {
        ...defaultPlayer,
        teams: 'Los Angeles Lakers',
      };
      render(<PlayerSearchResult player={playerWithStringTeams} />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    });

    it('handles invalid JSON teams gracefully', () => {
      const playerWithInvalidJsonTeams = {
        ...defaultPlayer,
        teams: '[{"invalid": "json"',
      };
      render(<PlayerSearchResult player={playerWithInvalidJsonTeams} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });

    it('handles teams with unknown team names', () => {
      const playerWithUnknownTeams = {
        ...defaultPlayer,
        teams: '[{"invalid": "data"}]',
      };
      render(<PlayerSearchResult player={playerWithUnknownTeams} />);

      expect(screen.getByText('Unknown Team')).toBeInTheDocument();
    });

    it('handles null teams', () => {
      const playerWithNullTeams = {
        ...defaultPlayer,
        teams: null,
      };
      render(<PlayerSearchResult player={playerWithNullTeams as any} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
    });
  });

  // Enhanced tests for NBA status
  describe('NBA status', () => {
    it('handles NBA status as object with start year', () => {
      const playerWithNbaObject = {
        ...defaultPlayer,
        nba: { start: 2003 },
      };
      render(<PlayerSearchResult player={playerWithNbaObject as any} />);

      expect(screen.getByText('NBA 2003+')).toBeInTheDocument();
    });

    it('handles NBA status as string', () => {
      const playerWithNbaString = {
        ...defaultPlayer,
        nba: '23',
      };
      render(<PlayerSearchResult player={playerWithNbaString} />);

      expect(screen.getByText('NBA Player')).toBeInTheDocument();
    });

    it('handles NBA status as number', () => {
      const playerWithNbaNumber = {
        ...defaultPlayer,
        nba: 23,
      };
      render(<PlayerSearchResult player={playerWithNbaNumber as any} />);

      expect(screen.getByText('NBA Player')).toBeInTheDocument();
    });
  });

  // Enhanced tests for college handling
  describe('college handling', () => {
    it('handles missing-college value', () => {
      const playerWithMissingCollege = {
        ...defaultPlayer,
        college: 'missing-college',
      };
      render(<PlayerSearchResult player={playerWithMissingCollege} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('missing-college')).not.toBeInTheDocument();
    });

    it('handles null college', () => {
      const playerWithNullCollege = {
        ...defaultPlayer,
        college: null,
      };
      render(<PlayerSearchResult player={playerWithNullCollege as any} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('St. Vincent-St. Mary HS (OH)')).not.toBeInTheDocument();
    });
  });

  // Enhanced tests for physical stats display
  describe('physical stats display', () => {
    it('handles null height and weight combination', () => {
      const playerWithNullStats = {
        ...defaultPlayer,
        height: null,
        weight: null,
      };
      render(<PlayerSearchResult player={playerWithNullStats as any} />);

      expect(screen.getByText('LeBron James')).toBeInTheDocument();
      expect(screen.queryByText('null • null')).not.toBeInTheDocument();
    });

    it('shows physical stats available message when raw data exists', () => {
      const playerWithRawStats = {
        ...defaultPlayer,
        height: '{"invalid": "data"}',
        weight: '{"invalid": "data"}',
      };
      render(<PlayerSearchResult player={playerWithRawStats} />);

      expect(screen.getByText('Physical stats available')).toBeInTheDocument();
    });

    it('shows multiple teams message when raw teams data exists', () => {
      const playerWithRawTeams = {
        ...defaultPlayer,
        teams: '[{"team_name": "Lakers"}, {"team_name": "Heat"}]',
      };
      render(<PlayerSearchResult player={playerWithRawTeams} />);

      expect(screen.getByText('Lakers')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });
  });
});
