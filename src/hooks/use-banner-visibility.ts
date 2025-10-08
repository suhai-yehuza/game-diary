'use client';

import { useEffect, useState } from 'react';

import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';
import { isMockModeEnabled } from '@/lib/utils/mock-mode';

import { useLiveGames } from './use-live-games';

/**
 * Hook to determine if the live games banner should be displayed
 * Handles client-side detection and hydration properly
 *
 * Features:
 * - Dynamic banner height measurement for perfect header positioning
 * - Responsive behavior with resize and orientation change listeners
 * - Mobile-optimized with debounced resize handling
 * - Automatic re-measurement when banner visibility changes
 */
export function useBannerVisibility() {
  const { games } = useLiveGames();
  const [isClient, setIsClient] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only run banner detection on client side to avoid hydration mismatches
  const shouldDisplayBanner =
    isClient &&
    // Show banner if there are games OR if we're in mock/test mode (games will load)
    ((games && games.length > 0) ||
      // In mock mode or test environment, show banner even if games haven't loaded yet
      isMockModeEnabled() ||
      isTestOrCIEnvironment());

  // Measure the actual banner height when it's displayed
  useEffect(() => {
    const measureBannerHeight = () => {
      if (shouldDisplayBanner && isClient) {
        const bannerElement = document.querySelector('[data-testid="live-games-banner"]');
        if (bannerElement) {
          const height = bannerElement.getBoundingClientRect().height;
          setBannerHeight(height);
        } else {
          // Fallback height if banner element not found yet
          setBannerHeight(48); // Approximate banner height
        }
      } else {
        setBannerHeight(0);
      }
    };

    // Initial measurement
    measureBannerHeight();

    // Debounced resize handler for better mobile performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(measureBannerHeight);
      }, 16); // ~60fps, good for mobile
    };

    // Add resize listener for responsive behavior
    window.addEventListener('resize', handleResize, { passive: true });

    // Add orientation change listener for mobile devices
    // Use a longer delay for orientation changes as they need more time to settle
    const handleOrientationChange = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        requestAnimationFrame(measureBannerHeight);
      }, 100); // Longer delay for orientation changes
    };
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true });

    // Also re-measure when banner visibility changes
    const timeoutId = setTimeout(measureBannerHeight, 100);

    // Use MutationObserver to detect when banner is added to DOM
    const observer = new MutationObserver(() => {
      if (shouldDisplayBanner && isClient) {
        requestAnimationFrame(measureBannerHeight);
      }
    });

    // Observe the body for banner additions
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeout);
      observer.disconnect();
    };
  }, [shouldDisplayBanner, isClient]);

  return {
    shouldDisplayBanner,
    isClient,
    bannerHeight,
  };
}
