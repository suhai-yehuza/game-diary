import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionPicker, ReactionButton } from '@/app/components/reactions';
import { ParentType } from '@/types';

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

// Mock useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'user-1' },
    isLoaded: true,
    isSignedIn: true,
  }),
}));

// Mock useReactions hook
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: () => ({
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
    reactionGroups: [
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

describe('Reaction Components Integration', () => {
  it('can render ReactionPicker without errors', () => {
    render(
      <ReactionPicker
        targetId="test-target"
        targetType={ParentType.GameLog}
        size="md"
        showCount={true}
      />
    );

    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument();
    expect(screen.getByTestId('reaction-picker')).toBeInTheDocument();
  });

  it('can render ReactionButton without errors', () => {
    const handleClick = vi.fn();

    render(
      <ReactionButton
        emoji="👍"
        count={5}
        hasReacted={true}
        onClick={handleClick}
        size="md"
        showCount={true}
      />
    );

    expect(screen.getByText('👍')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('exports all components correctly', () => {
    expect(ReactionPicker).toBeDefined();
    expect(ReactionButton).toBeDefined();
  });
});
