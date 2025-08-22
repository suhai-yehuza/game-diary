'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';

import { MOBILE_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { SearchSuggestions } from '@/app/components/search/SearchSuggestions';

// Common search input component
function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  className = '',
  autoFocus = false,
  autoComplete = 'off',
  spellCheck = false,
  id,
  ariaLabel,
  'data-testid': dataTestId,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
  id?: string;
  ariaLabel?: string;
  'data-testid'?: string;
}) {
  return (
    <div className="relative flex-1">
      {!value && (
        <Search className="absolute left-1.5 xs:left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 text-neutral-500 dark:text-neutral-400" />
      )}
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full bg-transparent border-none focus:ring-0 outline-none transition-all duration-200 !text-neutral-900 dark:!text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 ${value ? 'pl-1.5 xs:pl-2 sm:pl-2.5 md:pl-3' : 'pl-6 xs:pl-7 sm:pl-8 md:pl-9'} ${className}`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        autoFocus={autoFocus}
        id={id}
        aria-label={ariaLabel}
        data-testid={dataTestId}
      />
    </div>
  );
}

// Common close button component
function CloseButton({
  onClick,
  className = '',
  ariaLabel,
}: {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className={`!text-white hover:!text-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${className}`}
      aria-label={ariaLabel}
      onMouseDown={e => {
        e.preventDefault();
        onClick();
      }}
    >
      <X className="h-5 w-5" />
    </button>
  );
}

// Hook for mobile detection (for use by other components)
function useMobileDetection(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook for search functionality
function useSearchLogic() {
  const [search_query, setSearchQuery] = useState('');
  const [debounced_query, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SEARCH_DEBOUNCE_MS = 500;

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      setDebouncedQuery(query);
    }
  }, [searchParams]);

  // Update previous path when pathname changes
  useEffect(() => {
    if (pathname && !pathname.includes('search')) {
      previousPathRef.current = pathname;
      // Clear search when navigating away from search page
      setSearchQuery('');
      setDebouncedQuery('');
    }
  }, [pathname]);

  // Handle URL updates when debounced query changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const trimmedQuery = debounced_query.trim();

      // Only navigate if we have a valid pathname and query
      if (trimmedQuery && pathname && pathname !== '/_not-found' && !pathname.includes('404')) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        if (pathname.startsWith('/protected/admin')) {
          router.push(`/protected/admin/users?q=${encodedQuery}`);
        } else {
          router.push(`/search?q=${encodedQuery}`);
        }
      } else if (
        !trimmedQuery &&
        pathname &&
        pathname !== '/_not-found' &&
        !pathname.includes('404')
      ) {
        // Return to the previous page when search is cleared, but only if it's a valid path
        const previousPath = previousPathRef.current;
        if (
          previousPath &&
          previousPath !== '/_not-found' &&
          !previousPath.includes('404') &&
          previousPath !== pathname
        ) {
          router.push(previousPath);
        }
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [debounced_query, router, pathname]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedQuery = search_query.trim();

      // Immediate search on Enter (no debounce)
      if (trimmedQuery && pathname && pathname !== '/_not-found' && !pathname.includes('404')) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        if (pathname.startsWith('/protected/admin')) {
          router.push(`/protected/admin/users?q=${encodedQuery}`);
        } else {
          router.push(`/search?q=${encodedQuery}`);
        }
      }

      // Close suggestions
      setIsFocused(false);
    },
    [search_query, pathname, router, setIsFocused]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDebouncedQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Handle keyboard events for better UX
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const trimmedQuery = search_query.trim();

        if (trimmedQuery && pathname && pathname !== '/_not-found' && !pathname.includes('404')) {
          const encodedQuery = encodeURIComponent(trimmedQuery);
          if (pathname.startsWith('/protected/admin')) {
            router.push(`/protected/admin/users?q=${encodedQuery}`);
          } else {
            router.push(`/search?q=${encodedQuery}`);
          }
        }

        setIsFocused(false);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        e.currentTarget.blur();
      }
    },
    [search_query, pathname, router, setIsFocused]
  );

  return {
    search_query,
    isFocused,
    setIsFocused,
    handleSearch,
    handleSearchChange,
    clearSearch,
    handleKeyDown,
  };
}

function SearchBarContent({
  autoFocus = false,
  isFocused: controlledIsFocused,
  setIsFocused: controlledSetIsFocused,
}: { autoFocus?: boolean; isFocused?: boolean; setIsFocused?: (v: boolean) => void } = {}) {
  const {
    search_query,
    isFocused: internalIsFocused,
    setIsFocused: internalSetIsFocused,
    handleSearch,
    handleSearchChange,
    clearSearch,
    handleKeyDown,
  } = useSearchLogic();
  const pathname = usePathname();

  // Use controlled or internal focus state
  const isFocused = controlledIsFocused ?? internalIsFocused;
  const setIsFocused = controlledSetIsFocused ?? internalSetIsFocused;

  // Set isFocused to true whenever autoFocus changes to true
  useEffect(() => {
    if (autoFocus) {
      setIsFocused(true);
    }
  }, [autoFocus, setIsFocused]);

  // Get placeholder text based on current path
  const getPlaceholder = () => {
    return pathname.startsWith('/protected/admin') ? 'Search users...' : 'Global search...';
  };

  // Responsive form class for normal state
  const baseFormClass =
    'relative max-w-[120px] xs:max-w-[140px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[240px] xl:max-w-[280px] h-8 xs:h-9 sm:h-10 md:h-11 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow flex items-center px-1.5 xs:px-2 sm:px-2.5 md:px-3 transition-all duration-200 text-xs xs:text-sm sm:text-sm md:text-base';

  // Expanded form class for focused state (responsive, no overlay)
  const expandedFormClass =
    'relative w-full max-w-[95vw] xs:max-w-[calc(100vw-1rem)] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] h-10 xs:h-11 sm:h-12 md:h-12 bg-white dark:bg-gray-800 backdrop-blur-sm border border-gray-300 dark:border-gray-600 shadow-2xl flex items-center px-2 xs:px-3 sm:px-4 md:px-5 py-2 rounded-md transition-all duration-200 text-sm xs:text-base sm:text-base md:text-lg z-[100]';

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      // Update the search query with the selected suggestion
      const event = {
        target: { value: suggestion },
      } as React.ChangeEvent<HTMLInputElement>;
      handleSearchChange(event);

      // Submit the search
      const formEvent = new Event('submit', { bubbles: true, cancelable: true });
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(formEvent);
      }

      // Close suggestions
      setIsFocused(false);
    },
    [handleSearchChange, setIsFocused]
  );

  // Only expand the searchbar in place, no overlay
  return (
    <div className="relative">
      <form
        onSubmit={handleSearch}
        className={isFocused ? expandedFormClass : baseFormClass}
        tabIndex={-1}
      >
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <SearchInput
          id="search-input"
          value={search_query}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className={
            isFocused
              ? 'h-10 xs:h-11 sm:h-12 md:h-12 text-sm xs:text-base sm:text-base md:text-lg'
              : 'h-8 xs:h-9 sm:h-10 md:h-11 text-xs xs:text-sm sm:text-sm md:text-base'
          }
          autoFocus={autoFocus}
          aria-label="Search"
          data-testid="search"
        />
        {isFocused ? (
          <CloseButton
            onClick={() => setIsFocused(false)}
            className="ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            ariaLabel="Close search"
          />
        ) : (
          search_query && (
            <CloseButton
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              ariaLabel="Clear search"
            />
          )
        )}
      </form>

      {/* Search Suggestions */}
      <SearchSuggestions
        query={search_query}
        onSuggestionSelect={handleSuggestionSelect}
        onClose={() => setIsFocused(false)}
        isVisible={isFocused && search_query.length > 0}
      />
    </div>
  );
}

export function SearchBar(props: {
  autoFocus?: boolean;
  isFocused?: boolean;
  setIsFocused?: (v: boolean) => void;
}) {
  return (
    <Suspense fallback={<div className="w-[200px] h-10 bg-gray-200 animate-pulse rounded-md" />}>
      <SearchBarContent {...props} />
    </Suspense>
  );
}

// Export hooks for use in other components
export { useMobileDetection, useSearchLogic };
