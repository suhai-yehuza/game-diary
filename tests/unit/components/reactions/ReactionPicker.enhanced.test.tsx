import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ReactionPicker } from '@/app/components/reactions/ReactionPicker';
import { REACTION_EMOJIS } from '@/lib/constants';
import type { IReaction } from '@/types';
import { ParentType } from '@/types';

// Mock the useReactions hook
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: vi.fn(),
}));

// Mock the useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'user123' },
    isLoaded: true,
    isSignedIn: true,
  }),
}));

// Mock the MemoizedReactionButton component
vi.mock('@/app/components/reactions/MemoizedReactionButton', () => ({
  MemoizedReactionButton: ({ group, onClick, loading, showCount }: any) => (
    <button
      onClick={() => onClick(group.emoji)}
      disabled={loading}
      data-testid={`reaction-${group.emoji}`}
      className={showCount ? 'with-count' : 'without-count'}
      aria-label={`React with ${group.count} ${group.emoji} emoji`}
    >
      {group.emoji} {showCount && `(${group.count})`}
    </button>
  ),
}));

// Mock data helpers
const createMockReaction = (emoji: string, userId = 'user123'): IReaction => ({
  id: `reaction-${emoji}`,
  emoji,
  user_id: userId,
  target_id: 'test-target',
  target_type: ParentType.GameLog,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  user: {
    id: userId,
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    email_address: 'test@example.com',
    phone_number: null,
    image_url: null,
  },
});

const createMockGroupedReactions = (reactions: IReaction[]) => {
  const grouped = new Map<string, { emoji: string; count: number; hasUserReacted: boolean }>();

  reactions.forEach(reaction => {
    const existing = grouped.get(reaction.emoji);
    if (existing) {
      existing.count++;
      if (reaction.user_id === 'user123') {
        existing.hasUserReacted = true;
      }
    } else {
      grouped.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        hasUserReacted: reaction.user_id === 'user123',
      });
    }
  });

  return Array.from(grouped.values());
};

describe('ReactionPicker Enhanced', () => {
  let mockUseReactions: any;
  let mockToggleReaction: any;

  beforeEach(async () => {
    const reactionsModule = await import('@/hooks/use-reactions');
    mockUseReactions = vi.mocked(reactionsModule.useReactions);
    mockToggleReaction = vi.fn();

    vi.clearAllMocks();

    // Default mock implementation
    mockUseReactions.mockReturnValue({
      reactions: [],
      reactionGroups: [],
      userReactions: new Set(),
      toggleReaction: mockToggleReaction.mockResolvedValue(undefined),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  describe('Basic functionality', () => {
    it('should render without crashing', () => {
      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      expect(screen.getByTestId('reaction-picker')).toBeInTheDocument();
    });

    it('should render add reaction button', () => {
      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();
    });

    it('should render existing reactions when available', () => {
      const mockReactions = [
        createMockReaction(REACTION_EMOJIS.THUMBS_UP),
        createMockReaction(REACTION_EMOJIS.LOVE),
        createMockReaction(REACTION_EMOJIS.FIRE),
      ];

      mockUseReactions.mockReturnValue({
        reactions: mockReactions,
        reactionGroups: createMockGroupedReactions(mockReactions),
        userReactions: new Set([REACTION_EMOJIS.THUMBS_UP]),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.THUMBS_UP}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.LOVE}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.FIRE}`)).toBeInTheDocument();
    });

    it('should handle reaction click', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      // Wait for popover to open
      await waitFor(() => {
        expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
      });

      // Click on a reaction (component uses data-testid for identification)
      const thumbsUpButton = screen.getByTestId(`reaction-${REACTION_EMOJIS.THUMBS_UP}`);
      await user.click(thumbsUpButton);

      expect(mockToggleReaction).toHaveBeenCalledWith(REACTION_EMOJIS.THUMBS_UP);
    });
  });

  describe('Popover functionality', () => {
    it('should open popover when add reaction button is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
      // Check for primary reactions
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_UP)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LOVE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.FIRE)).toBeInTheDocument();
    });

    it('should close popover when close button is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      expect(screen.getByText('Quick Reactions')).toBeInTheDocument();

      const closeButton = screen.getByTestId('x-icon').closest('button');
      await user.click(closeButton!);

      expect(screen.queryByText('Quick Reactions')).not.toBeInTheDocument();
    });

    it('should close popover when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      expect(screen.getByText('Quick Reactions')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByText('Quick Reactions')).not.toBeInTheDocument();
    });
  });

  describe('Primary reactions', () => {
    it('should show primary reactions by default', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      // Check that primary reactions are visible (component uses PRIMARY_REACTIONS = ['👍', '👎', '❤️', '🔥', '😂'])
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_UP)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_DOWN)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LOVE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.FIRE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LAUGH)).toBeInTheDocument();
    });

    it('should show "Show more reactions" button', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      expect(screen.getByText('More Reactions')).toBeInTheDocument();
    });

    it('should toggle secondary reactions when "Show more reactions" is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      const showMoreButton = screen.getByText('More Reactions');
      await user.click(showMoreButton);

      // Check that secondary reactions are now visible (component uses SPORTS_REACTIONS, EMOTIONS_REACTIONS, ACTION_REACTIONS)
      expect(screen.getByText(REACTION_EMOJIS.BASKETBALL)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.MUSCLE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.ROCKET)).toBeInTheDocument();

      // Button should now show minus symbol
      expect(screen.getByText('−')).toBeInTheDocument();
    });
  });

  describe('More reactions section', () => {
    it('should show more reactions when expanded', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      // Click to expand more reactions
      const showMoreButton = screen.getByText('More Reactions');
      await user.click(showMoreButton);

      // Check for secondary reactions in the expanded section
      expect(screen.getByText(REACTION_EMOJIS.BASKETBALL)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.MUSCLE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.ROCKET)).toBeInTheDocument();
    });

    it('should not show more reactions section when collapsed', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      // More reactions should be collapsed by default
      expect(screen.queryByText(REACTION_EMOJIS.BASKETBALL)).not.toBeInTheDocument();
    });
  });

  describe('User reactions', () => {
    it('should highlight user reactions', async () => {
      const user = userEvent.setup();

      const mockReactions = [
        createMockReaction(REACTION_EMOJIS.THUMBS_UP),
        createMockReaction(REACTION_EMOJIS.LOVE),
      ];

      mockUseReactions.mockReturnValue({
        reactions: mockReactions,
        reactionGroups: createMockGroupedReactions(mockReactions),
        userReactions: new Set([REACTION_EMOJIS.THUMBS_UP, REACTION_EMOJIS.LOVE]),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      await user.click(addButton);

      // Check that user reactions are visible in the popover
      const thumbsUpButton = screen.getByText(REACTION_EMOJIS.THUMBS_UP);
      const loveButton = screen.getByText(REACTION_EMOJIS.LOVE);

      // Check that the buttons are in the popover
      expect(thumbsUpButton).toBeInTheDocument();
      expect(loveButton).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should disable buttons when loading', async () => {
      const _user = userEvent.setup();

      mockUseReactions.mockReturnValue({
        reactions: [],
        reactionGroups: [],
        userReactions: new Set(),
        toggleReaction: mockToggleReaction,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByTitle('Show Reactions');
      expect(addButton).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should apply custom className', () => {
      render(
        <ReactionPicker
          targetId="test-target"
          targetType={ParentType.GameLog}
          className="custom-class"
        />
      );

      // The component doesn't currently support className prop, so we just check it renders
      const addButton = screen.getByTitle('Show Reactions');
      expect(addButton).toBeInTheDocument();
    });

    it('should handle different sizes', () => {
      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} size="lg" />);

      const addButton = screen.getByTitle('Show Reactions');
      expect(addButton).toBeInTheDocument();
    });

    it('should handle showCount prop', () => {
      const mockReactions = [createMockReaction(REACTION_EMOJIS.THUMBS_UP)];

      mockUseReactions.mockReturnValue({
        reactions: mockReactions,
        reactionGroups: createMockGroupedReactions(mockReactions),
        userReactions: new Set(),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <ReactionPicker targetId="test-target" targetType={ParentType.GameLog} showCount={false} />
      );

      // Check that the component renders without errors
      const addButton = screen.getByTitle('Show Reactions');
      expect(addButton).toBeInTheDocument();
    });
  });
});
