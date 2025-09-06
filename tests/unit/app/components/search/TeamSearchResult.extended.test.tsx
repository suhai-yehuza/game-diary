import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { describe, it, expect, vi } from 'vitest';

import { TeamSearchResult } from '@/app/components/search/TeamSearchResult';
import type { ITeamSearchResultProps } from '@/types';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Building2: ({ className }: any) => <div data-testid="building-icon" className={className} />,
  MapPin: ({ className }: any) => <div data-testid="map-pin-icon" className={className} />,
  ArrowRight: ({ className }: any) => <div data-testid="arrow-right-icon" className={className} />,
  Star: ({ className }: any) => <div data-testid="star-icon" className={className} />,
  Trophy: ({ className }: any) => <div data-testid="trophy-icon" className={className} />,
}));

describe('TeamSearchResult Extended', () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    mockPush.mockClear();
  });

  const defaultProps: ITeamSearchResultProps = {
    team: {
      id: 'team-1',
      type: 'team',
      name: 'Los Angeles Lakers',
      nickname: 'Lakers',
      city: 'Los Angeles',
      state: 'CA',
      conference: 'Western',
      division: 'Pacific',
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  it('handles click events correctly', () => {
    render(<TeamSearchResult {...defaultProps} />);

    const container = screen.getByText('Los Angeles Lakers').closest('div');
    fireEvent.click(container!);

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/teams/team-1');
  });

  it('displays all team information correctly', () => {
    render(<TeamSearchResult {...defaultProps} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Lakers')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('Western • Pacific')).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const propsWithMissingData = {
      team: {
        ...defaultProps.team,
        nickname: undefined,
        city: undefined,
        state: undefined,
        conference: undefined,
        division: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithMissingData} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('Los Angeles, CA')).not.toBeInTheDocument();
    expect(screen.queryByText('Western • Pacific')).not.toBeInTheDocument();
  });

  it('handles empty string values', () => {
    const propsWithEmptyStrings = {
      team: {
        ...defaultProps.team,
        nickname: '',
        city: '',
        state: '',
      },
    };

    render(<TeamSearchResult {...propsWithEmptyStrings} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('Los Angeles, CA')).not.toBeInTheDocument();
  });

  it('handles null values', () => {
    const propsWithNullValues = {
      team: {
        ...defaultProps.team,
        nickname: undefined,
        city: undefined,
        state: undefined,
        conference: undefined,
        division: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithNullValues} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
    expect(screen.queryByText('Los Angeles, CA')).not.toBeInTheDocument();
    expect(screen.queryByText('Western • Pacific')).not.toBeInTheDocument();
  });

  it('renders with different team data', () => {
    const propsWithDifferentTeam = {
      team: {
        ...defaultProps.team,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        city: 'Boston',
        state: 'MA',
        conference: 'Eastern',
        division: 'Atlantic',
      },
    };

    render(<TeamSearchResult {...propsWithDifferentTeam} />);

    expect(screen.getByText('Boston Celtics')).toBeInTheDocument();
    expect(screen.getByText('Celtics')).toBeInTheDocument();
    expect(screen.getByText('Boston, MA')).toBeInTheDocument();
    expect(screen.getByText('Eastern • Atlantic')).toBeInTheDocument();
  });

  it('handles different conferences', () => {
    const conferences = ['Eastern', 'Western'];

    conferences.forEach(conference => {
      const propsWithConference = {
        team: {
          ...defaultProps.team,
          conference,
        },
      };

      const { unmount } = render(<TeamSearchResult {...propsWithConference} />);
      expect(screen.getByText(new RegExp(conference))).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different divisions', () => {
    const divisions = ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'];

    divisions.forEach(division => {
      const propsWithDivision = {
        team: {
          ...defaultProps.team,
          division,
        },
      };

      const { unmount } = render(<TeamSearchResult {...propsWithDivision} />);
      expect(screen.getByText(new RegExp(division))).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different nicknames', () => {
    const nicknames = ['Lakers', 'Celtics', 'Warriors', 'Heat', 'Knicks'];

    nicknames.forEach(nickname => {
      const propsWithNickname = {
        team: {
          ...defaultProps.team,
          nickname,
        },
      };

      const { unmount } = render(<TeamSearchResult {...propsWithNickname} />);
      expect(screen.getByText(nickname)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles different cities and states', () => {
    const cityStatePairs = [
      { city: 'New York', state: 'NY' },
      { city: 'Miami', state: 'FL' },
      { city: 'Golden State', state: 'CA' },
      { city: 'Chicago', state: 'IL' },
    ];

    cityStatePairs.forEach(({ city, state }) => {
      const propsWithCityState = {
        team: {
          ...defaultProps.team,
          city,
          state,
        },
      };

      const { unmount } = render(<TeamSearchResult {...propsWithCityState} />);
      expect(screen.getByText(`${city}, ${state}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles teams with same city and state', () => {
    const propsWithSameLocation = {
      team: {
        ...defaultProps.team,
        city: 'Los Angeles',
        state: 'CA',
      },
    };

    render(<TeamSearchResult {...propsWithSameLocation} />);

    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
  });

  it('handles teams with different city and state', () => {
    const propsWithDifferentLocation = {
      team: {
        ...defaultProps.team,
        city: 'San Francisco',
        state: 'CA',
      },
    };

    render(<TeamSearchResult {...propsWithDifferentLocation} />);

    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('handles teams with no nickname', () => {
    const propsWithNoNickname = {
      team: {
        ...defaultProps.team,
        nickname: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithNoNickname} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.queryByText('Lakers')).not.toBeInTheDocument();
  });

  it('handles teams with no conference', () => {
    const propsWithNoConference = {
      team: {
        ...defaultProps.team,
        conference: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithNoConference} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Pacific')).toBeInTheDocument();
  });

  it('handles teams with no division', () => {
    const propsWithNoDivision = {
      team: {
        ...defaultProps.team,
        division: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithNoDivision} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Western')).toBeInTheDocument();
  });

  it('handles teams with no location', () => {
    const propsWithNoLocation = {
      team: {
        ...defaultProps.team,
        city: undefined,
        state: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithNoLocation} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.queryByText('Los Angeles, CA')).not.toBeInTheDocument();
  });

  it('handles teams with only city', () => {
    const propsWithOnlyCity = {
      team: {
        ...defaultProps.team,
        state: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithOnlyCity} />);

    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
  });

  it('handles teams with only state', () => {
    const propsWithOnlyState = {
      team: {
        ...defaultProps.team,
        city: undefined,
      },
    };

    render(<TeamSearchResult {...propsWithOnlyState} />);

    expect(screen.getByText('CA')).toBeInTheDocument();
  });

  it('handles teams with empty name', () => {
    const propsWithEmptyName = {
      team: {
        ...defaultProps.team,
        name: '',
      },
    };

    render(<TeamSearchResult {...propsWithEmptyName} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles teams with whitespace-only name', () => {
    const propsWithWhitespaceName = {
      team: {
        ...defaultProps.team,
        name: '   ',
      },
    };

    render(<TeamSearchResult {...propsWithWhitespaceName} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });
});
