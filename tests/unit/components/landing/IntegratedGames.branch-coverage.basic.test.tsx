import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the hooks
vi.mock('@/hooks/use-latest-games', () => ({
  useLatestGames: vi.fn(),
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
  Calendar: ({ className, ...props }: any) => (
    <div className={className} data-testid="calendar" {...props} />
  ),
  Clock: ({ className, ...props }: any) => (
    <div className={className} data-testid="clock" {...props} />
  ),
  Trophy: ({ className, ...props }: any) => (
    <div className={className} data-testid="trophy" {...props} />
  ),
  ChevronLeft: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-left" {...props} />
  ),
  ChevronRight: ({ className, ...props }: any) => (
    <div className={className} data-testid="chevron-right" {...props} />
  ),
}));

import { IntegratedGames } from '@/app/components/landing/IntegratedGames';
import { useLatestGames } from '@/hooks/use-latest-games';

const mockUseLatestGames = vi.mocked(useLatestGames);

describe('IntegratedGames Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Conditional Branch Testing', () => {
    it('handles single finished game (no navigation controls)', () => {
      const singleGame = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: singleGame as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should not show navigation controls for single game
      expect(screen.queryByTestId('chevron-left')).not.toBeInTheDocument();
      expect(screen.queryByTestId('chevron-right')).not.toBeInTheDocument();
    });

    it('handles multiple finished games (shows navigation controls)', () => {
      const multipleGames = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
        {
          id: '2',
          date: '2023-01-02T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Team A', logo: null },
            away: { name: 'Team B', logo: null },
          },
          scores: {
            home: 110,
            away: 102,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: multipleGames as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show navigation controls for multiple games
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    it('filters out non-finished games', () => {
      const mixedGames = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
        {
          id: '2',
          date: '2023-01-02T20:00:00Z',
          status: { short: 'LIVE', long: 'Live' },
          teams: {
            home: { name: 'Team A', logo: null },
            away: { name: 'Team B', logo: null },
          },
          scores: {
            home: 50,
            away: 45,
          },
        },
        {
          id: '3',
          date: '2023-01-03T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Team C', logo: null },
            away: { name: 'Team D', logo: null },
          },
          scores: {
            home: 95,
            away: 88,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: mixedGames as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should only show finished games (2 out of 3)
      expect(screen.getByText('Home Team')).toBeInTheDocument();
      expect(screen.getByText('Away Team')).toBeInTheDocument();
      expect(screen.queryByText('Team A')).not.toBeInTheDocument(); // Live game should be filtered out
    });

    it('handles team with logo', () => {
      const gameWithLogo = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: 'https://example.com/logo.png' },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithLogo as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show team logo
      expect(screen.getByAltText('Home Team')).toBeInTheDocument();
    });

    it('handles team without logo (shows initial)', () => {
      const gameWithoutLogo = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithoutLogo as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show team initials
      expect(screen.getByText('H')).toBeInTheDocument(); // Home Team initial
      expect(screen.getByText('A')).toBeInTheDocument(); // Away Team initial
    });

    it('handles string date format', () => {
      const gameWithStringDate = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithStringDate as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should format string date correctly
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    });

    it('handles object date format', () => {
      const gameWithObjectDate = [
        {
          id: '1',
          date: { start: '2023-01-01T20:00:00Z', end: '2023-01-01T22:00:00Z' },
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithObjectDate as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should format object date correctly
      expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
    });

    it('handles more than 5 games (shows +more indicator)', () => {
      const manyGames = Array.from({ length: 7 }, (_, i) => ({
        id: `${i + 1}`,
        date: `2023-01-${String(i + 1).padStart(2, '0')}T20:00:00Z`,
        status: { short: 'FT', long: 'Finished' },
        teams: {
          home: { name: `Home Team ${i + 1}`, logo: null },
          away: { name: `Away Team ${i + 1}`, logo: null },
        },
        scores: {
          home: 100 + i,
          away: 95 + i,
        },
      }));

      mockUseLatestGames.mockReturnValue({
        latestGames: manyGames as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show +more indicator
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('handles exactly 5 games (no +more indicator)', () => {
      const fiveGames = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        date: `2023-01-${String(i + 1).padStart(2, '0')}T20:00:00Z`,
        status: { short: 'FT', long: 'Finished' },
        teams: {
          home: { name: `Home Team ${i + 1}`, logo: null },
          away: { name: `Away Team ${i + 1}`, logo: null },
        },
        scores: {
          home: 100 + i,
          away: 95 + i,
        },
      }));

      mockUseLatestGames.mockReturnValue({
        latestGames: fiveGames as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should not show +more indicator
      expect(screen.queryByText(/\+.*more/)).not.toBeInTheDocument();
    });

    it('handles no finished games', () => {
      const noFinishedGames = [
        {
          id: '1',
          date: '2023-01-01T20:00:00Z',
          status: { short: 'LIVE', long: 'Live' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 50,
            away: 45,
          },
        },
        {
          id: '2',
          date: '2023-01-02T20:00:00Z',
          status: { short: 'SCHEDULED', long: 'Scheduled' },
          teams: {
            home: { name: 'Team A', logo: null },
            away: { name: 'Team B', logo: null },
          },
          scores: {
            home: 0,
            away: 0,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: noFinishedGames as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show no games available message
      expect(screen.getByText('No recent games available')).toBeInTheDocument();
      expect(screen.getByText('Browse All Sports')).toBeInTheDocument();
    });

    it('handles error state', () => {
      mockUseLatestGames.mockReturnValue({
        latestGames: [] as any,
        loading: false,
        error: 'Failed to fetch games',
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show error message
      expect(screen.getByText('No recent games available')).toBeInTheDocument();
      expect(screen.getByText('Browse All Sports')).toBeInTheDocument();
    });

    it('handles empty games array', () => {
      mockUseLatestGames.mockReturnValue({
        latestGames: [] as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show no games available message
      expect(screen.getByText('No recent games available')).toBeInTheDocument();
      expect(screen.getByText('Browse All Sports')).toBeInTheDocument();
    });
  });

  describe('Date and Time Formatting Branches', () => {
    it('formats game date correctly', () => {
      const gameWithDate = [
        {
          id: '1',
          date: '2023-12-25T20:00:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithDate as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show formatted date
      expect(screen.getByText('Dec 25, 2023')).toBeInTheDocument();
    });

    it('formats game time correctly', () => {
      const gameWithTime = [
        {
          id: '1',
          date: '2023-01-01T20:30:00Z',
          status: { short: 'FT', long: 'Finished' },
          teams: {
            home: { name: 'Home Team', logo: null },
            away: { name: 'Away Team', logo: null },
          },
          scores: {
            home: 105,
            away: 98,
          },
        },
      ];

      mockUseLatestGames.mockReturnValue({
        latestGames: gameWithTime as any,
        loading: false,
        error: null,
        refetch: vi.fn(),
        season: 2024,
        note: undefined,
      });

      render(<IntegratedGames />);

      // Should show formatted time in 12-hour format with AM/PM
      const timeElement = screen.getByText(/^\d{1,2}:\d{2}\s(AM|PM)$/);
      expect(timeElement).toBeInTheDocument();
    });
  });
});
