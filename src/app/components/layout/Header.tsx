/// <reference types="node" />
'use client';
import { usePathname } from 'next/navigation';
import React, { useState, useCallback } from 'react';

import {
  HeaderRightSection,
  Logo,
  MobileSearchOverlay,
  NavigationContainer,
  useMobileDetection,
} from '@/app/components/layout/components';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { useMenuContext } from '@/app/components/providers';

export function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const pathname = usePathname() || '/';
  const isMobile = useMobileDetection(1024);

  // Menu is stacked only if expanded and in mobile/overlay mode
  const isStacked = isMenuExpanded && isMobile;

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
    setIsSearchVisible(false);
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible(true);
    if (isMenuExpanded) setIsMenuExpanded(false);
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleCloseMenu = useCallback(() => setIsMenuExpanded(false), [setIsMenuExpanded]);
  const handleCloseSearch = useCallback(() => setIsSearchVisible(false), []);

  return (
    <>
      {/* Live Games Banner */}
      <LiveGamesBanner />

      <header
        data-testid="header"
        className="w-full border-b-2 border-neutral-200 dark:border-neutral-600 shadow-md dark:shadow-lg bg-background"
      >
        {/* Overlay for mobile menu */}
        {isMenuExpanded && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={handleCloseMenu}
            aria-label="Close menu overlay"
            role="button"
            tabIndex={0}
          />
        )}
        <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full relative z-50">
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
          <HeaderRightSection isMenuExpanded={isMenuExpanded} onSearchToggle={handleSearchToggle} />
        </div>

        {/* Mobile Search Overlay */}
        <MobileSearchOverlay isVisible={isSearchVisible} onClose={handleCloseSearch} />
      </header>
    </>
  );
}
