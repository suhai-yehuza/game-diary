import { Menu, X } from 'lucide-react';
import React, { useRef, useEffect } from 'react';

import { TABLET_BREAKPOINT } from '@/app/components/layout/components/breakpoints';
import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation/ClientOnlyNavigationLinks';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { INavigationContainerProps } from '@/types';

export function NavigationContainer({
  isMenuExpanded,
  isActive,
  setIsMenuExpanded,
  closeMenu,
  isStacked,
  onMenuToggle,
}: INavigationContainerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  // Treat anything below tablet breakpoint as compact (use mobile menu behavior)
  const isCompactViewport = useMobileDetection(TABLET_BREAKPOINT);

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

  return (
    <nav className="flex justify-center">
      <div className="flex h-14 items-center relative">
        {/* Mobile Menu Button - for compact viewports (mobile and small tablets) */}
        <button
          aria-label={isMenuExpanded ? 'Close menu' : 'Open menu'}
          onClick={onMenuToggle}
          className={`md:block lg:hidden p-2 rounded-md transition-colors z-50 ${
            isMenuExpanded
              ? 'fixed top-4 left-4 bg-gray-800/90 border border-gray-500 shadow-lg'
              : 'mr-4 relative'
          } hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary`}
          style={{ pointerEvents: 'auto' }}
          data-testid="mobile-menu-button"
        >
          {isMenuExpanded ? <X className="h-7 w-7 text-white" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop/Tablet Nav Links - always visible in header on lg+ */}
        <div className="hidden lg:flex items-center">
          <ClientOnlyNavigationLinks
            isActive={isActive}
            _isMenuExpanded={false}
            _setIsMenuExpanded={() => undefined}
            closeMenu={undefined}
            isStacked={false}
          />
        </div>

        {/* Legacy Mobile Overlay - for medium viewports only (tablet) */}
        {isMenuExpanded && !isCompactViewport && (
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
