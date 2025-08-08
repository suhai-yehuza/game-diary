import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionPicker } from '@/app/components/reactions/ReactionPicker';
import { ParentType } from '@/lib/types/generated/graphql';

// Mock Apollo Client
vi.mock('@apollo/client', () => ({
  gql: vi.fn(),
  useMutation: () => [vi.fn(), { loading: false, error: null }],
  useQuery: () => ({
    loading: false,
    error: null,
    data: {
      reactions: [
        {
          id: 'reaction-1',
          emoji: '👍',
          user_id: 'user-1',
          target_id: 'target-1',
          target_type: ParentType.GameLog,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            id: 'user-1',
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            email_address: null,
            phone_number: null,
            image_url: null,
          },
        },
      ],
    },
    refetch: vi.fn(),
  }),
}));

// Mock useAuth hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
  }),
}));

// Mock useReactions hook
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: () => ({
    groupedReactions: [
      {
        emoji: '👍',
        count: 2,
        hasUserReacted: true,
        reactionIds: ['reaction-1'],
      },
    ],
    userReactions: new Set(['👍']),
    toggleReaction: vi.fn(),
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useReactionEmojis: () => ['👍', '❤️', '😂', '😮', '😢', '😠'],
}));

describe('ReactionPicker Component', () => {
  const defaultProps = {
    targetId: 'target-1',
    targetType: ParentType.GameLog,
  };

  it('renders existing reactions', () => {
    render(<ReactionPicker {...defaultProps} />);

    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders add reaction button', () => {
    render(<ReactionPicker {...defaultProps} />);

    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();
  });

  it('shows user has reacted styling', () => {
    render(<ReactionPicker {...defaultProps} />);

    const reactionButton = screen.getByLabelText('React with 👍 (2)');
    expect(reactionButton).toHaveClass('border-blue-500');
  });

  it('opens emoji picker when add button is clicked', async () => {
    render(<ReactionPicker {...defaultProps} />);

    const addButton = screen.getByLabelText('Add reaction');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('❤️')).toBeInTheDocument();
      expect(screen.getByText('😂')).toBeInTheDocument();
    });
  });

  // TODO: Fix this test when the module path is resolved
  // it('handles reaction click', async () => {
  //   const mockToggleReaction = vi.fn();
  //   vi.mocked(require('@/hooks/use-reactions').useReactions).mockReturnValue({
  //     groupedReactions: [
  //       {
  //         emoji: '👍',
  //         count: 1,
  //         hasUserReacted: true,
  //         reactionIds: ['reaction-1'],
  //       },
  //     ],
  //     userReactions: new Set(['👍']),
  //     toggleReaction: mockToggleReaction,
  //     loading: false,
  //     error: null,
  //     refetch: vi.fn(),
  //   });

  //   render(<ReactionPicker {...defaultProps} />);

  //   const reactionButton = screen.getByLabelText('React with 👍 (1)');
  //   fireEvent.click(reactionButton);

  //   expect(mockToggleReaction).toHaveBeenCalledWith('👍');
  // });
});
