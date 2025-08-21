import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionButton } from '@/app/components/reactions/ReactionButton';

describe('ReactionButton Large Count Formatting', () => {
  it('formats large reaction counts correctly', () => {
    const testCases = [
      { count: 1234, expected: '1.23k', emoji: '👍', emojiName: 'thumbs up' },
      { count: 3253, expected: '3.25k', emoji: '❤️', emojiName: 'love' }, // Main test case from requirement
      { count: 15000, expected: '15k', emoji: '🔥', emojiName: 'fire' },
      { count: 1500000, expected: '1.5M', emoji: '🚀', emojiName: 'rocket' },
      { count: 2000000000, expected: '2B', emoji: '🎯', emojiName: 'bullseye' },
    ];

    testCases.forEach(({ count, expected, emoji, emojiName }, _index) => {
      const { unmount } = render(
        <ReactionButton
          emoji={emoji}
          count={count}
          hasReacted={false}
          onClick={vi.fn()}
          showCount
        />
      );

      // Check that the formatted count is displayed
      expect(screen.getByText(expected)).toBeInTheDocument();

      // Check that the aria-label uses the formatted count with emoji name
      expect(
        screen.getByRole('button', {
          name: `React with ${expected} ${emojiName} emojis`,
        })
      ).toBeInTheDocument();

      // Clean up for next test
      unmount();
    });
  });

  it('handles edge cases for reaction count formatting', () => {
    const testCases = [
      { count: 999, expected: '999' },
      { count: 1000, expected: '1k' },
      { count: 1001, expected: '1k' },
      { count: 999999, expected: '1M' },
      { count: 1000000, expected: '1M' },
    ];

    testCases.forEach(({ count, expected }) => {
      const { unmount } = render(
        <ReactionButton emoji="👏" count={count} hasReacted={false} onClick={vi.fn()} showCount />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();

      // Clean up for next test
      unmount();
    });
  });

  it('provides proper accessibility for large counts', () => {
    render(
      <ReactionButton emoji="👏" count={3253} hasReacted={false} onClick={vi.fn()} showCount />
    );

    const button = screen.getByRole('button', {
      name: 'React with 3.25k clap emojis',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'React with 3.25k clap emojis');
  });

  it('handles zero and single count edge cases', () => {
    const { rerender } = render(
      <ReactionButton emoji="😮" count={0} hasReacted={false} onClick={vi.fn()} showCount />
    );

    // Zero count should not show count and should have simple aria-label
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'React with 😮' })).toBeInTheDocument();

    rerender(
      <ReactionButton emoji="😮" count={1} hasReacted={false} onClick={vi.fn()} showCount />
    );

    // Single count should use singular "emoji" not "emojis"
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'React with 1 wow emoji' })).toBeInTheDocument();
  });
});
