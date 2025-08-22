import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ReactionPicker } from '@/app/components/reactions/ReactionPicker';
import type { IReaction } from '@/lib/types';
import { REACTION_EMOJIS } from '@/lib/types/constant.types';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock the useReactions hook
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: vi.fn(),
}));

// Mock the MemoizedReactionButton component
vi.mock('@/app/components/reactions/MemoizedReactionButton', () => ({
  MemoizedReactionButton: ({ group, onClick, loading, showCount }: any) => (
    <button
      onClick={() => onClick(group.emoji)}
      disabled={loading}
      data-testid={`reaction-${group.emoji}`}
      className={showCount ? 'with-count' : 'without-count'}
    >
      {group.emoji} {showCount && `${group.count}`}
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
      groupedReactions: [],
      userReactions: new Set(),
      toggleReaction: mockToggleReaction,
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
        groupedReactions: createMockGroupedReactions(mockReactions),
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

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      // Wait for popover to open
      await waitFor(() => {
        expect(screen.getByText('Add Reaction')).toBeInTheDocument();
      });

      // Click on a reaction
      const thumbsUpButton = screen.getByLabelText(`React with ${REACTION_EMOJIS.THUMBS_UP}`);
      await user.click(thumbsUpButton);

      expect(mockToggleReaction).toHaveBeenCalledWith(REACTION_EMOJIS.THUMBS_UP);
    });
  });

  describe('Popover functionality', () => {
    it('should open popover when add reaction button is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      expect(screen.getByText('Add Reaction')).toBeInTheDocument();
      // Check for primary reactions
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_UP)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LOVE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.FIRE)).toBeInTheDocument();
    });

    it('should close popover when close button is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      expect(screen.getByText('Add Reaction')).toBeInTheDocument();

      const closeButton = screen.getByLabelText('Close');
      await user.click(closeButton);

      expect(screen.queryByText('Add Reaction')).not.toBeInTheDocument();
    });

    it('should close popover when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      expect(screen.getByText('Add Reaction')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByText('Add Reaction')).not.toBeInTheDocument();
    });
  });

  describe('Primary reactions', () => {
    it('should show primary reactions by default', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      // Check that primary reactions are visible
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_UP)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LOVE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.LAUGH)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.FIRE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.BASKETBALL)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.CLAP)).toBeInTheDocument();
    });

    it('should show "Show more reactions" button', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      expect(screen.getByText('Show more reactions')).toBeInTheDocument();
    });

    it('should toggle secondary reactions when "Show more reactions" is clicked', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      const showMoreButton = screen.getByText('Show more reactions');
      await user.click(showMoreButton);

      // Check that secondary reactions are now visible
      expect(screen.getByText(REACTION_EMOJIS.THUMBS_DOWN)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.MUSCLE)).toBeInTheDocument();
      expect(screen.getByText(REACTION_EMOJIS.ROCKET)).toBeInTheDocument();

      // Button should now say "Show less"
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  describe('Recently used section', () => {
    it('should show recently used reactions when available', async () => {
      const user = userEvent.setup();

      const mockReactions = [
        createMockReaction(REACTION_EMOJIS.THUMBS_UP),
        createMockReaction(REACTION_EMOJIS.LOVE),
        createMockReaction(REACTION_EMOJIS.FIRE),
        createMockReaction(REACTION_EMOJIS.BASKETBALL),
        createMockReaction(REACTION_EMOJIS.MUSCLE),
        createMockReaction(REACTION_EMOJIS.CLAP),
        createMockReaction(REACTION_EMOJIS.ROCKET),
      ];

      mockUseReactions.mockReturnValue({
        groupedReactions: createMockGroupedReactions(mockReactions),
        userReactions: new Set([REACTION_EMOJIS.THUMBS_UP]),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      // Check for recently used section
      expect(screen.getByText('Recently Used')).toBeInTheDocument();

      // Check for recently used reactions (should show first 6)
      // These should be visible in the main reaction picker, not in the popover
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.LOVE}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.FIRE}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.BASKETBALL}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.MUSCLE}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.CLAP}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reaction-${REACTION_EMOJIS.ROCKET}`)).toBeInTheDocument();
    });

    it('should not show recently used section when no reactions exist', async () => {
      const user = userEvent.setup();

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      expect(screen.queryByText('Recently Used')).not.toBeInTheDocument();
    });
  });

  describe('User reactions', () => {
    it('should highlight user reactions', async () => {
      const user = userEvent.setup();

      mockUseReactions.mockReturnValue({
        groupedReactions: [],
        userReactions: new Set([REACTION_EMOJIS.THUMBS_UP, REACTION_EMOJIS.LOVE]),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      await user.click(addButton);

      // Check that user reactions have the active class
      const thumbsUpButton = screen.getByLabelText(`React with ${REACTION_EMOJIS.THUMBS_UP}`);
      const loveButton = screen.getByLabelText(`React with ${REACTION_EMOJIS.LOVE}`);

      expect(thumbsUpButton).toHaveClass('bg-blue-100');
      expect(loveButton).toHaveClass('bg-blue-100');
    });
  });

  describe('Loading states', () => {
    it('should disable buttons when loading', async () => {
      const _user = userEvent.setup();

      mockUseReactions.mockReturnValue({
        groupedReactions: [],
        userReactions: new Set(),
        toggleReaction: mockToggleReaction,
        loading: true,
        error: null,
        refetch: vi.fn(),
      });

      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} />);

      const addButton = screen.getByLabelText('Add reaction');
      expect(addButton).toBeDisabled();

      // When loading is true, the add button should be disabled
      // and clicking it should not open the popover
      expect(addButton).toBeDisabled();
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

      const container = screen.getByTestId('reaction-picker');
      expect(container).toHaveClass('custom-class');
    });

    it('should handle different sizes', () => {
      render(<ReactionPicker targetId="test-target" targetType={ParentType.GameLog} size="lg" />);

      const addButton = screen.getByLabelText('Add reaction');
      expect(addButton).toHaveClass('p-2.5');
    });

    it('should handle showCount prop', () => {
      const mockReactions = [createMockReaction(REACTION_EMOJIS.THUMBS_UP)];

      mockUseReactions.mockReturnValue({
        groupedReactions: createMockGroupedReactions(mockReactions),
        userReactions: new Set(),
        toggleReaction: mockToggleReaction,
        loading: false,
        error: null,
        refetch: vi.fn(),
      });

      render(
        <ReactionPicker targetId="test-target" targetType={ParentType.GameLog} showCount={false} />
      );

      const reactionButton = screen.getByTestId(`reaction-${REACTION_EMOJIS.THUMBS_UP}`);
      expect(reactionButton).toHaveClass('without-count');
    });
  });
});
