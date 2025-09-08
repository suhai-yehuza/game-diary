'use client';

import { useEffect, useState } from 'react';

import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

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
      // Mock mode (consolidated) or test environment
      isMockModeEnabled() ||
      isTestOrCIEnvironment());

  return {
    shouldDisplayBanner,
    isClient,
    bannerHeight: shouldDisplayBanner ? 88 : 0,
  };
}
