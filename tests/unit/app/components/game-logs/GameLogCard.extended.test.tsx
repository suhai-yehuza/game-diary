import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { GameLogCard } from '@/app/components/game-logs/GameLogCard';

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

vi.mock('@/app/components/game-logs/utils/gameLogsUtils', () => ({
  getTeamDisplay: (game: any) => `Team Display for ${game?.id || 'unknown'}`,
}));

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
    status: 'Final',
    game_type: 'Regular Season',
    home_team_id: 'lakers',
    away_team_id: 'warriors',
    home_team: {
      id: 'lakers',
      name: 'Lakers',
      all_star: false,
      nba_franchise: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    away_team: {
      id: 'warriors',
      name: 'Warriors',
      all_star: false,
      nba_franchise: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
};

describe('GameLogCard Extended Tests', () => {
  describe('Conditional Rendering', () => {
    it('renders watched_setting when present', () => {
      render(<GameLogCard log={mockGameLog} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Home')).toHaveClass(
        'bg-semantic-success/10',
        'dark:bg-semantic-success/20'
      );
    });

    it('does not render watched_setting when absent', () => {
      const logWithoutSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard log={logWithoutSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('renders watched_scope when present', () => {
      render(<GameLogCard log={mockGameLog} />);

      expect(screen.getByText('Alone')).toBeInTheDocument();
      expect(screen.getByText('Alone')).toHaveClass(
        'bg-accent-purple/10',
        'dark:bg-accent-purple/20'
      );
    });

    it('does not render watched_scope when absent', () => {
      const logWithoutScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard log={logWithoutScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('renders notes when present', () => {
      render(<GameLogCard log={mockGameLog} />);

      expect(screen.getByText('Great game!')).toBeInTheDocument();
    });

    it('does not render notes when absent', () => {
      const logWithoutNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard log={logWithoutNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('renders tags when present', () => {
      render(<GameLogCard log={mockGameLog} />);

      expect(screen.getByText('#action')).toBeInTheDocument();
      expect(screen.getByText('#adventure')).toBeInTheDocument();
    });

    it('does not render tags when absent', () => {
      const logWithoutTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard log={logWithoutTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
      expect(screen.queryByText('#adventure')).not.toBeInTheDocument();
    });

    it('does not render tags when empty array', () => {
      const logWithEmptyTags = { ...mockGameLog, tags: [] };
      render(<GameLogCard log={logWithEmptyTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('renders watched_date when present', () => {
      render(<GameLogCard log={mockGameLog} />);

      // Check that the watched date element exists and follows the expected format
      const watchedDateElement = screen.getByText((content, element) => {
        return Boolean(
          element?.textContent?.includes('Watched:') &&
            element?.textContent?.match(/Watched:\s*[A-Za-z]{3}\s+\d{1,2},\s+\d{4}/) &&
            element?.className?.includes('text-neutral-500')
        );
      });

      expect(watchedDateElement).toBeInTheDocument();

      // Verify the format is correct (agnostic to the actual date)
      expect(watchedDateElement.textContent).toMatch(/Watched:\s*[A-Za-z]{3}\s+\d{1,2},\s+\d{4}/);
    });

    it('does not render watched_date when absent', () => {
      const logWithoutDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard log={logWithoutDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });
  });

  describe('User Display Logic', () => {
    it('renders user with first_name when available', () => {
      render(<GameLogCard log={mockGameLog} />);

      expect(screen.getByText('@John')).toBeInTheDocument();
    });

    it('renders user with username when first_name is not available', () => {
      const logWithUsernameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe' },
      };
      render(<GameLogCard log={logWithUsernameOnly} />);

      expect(screen.getByText('@john_doe')).toBeInTheDocument();
    });

    it('renders unknown user when user has no id', () => {
      const logWithUserNoId = {
        ...mockGameLog,
        user: { id: '', username: 'unknown', first_name: 'John' },
      };
      render(<GameLogCard log={logWithUserNoId} />);

      expect(screen.getByText('@Unknown User')).toBeInTheDocument();
    });
  });

  describe('Game Display', () => {
    it('renders game link with correct href', () => {
      render(<GameLogCard log={mockGameLog} />);

      const gameLink = screen.getByRole('link', { name: /team display/i });
      expect(gameLink).toHaveAttribute('href', '/games/game-1');
    });

    it('renders user link with correct href when user has id', () => {
      render(<GameLogCard log={mockGameLog} />);

      const userLink = screen.getByRole('link', { name: /@John/i });
      expect(userLink).toHaveAttribute('href', '/users/user-1');
    });
  });

  describe('Comments Section', () => {
    it('renders comments toggle button', () => {
      render(<GameLogCard log={mockGameLog} />);

      const commentsButton = screen.getByRole('button', { name: /comments/i });
      expect(commentsButton).toBeInTheDocument();
      expect(commentsButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders comments section when expanded', async () => {
      const user = userEvent.setup();
      render(<GameLogCard log={mockGameLog} />);

      const commentsButton = screen.getByRole('button', { name: /comments/i });

      await act(async () => {
        await user.click(commentsButton);
      });

      const commentsSection = screen.getByTestId('game-log-comments-inner');
      expect(commentsSection).toBeInTheDocument();
      expect(commentsSection).toHaveAttribute('data-game-log-id', 'log-1');
    });
  });

  describe('Edge Cases', () => {
    it('handles game without teams gracefully', () => {
      const logWithoutGame = { ...mockGameLog, game: undefined };
      render(<GameLogCard log={logWithoutGame} />);

      expect(screen.getByText(/Team Display for unknown/)).toBeInTheDocument();
    });

    it('handles empty string notes', () => {
      const logWithEmptyNotes = { ...mockGameLog, notes: '' };
      render(<GameLogCard log={logWithEmptyNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles empty string tags', () => {
      const logWithEmptyTags = { ...mockGameLog, tags: [''] };
      render(<GameLogCard log={logWithEmptyTags} />);

      expect(screen.getByText('#')).toBeInTheDocument();
    });

    it('handles undefined watched_date', () => {
      const logWithUndefinedDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard log={logWithUndefinedDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });

    it('handles undefined watched_date', () => {
      const logWithUndefinedDate = { ...mockGameLog, watched_date: undefined };
      render(<GameLogCard log={logWithUndefinedDate} />);

      expect(screen.queryByText(/Watched:/)).not.toBeInTheDocument();
    });

    it('handles undefined watched_setting', () => {
      const logWithUndefinedSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard log={logWithUndefinedSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles undefined watched_setting', () => {
      const logWithUndefinedSetting = { ...mockGameLog, watched_setting: undefined };
      render(<GameLogCard log={logWithUndefinedSetting} />);

      expect(screen.queryByText('Home')).not.toBeInTheDocument();
    });

    it('handles undefined watched_scope', () => {
      const logWithUndefinedScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard log={logWithUndefinedScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('handles undefined watched_scope', () => {
      const logWithUndefinedScope = { ...mockGameLog, watched_scope: undefined };
      render(<GameLogCard log={logWithUndefinedScope} />);

      expect(screen.queryByText('Alone')).not.toBeInTheDocument();
    });

    it('handles undefined notes', () => {
      const logWithUndefinedNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard log={logWithUndefinedNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles undefined notes', () => {
      const logWithUndefinedNotes = { ...mockGameLog, notes: undefined };
      render(<GameLogCard log={logWithUndefinedNotes} />);

      expect(screen.queryByText('Great game!')).not.toBeInTheDocument();
    });

    it('handles undefined tags', () => {
      const logWithUndefinedTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard log={logWithUndefinedTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('handles undefined tags', () => {
      const logWithUndefinedTags = { ...mockGameLog, tags: undefined };
      render(<GameLogCard log={logWithUndefinedTags} />);

      expect(screen.queryByText('#action')).not.toBeInTheDocument();
    });

    it('handles user with only username', () => {
      const logWithUsernameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe' },
      };
      render(<GameLogCard log={logWithUsernameOnly} />);

      expect(screen.getByText('@john_doe')).toBeInTheDocument();
    });

    it('handles user with only first_name', () => {
      const logWithFirstNameOnly = {
        ...mockGameLog,
        user: { id: 'user-1', username: 'john_doe', first_name: 'John' },
      };
      render(<GameLogCard log={logWithFirstNameOnly} />);

      expect(screen.getByText('@John')).toBeInTheDocument();
    });

    it('handles user with neither first_name nor username', () => {
      const logWithNoName = {
        ...mockGameLog,
        user: { id: 'user-1', username: '' },
      };
      render(<GameLogCard log={logWithNoName} />);

      expect(screen.getByText('@Unknown User')).toBeInTheDocument();
    });

    it('handles user with empty first_name and username', () => {
      const logWithEmptyNames = {
        ...mockGameLog,
        user: { id: 'user-1', first_name: '', username: '' },
      };
      render(<GameLogCard log={logWithEmptyNames} />);

      expect(screen.getByText('@Unknown User')).toBeInTheDocument();
    });
  });

  describe('Comment Count Display', () => {
    it('displays comment count when totalCommentCount is greater than 0', () => {
      const logWithComments = { ...mockGameLog, totalCommentCount: 5 };
      render(<GameLogCard log={logWithComments} />);

      expect(screen.getByText('Comments (5)')).toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is 0', () => {
      const logWithNoComments = { ...mockGameLog, totalCommentCount: 0 };
      render(<GameLogCard log={logWithNoComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText('Comments (0)')).not.toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is undefined', () => {
      const logWithUndefinedComments = { ...mockGameLog, totalCommentCount: undefined };
      render(<GameLogCard log={logWithUndefinedComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText(/Comments \(\d+\)/)).not.toBeInTheDocument();
    });

    it('does not display comment count when totalCommentCount is null', () => {
      const logWithNullComments = { ...mockGameLog, totalCommentCount: undefined };
      render(<GameLogCard log={logWithNullComments} />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
      expect(screen.queryByText(/Comments \(\d+\)/)).not.toBeInTheDocument();
    });
  });
});
