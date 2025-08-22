import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';

import { GameLogsSort } from '@/app/components/game-logs/GameLogsSort';

describe('GameLogsSort', () => {
  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Default Rendering', () => {
    it('renders with default props', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    it('renders all sort options', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.getByText('Date Created')).toBeInTheDocument();
      expect(screen.getByText('Rating')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Setting')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(screen.getByText('Game ID')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('calls onSort when sort option is clicked', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const teamButton = screen.getByText('Team').closest('button');
      fireEvent.click(teamButton!);

      expect(mockOnSort).toHaveBeenCalledWith('team', 'asc');
    });

    it('toggles sort direction when same key is clicked', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const dateButton = screen.getByText('Date Created').closest('button');
      fireEvent.click(dateButton!);

      expect(mockOnSort).toHaveBeenCalledWith('created_at', 'asc');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct CSS classes', () => {
      render(<GameLogsSort sortKey="created_at" sortDirection="desc" onSort={mockOnSort} />);

      const container = screen.getByText('Sort by:').closest('div');
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'gap-2',
        'sm:flex-row',
        'sm:items-center',
        'sm:gap-2'
      );
    });
  });
});
