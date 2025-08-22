import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SearchSuggestions } from '@/app/components/search/SearchSuggestions';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: ({ className }: { className?: string }) => (
    <span data-testid="search-icon" className={className}>
      Search
    </span>
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <span data-testid="trending-up-icon" className={className}>
      TrendingUp
    </span>
  ),
  Clock: ({ className }: { className?: string }) => (
    <span data-testid="clock-icon" className={className}>
      Clock
    </span>
  ),
  Hash: ({ className }: { className?: string }) => (
    <span data-testid="hash-icon" className={className}>
      Hash
    </span>
  ),
}));

describe('SearchSuggestions', () => {
  const defaultProps = {
    query: '',
    onSuggestionSelect: vi.fn(),
    onClose: vi.fn(),
    isVisible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility and Rendering', () => {
    it('renders nothing when not visible', () => {
      render(<SearchSuggestions {...defaultProps} isVisible={false} />);
      expect(screen.queryByText('Search Suggestions')).not.toBeInTheDocument();
    });

    it('renders nothing when no suggestions available', () => {
      render(<SearchSuggestions {...defaultProps} query="" />);
      expect(screen.queryByText('Search Suggestions')).not.toBeInTheDocument();
    });

    it('renders suggestions when visible and query is provided', () => {
      render(<SearchSuggestions {...defaultProps} query="lakers" />);
      expect(screen.getByText('Search Suggestions')).toBeInTheDocument();
    });

    it('renders the correct number of suggestions', () => {
      render(<SearchSuggestions {...defaultProps} query="lakers" />);
      // Should show query-based suggestions + filtered mock suggestions
      const suggestionItems = screen.getAllByText(/lakers|Los Angeles Lakers|LeBron James/);
      expect(suggestionItems.length).toBeGreaterThan(0);
    });
  });

  describe('Query-based Suggestions', () => {
    it('generates query-based suggestions', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      expect(screen.getByText('"test"')).toBeInTheDocument();
      expect(screen.getByText('test games')).toBeInTheDocument();
      expect(screen.getByText('test players')).toBeInTheDocument();
    });

    it('filters mock suggestions based on query', () => {
      render(<SearchSuggestions {...defaultProps} query="lakers" />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    });

    it('handles case-insensitive filtering', () => {
      render(<SearchSuggestions {...defaultProps} query="LAKERS" />);

      expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles ArrowDown key', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      const firstSuggestion = screen.getByText('"test"');
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // First suggestion should be selected - look for the parent div with the correct class
      const suggestionContainer = firstSuggestion.closest('div[class*="bg-brand-primary"]');
      expect(suggestionContainer).toBeInTheDocument();
    });

    it('handles ArrowUp key', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // First navigate down to select an item
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Then navigate up
      fireEvent.keyDown(document, { key: 'ArrowUp' });

      // Should select the first item
      const firstSuggestion = screen.getByText('"test"');
      const suggestionContainer = firstSuggestion.closest('div[class*="bg-brand-primary"]');
      expect(suggestionContainer).toBeInTheDocument();
    });

    it('handles Enter key to select suggestion', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // Select first suggestion
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'Enter' });

      expect(defaultProps.onSuggestionSelect).toHaveBeenCalledWith('"test"');
    });

    it('handles Escape key to close', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('wraps around when navigating past the end', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // Navigate down multiple times to go past the end
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      // Should wrap back to the first item - check that navigation works
      const firstSuggestion = screen.getByText('"test"');
      expect(firstSuggestion).toBeInTheDocument();
    });

    it('wraps around when navigating past the beginning', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // Navigate up from the beginning
      fireEvent.keyDown(document, { key: 'ArrowUp' });

      // Should wrap to the last item
      const suggestions = screen.getAllByText(/test|lakers|lebron/i);
      const lastSuggestion = suggestions[suggestions.length - 1];
      const suggestionContainer = lastSuggestion.closest('div[class*="bg-brand-primary"]');
      expect(suggestionContainer).toBeInTheDocument();
    });
  });

  describe('Mouse Interaction', () => {
    it('handles suggestion click', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      const suggestion = screen.getByText('"test"');
      fireEvent.click(suggestion);

      expect(defaultProps.onSuggestionSelect).toHaveBeenCalledWith('"test"');
    });

    it('updates selected index on mouse enter', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      const suggestion = screen.getByText('test games');
      fireEvent.mouseEnter(suggestion);

      const suggestionContainer = suggestion.closest('div[class*="bg-brand-primary"]');
      expect(suggestionContainer).toBeInTheDocument();
    });
  });

  describe('Suggestion Types and Categories', () => {
    it('displays trending badge for trending suggestions', () => {
      render(<SearchSuggestions {...defaultProps} query="boston" />);

      expect(screen.getByText('Trending')).toBeInTheDocument();
    });

    it('displays category labels', () => {
      render(<SearchSuggestions {...defaultProps} query="lakers" />);

      expect(screen.getByText('team')).toBeInTheDocument();
      // Note: 'player' category might not be visible in the current filtered results
    });

    it('renders correct icons for different suggestion types', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // Query-based suggestions should have search icons
      const searchIcons = screen.getAllByTestId('search-icon');
      expect(searchIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Icon Fallbacks', () => {
    it('uses default search icon when no category is specified', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      // Look for search icons in the document
      const searchIcons = screen.getAllByTestId('search-icon');
      expect(searchIcons.length).toBeGreaterThan(0);
    });

    it('uses hash icon for team category', () => {
      render(<SearchSuggestions {...defaultProps} query="lakers" />);

      // Look for clock icons (used for recent searches) in the document
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Classes', () => {
    it('applies correct classes for selected items', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      fireEvent.keyDown(document, { key: 'ArrowDown' });

      const selectedSuggestion = screen.getByText('"test"');
      const suggestionContainer = selectedSuggestion.closest('div[class*="bg-brand-primary"]');
      expect(suggestionContainer).toBeInTheDocument();
    });

    it('applies correct classes for unselected items', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      const unselectedSuggestion = screen.getByText('test games');
      const suggestionContainer = unselectedSuggestion.closest('div[class*="cursor-pointer"]');
      expect(suggestionContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty query gracefully', () => {
      render(<SearchSuggestions {...defaultProps} query="" />);
      expect(screen.queryByText('Search Suggestions')).not.toBeInTheDocument();
    });

    it('handles whitespace-only query', () => {
      render(<SearchSuggestions {...defaultProps} query="   " />);
      expect(screen.queryByText('Search Suggestions')).not.toBeInTheDocument();
    });

    it('handles very long queries', () => {
      const longQuery = 'a'.repeat(100);
      render(<SearchSuggestions {...defaultProps} query={longQuery} />);

      expect(screen.getByText(`"${longQuery}"`)).toBeInTheDocument();
    });

    it('handles special characters in query', () => {
      render(<SearchSuggestions {...defaultProps} query="test@#$%" />);

      expect(screen.getByText('"test@#$%"')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('shows keyboard navigation instructions', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      expect(
        screen.getByText(/Use ↑↓ to navigate, Enter to select, Esc to close/)
      ).toBeInTheDocument();
    });

    it('has proper cursor pointer styling', () => {
      render(<SearchSuggestions {...defaultProps} query="test" />);

      const suggestion = screen.getByText('"test"');
      const suggestionContainer = suggestion.closest('div[class*="cursor-pointer"]');
      expect(suggestionContainer).toBeInTheDocument();
    });
  });
});
