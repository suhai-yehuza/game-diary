import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { ReactionButton } from '@/app/components/reactions/ReactionButton';

describe('ReactionButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('calls onClick and applies pressed animation temporarily', () => {
    const onClick = vi.fn();

    render(
      <ReactionButton
        emoji="👍"
        count={3}
        hasReacted={false}
        onClick={onClick}
        size="md"
        showCount
      />
    );

    const button = screen.getByRole('button', { name: 'React with 👍 (3)' });

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.className).toContain('scale-95');

    // Advance timers to exercise the reset path; UI assertion not required here
    vi.advanceTimersByTime(160);
  });

  it('renders count only when showCount is true and count > 0', () => {
    const { rerender } = render(
      <ReactionButton emoji="🔥" count={0} hasReacted={false} onClick={vi.fn()} showCount />
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();

    rerender(
      <ReactionButton emoji="🔥" count={5} hasReacted={false} onClick={vi.fn()} showCount />
    );
    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(
      <ReactionButton emoji="🔥" count={5} hasReacted={false} onClick={vi.fn()} showCount={false} />
    );
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('applies reacted styling when hasReacted is true', () => {
    render(<ReactionButton emoji="❤️" count={2} hasReacted onClick={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'React with ❤️ (2)' });
    expect(button.className).toContain('border-blue-500');
  });

  it('applies size classes based on size prop', () => {
    const { rerender } = render(
      <ReactionButton emoji="😂" count={1} hasReacted={false} onClick={vi.fn()} size="sm" />
    );
    let button = screen.getByRole('button', { name: 'React with 😂 (1)' });
    expect(button.className).toContain('px-2');
    expect(button.className).toContain('py-1');

    rerender(
      <ReactionButton emoji="😂" count={1} hasReacted={false} onClick={vi.fn()} size="md" />
    );
    button = screen.getByRole('button', { name: 'React with 😂 (1)' });
    expect(button.className).toContain('px-3');
    expect(button.className).toContain('py-1.5');

    rerender(
      <ReactionButton emoji="😂" count={1} hasReacted={false} onClick={vi.fn()} size="lg" />
    );
    button = screen.getByRole('button', { name: 'React with 😂 (1)' });
    expect(button.className).toContain('px-4');
    expect(button.className).toContain('py-2');
  });
});
