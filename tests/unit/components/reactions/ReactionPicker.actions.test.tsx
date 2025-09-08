import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionPicker } from '@/app/components/reactions/ReactionPicker';
import { ParentType } from '@/types';

// Hoisted spies to assert interactions inside the mocked hook
const { toggleSpy } = vi.hoisted(() => ({ toggleSpy: vi.fn().mockResolvedValue(undefined) }));

// Mock useReactions to return our hoisted spy and some default state
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: () => ({
    reactions: [
      {
        id: '1',
        emoji: '👍',
        user_id: 'user1',
        target_id: 't1',
        target_type: ParentType.GameLog,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: { id: 'user1', username: 'user1', first_name: 'User', last_name: 'One' },
      },
    ],
    reactionGroups: [
      { emoji: '👍', count: 1, hasUserReacted: false, reactionIds: ['1'] },
      { emoji: '❤️', count: 0, hasUserReacted: false, reactionIds: [] },
    ],
    userReactions: new Set<string>(),
    toggleReaction: toggleSpy,
    loading: false,
  }),
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

// Mock ResizeObserver to prevent errors in test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('ReactionPicker interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toggleReaction when clicking an existing reaction', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    const existing = screen.getByTestId('reaction-👍');
    fireEvent.click(existing);

    await waitFor(() => {
      expect(toggleSpy).toHaveBeenCalledWith('👍');
    });
  });

  it('opens picker and calls toggleReaction when selecting an emoji from grid', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    fireEvent.click(screen.getByLabelText('Add reaction'));

    await waitFor(() => {
      expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
      expect(screen.getAllByText('❤️').length).toBeGreaterThan(0);
    });

    // Click the first instance in the emoji grid
    fireEvent.click(screen.getAllByTestId('reaction-❤️')[0]);

    await waitFor(() => {
      expect(toggleSpy).toHaveBeenCalledWith('❤️');
    });
  });

  it('closes on Escape key when open', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    fireEvent.click(screen.getByLabelText('Add reaction'));

    await waitFor(() => {
      expect(screen.getByText('Quick Reactions')).toBeInTheDocument();
    });

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      // The popover should close
      expect(screen.queryByText('Quick Reactions')).not.toBeInTheDocument();
    });
  });
});
