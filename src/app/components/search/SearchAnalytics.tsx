'use client';

import { useEffect, useRef } from 'react';

import type { ISearchAnalyticsProps, ISearchEvent } from '@/lib/types';

// Interfaces moved to src/lib/types/components.types.ts

export function SearchAnalytics({
  query,
  resultsCount,
  searchTime,
  category,
  filters,
  children,
}: ISearchAnalyticsProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!query || hasTracked.current) return;

    const trackSearchEvent = async () => {
      const searchEvent: ISearchEvent = {
        query: query.trim(),
        resultsCount,
        searchTime,
        category,
        filters,
        timestamp: Date.now(),
        sessionId: getSessionId(),
      };

      try {
        // Send to analytics endpoint (if available)
        await fetch('/api/analytics/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchEvent),
        });
      } catch (_error) {
        // Fallback to localStorage for offline tracking
        storeSearchEventLocally(searchEvent);
      }

      hasTracked.current = true;
    };

    void trackSearchEvent();
  }, [query, resultsCount, searchTime, category, filters]);

  return <div data-testid="search-analytics">{children}</div>;
}

// Helper functions
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = localStorage.getItem('search_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('search_session_id', sessionId);
  }
  return sessionId;
}

function storeSearchEventLocally(event: ISearchEvent) {
  if (typeof window === 'undefined') return;

  try {
    const existingEvents = JSON.parse(localStorage.getItem('search_events') || '[]');
    existingEvents.push(event);

    // Keep only last 100 events to prevent localStorage overflow
    if (existingEvents.length > 100) {
      existingEvents.splice(0, existingEvents.length - 100);
    }

    localStorage.setItem('search_events', JSON.stringify(existingEvents));
  } catch (_error) {
    console.warn('Failed to store search event locally:', _error);
  }
}

// Hook for tracking search interactions
export function useSearchAnalytics() {
  const trackSearchInteraction = (interaction: string, data?: Record<string, unknown>) => {
    const event = {
      query: interaction,
      resultsCount: 0,
      searchTime: 0,
      category: 'interaction',
      filters: data,
      timestamp: Date.now(),
      sessionId: getSessionId(),
    };

    try {
      // Send to analytics endpoint
      void fetch('/api/analytics/search-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
        .catch(() => {
          // Fallback to localStorage
          storeSearchEventLocally(event);
        })
        .catch(() => {
          // Ignore errors in analytics
        });
    } catch (_error) {
      console.warn('Failed to track search interaction:', _error);
    }
  };

  return { trackSearchInteraction };
}
