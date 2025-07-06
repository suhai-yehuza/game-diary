import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import type { IUseSearchOptions } from '@/lib/types/hooks.types';

export function useSearch(options: IUseSearchOptions = {}) {
  const {
    debounceMs = 500,
    searchPath = '/search',
    adminSearchPath = '/protected/admin/users',
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const trimmedQuery = debouncedQuery.trim();

      // Only navigate if we have a valid pathname and query
      if (trimmedQuery && pathname && pathname !== '/_not-found' && !pathname.includes('404')) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        if (pathname.startsWith('/protected/admin')) {
          router.push(`${adminSearchPath}?q=${encodedQuery}`);
        } else {
          router.push(`${searchPath}?q=${encodedQuery}`);
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
    }, debounceMs);
  }, [debouncedQuery, router, pathname, debounceMs, searchPath, adminSearchPath]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setDebouncedQuery(searchQuery);
    },
    [searchQuery]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDebouncedQuery(query);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    isFocused,
    handleSearch,
    handleSearchChange,
    handleFocus,
    handleBlur,
    clearSearch,
  };
}
