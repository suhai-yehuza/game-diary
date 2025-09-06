import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ContentPreviewBanner } from '@/app/components/landing/ContentPreviewBanner';
import type { IGameLog, IGameResponse } from '@/types';

// Mock the hooks
vi.mock('@/hooks/use-landing-page-data');

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
  TrendingUp: ({ className, ...props }: any) => (
    <div className={className} data-testid="trending-up" {...props} />
  ),
  Calendar: ({ className, ...props }: any) => (
    <div className={className} data-testid="calendar" {...props} />
  ),
  MessageCircle: ({ className, ...props }: any) => (
    <div className={className} data-testid="message-circle" {...props} />
  ),
  Heart: ({ className, ...props }: any) => (
    <div className={className} data-testid="heart" {...props} />
  ),
  User: ({ className, ...props }: any) => (
    <div className={className} data-testid="user" {...props} />
  ),
  MapPin: ({ className, ...props }: any) => (
    <div className={className} data-testid="map-pin" {...props} />
  ),
}));

// Mock data helpers
const createMockGameLog = (
  id: string,
  commentCount = 0,
  reactionCount = 0,
  rating = 5
): IGameLog => ({
  id,

  game_id: 'game123',
  classification: 'PUBLIC',
  rating_for_game: rating,
  totalCommentCount: commentCount,
  totalReactionCount: reactionCount,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  user: {
    id: 'user123',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',

    image_url: 'https://example.com/avatar.jpg',
  },
  game: {
    id: 'game123',
    date: new Date().toISOString(),
    game_type: 'REGULAR',
    status: 'FINISHED',
    teams: {
      home: {
        id: 'team1',
        name: 'Home Team',
        nickname: 'Home',
        code: 'HOME',
        logo: 'https://example.com/home-logo.png',
      },
      away: {
        id: 'team2',
        name: 'Away Team',
        nickname: 'Away',
        code: 'AWAY',
        logo: 'https://example.com/away-logo.png',
      },
    },
    scores: {
      home: {
        points: 100,
        win: 1,
        loss: 0,
        series: { win: 0, loss: 0 },
        linescore: [100],
      },
      away: {
        points: 95,
        win: 0,
        loss: 1,
        series: { win: 0, loss: 0 },
        linescore: [95],
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),

    home_team: {
      id: 'team1',
      name: 'Home Team',
      nickname: 'Home',
      code: 'HOME',
      logo: 'https://example.com/home-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    away_team: {
      id: 'team2',
      name: 'Away Team',
      nickname: 'Away',
      code: 'AWAY',
      logo: 'https://example.com/away-logo.png',
      all_star: false,
      nba_franchise: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
});

const createMockGame = (id: number, date: string, status: string): IGameResponse => ({
  id,
  league: 'NBA',
  season: 2024,
  date: {
    start: date,
    end: new Date(new Date(date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
    duration: '2:00',
  },
  stage: 2,
  status: {
    clock: undefined,
    halftime: false,
    short: status,
    long: status === 'FT' ? 'Finished' : 'Live',
  },
  periods: {
    current: 4,
    total: 4,
    endOfPeriod: false,
  },
  arena: {
    name: 'Test Arena',
    city: 'Test City',
    state: 'TS',
    country: 'USA',
  },
  teams: {
    home: {
      id: 583,
      name: 'Test Home Team',
      nickname: 'Home',
      code: 'HOME',
      logo: 'https://example.com/home-logo.png',
    },
    visitors: {
      id: 584,
      name: 'Test Away Team',
      nickname: 'Away',
      code: 'AWAY',
      logo: 'https://example.com/away-logo.png',
    },
  },
  scores: {
    home: {
      win: 15,
      loss: 12,
      series: { win: 0, loss: 0 },
      linescore: [25, 30, 28, 27],
      points: 110,
    },
    visitors: {
      win: 14,
      loss: 13,
      series: { win: 0, loss: 0 },
      linescore: [28, 25, 30, 25],
      points: 108,
    },
  },
  officials: ['Official 1', 'Official 2', 'Official 3'],
  timesTied: 5,
  leadChanges: 8,
});

describe('ContentPreviewBanner', () => {
  let mockUseLandingPageData: any;

  beforeEach(async () => {
    const landingPageDataModule = await import('@/hooks/use-landing-page-data');
    mockUseLandingPageData = vi.mocked(landingPageDataModule.useLandingPageData);
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockUseLandingPageData.mockReturnValue({
      data: {
        trendingContent: {
          topGameLogs: [],
          mostActiveGameLog: null,
        },
        latestResults: {
          latestGames: [],
          latestFinishedGame: null,
        },
        recentGames: {
          finishedGames: [],
          currentGame: null,
        },
        popularGames: {
          topRated: [],
          mostRated: [],
          mostPopular: [],
        },
        timestamp: new Date().toISOString(),
        source: 'database',
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
      lastUpdated: new Date().toISOString(),
      source: 'database',
    });
  });

  describe('Loading state', () => {
    it('should show loading skeleton when data is loading', () => {
      mockUseLandingPageData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: vi.fn(),
        lastUpdated: null,
        source: null,
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText("See What's Happening")).toBeInTheDocument();
      expect(
        screen.getByText('Join thousands of sports fans sharing their game experiences')
      ).toBeInTheDocument();

      // Should show loading skeleton
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Content display', () => {
    it('should display trending content section', () => {
      const mockGameLog = createMockGameLog('1', 15, 25, 4);
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('Trending Now')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Home Team vs Away Team')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // Comment count
      expect(screen.getByText('25')).toBeInTheDocument(); // Reaction count
      expect(screen.getByText('⭐ 4/5')).toBeInTheDocument(); // Rating
    });

    it('should display latest results section', () => {
      const mockGame = createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT');
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('Latest Results')).toBeInTheDocument();
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('Test Away Team')).toBeInTheDocument();
      expect(screen.getByText('110')).toBeInTheDocument(); // Home score
      expect(screen.getByText('108')).toBeInTheDocument(); // Away score
      expect(screen.getByText('Final')).toBeInTheDocument();
    });

    it('should show most active game log in trending section', () => {
      const gameLog1 = createMockGameLog('1', 5, 10, 3); // Activity: 15
      const gameLog2 = createMockGameLog('2', 20, 15, 4); // Activity: 35 (most active)
      const gameLog3 = createMockGameLog('3', 8, 8, 5); // Activity: 16

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [gameLog1, gameLog2, gameLog3],
            mostActiveGameLog: gameLog2, // The service should return the most active one
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      // Should show the most active game log (gameLog2)
      expect(screen.getByText('20')).toBeInTheDocument(); // Comment count from gameLog2
      expect(screen.getByText('15')).toBeInTheDocument(); // Reaction count from gameLog2
    });

    it('should show latest finished game in results section', () => {
      const game1 = createMockGame(1, '2024-12-20T19:30:00.000Z', 'FT'); // Older
      const game2 = createMockGame(2, '2024-12-23T19:30:00.000Z', 'FT'); // Newer
      const game3 = createMockGame(3, '2024-12-22T19:30:00.000Z', 'Q3'); // Live game

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [game1, game2, game3],
            latestFinishedGame: game2, // The service should return the latest finished game
          },
          recentGames: {
            finishedGames: [game2, game1], // Only finished games
            currentGame: game2,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      // Should show the latest finished game (game2)
      expect(screen.getByText('Test Home Team')).toBeInTheDocument();
      expect(screen.getByText('Test Away Team')).toBeInTheDocument();
    });
  });

  describe('Empty states', () => {
    it('should show empty state when no trending content', () => {
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('No trending content yet')).toBeInTheDocument();
    });

    it('should show empty state when no recent games', () => {
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('No recent games available')).toBeInTheDocument();
    });

    it('should show empty state when no finished games', () => {
      const liveGame = createMockGame(1, '2024-12-23T19:30:00.000Z', 'Q3');
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [], // Empty array - no games at all
            latestFinishedGame: null, // No finished games
          },
          recentGames: {
            finishedGames: [], // No finished games
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('No recent games available')).toBeInTheDocument();
    });
  });

  describe('Navigation links', () => {
    it('should have correct link to user dashboard', () => {
      const mockGameLog = createMockGameLog('1', 15, 25, 4);
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      const trendingLink = screen.getByText('Trending Now').closest('a');
      expect(trendingLink).toHaveAttribute('href', '/protected/user');
    });

    it('should have correct link to sports page', () => {
      const mockGame = createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT');
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      const resultsLink = screen.getByText('Latest Results').closest('a');
      expect(resultsLink).toHaveAttribute('href', '/sports/all-sports');
    });
  });

  describe('User avatar display', () => {
    it('should display user avatar when available', () => {
      const mockGameLog = createMockGameLog('1', 15, 25, 4);
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      const avatar = screen.getByAltText('testuser');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should show default user icon when no avatar', () => {
      const mockGameLog = {
        ...createMockGameLog('1', 15, 25, 4),
        user: {
          ...createMockGameLog('1', 15, 25, 4).user,
          image_url: null,
        },
      };

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      // Should show default user icon instead of avatar
      expect(screen.queryByAltText('testuser')).not.toBeInTheDocument();
    });
  });

  describe('Team logo display', () => {
    it('should display team logos when available', () => {
      const mockGame = createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT');
      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      const homeLogo = screen.getByAltText('Test Home Team');
      const awayLogo = screen.getByAltText('Test Away Team');

      expect(homeLogo).toHaveAttribute('src', 'https://example.com/home-logo.png');
      expect(awayLogo).toHaveAttribute('src', 'https://example.com/away-logo.png');
    });

    it('should show team initials when no logo', () => {
      const mockGame = {
        ...createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT'),
        teams: {
          home: {
            ...createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT').teams.home,
            logo: null,
          },
          visitors: {
            ...createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT').teams.visitors,
            logo: null,
          },
        },
      };

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      // Should show team initials instead of logos
      const teamInitials = screen.getAllByText('T');
      expect(teamInitials).toHaveLength(2); // Both teams start with 'T'
    });
  });

  describe('Date formatting', () => {
    it('should format recent dates correctly', () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 2); // 2 hours ago

      const mockGameLog = {
        ...createMockGameLog('1', 15, 25, 4),
        created_at: recentDate.toISOString(),
      };

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [],
            latestFinishedGame: null,
          },
          recentGames: {
            finishedGames: [],
            currentGame: null,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('should format game dates correctly', () => {
      const gameDate = new Date();
      gameDate.setDate(gameDate.getDate() - 1); // 1 day ago

      const mockGame = {
        ...createMockGame(1, gameDate.toISOString(), 'FT'),
      };

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [],
            mostActiveGameLog: null,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('1d ago')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle data loading error gracefully', () => {
      mockUseLandingPageData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load landing page data',
        refresh: vi.fn(),
        lastUpdated: null,
        source: null,
      });

      render(<ContentPreviewBanner />);

      expect(screen.getByText('No trending content yet')).toBeInTheDocument();
      expect(screen.getByText('No recent games available')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ContentPreviewBanner />);

      // The component no longer has a heading, it was moved to the hero section
      // Check that the descriptive text is present instead
      expect(
        screen.getByText('Join thousands of sports fans sharing their game experiences')
      ).toBeInTheDocument();
    });

    it('should have proper link descriptions', () => {
      const mockGameLog = createMockGameLog('1', 15, 25, 4);
      const mockGame = createMockGame(1, '2024-12-23T19:30:00.000Z', 'FT');

      mockUseLandingPageData.mockReturnValue({
        data: {
          trendingContent: {
            topGameLogs: [mockGameLog],
            mostActiveGameLog: mockGameLog,
          },
          latestResults: {
            latestGames: [mockGame],
            latestFinishedGame: mockGame,
          },
          recentGames: {
            finishedGames: [mockGame],
            currentGame: mockGame,
          },
          popularGames: {
            topRated: [],
            mostRated: [],
            mostPopular: [],
          },
          timestamp: new Date().toISOString(),
          source: 'database',
        },
        loading: false,
        error: null,
        refresh: vi.fn(),
        lastUpdated: new Date().toISOString(),
        source: 'database',
      });

      render(<ContentPreviewBanner />);

      const trendingLink = screen.getByRole('link', { name: /trending now/i });
      const resultsLink = screen.getByRole('link', { name: /latest results/i });

      expect(trendingLink).toBeInTheDocument();
      expect(resultsLink).toBeInTheDocument();
    });
  });
});
