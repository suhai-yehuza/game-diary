'use client';

import { Search, TrendingUp, Clock, Hash } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';

interface ISearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: 'user' | 'game' | 'team' | 'player';
  icon?: React.ReactNode;
}

interface ISearchSuggestionsProps {
  query: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function SearchSuggestions({
  query,
  onSuggestionSelect,
  onClose,
  isVisible,
}: ISearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ISearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock suggestions - in a real app, these would come from an API
  const mockSuggestions: ISearchSuggestion[] = useMemo(
    () => [
      // Recent searches
      {
        id: '1',
        text: 'Los Angeles Lakers',
        type: 'recent',
        category: 'team',
        icon: <Clock className="w-4 h-4" />,
      },
      {
        id: '2',
        text: 'LeBron James',
        type: 'recent',
        category: 'player',
        icon: <Clock className="w-4 h-4" />,
      },
      {
        id: '3',
        text: 'NBA Finals 2024',
        type: 'recent',
        category: 'game',
        icon: <Clock className="w-4 h-4" />,
      },

      // Trending searches
      {
        id: '4',
        text: 'Boston Celtics',
        type: 'trending',
        category: 'team',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        id: '5',
        text: 'Stephen Curry',
        type: 'trending',
        category: 'player',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        id: '6',
        text: 'Playoff Games',
        type: 'trending',
        category: 'game',
        icon: <TrendingUp className="w-4 h-4" />,
      },

      // General suggestions
      {
        id: '7',
        text: 'NBA Teams',
        type: 'suggestion',
        category: 'team',
        icon: <Hash className="w-4 h-4" />,
      },
      {
        id: '8',
        text: 'All Star Game',
        type: 'suggestion',
        category: 'game',
        icon: <Hash className="w-4 h-4" />,
      },
      {
        id: '9',
        text: 'Rookie Players',
        type: 'suggestion',
        category: 'player',
        icon: <Hash className="w-4 h-4" />,
      },
    ],
    []
  );

  useEffect(() => {
    if (!isVisible || !query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // Filter suggestions based on query
    const filtered = mockSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );

    // Add query-based suggestions
    const querySuggestions: ISearchSuggestion[] = [
      {
        id: 'query-1',
        text: `"${query}"`,
        type: 'suggestion',
        icon: <Search className="w-4 h-4" />,
      },
      {
        id: 'query-2',
        text: `${query} games`,
        type: 'suggestion',
        icon: <Search className="w-4 h-4" />,
      },
      {
        id: 'query-3',
        text: `${query} players`,
        type: 'suggestion',
        icon: <Search className="w-4 h-4" />,
      },
    ];

    setSuggestions([...querySuggestions, ...filtered.slice(0, 5)]);
    setSelectedIndex(-1);
  }, [query, isVisible, mockSuggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            onSuggestionSelect(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onSuggestionSelect, onClose]);

  const handleSuggestionClick = (suggestion: ISearchSuggestion) => {
    onSuggestionSelect(suggestion.text);
  };

  const getSuggestionIcon = (suggestion: ISearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon;

    switch (suggestion.category) {
      case 'team':
        return <Hash className="w-4 h-4" />;
      case 'player':
        return <Hash className="w-4 h-4" />;
      case 'game':
        return <Hash className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getSuggestionClass = (index: number) => {
    const baseClass =
      'flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-3.5 px-2 xs:px-3 sm:px-4 md:px-5 py-2 xs:py-2.5 sm:py-3 md:py-3.5 text-xs xs:text-sm sm:text-sm md:text-base cursor-pointer transition-colors';
    const isSelected = index === selectedIndex;

    if (isSelected) {
      return `${baseClass} bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary`;
    }

    return `${baseClass} !text-neutral-900 dark:!text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800`;
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-60 xs:max-h-72 sm:max-h-80 md:max-h-96 overflow-y-auto"
    >
      <div className="p-1.5 xs:p-2 sm:p-2.5 md:p-3">
        <div className="text-xs xs:text-sm sm:text-sm md:text-base font-medium text-neutral-500 dark:text-neutral-400 px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-1 xs:py-1.5 sm:py-2 md:py-2.5">
          Search Suggestions
        </div>

        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={getSuggestionClass(index)}
            onClick={() => handleSuggestionClick(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="flex-shrink-0 text-neutral-400">{getSuggestionIcon(suggestion)}</div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{suggestion.text}</div>
              {suggestion.category && (
                <div className="text-xs xs:text-xs sm:text-xs md:text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                  {suggestion.category}
                </div>
              )}
            </div>
            {suggestion.type === 'trending' && (
              <div className="flex-shrink-0">
                <span className="text-xs xs:text-xs sm:text-xs md:text-sm bg-accent-orange/10 text-accent-orange px-1.5 xs:px-2 sm:px-2.5 md:px-3 py-0.5 xs:py-1 sm:py-1 md:py-1.5 rounded-full">
                  Trending
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-700 p-1.5 xs:p-2 sm:p-2.5 md:p-3">
        <div className="text-xs xs:text-xs sm:text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
