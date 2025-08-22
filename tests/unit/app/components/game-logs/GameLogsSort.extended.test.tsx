import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsSort } from '@/app/components/game-logs/GameLogsSort';

// Mock the mobile detection hook
const mockUseMobileDetection = vi.fn();

vi.mock('@/app/components/layout/components/SearchBar', () => ({
  useMobileDetection: () => mockUseMobileDetection(),
}));

describe('GameLogsSort Extended Tests', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('renders desktop layout classes', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const container = screen.getByTestId('game-logs-sort');
      expect(container).toHaveClass('sm:flex-row', 'sm:items-center', 'sm:justify-between');
    });

    it('renders primary sort options on desktop', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.getByText('Date Created')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Setting')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
    });

    it('shows correct active sort option', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      const ratingButton = screen.getByText('Rating').closest('button');
      expect(ratingButton).toHaveClass(
        'bg-brand-primary/10',
        'border-brand-primary/30',
        'text-brand-primary'
      );
    });
  });

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(true);
    });

    it('renders mobile layout classes', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const container = screen.getByTestId('game-logs-sort');
      expect(container).toHaveClass('flex-col');
      expect(container).not.toHaveClass('sm:flex-row');
    });

    it('renders primary sort options on mobile', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.getByText('Date Created')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Setting')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
    });
  });

  describe('Sort Options', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('calls onSort with created_at when Date Created is clicked', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="desc" onSort={mockOnSort} />);

      const dateCreatedOption = screen.getByText('Date Created');
      fireEvent.click(dateCreatedOption);

      expect(mockOnSort).toHaveBeenCalledWith('created_at', 'asc');
    });

    it('calls onSort with rating_for_game when Rating is clicked', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const ratingOption = screen.getByText('Rating');
      fireEvent.click(ratingOption);

      expect(mockOnSort).toHaveBeenCalledWith('rating_for_game', 'asc');
    });

    it('calls onSort with classification when Privacy is clicked', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const privacyOption = screen.getByText('Privacy');
      fireEvent.click(privacyOption);

      expect(mockOnSort).toHaveBeenCalledWith('classification', 'asc');
    });

    it('calls onSort with team when Team is clicked after expanding more options', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      // Team should be visible by default now
      const teamOption = screen.getByText('Team');
      fireEvent.click(teamOption);

      expect(mockOnSort).toHaveBeenCalledWith('team', 'asc');
    });
  });

  describe('Sort Direction Toggle', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('toggles from asc to desc when clicking same option', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      const ratingOption = screen.getByText('Rating');
      fireEvent.click(ratingOption);

      expect(mockOnSort).toHaveBeenCalledWith('rating_for_game', 'desc');
    });

    it('toggles from desc to asc when clicking same option', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="desc" onSort={mockOnSort} />);

      const ratingOption = screen.getByText('Rating');
      fireEvent.click(ratingOption);

      expect(mockOnSort).toHaveBeenCalledWith('rating_for_game', 'asc');
    });

    it('sets new sort key with asc direction when clicking different option', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="desc" onSort={mockOnSort} />);

      // Team should be visible by default now
      const teamOption = screen.getByText('Team');
      fireEvent.click(teamOption);

      expect(mockOnSort).toHaveBeenCalledWith('team', 'asc');
    });
  });

  describe('Active Sort Styling', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('shows active styling for selected sort option', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      const ratingButton = screen.getByText('Rating').closest('button');
      expect(ratingButton).toHaveClass(
        'bg-brand-primary/10',
        'border-brand-primary/30',
        'text-brand-primary',
        'shadow-md'
      );
    });

    it('shows inactive styling for non-selected options', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      // Team should be visible by default now
      const teamButton = screen.getByText('Team').closest('button');
      expect(teamButton).toHaveClass('bg-neutral-50', 'border-neutral-200', 'text-neutral-700');
      expect(teamButton).not.toHaveClass(
        'bg-brand-primary/10',
        'border-brand-primary/30',
        'text-brand-primary'
      );
    });
  });

  describe('Clear Button', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('shows clear button when sortKey is set', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('does not show clear button when sortKey is empty', () => {
      render(<GameLogsSort sortKey="" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('calls onSort with empty key and null direction when clear is clicked', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(mockOnSort).toHaveBeenCalledWith('', null);
    });
  });

  describe('Display Count', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('shows display count when provided', () => {
      render(
        <GameLogsSort
          sortKey="created_at"
          sortDirection="desc"
          onSort={mockOnSort}
          displayedCount={10}
          totalCount={25}
        />
      );

      expect(screen.getByText('Displaying 10 of 25 game logs')).toBeInTheDocument();
    });

    it('shows display count with custom classification', () => {
      render(
        <GameLogsSort
          sortKey="created_at"
          sortDirection="desc"
          onSort={mockOnSort}
          displayedCount={5}
          totalCount={15}
          classification="entries"
        />
      );

      expect(screen.getByText('Displaying 5 of 15 entries')).toBeInTheDocument();
    });

    it('does not show display count when not provided', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.queryByText(/Displaying/)).not.toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('calls onSort multiple times when different options are clicked', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      fireEvent.click(screen.getByText('Rating'));

      // Team should be visible by default now
      fireEvent.click(screen.getByText('Team'));
      fireEvent.click(screen.getByText('Privacy'));

      expect(mockOnSort).toHaveBeenCalledTimes(3);
      expect(mockOnSort).toHaveBeenNthCalledWith(1, 'rating_for_game', 'asc');
      expect(mockOnSort).toHaveBeenNthCalledWith(2, 'team', 'asc');
      expect(mockOnSort).toHaveBeenNthCalledWith(3, 'classification', 'asc');
    });

    it('calls onSort when clicking the same option multiple times', () => {
      render(<GameLogsSort sortKey="rating_for_game" sortDirection="asc" onSort={mockOnSort} />);

      const ratingOption = screen.getByText('Rating');
      fireEvent.click(ratingOption);
      fireEvent.click(ratingOption);
      fireEvent.click(ratingOption);

      expect(mockOnSort).toHaveBeenCalledTimes(3);
      expect(mockOnSort).toHaveBeenNthCalledWith(1, 'rating_for_game', 'desc');
      expect(mockOnSort).toHaveBeenNthCalledWith(2, 'rating_for_game', 'desc');
      expect(mockOnSort).toHaveBeenNthCalledWith(3, 'rating_for_game', 'desc');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('has proper button roles for sort options', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(3); // Primary sort options + More button + clear button
    });

    it('sort options are clickable', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const ratingOption = screen.getByText('Rating');
      expect(ratingOption).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockUseMobileDetection.mockReturnValue(false);
    });

    it('handles onSort being undefined gracefully', () => {
      expect(() => {
        render(
          <GameLogsSort sortKey="created_at" sortDirection="desc" onSort={undefined as any} />
        );
      }).not.toThrow();
    });

    it('handles onSort being null gracefully', () => {
      expect(() => {
        render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={null as any} />);
      }).not.toThrow();
    });

    it('handles unknown sortKey gracefully', () => {
      expect(() => {
        render(<GameLogsSort sortKey="unknown_key" sortDirection="desc" onSort={mockOnSort} />);
      }).not.toThrow();

      // Should still render all options
      expect(screen.getByText('Date Created')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Setting')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
    });

    it('handles empty sortKey gracefully', () => {
      expect(() => {
        render(<GameLogsSort sortKey="" sortDirection="desc" onSort={mockOnSort} />);
      }).not.toThrow();
    });

    it('handles undefined sortDirection gracefully', () => {
      expect(() => {
        render(
          <GameLogsSort sortKey="created_at" sortDirection={undefined as any} onSort={mockOnSort} />
        );
      }).not.toThrow();
    });

    it('renders correctly when mobile detection returns undefined', () => {
      mockUseMobileDetection.mockReturnValue(undefined);

      expect(() => {
        render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);
      }).not.toThrow();

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    it('renders correctly when mobile detection returns null', () => {
      mockUseMobileDetection.mockReturnValue(null);

      expect(() => {
        render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);
      }).not.toThrow();

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });
  });
});
