import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { GameLogCard } from '@/app/components';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ExternalLink: ({ className }: any) => (
    <div data-testid="external-link" className={className}>
      ExternalLink
    </div>
  ),
  Loader2: ({ className }: any) => (
    <div data-testid="loader-2" className={className}>
      Loader2
    </div>
  ),
  MessageCircle: ({ className }: any) => (
    <div data-testid="message-circle" className={className}>
      MessageCircle
    </div>
  ),
  ChevronDown: ({ className }: any) => (
    <div data-testid="chevron-down" className={className}>
      ChevronDown
    </div>
  ),
  ChevronUp: ({ className }: any) => (
    <div data-testid="chevron-up" className={className}>
      ChevronUp
    </div>
  ),
  Heart: ({ className }: any) => (
    <div data-testid="heart" className={className}>
      Heart
    </div>
  ),
  Star: ({ className }: any) => (
    <div data-testid="star" className={className}>
      Star
    </div>
  ),
  Eye: ({ className }: any) => (
    <div data-testid="eye" className={className}>
      Eye
    </div>
  ),
  Calendar: ({ className }: any) => (
    <div data-testid="calendar" className={className}>
      Calendar
    </div>
  ),
  MapPin: ({ className }: any) => (
    <div data-testid="map-pin" className={className}>
      MapPin
    </div>
  ),
  Edit: ({ className }: any) => (
    <div data-testid="edit" className={className}>
      Edit
    </div>
  ),
  Trash2: ({ className }: any) => (
    <div data-testid="trash-2" className={className}>
      Trash2
    </div>
  ),
  Users: ({ className }: any) => (
    <div data-testid="users" className={className}>
      Users
    </div>
  ),
  Clock: ({ className }: any) => (
    <div data-testid="clock" className={className}>
      Clock
    </div>
  ),
  Moon: ({ className }: any) => (
    <div data-testid="moon" className={className}>
      Moon
    </div>
  ),
  Sun: ({ className }: any) => (
    <div data-testid="sun" className={className}>
      Sun
    </div>
  ),
  Monitor: ({ className }: any) => (
    <div data-testid="monitor" className={className}>
      Monitor
    </div>
  ),
}));

// Mock components
vi.mock('@/app/components/comments/GameLogComments', () => ({
  GameLogComments: ({ gameLog }: any) => (
    <div data-testid="game-log-comments-inner" data-game-log-id={gameLog.id}>
      Comments for {gameLog.id}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/ClassificationIcon', () => ({
  ClassificationIcon: ({ classification }: any) => (
    <div data-testid="classification-icon" data-classification={classification}>
      {classification}
    </div>
  ),
}));

vi.mock('@/app/components/game-logs/RatingStars', () => ({
  RatingStars: ({ rating }: any) => (
    <div data-testid="rating-stars" data-rating={rating}>
      Rating: {rating}
    </div>
  ),
}));

vi.mock('@/app/components/reactions', () => ({
  ReactionPicker: ({ targetId, targetType, _size, _showCount }: any) => (
    <div data-testid="reaction-picker" data-target-id={targetId} data-target-type={targetType}>
      Reactions
    </div>
  ),
}));

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

// Note: gameLogsUtils functions are used as-is since they're pure functions

const mockGameLog = {
  id: 'log-1',
  game_id: 'game-1',
  classification: 'Watched',
  rating_for_game: 4,
  notes: 'Great game!',
  tags: ['action', 'adventure'],
  watched_setting: 'Home',
  watched_scope: 'Alone',
  watched_date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  user: {
    id: 'user-1',
    first_name: 'John',
    username: 'john_doe',
  },
  game: {
    id: 'game-1',
    date: '2024-01-15',
    status: { short: '', long: 'Finished' },
    teams: {
      home: {
        id: 'lakers',
        name: 'Lakers',
        nickname: 'Lakers',
        code: 'LAL',
        logo: null,
      },
      away: {
        id: 'warriors',
        name: 'Warriors',
        nickname: 'Warriors',
        code: 'GSW',
        logo: null,
      },
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
};

describe('GameLogCard Extended Tests', () => {
  describe('Conditional Rendering', () => {
    it('renders watched_setting when present', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Home')).toHaveClass(
        'bg-semantic-success/10',
        'dark:bg-semantic-success/20'
      );
    });

    it('does not render watched_setting when absent', () => {
      const logWithoutSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard gameLog={logWithoutSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('renders watched_scope when present', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      expect(screen.getByText('Alone')).toBeInTheDocument();
      expect(screen.getByText('Alone')).toHaveClass(
        'bg-accent-purple/10',
        'dark:bg-accent-purple/20'
      );
    });

    it('does not render watched_scope when absent', () => {
      const logWithoutScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard gameLog={logWithoutScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('renders notes when present', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      expect(screen.getByText('Great game!')).toBeInTheDocument();
    });

    it('does not render notes when absent', () => {
      const logWithoutNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard gameLog={logWithoutNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('renders tags when present', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      expect(screen.getByText('#action')).toBeInTheDocument();
      expect(screen.getByText('#adventure')).toBeInTheDocument();
    });

    it('does not render tags when absent', () => {
      const logWithoutTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard gameLog={logWithoutTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
      expect(screen.queryByText('#adventure')).not.toBeInTheDocument();
    });

    it('does not render tags when empty array', () => {
      const logWithEmptyTags = { ...mockGameLog, tags: [] };
      render(<GameLogCard gameLog={logWithEmptyTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('renders watched_date when present', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      // Check that the watched date element exists and follows the expected format
      const watchedDateElement = screen.getByText((content, element) => {
        return Boolean(
          element?.textContent?.includes('Watched:') &&
            element?.className?.includes('text-neutral-500')
        );
      });

      expect(watchedDateElement).toBeInTheDocument();

      // Verify the format contains "Watched:" followed by a date
      expect(watchedDateElement.textContent).toMatch(/Watched:\s*.+/);
    });

    it('does not render watched_date when absent', () => {
      const logWithoutDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard gameLog={logWithoutDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });
  });

  describe('User Display Logic', () => {
    it('renders user with first_name when available', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      expect(screen.getByText('@John')).toBeInTheDocument();
    });

    it('renders user with username when first_name is not available', () => {
      const logWithUsernameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe' },
      };
      render(<GameLogCard gameLog={logWithUsernameOnly} />);

      expect(screen.getByText('@john_doe')).toBeInTheDocument();
    });

    it('renders unknown user when user has no id', () => {
      const logWithUserNoId = {
        ...mockGameLog,
        user: { id: '', username: 'unknown', first_name: 'John' },
      };
      render(<GameLogCard gameLog={logWithUserNoId} />);

      expect(screen.getByText('@Anonymous')).toBeInTheDocument();
    });
  });

  describe('Game Display', () => {
    it('renders game link with correct href', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      const gameLink = screen.getByRole('link', { name: /GSW @ LAL on Sun, Jan 14, 2024/i });
      expect(gameLink).toHaveAttribute('href', '/games/game-1');
    });

    it('renders user link with correct href when user has id', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      const userLink = screen.getByRole('link', { name: /@John/i });
      expect(userLink).toHaveAttribute('href', '/users/user-1');
    });
  });

  describe('Comments Section', () => {
    it('renders comments toggle button', () => {
      render(<GameLogCard gameLog={mockGameLog} />);

      const commentsButton = screen.getByRole('button', { name: /comments/i });
      expect(commentsButton).toBeInTheDocument();
      expect(commentsButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders comments section when expanded', async () => {
      const user = userEvent.setup();
      render(<GameLogCard gameLog={mockGameLog} />);

      const commentsButton = screen.getByRole('button', { name: /comments/i });

      await act(async () => {
        await user.click(commentsButton);
      });

      const commentsSection = screen.getByTestId('game-log-comments');
      expect(commentsSection).toBeInTheDocument();
      const innerDiv = commentsSection.querySelector('[data-game-log-id="log-1"]');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles game without teams gracefully', () => {
      const logWithoutGame = { ...mockGameLog, game: undefined };
      render(<GameLogCard gameLog={logWithoutGame} />);

      expect(screen.getByText(/Unknown Teams/)).toBeInTheDocument();
    });

    it('handles empty string notes', () => {
      const logWithEmptyNotes = { ...mockGameLog, notes: '' };
      render(<GameLogCard gameLog={logWithEmptyNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles empty string tags', () => {
      const logWithEmptyTags = { ...mockGameLog, tags: [''] };
      render(<GameLogCard gameLog={logWithEmptyTags} />);

      expect(screen.getByText('#')).toBeInTheDocument();
    });

    it('handles undefined watched_date', () => {
      const logWithUndefinedDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard gameLog={logWithUndefinedDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });

    it('handles undefined watched_date', () => {
      const logWithUndefinedDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard gameLog={logWithUndefinedDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });

    it('handles undefined watched_setting', () => {
      const logWithUndefinedSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard gameLog={logWithUndefinedSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles undefined watched_setting', () => {
      const logWithUndefinedSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard gameLog={logWithUndefinedSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles undefined watched_scope', () => {
      const logWithUndefinedScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard gameLog={logWithUndefinedScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('handles undefined watched_scope', () => {
      const logWithUndefinedScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard gameLog={logWithUndefinedScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('handles undefined notes', () => {
      const logWithUndefinedNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard gameLog={logWithUndefinedNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles undefined notes', () => {
      const logWithUndefinedNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard gameLog={logWithUndefinedNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles undefined tags', () => {
      const logWithUndefinedTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard gameLog={logWithUndefinedTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('handles undefined tags', () => {
      const logWithUndefinedTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard gameLog={logWithUndefinedTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('handles user with only username', () => {
      const logWithUsernameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe' },
      };
      render(<GameLogCard gameLog={logWithUsernameOnly} />);

      expect(screen.getByText('@john_doe')).toBeInTheDocument();
    });

    it('handles user with only first_name', () => {
      const logWithFirstNameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe', first_name: 'John' },
      };
      render(<GameLogCard gameLog={logWithFirstNameOnly} />);

      expect(screen.getByText('@John')).toBeInTheDocument();
    });

    it('handles user with neither first_name nor username', () => {
      const logWithNoName = {
        ...mockGameLog,
        user: { id: 'user-1', username: '' },
      };
      render(<GameLogCard gameLog={logWithNoName} />);

      expect(screen.getByText('@Anonymous')).toBeInTheDocument();
    });

    it('handles user with empty first_name and username', () => {
      const logWithEmptyNames = {
        ...mockGameLog,
        user: { id: 'user-1', first_name: '', username: '' },
      };
      render(<GameLogCard gameLog={logWithEmptyNames} />);

      expect(screen.getByText('@Anonymous')).toBeInTheDocument();
    });
  });

  describe('Comment Count Display', () => {
    it('displays comment count when totalCommentCount is greater than 0', () => {
      const logWithComments = { ...mockGameLog, totalCommentCount: 5 };
      render(<GameLogCard gameLog={logWithComments} />);

      expect(screen.getByText('Comments (5)')).toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is 0', () => {
      const logWithNoComments = { ...mockGameLog, totalCommentCount: 0 };
      render(<GameLogCard gameLog={logWithNoComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText('Comments (0)')).not.toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is undefined', () => {
      const logWithUndefinedComments = { ...mockGameLog, totalCommentCount: undefined };
      render(<GameLogCard gameLog={logWithUndefinedComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText(/Comments \(\d+\)/)).not.toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is null', () => {
      const logWithNullComments = { ...mockGameLog, totalCommentCount: undefined };
      render(<GameLogCard gameLog={logWithNullComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText(/Comments \(\d+\)/)).not.toBeInTheDocument();
    });
  });
});
