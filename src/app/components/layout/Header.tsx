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
import { useMenuContext } from '@/app/components/providers';
import { useLiveGames } from '@/hooks/use-live-games';
import { isTestOrCIEnvironment } from '@/lib/utils/e2e-test-setup';

export function Header() {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const pathname = usePathname() || '/';
  const isMobile = useMobileDetection();
  const { games } = useLiveGames();

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

  // Check if there are live games to determine spacing
  // Use a stable initial state to prevent hydration mismatches
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Banner should be displayed when there are real games OR in test/CI environment
  const hasLiveGames = mounted && games && games.length > 0;
  const shouldShowBanner = hasLiveGames || isTestOrCIEnvironment();
  const headerMarginClass = shouldShowBanner ? 'mt-20' : 'mt-0';

  return (
    <header
      data-testid="header"
      className={`w-full border-b-2 border-neutral-200 dark:border-neutral-600 shadow-md dark:shadow-lg bg-background ${headerMarginClass}`}
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
  );
}
