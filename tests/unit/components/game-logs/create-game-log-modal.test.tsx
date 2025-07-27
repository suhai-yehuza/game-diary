import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { CreateGameLogModal } from '@/app/components/game-logs/CreateGameLogModal';

// Mock the GameLogModal component
vi.mock('@/app/components/game-logs/GameLogModal', () => ({
  GameLogModal: ({ mode, ...props }: { mode: string; [key: string]: any }) => (
    <div data-testid="game-log-modal" data-mode={mode}>
      CreateGameLogModal Mock
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  ),
}));

describe('CreateGameLogModal', () => {
  it('renders with create mode', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<CreateGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'create');
  });

  it('passes through all props to GameLogModal', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<CreateGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();

    // Check that the props are passed through
    expect(modal.textContent).toContain('isOpen');
    expect(modal.textContent).toContain('true');
  });

  it('renders without crashing when minimal props are provided', () => {
    const mockProps = {
      isOpen: false,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<CreateGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'create');
  });
});
