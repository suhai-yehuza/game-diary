import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GameLogsSearch } from '@/app/components/game-logs/GameLogsSearch';

describe('GameLogsSearch Extended Tests', () => {
  const defaultProps = {
    searchTerm: '',
    searchField: 'all',
    onSearchChange: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      expect(() => {
        render(<GameLogsSearch {...defaultProps} />);
      }).not.toThrow();
    });

    it('renders search input with correct placeholder', () => {
      render(<GameLogsSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search game logs...');
      expect(searchInput).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<GameLogsSearch {...defaultProps} />);

      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
    });

    it('renders search field dropdown', () => {
      render(<GameLogsSearch {...defaultProps} />);

      const searchFieldSelect = screen.getByRole('combobox');
      expect(searchFieldSelect).toBeInTheDocument();
    });

    it('displays initial search term', () => {
      render(<GameLogsSearch {...defaultProps} searchTerm="test search" />);

      const searchInput = screen.getByDisplayValue('test search');
      expect(searchInput).toBeInTheDocument();
    });

    it('handles empty search term', () => {
      render(<GameLogsSearch {...defaultProps} searchTerm="" />);

      const searchInput = screen.getByPlaceholderText('Search game logs...');
      expect(searchInput).toHaveValue('');
    });

    it('handles null search term', () => {
      render(<GameLogsSearch {...defaultProps} searchTerm={null as any} />);

      const searchInput = screen.getByPlaceholderText('Search game logs...');
      expect(searchInput).toHaveValue('');
    });

    it('handles undefined search term', () => {
      render(<GameLogsSearch {...defaultProps} searchTerm={undefined as any} />);

      const searchInput = screen.getByPlaceholderText('Search game logs...');
      expect(searchInput).toHaveValue('');
    });

    it('displays correct search field options', () => {
      render(<GameLogsSearch {...defaultProps} />);

      expect(screen.getByText('All Fields')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long search terms', () => {
      const longSearchTerm = 'a'.repeat(1000);
      render(<GameLogsSearch {...defaultProps} searchTerm={longSearchTerm} />);

      const searchInput = screen.getByDisplayValue(longSearchTerm);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles special characters in search term', () => {
      const specialSearchTerm = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      render(<GameLogsSearch {...defaultProps} searchTerm={specialSearchTerm} />);

      const searchInput = screen.getByDisplayValue(specialSearchTerm);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles unicode characters in search term', () => {
      const unicodeSearchTerm = '🎮游戏日志🔍';
      render(<GameLogsSearch {...defaultProps} searchTerm={unicodeSearchTerm} />);

      const searchInput = screen.getByDisplayValue(unicodeSearchTerm);
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper input attributes', () => {
      render(<GameLogsSearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search game logs...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('has proper select attributes', () => {
      render(<GameLogsSearch {...defaultProps} />);

      const searchFieldSelect = screen.getByRole('combobox');
      expect(searchFieldSelect).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('handles null onSearchChange callback', () => {
      expect(() => {
        render(<GameLogsSearch {...defaultProps} onSearchChange={null as any} />);
      }).not.toThrow();
    });

    it('handles different search field values', () => {
      const searchFields = [
        'all',
        'classification',
        'watched_setting',
        'watched_scope',
        'notes',
        'tags',
        'team',
      ];

      searchFields.forEach(field => {
        expect(() => {
          render(<GameLogsSearch {...defaultProps} searchField={field} />);
        }).not.toThrow();
      });
    });
  });
});
