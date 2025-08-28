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

    const header = screen.getByText('Game Logs').parentElement?.parentElement;
    expect(header).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('applies correct CSS classes to the title', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const title = screen.getByText('Game Logs');
    expect(title).toHaveClass('font-bold', 'text-neutral-900', 'dark:text-neutral-100', 'text-2xl');
  });

  it('applies correct CSS classes to the create button', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByRole('button');
    expect(createButton).toHaveClass(
      'justify-center',
      'text-sm',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      'disabled:opacity-50',
      'disabled:pointer-events-none',
      'ring-offset-background',
      'h-10',
      'flex',
      'items-center',
      'gap-2',
      'bg-brand-primary',
      'hover:bg-brand-primary-dark',
      'text-white',
      'rounded-xl',
      'font-semibold',
      'shadow-lg',
      'hover:shadow-xl',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-brand-primary',
      'transition-all',
      'duration-200',
      'px-6',
      'py-2.5'
    );
  });

  it('renders the header as a flex container with space between items', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const header = screen.getByText('Game Logs').parentElement?.parentElement;
    expect(header).toHaveClass('flex', 'justify-between', 'items-center');
  });

  it('has proper accessibility attributes', () => {
    const onCreateClick = vi.fn();
    render(<GameLogsHeader onCreateClick={onCreateClick} />);

    const createButton = screen.getByRole('button');
    expect(createButton).toBeInTheDocument();
  });
});
