import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi } from 'vitest';

import { PlayerSearchResult } from '@/app/components/search/PlayerSearchResult';
import type { IPlayerSearchResultProps } from '@/lib/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  User: ({ className }: any) => <div data-testid="user-icon" className={className} />,
  MapPin: ({ className }: any) => <div data-testid="map-pin-icon" className={className} />,
  GraduationCap: ({ className }: any) => (
    <div data-testid="graduationcap-icon" className={className} />
  ),
  Calendar: ({ className }: any) => <div data-testid="calendar-icon" className={className} />,
  ArrowRight: ({ className }: any) => <div data-testid="arrow-right-icon" className={className} />,
}));

describe('PlayerSearchResult Extended', () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    mockPush.mockClear();
  });

  const defaultProps: IPlayerSearchResultProps = {
    player: {
      id: 'player-1',
      type: 'player',
      first_name: 'John',
      last_name: 'Doe',
      teams: 'Lakers',
      college: 'UCLA',
      birth: '1990-01-01',
      height: '6-6',
      weight: '220',
      nba: '5 years',
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  it('handles click events correctly', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    const container = screen.getByText('John Doe').closest('div');
    fireEvent.click(container!);

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/player/player-1');
  });

  it('displays all player information correctly', () => {
    render(<PlayerSearchResult {...defaultProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('UCLA')).toBeInTheDocument();
    expect(screen.getByText('6-6 • 220')).toBeInTheDocument();
    expect(screen.getByText('NBA: 5 years')).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const propsWithMissingData = {
      player: {
        ...defaultProps.player,
        teams: undefined,
        college: undefined,
        birth: undefined,
        height: undefined,
        weight: undefined,
        nba: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithMissingData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('UCLA')).not.toBeInTheDocument();
    expect(screen.queryByText('6-6 • 220')).not.toBeInTheDocument();
    expect(screen.queryByText('NBA:')).not.toBeInTheDocument();
  });

  it('handles empty string values', () => {
    const propsWithEmptyStrings = {
      player: {
        ...defaultProps.player,
        teams: '',
        college: '',
        height: '',
        weight: '',
        nba: '',
      },
    };

    render(<PlayerSearchResult {...propsWithEmptyStrings} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('UCLA')).not.toBeInTheDocument();
  });

  it('handles null values', () => {
    const propsWithNullValues = {
      player: {
        ...defaultProps.player,
        teams: undefined,
        college: undefined,
        birth: undefined,
        height: undefined,
        weight: undefined,
        nba: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithNullValues} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('UCLA')).not.toBeInTheDocument();
  });

  it('renders with different team data', () => {
    const propsWithDifferentTeam = {
      player: {
        ...defaultProps.player,
        teams: 'Celtics',
      },
    };

    render(<PlayerSearchResult {...propsWithDifferentTeam} />);

    expect(screen.getByText('Celtics')).toBeInTheDocument();
  });

  it('handles different colleges', () => {
    const colleges = ['Duke', 'Kentucky', 'North Carolina', 'Kansas'];

    colleges.forEach(college => {
      const propsWithCollege = {
        player: {
          ...defaultProps.player,
          college,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithCollege} />);
      expect(screen.getByText(college)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different heights', () => {
    const heights = ['5-8', '6-0', '7-2', '6-11'];

    heights.forEach(height => {
      const propsWithHeight = {
        player: {
          ...defaultProps.player,
          height,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithHeight} />);
      expect(screen.getByText(new RegExp(height))).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different weights', () => {
    const weights = ['180', '250', '300'];

    weights.forEach(weight => {
      const propsWithWeight = {
        player: {
          ...defaultProps.player,
          weight,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithWeight} />);
      expect(screen.getByText(new RegExp(weight))).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different NBA experience', () => {
    const nbaExperiences = ['1 year', '3 years', '10 years', 'Rookie'];

    nbaExperiences.forEach(experience => {
      const propsWithExperience = {
        player: {
          ...defaultProps.player,
          nba: experience,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithExperience} />);
      expect(screen.getByText(`NBA: ${experience}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different birth dates', () => {
    const birthDates = ['1985-12-25', '1995-06-15', '2000-03-10'];

    birthDates.forEach(date => {
      const propsWithBirthDate = {
        player: {
          ...defaultProps.player,
          birth: date,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithBirthDate} />);
      // The component should display the formatted date
      expect(
        screen.getByText(
          new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          })
        )
      ).toBeInTheDocument();
      unmount();
    });
  });

  it('handles players with only first name', () => {
    const propsWithOnlyFirstName = {
      player: {
        ...defaultProps.player,
        last_name: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithOnlyFirstName} />);

    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('handles players with only last name', () => {
    const propsWithOnlyLastName = {
      player: {
        ...defaultProps.player,
        first_name: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithOnlyLastName} />);

    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('handles players with no name', () => {
    const propsWithNoName = {
      player: {
        ...defaultProps.player,
        first_name: undefined,
        last_name: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithNoName} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });

  it('handles height and weight combinations', () => {
    const combinations = [
      { height: '6-6', weight: '220' },
      { height: '7-0', weight: '250' },
      { height: '5-10', weight: '180' },
    ];

    combinations.forEach(({ height, weight }) => {
      const propsWithCombination = {
        player: {
          ...defaultProps.player,
          height,
          weight,
        },
      };

      const { unmount } = render(<PlayerSearchResult {...propsWithCombination} />);
      expect(screen.getByText(`${height} • ${weight}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles only height without weight', () => {
    const propsWithOnlyHeight = {
      player: {
        ...defaultProps.player,
        weight: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithOnlyHeight} />);

    expect(screen.getByText('6-6')).toBeInTheDocument();
    // The bullet point might still appear in other contexts, so we check for the combined text
    expect(screen.queryByText('6-6 • 220')).not.toBeInTheDocument();
  });

  it('handles only weight without height', () => {
    const propsWithOnlyWeight = {
      player: {
        ...defaultProps.player,
        height: undefined,
      },
    };

    render(<PlayerSearchResult {...propsWithOnlyWeight} />);

    expect(screen.getByText('220')).toBeInTheDocument();
    // The bullet point might still appear in other contexts, so we check for the combined text
    expect(screen.queryByText('6-6 • 220')).not.toBeInTheDocument();
  });
});
