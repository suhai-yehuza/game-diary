import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { EditGameLogModal } from '@/app/components/game-logs/GameLogModal';

// Mock the BaseGameLogModal component
vi.mock('@/app/components/game-logs/BaseGameLogModal', () => ({
  GameLogModal: ({
    mode,
    gameLog,
    ...props
  }: {
    mode: string;
    gameLog: any;
    [key: string]: any;
  }) => (
    <div data-testid="game-log-modal" data-mode={mode}>
      EditGameLogModal Mock
      <div data-testid="game-log-data">{JSON.stringify(gameLog)}</div>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </div>
  ),
}));

describe('EditGameLogModal', () => {
  const mockGameLog = {
    id: 'test-log-id',
    game_id: 'test-game-id',
    rating_for_game: 4,
    notes: 'Test notes',
    tags: ['test', 'game'],
    classification: 'PUBLIC',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    user: {
      id: 'test-user-id',
      username: 'testuser',
    },
  };

  it('renders with edit mode', () => {
    const mockProps = {
      gameLog: mockGameLog,
      isOpen: true,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<EditGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'edit');
  });

  it('passes through gameLog prop to GameLogModal', () => {
    const mockProps = {
      gameLog: mockGameLog,
      isOpen: true,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<EditGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    const gameLogData = screen.getByTestId('game-log-data');

    expect(modal).toBeInTheDocument();
    expect(gameLogData).toBeInTheDocument();
    expect(gameLogData.textContent).toContain('test-log-id');
    expect(gameLogData.textContent).toContain('test-game-id');
  });

  it('passes through all other props to GameLogModal', () => {
    const mockProps = {
      gameLog: mockGameLog,
      isOpen: true,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<EditGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();

    // Check that the props are passed through
    expect(modal.textContent).toContain('isOpen');
    expect(modal.textContent).toContain('true');
  });

  it('renders without crashing when minimal props are provided', () => {
    const mockProps = {
      gameLog: mockGameLog,
      isOpen: false,
      onClose: vi.fn(),
      onSuccess: vi.fn(),
    };

    render(<EditGameLogModal {...mockProps} />);

    const modal = screen.getByTestId('game-log-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-mode', 'edit');
  });
});
