import { useState, useMemo, useCallback } from 'react';

import { UseSearchFiltersOptions } from '@/lib/types/consolidated.types';

export function useSearchFilters({
  filterConfig,
  additionalFilters = {},
}: UseSearchFiltersOptions) {
  // Initialize filter state based on config
  const initialState = useMemo(() => {
    const state: Record<string, string | number | boolean> = {};
    Object.entries(filterConfig).forEach(([key, config]) => {
      state[key] = config.defaultValue;
    });
    return state;
  }, [filterConfig]);

  const [filters, setFilters] = useState(initialState);

  // Update individual filter
  const updateFilter = useCallback((key: string, value: string | number | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear all filters back to defaults
  const clearFilters = useCallback(() => {
    setFilters(initialState);
  }, [initialState]);

  // Check if any filters are active (not default values)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = filterConfig[key]?.defaultValue;
      return value !== defaultValue;
    });
  }, [filters, filterConfig]);

  // Build final filters object for GraphQL queries
  const builtFilters = useMemo(() => {
    const result: Record<string, string | number | boolean> = {
      ...(additionalFilters as Record<string, string | number | boolean>),
    };

    Object.entries(filters).forEach(([key, value]) => {
      const config = filterConfig[key];
      const isDefault = value === config?.defaultValue;

      if (!isDefault) {
        // Handle special filter logic
        if (key === 'searchText' && typeof value === 'string' && value.trim()) {
          result.searchText = value.trim();
        } else if (key === 'rating' && value !== 'all') {
          const ratingValue = typeof value === 'string' ? parseInt(value) : Number(value);
          result.minRating = ratingValue;
          result.maxRating = ratingValue;
        } else if (value !== 'all' && value !== '') {
          // Convert to appropriate type
          if (config?.type === 'number') {
            result[key] = typeof value === 'string' ? parseInt(value) : Number(value);
          } else if (config?.type === 'boolean') {
            result[key] = value === 'yes' || value === true;
          } else {
            result[key] = value;
          }
        }
      }
    });

    return result;
  }, [filters, filterConfig, additionalFilters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    builtFilters,
  };
}
