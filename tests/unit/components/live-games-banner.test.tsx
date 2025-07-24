import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: vi.fn(),
}));

import { useLiveGames } from '@/hooks/use-live-games';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';

const mockGames = [
  {
    id: 1,
    teams: {
      visitors: { code: 'LAL', name: 'Lakers', nickname: 'Lakers', logo: '' },
      home: { code: 'BOS', name: 'Celtics', nickname: 'Celtics', logo: '' },
    },
    scores: {
      visitors: { points: 105 },
      home: { points: 98 },
    },
    status: {
      clock: '2:30',
      halftime: false,
      long: '2nd Quarter',
    },
    league: 'NBA',
    arena: { name: 'TD Garden', city: 'Boston' },
  },
  {
    id: 2,
    teams: {
      visitors: { code: 'GSW', name: 'Warriors', nickname: 'Warriors', logo: '' },
      home: { code: 'MIA', name: 'Heat', nickname: 'Heat', logo: '' },
    },
    scores: {
      visitors: { points: 89 },
      home: { points: 92 },
    },
    status: {
      clock: null,
      halftime: true,
      long: 'Halftime',
    },
    league: 'NBA',
    arena: { name: 'Chase Center', city: 'San Francisco' },
  },
];

describe('LiveGamesBanner', () => {
  it('renders number of games and codes', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('Games: 2')).toBeInTheDocument();
    expect(screen.getByText('LAL vs BOS')).toBeInTheDocument();
    expect(screen.getByText('GSW vs MIA')).toBeInTheDocument();
  });

  it('renders correct number of list items', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders Games: 0 and no list items if games is empty', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: [] }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('Games: 0')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders Games: 0 and no list items if games is undefined', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: undefined }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('Games: 0')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('handles missing team codes gracefully', () => {
    (useLiveGames as any).mockImplementation(
      () =>
        ({
          games: [
            {
              id: 3,
              teams: { visitors: {}, home: {} },
              scores: {},
              status: {},
              league: 'NBA',
              arena: {},
            },
          ],
        }) as any
    );
    render(<LiveGamesBanner />);
    // Should render something like 'vs' or 'undefined vs undefined'
    expect(screen.getByText(/vs/)).toBeInTheDocument();
  });
});
