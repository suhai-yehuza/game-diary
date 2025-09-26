/// <reference types="node" />
'use client';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  HeaderRightSection,
  Logo,
  NavigationContainer,
  useMobileDetection,
} from '@/app/components/layout/components';
import { NAVIGATION_DESKTOP_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { SkipNavigation } from '@/app/components/layout/components/SkipNavigation';
import { UnifiedMobileNavigation } from '@/app/components/layout/components/UnifiedMobileNavigation';
import { useMenuContext } from '@/app/components/providers';
import { useBannerVisibility } from '@/hooks/use-banner-visibility';

export function Header() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const pathname = usePathname() || '/';
  // Consider compact if below desktop breakpoint so tablets without full nav use mobile menu
  const isCompactViewport = useMobileDetection(NAVIGATION_DESKTOP_BREAKPOINT);
  const { shouldDisplayBanner, bannerHeight } = useBannerVisibility();

  // Scroll detection state - always flush to top when scrolling
  const [isScrolled, setIsScrolled] = useState(false);

  // Overlap detection state
  const [isOverlapping, setIsOverlapping] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);

  // Menu is stacked only if expanded and in mobile/overlay mode
  const isStacked = isMenuExpanded && isCompactViewport;

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') {
        return pathname === '/';
      }
      if (path === '/sports/nba') {
        return pathname === path || pathname.startsWith(`${path}/`);
      }
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  const handleCloseMenu = useCallback(() => setIsMenuExpanded(false), [setIsMenuExpanded]);

  // Optimized overlap detection with consolidated observer
  useEffect(() => {
    const checkOverlap = () => {
      if (!logoRef.current || !rightSectionRef.current || !headerRef.current) return;

      const logoRect = logoRef.current.getBoundingClientRect();
      const rightSectionRect = rightSectionRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      // Check if logo and right section are overlapping
      const isOverlappingNow = logoRect.right > rightSectionRect.left;

      // Also check if the total width of logo + right section exceeds the header width
      const totalWidth = logoRect.width + rightSectionRect.width;
      const headerWidth = headerRect.width;
      const isWidthExceeded = totalWidth > headerWidth * 0.9; // Increased threshold to 90% to be less aggressive

      // Only set overlapping if there's actual overlap AND we're not on a very wide screen
      const isVeryWideScreen = headerWidth > 1200; // Don't hide nav on very wide screens
      setIsOverlapping((isOverlappingNow || isWidthExceeded) && !isVeryWideScreen);
    };

    // Check overlap on mount
    checkOverlap();

    // Use a single ResizeObserver for all elements
    const resizeObserver = new ResizeObserver(checkOverlap);

    // Observe all relevant elements
    const elementsToObserve = [headerRef.current, logoRef.current, rightSectionRef.current].filter(
      Boolean
    );

    elementsToObserve.forEach(element => {
      if (element) resizeObserver.observe(element);
    });

    // Throttled resize listener for better performance
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkOverlap, 100);
    };

    window.addEventListener('resize', throttledResize, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', throttledResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Scroll detection effect - always flush to top when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If at the very top of the page, keep header floating
      if (currentScrollY < 16) {
        setIsScrolled(false);
      } else {
        // Any scrolling (up or down) - flush to top
        setIsScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <SkipNavigation />
      <header
        ref={headerRef}
        data-testid="header"
        id="main-navigation"
        className={`fixed ${isScrolled ? 'top-0 left-0 right-0 w-full rounded-none' : 'top-4 left-4 right-4 w-auto rounded-xl'} bg-gray-800 border-gray-600 text-white backdrop-blur-md border shadow-xl z-50 transition-all duration-300 ease-in-out force-dark-header`}
        style={{
          marginTop: shouldDisplayBanner ? `${bannerHeight}px` : '0px',
        }}
      >
        {/* Overlay for mobile menu */}
        {isMenuExpanded && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={handleCloseMenu}
            aria-label="Close menu overlay"
            tabIndex={0}
            style={{ border: 'none', background: 'transparent', padding: 0, margin: 0 }}
          />
        )}
        <div
          className={`grid h-14 items-center w-full relative z-50 px-4 ${
            isOverlapping || isCompactViewport
              ? 'grid-cols-[auto_1fr_auto]'
              : 'grid-cols-[auto_1fr_auto]'
          }`}
        >
          {/* Logo Section */}
          <div ref={logoRef}>
            <Logo isMenuExpanded={isMenuExpanded} />
          </div>

          {/* Navigation Section */}
          <NavigationContainer
            isMenuExpanded={isMenuExpanded}
            isActive={isActive}
            setIsMenuExpanded={setIsMenuExpanded}
            closeMenu={handleCloseMenu}
            isStacked={isStacked}
            isOverlapping={isOverlapping}
          />

          {/* Right Section */}
          <div ref={rightSectionRef}>
            <HeaderRightSection isMenuExpanded={isMenuExpanded} />
          </div>
        </div>
      </header>

      {/* Unified Mobile Navigation - handles both bottom nav and mobile menu */}
      <UnifiedMobileNavigation />
    </>
  );
}
