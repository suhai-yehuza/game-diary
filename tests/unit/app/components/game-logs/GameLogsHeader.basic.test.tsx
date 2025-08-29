import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GameLogsHeader } from '@/app/components/game-logs/GameLogsHeader';

// Mock the useMobileDetection hook
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

describe('GameLogsHeader', () => {
  const mockOnCreateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header with title and description', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    expect(screen.getByText('Game Logs')).toBeInTheDocument();
    expect(screen.getByText('Track and share your sports viewing experiences')).toBeInTheDocument();
  });

  it('renders create button with correct text', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button', { name: /create new log/i });
    expect(createButton).toBeInTheDocument();
  });

  it('calls onCreateClick when create button is clicked', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button', { name: /create new log/i });
    fireEvent.click(createButton);

    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes to the title', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const title = screen.getByText('Game Logs');
    expect(title).toHaveClass('font-bold', 'text-white', 'text-2xl');
  });

  it('applies correct CSS classes to the description', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const description = screen.getByText('Track and share your sports viewing experiences');
    expect(description).toHaveClass('text-white', 'text-sm', 'sm:text-base');
  });

  it('applies correct CSS classes to the create button', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button', { name: /create new log/i });
    expect(createButton).toHaveClass(
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

  it('renders Plus icon in the create button', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button', { name: /create new log/i });
    // Check for the Plus icon by looking for the icon element
    const iconElement =
      createButton.querySelector('[data-testid="plus-icon"]') || createButton.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const header = screen.getByRole('heading', { name: 'Game Logs' });
    expect(header.tagName).toBe('H2');
    expect(header).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button', { name: /create new log/i });
    // Check that the button is accessible and clickable
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('type', 'button');
  });
});
