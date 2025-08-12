import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionPicker } from '@/app/components/reactions/ReactionPicker';
import { ParentType } from '@/lib/types/generated/graphql';

// Hoisted spies to assert interactions inside the mocked hook
const { toggleSpy } = vi.hoisted(() => ({ toggleSpy: vi.fn() }));

// Mock useReactions to return our hoisted spy and some default state
vi.mock('@/hooks/use-reactions', () => ({
  useReactions: () => ({
    groupedReactions: [
      { emoji: '👍', count: 1, hasUserReacted: false, reactionIds: [] },
      { emoji: '❤️', count: 0, hasUserReacted: false, reactionIds: [] },
    ],
    userReactions: new Set<string>(),
    toggleReaction: toggleSpy,
    loading: false,
  }),
}));

describe('ReactionPicker interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toggleReaction when clicking an existing reaction', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    const existing = screen.getByLabelText('React with 👍 (1)');
    fireEvent.click(existing);

    await waitFor(() => {
      expect(toggleSpy).toHaveBeenCalledWith('👍');
    });
  });

  it('opens picker and calls toggleReaction when selecting an emoji from grid', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    fireEvent.click(screen.getByLabelText('Add reaction'));

    await waitFor(() => {
      expect(screen.getAllByText('❤️').length).toBeGreaterThan(0);
    });

    // Click the first instance in the emoji grid
    fireEvent.click(screen.getAllByLabelText('React with ❤️')[0]);

    await waitFor(() => {
      expect(toggleSpy).toHaveBeenCalledWith('❤️');
    });
  });

  it('closes on Escape key when open', async () => {
    render(<ReactionPicker targetId="t1" targetType={ParentType.GameLog} />);

    fireEvent.click(screen.getByLabelText('Add reaction'));

    await waitFor(() => {
      expect(screen.getByText('Reactions')).toBeInTheDocument();
    });

    // Press Escape to close
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      // One of the emojis from default tab should disappear when closed
      expect(screen.queryByText('❤️')).not.toBeInTheDocument();
    });
  });
});
