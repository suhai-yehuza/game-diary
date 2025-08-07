'use client';

import { useEffect, useState } from 'react';

import { useLiveGames } from './use-live-games';

/**
 * Hook to determine if the live games banner should be displayed
 * Handles client-side detection and hydration properly
 */
export function useBannerVisibility() {
  const { games } = useLiveGames();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only run banner detection on client side to avoid hydration mismatches
  const shouldDisplayBanner =
    isClient &&
    // Real live games
    ((games && games.length > 0) ||
      // Mock mode in development
      (process.env.NODE_ENV === 'development' && process.env.API_MOCK_MODE === 'true') ||
      // Mock mode via window global (for tests/CI)
      (typeof window !== 'undefined' && window.__API_MOCK_MODE__) ||
      // Server-injected mock mode
      (typeof window !== 'undefined' && window.__SERVER_API_MOCK_MODE__) ||
      // E2E test mode
      (typeof window !== 'undefined' && window.__E2E_MOCK_MODE__));

  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && isClient) {
    console.log('🔍 Banner visibility debug:', {
      isClient,
      hasGames: games && games.length > 0,
      gamesCount: games?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      processApiMockMode: process.env.API_MOCK_MODE,
      windowApiMockMode: typeof window !== 'undefined' ? window.__API_MOCK_MODE__ : undefined,
      windowServerApiMockMode:
        typeof window !== 'undefined' ? window.__SERVER_API_MOCK_MODE__ : undefined,
      windowE2EMockMode: typeof window !== 'undefined' ? window.__E2E_MOCK_MODE__ : undefined,
      shouldDisplayBanner,
    });
  }

  return {
    shouldDisplayBanner,
    isClient,
    bannerHeight: shouldDisplayBanner ? 88 : 0,
  };
}
