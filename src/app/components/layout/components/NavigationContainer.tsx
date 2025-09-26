// Menu and X icons removed - handled by UnifiedMobileNavigation
import React, { useRef, useEffect, useState } from 'react';

import { NAVIGATION_DESKTOP_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation/ClientOnlyNavigationLinks';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { INavigationContainerProps } from '@/types';

export function NavigationContainer({
  isMenuExpanded,
  isActive,
  setIsMenuExpanded,
  closeMenu,
  isStacked,
  isOverlapping = false,
}: Omit<INavigationContainerProps, 'onMenuToggle'>) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Treat anything below desktop breakpoint as compact (use mobile menu behavior)
  const isCompactViewport = useMobileDetection(NAVIGATION_DESKTOP_BREAKPOINT);

  // Detect navigation overflow - run on all screen sizes
  useEffect(() => {
    const checkOverflow = () => {
      if (!navigationRef.current) return;

      const navElement = navigationRef.current;
      const hasHorizontalOverflow = navElement.scrollWidth > navElement.clientWidth;

      // Check if navigation items are getting cut off by looking at the header container
      const headerElement = navElement.closest('header');
      if (headerElement) {
        const headerWidth = headerElement.clientWidth;
        const navWidth = navElement.scrollWidth;

        // Get actual measurements of header sections
        const logoSection = headerElement.querySelector('[data-testid="logo"]')?.parentElement;
        const rightSection = headerElement.querySelector(
          '[data-testid="header-right-section"]'
        )?.parentElement;

        const logoWidth = logoSection?.clientWidth || 100;
        const rightSectionWidth = rightSection?.clientWidth || 200;
        const padding = 32; // Header padding
        const availableWidth = headerWidth - rightSectionWidth - logoWidth - padding;

        // If navigation needs more space than available, consider it cramped
        const isCramped = navWidth > availableWidth;

        // Also check if any navigation items are actually cut off
        const navItems = navElement.querySelectorAll('a, button');
        let hasCutOffItems = false;
        navItems.forEach(item => {
          const rect = item.getBoundingClientRect();
          const headerRect = headerElement.getBoundingClientRect();
          if (rect.right > headerRect.right - rightSectionWidth) {
            hasCutOffItems = true;
          }
        });

        setHasOverflow(hasHorizontalOverflow || isCramped || hasCutOffItems);
      } else {
        setHasOverflow(hasHorizontalOverflow);
      }
    };

    // Run immediately and on resize
    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    // Also run on window load to catch initial state
    window.addEventListener('load', checkOverflow);

    return () => {
      window.removeEventListener('resize', checkOverflow);
      window.removeEventListener('load', checkOverflow);
    };
  }, []);

  // Focus trap for mobile menu overlay (legacy support)
  useEffect(() => {
    if (!isMenuExpanded || !overlayRef.current || isCompactViewport) return;
    const overlay = overlayRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'input:not([type="hidden"])',
      'select',
      'textarea',
    ];
    const getFocusable = () => overlay.querySelectorAll<HTMLElement>(focusableSelectors.join(','));
    const focusFirst = () => {
      const focusables = getFocusable();
      if (focusables.length) focusables[0].focus();
    };
    focusFirst();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(getFocusable());
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    overlay.addEventListener('keydown', handleKeyDown);
    return () => overlay.removeEventListener('keydown', handleKeyDown);
  }, [isMenuExpanded, isCompactViewport]);

  // Show mobile menu button when overlapping, when navigation items overflow, or when screen is too narrow
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const updateScreenWidth = () => setScreenWidth(window.innerWidth);
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Show mobile menu when screen is too narrow for comfortable navigation
  const isScreenTooNarrow = screenWidth > 0 && screenWidth < 1600; // More aggressive threshold for better UX
  const shouldShowMobileMenu = isOverlapping || hasOverflow || isScreenTooNarrow;

  return (
    <nav className="flex justify-center">
      <div className="flex h-14 items-center relative">
        {/* Mobile Menu Button - handled by UnifiedMobileNavigation */}
        {/* Removed since UnifiedMobileNavigation handles all mobile menu interactions */}

        {/* Desktop Navigation - show on desktop when not overlapping and no overflow */}
        {!isCompactViewport && !shouldShowMobileMenu && (
          <div className="hidden xl:flex items-center" ref={navigationRef}>
            <ClientOnlyNavigationLinks
              isActive={isActive}
              _isMenuExpanded={false}
              _setIsMenuExpanded={() => undefined}
              closeMenu={undefined}
              isStacked={false}
            />
          </div>
        )}

        {/* Tablet Navigation - show on tablet when not overlapping and no overflow */}
        {!isCompactViewport && !shouldShowMobileMenu && (
          <div className="hidden lg:flex xl:hidden items-center" ref={navigationRef}>
            <ClientOnlyNavigationLinks
              isActive={isActive}
              _isMenuExpanded={false}
              _setIsMenuExpanded={() => undefined}
              closeMenu={undefined}
              isStacked={false}
            />
          </div>
        )}

        {/* Scrollable Navigation - when items overflow but we want to keep them accessible */}
        {!isCompactViewport && hasOverflow && !isOverlapping && (
          <div
            className="hidden lg:flex items-center max-w-full overflow-x-auto scrollbar-hide"
            ref={navigationRef}
          >
            <div className="flex items-center space-x-4 min-w-max">
              <ClientOnlyNavigationLinks
                isActive={isActive}
                _isMenuExpanded={false}
                _setIsMenuExpanded={() => undefined}
                closeMenu={undefined}
                isStacked={false}
              />
            </div>
          </div>
        )}

        {/* Fallback navigation for tablet when overlapping */}
        {!isCompactViewport && isOverlapping && (
          <div className="hidden md:flex lg:hidden items-center">
            <ClientOnlyNavigationLinks
              isActive={isActive}
              _isMenuExpanded={false}
              _setIsMenuExpanded={() => undefined}
              closeMenu={undefined}
              isStacked={false}
            />
          </div>
        )}

        {/* Legacy Mobile Overlay - for medium viewports only (tablet) or when overlapping */}
        {isMenuExpanded && (!isCompactViewport || isOverlapping) && (
          <div
            ref={overlayRef}
            className="fixed inset-0 z-40 flex flex-col bg-background lg:hidden"
            data-testid="mobile-menu-overlay"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            autoFocus
          >
            {/* Nav links area, aligned to top, with margin below button */}
            <div className="flex-1 flex flex-col items-center justify-start gap-2 px-4 sm:px-0 mt-16">
              <ClientOnlyNavigationLinks
                isActive={isActive}
                _isMenuExpanded={isMenuExpanded}
                _setIsMenuExpanded={setIsMenuExpanded}
                closeMenu={closeMenu}
                isStacked={isStacked}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
