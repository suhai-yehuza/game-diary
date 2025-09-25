/// <reference types="node" />
'use client';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import {
  HeaderRightSection,
  Logo,
  NavigationContainer,
  useMobileDetection,
} from '@/app/components/layout/components';
import { TABLET_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { MobileBottomNavigation } from '@/app/components/layout/components/MobileBottomNavigation';
import { MobileMenuSheet } from '@/app/components/layout/components/MobileMenuSheet';
import { useMenuContext } from '@/app/components/providers';
import { useBannerVisibility } from '@/hooks/use-banner-visibility';

export function Header() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const pathname = usePathname() || '/';
  // Consider compact if below tablet breakpoint so tablets without full nav use mobile menu
  const isCompactViewport = useMobileDetection(TABLET_BREAKPOINT);
  const { shouldDisplayBanner, bannerHeight } = useBannerVisibility();

  // Scroll detection state - always flush to top when scrolling
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleMenuToggle = useCallback(() => {
    setIsMenuExpanded(!isMenuExpanded);
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleCloseMenu = useCallback(() => setIsMenuExpanded(false), [setIsMenuExpanded]);

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
      <header
        data-testid="header"
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
        <div className="grid grid-cols-[auto_1fr_auto] h-14 items-center w-full relative z-50 px-4">
          {/* Logo Section */}
          <Logo isMenuExpanded={isMenuExpanded} />

          {/* Navigation Section */}
          <NavigationContainer
            isMenuExpanded={isMenuExpanded}
            isActive={isActive}
            setIsMenuExpanded={setIsMenuExpanded}
            closeMenu={handleCloseMenu}
            isStacked={isStacked}
            onMenuToggle={handleMenuToggle}
          />

          {/* Right Section */}
          <HeaderRightSection isMenuExpanded={isMenuExpanded} />
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />

      {/* Mobile Menu Sheet */}
      <MobileMenuSheet isActive={isActive} />
    </>
  );
}
