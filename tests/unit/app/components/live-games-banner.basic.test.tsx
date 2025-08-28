import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() to properly handle mock variables
const { mockUseLiveGames, mockUseBannerVisibility, mockUseRouter } = vi.hoisted(() => ({
  mockUseLiveGames: vi.fn(),
  mockUseBannerVisibility: vi.fn(),
  mockUseRouter: vi.fn(),
}));

vi.mock('@/hooks/use-live-games', () => ({
  useLiveGames: mockUseLiveGames,
}));

vi.mock('@/hooks/use-banner-visibility', () => ({
  useBannerVisibility: mockUseBannerVisibility,
}));

vi.mock('next/navigation', () => ({
  useRouter: mockUseRouter,
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="team-logo" />
  ),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the getDisplayGames function
vi.mock('@/lib/mock/liveGamesMock', () => ({
  MOCK_LIVE_GAMES: {
    response: [
      {
        id: 1,
        teams: {
          visitors: { name: 'Lakers', code: 'LAL', logo: '/lakers.png' },
          home: { name: 'Warriors', code: 'GSW', logo: '/warriors.png' },
        },
        scores: {
          visitors: { points: 105 },
          home: { points: 98 },
        },
        status: { short: 'Q4', clock: '2:30' },
      },
    ],
  },
}));

// Import the component after mocking
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';

describe('LiveGamesBanner', () => {
  const mockPush = vi.fn();
  const mockVibrate = vi.fn();
  const mockGames = [
    {
      id: 1,
      teams: {
        visitors: { name: 'Lakers', code: 'LAL', logo: '/lakers.png' },
        home: { name: 'Warriors', code: 'GSW', logo: '/warriors.png' },
      },
      scores: {
        visitors: { points: 105 },
        home: { points: 98 },
      },
      status: { short: 'Q4', clock: '2:30' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024, // Desktop by default
    });

    // Default mock implementations
    mockUseRouter.mockReturnValue({
      push: mockPush,
    });

    mockUseBannerVisibility.mockReturnValue({
      shouldDisplayBanner: true,
      isClient: true,
    });

    mockUseLiveGames.mockReturnValue({
      games: mockGames,
    });

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
    });

    // Mock window.__API_MOCK_MODE__
    Object.defineProperty(window, '__API_MOCK_MODE__', {
      value: false,
      writable: true,
    });

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
      },
      writable: true,
    });
  });

  it('renders banner when games are available and banner should be displayed', () => {
    render(<LiveGamesBanner />);

    expect(screen.getByTestId('live-games-banner')).toBeInTheDocument();
    expect(screen.getByTestId('live-indicator')).toBeInTheDocument();
    expect(screen.getByText('1 Live Games')).toBeInTheDocument();
  });

  it('does not render when banner should not be displayed', () => {
    mockUseBannerVisibility.mockReturnValue({
      shouldDisplayBanner: false,
      isClient: true,
    });

    render(<LiveGamesBanner />);

    expect(screen.queryByTestId('live-games-banner')).not.toBeInTheDocument();
  });

  it('does not render when not on client side', () => {
    mockUseBannerVisibility.mockReturnValue({
      shouldDisplayBanner: true,
      isClient: false,
    });

    render(<LiveGamesBanner />);

    expect(screen.queryByTestId('live-games-banner')).not.toBeInTheDocument();
  });

  it('does not render when no games are available', () => {
    mockUseLiveGames.mockReturnValue({
      games: [],
    });

    render(<LiveGamesBanner />);

    expect(screen.queryByTestId('live-games-banner')).not.toBeInTheDocument();
  });

  it('displays correct number of live games', () => {
    const multipleGames = [
      ...mockGames,
      {
        id: 2,
        teams: {
          visitors: { name: 'Celtics', code: 'BOS', logo: '/celtics.png' },
          home: { name: 'Heat', code: 'MIA', logo: '/heat.png' },
        },
        scores: {
          visitors: { points: 89 },
          home: { points: 92 },
        },
        status: { short: 'Q3', clock: '5:45' },
      },
    ];

    mockUseLiveGames.mockReturnValue({
      games: multipleGames,
    });

    render(<LiveGamesBanner />);

    expect(screen.getByText('2 Live Games')).toBeInTheDocument();
  });

  it('handles game click and navigates to game detail page', () => {
    render(<LiveGamesBanner />);

    const gameElements = screen.getAllByTestId('game');
    fireEvent.click(gameElements[0]); // Click the first game element

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/games/1');
  });

  it('handles keyboard navigation for game click', () => {
    render(<LiveGamesBanner />);

    const gameElements = screen.getAllByTestId('game');
    fireEvent.keyDown(gameElements[0], { key: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/games/1');
  });

  it('handles space key navigation for game click', () => {
    render(<LiveGamesBanner />);

    const gameElements = screen.getAllByTestId('game');
    fireEvent.keyDown(gameElements[0], { key: ' ' });

    expect(mockPush).toHaveBeenCalledWith('/sports/nba/games/1');
  });

  it('calls vibrate when game is clicked', () => {
    render(<LiveGamesBanner />);

    const gameElements = screen.getAllByTestId('game');
    fireEvent.click(gameElements[0]);

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('handles live indicator click and navigates to live games page', () => {
    // Mock window.location.href assignment
    const mockLocation = { href: 'http://localhost:3000/' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<LiveGamesBanner />);

    const liveIndicator = screen.getByTestId('live-indicator').parentElement;
    fireEvent.click(liveIndicator!);

    // The component sets window.location.href directly
    expect(mockLocation.href).toBe('/sports/live');
  });

  it('handles keyboard navigation for live indicator', () => {
    // Mock window.location.href assignment
    const mockLocation = { href: 'http://localhost:3000/' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<LiveGamesBanner />);

    const liveIndicator = screen.getByTestId('live-indicator').parentElement;
    fireEvent.keyDown(liveIndicator!, { key: 'Enter' });

    // The component sets window.location.href directly
    expect(mockLocation.href).toBe('/sports/live');
  });

  it('handles space key navigation for live indicator', () => {
    // Mock window.location.href assignment
    const mockLocation = { href: 'http://localhost:3000/' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(<LiveGamesBanner />);

    const liveIndicator = screen.getByTestId('live-indicator').parentElement;
    fireEvent.keyDown(liveIndicator!, { key: ' ' });

    // The component sets window.location.href directly
    expect(mockLocation.href).toBe('/sports/live');
  });

  it('calls vibrate when live indicator is clicked', () => {
    render(<LiveGamesBanner />);

    const liveIndicator = screen.getByTestId('live-indicator').parentElement;
    fireEvent.click(liveIndicator!);

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('handles mouse enter and leave events', () => {
    render(<LiveGamesBanner />);

    const banner = screen.getByTestId('live-games-banner');

    fireEvent.mouseEnter(banner);
    fireEvent.mouseLeave(banner);

    // The component should handle these events without errors
    expect(banner).toBeInTheDocument();
  });

  it('displays loading state when no games are available initially', async () => {
    mockUseLiveGames.mockReturnValue({
      games: [],
    });

    render(<LiveGamesBanner />);

    // The component should not render when no games are available
    expect(screen.queryByTestId('live-games-banner')).not.toBeInTheDocument();
  });

  it('displays game information correctly', () => {
    render(<LiveGamesBanner />);

    // Use getAllByText to handle multiple elements with the same text
    const lalElements = screen.getAllByText('LAL');
    expect(lalElements.length).toBeGreaterThan(0);

    const scoreElements = screen.getAllByText('105');
    expect(scoreElements.length).toBeGreaterThan(0);

    // Use getAllByText for @ symbol as well
    const atSymbolElements = screen.getAllByText('@');
    expect(atSymbolElements.length).toBeGreaterThan(0);

    const gswElements = screen.getAllByText('GSW');
    expect(gswElements.length).toBeGreaterThan(0);

    const score98Elements = screen.getAllByText('98');
    expect(score98Elements.length).toBeGreaterThan(0);

    const q4Elements = screen.getAllByText('Q4');
    expect(q4Elements.length).toBeGreaterThan(0);

    const clockElements = screen.getAllByText('2:30');
    expect(clockElements.length).toBeGreaterThan(0);
  });

  it('handles games without clock information', () => {
    const gamesWithoutClock = [
      {
        id: 1,
        teams: {
          visitors: { name: 'Lakers', code: 'LAL', logo: '/lakers.png' },
          home: { name: 'Warriors', code: 'GSW', logo: '/warriors.png' },
        },
        scores: {
          visitors: { points: 105 },
          home: { points: 98 },
        },
        status: { short: 'Q4' }, // No clock
      },
    ];

    mockUseLiveGames.mockReturnValue({
      games: gamesWithoutClock,
    });

    render(<LiveGamesBanner />);

    const q4Elements = screen.getAllByText('Q4');
    expect(q4Elements.length).toBeGreaterThan(0);
    expect(screen.queryByText('2:30')).not.toBeInTheDocument();
  });

  it('displays last updated time', () => {
    render(<LiveGamesBanner />);
    const updatedElements = screen.getAllByText(/Updated/);
    expect(updatedElements.length).toBeGreaterThan(0);
  });

  it('renders team logos correctly', () => {
    render(<LiveGamesBanner />);

    const logos = screen.getAllByTestId('team-logo');
    // The component duplicates games for seamless scrolling, so we expect 4 logos (2 teams × 2 instances)
    expect(logos).toHaveLength(4);
    expect(logos[0]).toHaveAttribute('src', '/lakers.png');
    expect(logos[1]).toHaveAttribute('src', '/warriors.png');
  });
});
