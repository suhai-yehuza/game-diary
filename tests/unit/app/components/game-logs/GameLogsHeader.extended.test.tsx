import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsHeader } from '@/app/components/game-logs/GameLogsHeader';

// Mock the mobile detection hook
const mockUseMobileDetection = vi.fn();

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => mockUseMobileDetection(),
}));

describe('GameLogsHeader Extended Tests', () => {
  const mockOnCreateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('renders desktop title styling', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const title = screen.getByText('Game Logs');
      expect(title).toHaveClass('text-2xl');
      expect(title).not.toHaveClass('text-xl');
    });

    it('renders desktop button styling', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-2.5');
      expect(button).not.toHaveClass('px-4');
    });

    it('renders full button text on desktop', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      expect(screen.getByText('Create New Log')).toBeInTheDocument();
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    it('renders desktop icon sizing', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(true);
    });

    it('renders mobile title styling', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const title = screen.getByText('Game Logs');
      expect(title).toHaveClass('text-xl');
      expect(title).not.toHaveClass('text-2xl');
    });

    it('renders mobile button styling', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2.5', 'text-sm');
      expect(button).not.toHaveClass('px-6');
    });

    it('renders shortened button text on mobile', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      expect(screen.getByText('New')).toBeInTheDocument();
      expect(screen.queryByText('Create New Log')).not.toBeInTheDocument();
    });

    it('renders mobile icon sizing', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Interactive Behavior', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('calls onCreateClick when button is clicked', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
    });

    it('calls onCreateClick when button is clicked on mobile', () => {
      mockUseMobileDetection.mockReturnValue(true);
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
    });

    it('handles multiple clicks correctly', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnCreateClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('has proper button role', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Game Logs');
    });

    it('button is clickable', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling Classes', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('applies correct container classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const container = screen.getByText('Game Logs').closest('div');
      expect(container).toHaveClass('flex', 'justify-between', 'items-center');
    });

    it('applies correct title classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const title = screen.getByText('Game Logs');
      expect(title).toHaveClass('font-bold', 'text-gray-900', 'dark:text-gray-100', 'text-2xl');
    });

    it('applies correct button classes', () => {
      render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'flex',
        'items-center',
        'gap-2',
        'bg-blue-600',
        'hover:bg-blue-700',
        'text-white',
        'rounded-xl',
        'font-semibold',
        'shadow-lg',
        'hover:shadow-xl',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-400',
        'transition-all',
        'duration-200'
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('handles onCreateClick being undefined gracefully', () => {
      expect(() => {
        render(<GameLogsHeader onCreateClick={undefined as any} />);
      }).not.toThrow();
    });

    it('handles onCreateClick being null gracefully', () => {
      expect(() => {
        render(<GameLogsHeader onCreateClick={null as any} />);
      }).not.toThrow();
    });

    it('renders correctly when mobile detection returns undefined', () => {
      mockUseMobileDetection.mockReturnValue(undefined);

      expect(() => {
        render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      }).not.toThrow();

      expect(screen.getByText('Game Logs')).toBeInTheDocument();
    });

    it('renders correctly when mobile detection returns null', () => {
      mockUseMobileDetection.mockReturnValue(null);

      expect(() => {
        render(<GameLogsHeader onCreateClick={mockOnCreateClick} />);
      }).not.toThrow();

      expect(screen.getByText('Game Logs')).toBeInTheDocument();
    });
  });
});
