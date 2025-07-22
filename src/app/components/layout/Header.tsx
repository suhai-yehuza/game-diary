/// <reference types="node" />
'use client';
import { usePathname } from 'next/navigation';
import React, { useCallback } from 'react';

import {
  HeaderRightSection,
  Logo,
  NavigationContainer,
  useMobileDetection,
} from '@/app/components/layout/components';
import { LiveGamesBanner } from '@/app/components/LiveGamesBanner';
import { useMenuContext } from '@/app/components/providers';

export function Header() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const pathname = usePathname() || '/';
  const isMobile = useMobileDetection();

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
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleCloseMenu = useCallback(() => setIsMenuExpanded(false), [setIsMenuExpanded]);

  return (
    <>
      {/* Live Games Banner */}
      <LiveGamesBanner />

      {/* data-testid is required for unit tests in layout.test.tsx */}
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
          <HeaderRightSection isMenuExpanded={isMenuExpanded} />
        </div>
      </header>
    </>
  );
}
