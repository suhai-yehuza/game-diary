import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsHeader } from '@/app/components/game-logs/GameLogsHeader';

describe('GameLogsHeader', () => {
  it('renders the title correctly', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    expect(screen.getByText('Game Logs')).toBeInTheDocument();
  });

  it('renders the create button correctly', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByText('Create New Log');
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateClick when create button is clicked', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByText('Create New Log');
    fireEvent.click(createButton);

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders the plus icon in the create button', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByText('Create New Log');
    expect(createButton).toBeInTheDocument();

    // Check that the button contains the plus icon
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Create New Log');
  });

  it('applies correct CSS classes to the header container', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const header = screen.getByText('Game Logs').parentElement;
    expect(header).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('applies correct CSS classes to the title', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const title = screen.getByText('Game Logs');
    expect(title).toHaveClass('text-2xl', 'font-semibold');
  });

  it('applies correct CSS classes to the create button', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByRole('button');
    expect(createButton).toHaveClass(
      'flex',
      'items-center',
      'gap-2',
      'bg-blue-600',
      'text-white',
      'rounded-full',
      'px-5',
      'py-2',
      'font-semibold',
      'shadow',
      'hover:bg-blue-700',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-400',
      'transition'
    );
  });

  it('renders the header as a flex container with space between items', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const header = screen.getByText('Game Logs').parentElement;
    expect(header).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('has proper accessibility attributes', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByRole('button');
    expect(createButton).toBeInTheDocument();
  });
});
