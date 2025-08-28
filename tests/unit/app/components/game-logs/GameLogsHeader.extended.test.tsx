import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GameLogsHeader } from '@/app/components/game-logs/GameLogsHeader';

// Mock the useMobileDetection hook
vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => false,
}));

describe('GameLogsHeader Extended Tests', () => {
  const mockOnCreateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders the component without crashing', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      expect(screen.getByText('Game Logs')).toBeInTheDocument();
    });

    it('renders all required elements', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      expect(screen.getByText('Game Logs')).toBeInTheDocument();
      expect(
        screen.getByText('Track and share your sports viewing experiences')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new log/i })).toBeInTheDocument();
    });

    it('calls onCreateClick when button is clicked', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button', { name: /create new log/i });
      fireEvent.click(button);

      expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Verification', () => {
    it('displays correct title text', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      expect(screen.getByText('Game Logs')).toBeInTheDocument();
    });

    it('displays correct description text', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      expect(
        screen.getByText('Track and share your sports viewing experiences')
      ).toBeInTheDocument();
    });

    it('displays correct button text', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      expect(screen.getByRole('button', { name: /create new log/i })).toBeInTheDocument();
    });

    it('includes plus icon in button', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      const button = screen.getByRole('button', { name: /create new log/i });
      // Check for the Plus icon by looking for the icon element
      const iconElement =
        button.querySelector('[data-testid="plus-icon"]') || button.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });
  });

  describe('Styling Classes', () => {
    it('applies correct title classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const title = screen.getByText('Game Logs');
      expect(title).toHaveClass('font-bold', 'text-white', 'text-2xl');
    });

    it('applies correct description classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const description = screen.getByText('Track and share your sports viewing experiences');
      expect(description).toHaveClass('text-white', 'text-sm', 'sm:text-base');
    });

    it('applies correct button classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button', { name: /create new log/i });
      expect(button).toHaveClass(
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

    it('applies correct container classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const header = screen.getByText('Game Logs').closest('.mb-8');
      expect(header).toHaveClass('mb-8');

      const flexContainer = screen.getByText('Game Logs').closest('.flex');
      expect(flexContainer).toHaveClass('flex', 'justify-between', 'items-center', 'mb-6');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const heading = screen.getByRole('heading', { name: 'Game Logs' });
      expect(heading.tagName).toBe('H2');
    });

    it('has accessible button', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button', { name: /create new log/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('has proper focus management', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button', { name: /create new log/i });
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-brand-primary');
    });
  });

  describe('Interaction', () => {
    it('handles multiple clicks correctly', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button', { name: /create new log/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnCreateClick).toHaveBeenCalledTimes(3);
    });

    it('does not call onCreateClick when not clicked', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      expect(mockOnCreateClick).not.toHaveBeenCalled();
    });
  });

  describe('Layout', () => {
    it('renders in a flex layout', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const flexContainer = screen.getByText('Game Logs').closest('.flex');
      expect(flexContainer).toHaveClass('flex', 'justify-between', 'items-center');
    });

    it('has proper spacing', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const header = screen.getByText('Game Logs').closest('.mb-8');
      expect(header).toHaveClass('mb-8');

      const flexContainer = screen.getByText('Game Logs').closest('.flex');
      expect(flexContainer).toHaveClass('mb-6');
    });
  });
});
