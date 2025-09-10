import { useCallback, useEffect, useState } from 'react';

import type { IUseDebouncedSearchOptions } from '@/types';

export function useDebouncedSearch({
  delay = 300,
  minLength = 2,
  onSearch,
}: IUseDebouncedSearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, delay);

    if (query.length >= minLength || query.length === 0) {
      setIsSearching(true);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay, minLength]);

  // Call onSearch when debounced query changes
  useEffect(() => {
    if (onSearch && (debouncedQuery.length >= minLength || debouncedQuery.length === 0)) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch, minLength]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  }, []);

  return {
    query,
    debouncedQuery,
    isSearching,
    handleSearch,
    clearSearch,
    isValidQuery: debouncedQuery.length >= minLength || debouncedQuery.length === 0,
  };
}
