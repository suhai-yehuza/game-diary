'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';

// Common search input component
function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className = '',
  autoFocus = false,
  autoComplete = 'off',
  spellCheck = false,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder={placeholder}
        className={`pl-8 w-full bg-transparent border-none focus:ring-0 outline-none transition-all duration-200 ${className}`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        autoFocus={autoFocus}
      />
    </div>
  );
}

// Common close button component
function CloseButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={`text-gray-400 hover:text-gray-600 focus:outline-none ${className}`}
      aria-label="Close search"
      onMouseDown={e => {
        e.preventDefault();
        onClick();
      }}
    >
      <X className="h-5 w-5" />
    </button>
  );
}

// Hook for mobile detection
function useMobileDetection(breakpoint = 640) {
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
      setDebouncedQuery(search_query);
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsFocused(false);
      }
    },
    [search_query]
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

  return {
    search_query,
    isFocused,
    setIsFocused,
    handleSearch,
    handleSearchChange,
    clearSearch,
  };
}

function SearchBarContent({ autoFocus = false }: { autoFocus?: boolean } = {}) {
  const { search_query, isFocused, setIsFocused, handleSearch, handleSearchChange, clearSearch } =
    useSearchLogic();
  const isMobile = useMobileDetection(640);
  const pathname = usePathname();

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

  // For detaching effect
  const baseFormClass =
    'relative max-w-[180px] md:max-w-[220px] h-11 bg-background border border-[#27272a] shadow flex items-center px-2 transition-all duration-200 text-sm';

  if (isFocused) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] animate-fadeIn">
        {/* Overlay for mobile search */}
        {isMobile && (
          <div
            className="fixed inset-0 z-0 bg-white/90 dark:bg-black/80 transition-colors"
            onClick={() => setIsFocused(false)}
            aria-label="Close search overlay"
            role="button"
            tabIndex={0}
          />
        )}
        <form
          onSubmit={handleSearch}
          className="w-[300px] md:w-[400px] h-12 bg-background/95 dark:bg-background/95 backdrop-blur-sm border border-[#27272a] shadow-2xl flex items-center px-4 py-2 rounded-md relative z-10"
          tabIndex={-1}
        >
          <SearchInput
            value={search_query}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={getPlaceholder()}
            className="h-11 md:h-11 text-base"
            autoFocus
          />
          <CloseButton onClick={() => setIsFocused(false)} className="ml-2" />
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSearch} className={baseFormClass} tabIndex={-1}>
      <SearchInput
        value={search_query}
        onChange={handleSearchChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={getPlaceholder()}
        className="h-11 text-sm"
      />
      {search_query && (
        <CloseButton onClick={clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2" />
      )}
    </form>
  );
}

export function SearchBar(props: { autoFocus?: boolean }) {
  return (
    <Suspense fallback={<div className="w-[200px] h-10 bg-gray-200 animate-pulse rounded-md" />}>
      <SearchBarContent {...props} />
    </Suspense>
  );
}

// Export hooks for use in other components
export { useMobileDetection, useSearchLogic };
