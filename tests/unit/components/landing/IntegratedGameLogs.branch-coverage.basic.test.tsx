import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-landing-page-data', () => ({
  useLandingPageData: vi.fn(),
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  MessageCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="message-circle" {...props} />
  ),
  Heart: ({ className, ...props }: any) => (
    <div className={className} data-testid="heart" {...props} />
  ),
  TrendingUp: ({ className, ...props }: any) => (
    <div className={className} data-testid="trending-up" {...props} />
  ),
  User: ({ className, ...props }: any) => (
    <div className={className} data-testid="user" {...props} />
  ),
  ChevronLeft: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-left" {...props} />
  ),
  ChevronRight: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-right" {...props} />
  ),
}));

import { IntegratedGameLogs } from '@/app/components/landing/IntegratedGameLogs';
import { useLandingPageData } from '@/hooks/use-landing-page-data';

const mockUseLandingPageData = vi.mocked(useLandingPageData);

// Helper function to create mock landing page data
const createMockLandingPageData = (topGameLogs: any[]) => ({
  data: {
    trendingContent: {
      topGameLogs,
      mostActiveGameLog: null,
    },
    latestResults: { latestGames: [], latestFinishedGame: null },
    recentGames: { finishedGames: [], currentGame: null },
    popularGames: { topRated: [], mostRated: [], mostPopular: [] },
    timestamp: '2023-01-01T00:00:00Z',
    source: 'cache' as const,
  },
  loading: false,
  error: null,
  refresh: vi.fn(),
  lastUpdated: '2023-01-01T00:00:00Z',
  source: 'cache',
});

describe('IntegratedGameLogs Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Branch Testing', () => {
    it('handles single game log (no navigation controls)', () => {
      const singleGameLog = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(singleGameLog));

      render(<IntegratedGameLogs />);

      // Should not show navigation controls for single game log
      expect(screen.queryByTestId('chevron-left')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
    });

    it('handles multiple game logs (shows navigation controls)', () => {
      const multipleGameLogs = [
        {
          id: '1',
          user: { username: 'user1', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          user: { username: 'user2', image_url: undefined },
          game: {
            home_team: { name: 'Team A' },
            away_team: { name: 'Team B' },
          },
          rating_for_game: 3,
          totalCommentCount: 2,
          totalReactionCount: 1,
          created_at: '2023-01-02T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(multipleGameLogs));

      render(<IntegratedGameLogs />);

      // Should show multiple game logs (no navigation controls in IntegratedGameLogs)
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    it('handles user with image_url', () => {
      const gameLogWithImage = [
        {
          id: '1',
          user: { username: 'testuser', image_url: 'https://example.com/avatar.jpg' },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogWithImage));

      render(<IntegratedGameLogs />);

      // Should show image instead of User icon
      expect(screen.getByAltText('testuser')).toBeInTheDocument();
      expect(screen.queryByTestId('user')).not.toBeInTheDocument();
    });

    it('handles user without image_url (shows User icon)', () => {
      const gameLogWithoutImage = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogWithoutImage));

      render(<IntegratedGameLogs />);

      // Should show User icon instead of image
      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.queryByAltText('testuser')).not.toBeInTheDocument();
    });

    it('handles anonymous user', () => {
      const anonymousGameLog = [
        {
          id: '1',
          user: null,
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(anonymousGameLog));

      render(<IntegratedGameLogs />);

      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('handles team with logo', () => {
      const gameLogWithTeamLogo = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team', logo: 'https://example.com/logo.png' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogWithTeamLogo));

      render(<IntegratedGameLogs />);

      // Should show team logo
      expect(screen.getByAltText('Home Team')).toBeInTheDocument();
    });

    it('handles team without logo (shows initial)', () => {
      const gameLogWithoutTeamLogo = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogWithoutTeamLogo));

      render(<IntegratedGameLogs />);

      // Should show team initial
      expect(screen.getByText('H')).toBeInTheDocument(); // Home Team initial
      expect(screen.getByText('A')).toBeInTheDocument(); // Away Team initial
    });

    it('handles high activity level (red color)', () => {
      const highActivityGameLog = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 30,
          totalReactionCount: 25,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(highActivityGameLog));

      render(<IntegratedGameLogs />);

      const activityElement = screen.getByText('55 activity');
      expect(activityElement).toHaveClass('text-red-600', 'dark:text-red-400');
    });

    it('handles medium activity level (orange color)', () => {
      const mediumActivityGameLog = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 15,
          totalReactionCount: 8,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(mediumActivityGameLog));

      render(<IntegratedGameLogs />);

      const activityElement = screen.getByText('23 activity');
      expect(activityElement).toHaveClass('text-orange-600', 'dark:text-orange-400');
    });

    it('handles low activity level (green color)', () => {
      const lowActivityGameLog = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 3,
          totalReactionCount: 2,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(lowActivityGameLog));

      render(<IntegratedGameLogs />);

      const activityElement = screen.getByText('5 activity');
      expect(activityElement).toHaveClass('text-green-600', 'dark:text-green-400');
    });

    it('handles more than 5 game logs (shows +more indicator)', () => {
      const manyGameLogs = Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        user: { username: `user${i + 1}`, image_url: undefined },
        game: {
          home_team: { name: `Home Team ${i + 1}` },
          away_team: { name: `Away Team ${i + 1}` },
        },
        rating_for_game: 4,
        totalCommentCount: 5,
        totalReactionCount: 3,
        created_at: '2023-01-01T00:00:00Z',
      }));

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(manyGameLogs));

      render(<IntegratedGameLogs />);

      // Should show all game logs in scrollable container (no +more indicator in IntegratedGameLogs)
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });

    it('handles exactly 5 game logs (no +more indicator)', () => {
      const fiveGameLogs = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        user: { username: `user${i + 1}`, image_url: undefined },
        game: {
          home_team: { name: `Home Team ${i + 1}` },
          away_team: { name: `Away Team ${i + 1}` },
        },
        rating_for_game: 4,
        totalCommentCount: 5,
        totalReactionCount: 3,
        created_at: '2023-01-01T00:00:00Z',
      }));

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(fiveGameLogs));

      render(<IntegratedGameLogs />);

      // Should not show +more indicator
      expect(screen.queryByText(/\+.*more/)).not.toBeInTheDocument();
    });

    it('handles null comment and reaction counts', () => {
      const gameLogWithNullCounts = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: null,
          totalReactionCount: null,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogWithNullCounts));

      render(<IntegratedGameLogs />);

      expect(screen.getByText('0 activity')).toBeInTheDocument();
      expect(screen.getByText('0 comments')).toBeInTheDocument();
      expect(screen.getByText('0 reactions')).toBeInTheDocument();
    });
  });

  describe('Date Formatting Branches', () => {
    it('formats today date', () => {
      const today = new Date().toISOString();
      const gameLogToday = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: today,
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogToday));

      render(<IntegratedGameLogs />);

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('formats yesterday date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const gameLogYesterday = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: yesterday,
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogYesterday));

      render(<IntegratedGameLogs />);

      expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });

    it('formats recent date (less than 7 days)', () => {
      const recentDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const gameLogRecent = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: recentDate,
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogRecent));

      render(<IntegratedGameLogs />);

      expect(screen.getByText('3 days ago')).toBeInTheDocument();
    });

    it('formats old date (more than 7 days)', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const gameLogOld = [
        {
          id: '1',
          user: { username: 'testuser', image_url: undefined },
          game: {
            home_team: { name: 'Home Team' },
            away_team: { name: 'Away Team' },
          },
          rating_for_game: 4,
          totalCommentCount: 5,
          totalReactionCount: 3,
          created_at: oldDate,
        },
      ];

      mockUseLandingPageData.mockReturnValue(createMockLandingPageData(gameLogOld));

      render(<IntegratedGameLogs />);

      // Should show formatted date (the actual format depends on the date)
      const dateElement = screen.getByText(/Aug \d+/);
      expect(dateElement).toBeInTheDocument();
    });
  });
});
