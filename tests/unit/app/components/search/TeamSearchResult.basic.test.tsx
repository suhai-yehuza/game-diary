import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { TeamSearchResult } from '@/app/components/search/TeamSearchResult';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Building2: ({ className, ...props }: any) => (
    <div data-testid="building-icon" className={className} {...props}>
      Building2
    </div>
  ),
  MapPin: ({ className, ...props }: any) => (
    <div data-testid="mappin-icon" className={className} {...props}>
      MapPin
    </div>
  ),
}));

describe('TeamSearchResult', () => {
  const mockTeam = {
    id: 'team-1',
    type: 'team' as const,
    created_at: '2024-01-01T00:00:00Z',
    name: 'Los Angeles Lakers',
    nickname: 'Lakers',
    city: 'Los Angeles',
    state: 'CA',
    conference: 'Western',
    division: 'Pacific',
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders team information correctly', () => {
    render(<TeamSearchResult team={mockTeam} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('Western • Pacific')).toBeInTheDocument();
  });

  it('handles team with missing name', () => {
    const teamWithoutName = {
      ...mockTeam,
      name: undefined,
    };

    render(<TeamSearchResult team={teamWithoutName} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles team with null name', () => {
    const teamWithNullName = {
      ...mockTeam,
      name: undefined,
    };

    render(<TeamSearchResult team={teamWithNullName} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles team with empty string name', () => {
    const teamWithEmptyName = {
      ...mockTeam,
      name: '',
    };

    render(<TeamSearchResult team={teamWithEmptyName} />);

    expect(screen.getByText('Unknown Team')).toBeInTheDocument();
  });

  it('handles team without nickname', () => {
    const teamWithoutNickname = {
      ...mockTeam,
      nickname: undefined,
    };

    render(<TeamSearchResult team={teamWithoutNickname} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
  });

  it('handles team without city', () => {
    const teamWithoutCity = {
      ...mockTeam,
      city: undefined,
    };

    render(<TeamSearchResult team={teamWithoutCity} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
  });

  it('handles team without state', () => {
    const teamWithoutState = {
      ...mockTeam,
      state: undefined,
    };

    render(<TeamSearchResult team={teamWithoutState} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
  });

  it('handles team without city and state', () => {
    const teamWithoutLocation = {
      ...mockTeam,
      city: undefined,
      state: undefined,
    };

    render(<TeamSearchResult team={teamWithoutLocation} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Western • Pacific')).toBeInTheDocument();
  });

  it('handles team with empty city and state', () => {
    const teamWithEmptyLocation = {
      ...mockTeam,
      city: '',
      state: '',
    };

    render(<TeamSearchResult team={teamWithEmptyLocation} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Western • Pacific')).toBeInTheDocument();
  });

  it('handles team without conference', () => {
    const teamWithoutConference = {
      ...mockTeam,
      conference: undefined,
    };

    render(<TeamSearchResult team={teamWithoutConference} />);

    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('Pacific')).toBeInTheDocument();
  });

  it('navigates to team page when clicked', () => {
    render(<TeamSearchResult team={mockTeam} />);

    const teamCard = screen.getByText('Los Angeles Lakers').closest('div');
    expect(teamCard).toBeInTheDocument();

    if (teamCard) {
      teamCard.click();
      expect(mockPush).toHaveBeenCalledWith('/sports/nba/team/team-1');
    }
  });

  it('has correct styling classes', () => {
    const { container } = render(<TeamSearchResult team={mockTeam} />);

    const teamCard = container.firstChild as HTMLElement;
    expect(teamCard).toHaveClass(
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

  it('displays building icon', () => {
    render(<TeamSearchResult team={mockTeam} />);

    expect(screen.getByTestId('building-icon')).toBeInTheDocument();
  });

  it('displays map pin icon when location is available', () => {
    render(<TeamSearchResult team={mockTeam} />);

    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
  });

  it('handles special characters in team names', () => {
    const teamWithSpecialChars = {
      ...mockTeam,
      name: 'San José Sharks',
    };

    render(<TeamSearchResult team={teamWithSpecialChars} />);

    expect(screen.getByText('San José Sharks')).toBeInTheDocument();
  });

  it('handles very long team names', () => {
    const teamWithLongName = {
      ...mockTeam,
      name: 'VeryLongTeamNameThatExceedsNormalLength',
    };

    render(<TeamSearchResult team={teamWithLongName} />);

    expect(screen.getByText('VeryLongTeamNameThatExceedsNormalLength')).toBeInTheDocument();
  });

  it('shows separator between conference and division', () => {
    render(<TeamSearchResult team={mockTeam} />);

    expect(screen.getByText('Western • Pacific')).toBeInTheDocument();
  });

  it('formats location correctly with city only', () => {
    const teamWithCityOnly = {
      ...mockTeam,
      state: undefined,
    };

    render(<TeamSearchResult team={teamWithCityOnly} />);

    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
  });

  it('formats location correctly with state only', () => {
    const teamWithStateOnly = {
      ...mockTeam,
      city: undefined,
    };

    render(<TeamSearchResult team={teamWithStateOnly} />);

    expect(screen.getByText('CA')).toBeInTheDocument();
  });
});
