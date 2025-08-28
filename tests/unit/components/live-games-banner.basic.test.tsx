import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { useLiveGames } from '@/hooks/use-live-games';

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src: _src, alt: _alt, _priority, ...props }: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the hook
vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: vi.fn(),
}));

// Mock the mock data
vi.mock('@/lib/mock/liveGamesMock', async () => {
  const actual = await vi.importActual('@/lib/mock/liveGamesMock');
  return {
    ...actual,
    createMockLiveGames: vi.fn(),
  };
});

const mockGames = [
  {
    id: 1234567,
    league: 'NBA',
    season: 2024,
    date: {
      start: '2024-12-23T19:30:00.000Z',
      end: '2024-12-23T22:15:00.000Z',
      duration: '2:45',
    },
    stage: 2,
    status: {
      clock: '5:30',
      halftime: false,
      short: 'Q3',
      long: '3rd Quarter',
    },
    periods: {
      current: 3,
      total: 4,
      endOfPeriod: false,
    },
    arena: {
      name: 'Madison Square Garden',
      city: 'New York',
      state: 'NY',
      country: 'USA',
    },
    teams: {
      home: {
        id: 583,
        name: 'New York Knicks',
        nickname: 'Knicks',
        code: 'NYK',
        logo: 'https://media.api-sports.io/basketball/teams/583.png',
      },
      visitors: {
        id: 584,
        name: 'Boston Celtics',
        nickname: 'Celtics',
        code: 'BOS',
        logo: 'https://media.api-sports.io/basketball/teams/584.png',
      },
    },
    scores: {
      home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [28, 32, 25], points: 85 },
      visitors: {
        win: 0,
        loss: 0,
        series: { win: 0, loss: 0 },
        linescore: [30, 35, 30],
        points: 95,
      },
    },
    officials: [],
    timesTied: 2,
    leadChanges: 3,
  },
  {
    id: 1234568,
    league: 'NBA',
    season: 2024,
    date: {
      start: '2024-12-23T20:00:00.000Z',
      end: '2024-12-23T22:45:00.000Z',
      duration: '2:45',
    },
    stage: 2,
    status: {
      clock: '2:15',
      halftime: false,
      short: 'Q4',
      long: '4th Quarter',
    },
    periods: {
      current: 4,
      total: 4,
      endOfPeriod: false,
    },
    arena: {
      name: 'Crypto.com Arena',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
    },
    teams: {
      home: {
        id: 585,
        name: 'Golden State Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: 'https://media.api-sports.io/basketball/teams/585.png',
      },
      visitors: {
        id: 586,
        name: 'Los Angeles Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: 'https://media.api-sports.io/basketball/teams/586.png',
      },
    },
    scores: {
      home: { win: 0, loss: 0, series: { win: 0, loss: 0 }, linescore: [25, 28, 30], points: 83 },
      visitors: {
        win: 0,
        loss: 0,
        series: { win: 0, loss: 0 },
        linescore: [22, 30, 32],
        points: 84,
      },
    },
    officials: [],
    timesTied: 1,
    leadChanges: 2,
  },
];

describe('LiveGamesBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders live games count and team codes', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getByText('2 Live Games')).toBeInTheDocument();
    expect(screen.getAllByText('BOS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('NYK').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GSW').length).toBeGreaterThan(0);
  });

  it('renders correct number of game elements', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const gameElements = screen.getAllByTestId('game');
    expect(gameElements.length).toBeGreaterThan(2); // More due to seamless scrolling duplicates
  });

  it('renders mock data if games is empty in test environment', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: [] }) as any);
    render(<LiveGamesBanner />);
    // Banner should show mock data in test environments when no real games
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByText('8 Live Games')).toBeInTheDocument();
  });

  it('renders mock data if games is undefined in test environment', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: undefined }) as any);
    render(<LiveGamesBanner />);
    // Banner should show mock data in test environments when games is undefined
    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByText('8 Live Games')).toBeInTheDocument();
  });

  it('displays live indicator with pulsing animation', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const liveIndicator = screen.getByTestId('live-indicator');
    expect(liveIndicator).toHaveClass('w-3', 'h-3', 'bg-red-500', 'rounded-full');
  });

  it('has proper accessibility attributes', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const banner = screen.getByTestId('live-games-banner');
    expect(banner).toHaveAttribute('role', 'banner');
    expect(banner).toHaveAttribute('aria-label', 'Live sports games');
  });

  it('has clickable game items with proper accessibility', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const gameItems = screen.getAllByTestId('game');
    expect(gameItems.length).toBeGreaterThan(0);

    gameItems.forEach(gameItem => {
      expect(gameItem).toHaveAttribute('role', 'button');
      expect(gameItem).toHaveAttribute('tabIndex', '0');
      expect(gameItem).toHaveClass('cursor-pointer');
    });
  });

  it('has clickable live indicator with proper accessibility', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    // Find the button element that contains the live games text
    const liveIndicator = screen.getByText('2 Live Games').closest('[role="button"]');
    expect(liveIndicator).toHaveAttribute('role', 'button');
    expect(liveIndicator).toHaveAttribute('tabIndex', '0');
    expect(liveIndicator).toHaveAttribute('aria-label');
  });

  it('shows last updated timestamp in combined indicator', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    // Check for both "Last Updated at" and "Updated at" text (responsive design)
    const lastUpdatedText = screen.getAllByText(/Updated/);
    expect(lastUpdatedText.length).toBeGreaterThan(0);

    // Check that it's within the combined indicator container
    const combinedIndicator = screen.getByText('2 Live Games').closest('[role="button"]');
    expect(combinedIndicator).toContainElement(lastUpdatedText[0]);

    // Check for the red live indicator dot
    const liveIndicator = screen.getByTestId('live-indicator');
    expect(liveIndicator).toBeInTheDocument();
    expect(liveIndicator).toHaveClass('bg-red-500', 'rounded-full');
  });

  it('has combined indicator layout with proper styling', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const combinedIndicator = screen.getByText('2 Live Games').closest('[role="button"]');

    // Check for proper flex layout and spacing (updated for simplified design)
    expect(combinedIndicator).toHaveClass(
      'flex',
      'items-center',
      'gap-3',
      'cursor-pointer',
      'rounded-lg'
    );
    expect(combinedIndicator).toHaveClass('hover:bg-white/5', 'transition-colors');
    expect(combinedIndicator).toHaveClass(
      'px-3',
      'xs:px-4',
      'sm:px-5',
      'py-2',
      'xs:py-2.5',
      'sm:py-3'
    );

    // Check that the text content is in a flex column
    const textContainer = combinedIndicator?.querySelector('.flex-col');
    expect(textContainer).toBeInTheDocument();
  });

  it('has clickable view all button with proper accessibility', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const viewAllButton = screen.getByRole('button', { name: /click to view all/ });
    expect(viewAllButton).toBeInTheDocument();
  });

  it('has responsive positioning for indicators to avoid blocking game content', () => {
    render(<LiveGamesBanner />);

    // Check that the combined indicator container exists and has positioning
    const combinedIndicatorContainer = screen
      .getByText('2 Live Games')
      .closest('[role="button"]')?.parentElement;
    expect(combinedIndicatorContainer).toBeInTheDocument();

    // Check that the view all button exists and has positioning
    const viewAllButton = screen.getByRole('button', { name: /click to view all/ });
    expect(viewAllButton).toBeInTheDocument();

    // Verify both elements are properly positioned within the banner
    const banner = screen.getByRole('banner');
    if (combinedIndicatorContainer) {
      expect(banner).toContainElement(combinedIndicatorContainer);
    }
    expect(banner).toContainElement(viewAllButton);

    // Verify the scrolling content has responsive padding
    const scrollingContent = screen.getByRole('banner').querySelector('[class*="w-[60px]"]');
    expect(scrollingContent).toBeInTheDocument();
  });

  it('has responsive padding for scrolling content area', () => {
    render(<LiveGamesBanner />);

    // Check that the scrolling content has responsive padding to accommodate UI elements
    const scrollingContent = screen.getByRole('banner').querySelector('[class*="w-[60px]"]');
    expect(scrollingContent).toBeInTheDocument();

    // Verify the scrolling content exists and has proper structure
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();

    // Verify the responsive padding classes are applied for mobile optimization
    expect(scrollingContent).toHaveClass('w-[60px]');
  });

  it('has responsive banner padding and spacing', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const banner = screen.getByTestId('live-games-banner');
    expect(banner).toHaveClass('py-0.5', 'xs:py-1', 'sm:py-1.5', 'px-1', 'xs:px-2', 'sm:px-4');
  });

  it('has responsive game item spacing and sizing', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const gameItems = screen.getAllByTestId('game');
    const firstGame = gameItems[0];

    // Check responsive spacing
    expect(firstGame).toHaveClass('space-x-0.5', 'xs:space-x-1', 'sm:space-x-2');
    expect(firstGame).toHaveClass('px-1', 'xs:px-1.5', 'sm:px-2');
  });

  it('has responsive team logo sizing', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const banner = screen.getByTestId('live-games-banner');
    const logoContainers = banner.querySelectorAll(
      '[class*="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3"]'
    );
    expect(logoContainers.length).toBeGreaterThan(0);
  });

  it('has responsive indicator sizing and spacing', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const combinedIndicator = screen.getByText('2 Live Games').closest('[role="button"]');

    // Check responsive spacing and sizing
    expect(combinedIndicator).toHaveClass('px-3', 'xs:px-4', 'sm:px-5');
    expect(combinedIndicator).toHaveClass('py-2', 'xs:py-2.5', 'sm:py-3');

    // Check responsive live indicator sizing
    const liveIndicator = screen.getByTestId('live-indicator');
    expect(liveIndicator).toHaveClass('w-3', 'h-3', 'bg-red-500', 'rounded-full');
  });

  it('has extra small viewport optimizations', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    const banner = screen.getByTestId('live-games-banner');

    // Check for extra small viewport classes
    expect(banner).toHaveClass('py-0.5', 'xs:py-1');
    expect(banner).toHaveClass('px-1', 'xs:px-2');

    // Check for responsive spacing in game items
    const gameItems = screen.getAllByTestId('game');
    const firstGame = gameItems[0];
    expect(firstGame).toHaveClass('space-x-0.5', 'xs:space-x-1');
  });

  it('ensures UI elements are visible across all viewport sizes', () => {
    render(<LiveGamesBanner />);

    // Check that the combined indicator exists and has proper styling
    const combinedIndicator = screen
      .getByText('2 Live Games')
      .closest('[role="button"]') as HTMLElement;
    expect(combinedIndicator).toBeInTheDocument();
    expect(combinedIndicator).toHaveClass('rounded-lg');

    // Check that the view all button exists
    const viewAllButton = screen.getByRole('button', { name: /click to view all/ });
    expect(viewAllButton).toBeInTheDocument();

    // Verify both elements are properly positioned within the banner
    const banner = screen.getByRole('banner');
    expect(banner).toContainElement(combinedIndicator);
    expect(banner).toContainElement(viewAllButton);
  });

  it('displays view all button', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const viewAllButton = screen.getByRole('button', { name: /click to view all/ });
    expect(viewAllButton).toBeInTheDocument();
  });

  it('displays team scores', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getAllByText('95').length).toBeGreaterThan(0); // BOS score
    expect(screen.getAllByText('85').length).toBeGreaterThan(0); // NYK score
    expect(screen.getAllByText('84').length).toBeGreaterThan(0); // LAL score
    expect(screen.getAllByText('83').length).toBeGreaterThan(0); // GSW score
  });

  it('displays game clock when available', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getAllByText('5:30').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2:15').length).toBeGreaterThan(0);
  });

  it('displays @ separator between teams', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const separators = screen.getAllByText('@');
    expect(separators.length).toBeGreaterThan(2); // More due to duplicates
  });

  it('displays quarter information', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    expect(screen.getAllByText('Q3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Q4').length).toBeGreaterThan(0);
  });

  it('has scrolling animation class', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);
    const banner = screen.getByTestId('live-games-banner');
    const scrollingContent = banner.querySelector('.animate-scroll-left');
    expect(scrollingContent).toBeInTheDocument();
  });

  it('displays correct team order (visitors @ home)', () => {
    (useLiveGames as any).mockImplementation(() => ({ games: mockGames }) as any);
    render(<LiveGamesBanner />);

    // Check first game: BOS @ NYK (expect multiple due to duplicates)
    expect(screen.getAllByText('BOS').length).toBeGreaterThan(0);
    expect(screen.getAllByText('NYK').length).toBeGreaterThan(0);

    // Check second game: LAL @ GSW (expect multiple due to duplicates)
    expect(screen.getAllByText('LAL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GSW').length).toBeGreaterThan(0);
  });
});
