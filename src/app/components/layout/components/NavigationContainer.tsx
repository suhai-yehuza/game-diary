import { Menu, X } from 'lucide-react';

import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation/ClientOnlyNavigationLinks';
import type { INavigationContainerProps } from '@/lib/types';

export function NavigationContainer({
  isMenuExpanded,
  isActive,
  setIsMenuExpanded,
  closeMenu,
  isStacked,
  onMenuToggle,
}: INavigationContainerProps) {
  return (
    <nav className="flex justify-center">
      <div className="flex h-16 items-center relative">
        {/* Mobile Menu Button - only on mobile */}
        <button
          aria-label={isMenuExpanded ? 'Close menu' : 'Open menu'}
          onClick={onMenuToggle}
          className={`lg:hidden p-2 rounded-md transition-colors z-50 ${
            isMenuExpanded
              ? 'fixed top-4 left-4 bg-white/90 border border-gray-300 shadow-lg'
              : 'mr-4 relative'
          } hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:hover:bg-gray-800`}
          style={{ pointerEvents: 'auto' }}
          data-testid="mobile-menu-button"
        >
          {isMenuExpanded ? <X className="h-7 w-7 text-gray-900" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Desktop/Tablet Nav Links - always visible in header on lg+ */}
        <div className="hidden lg:flex items-center h-full">
          <ClientOnlyNavigationLinks
            isActive={isActive}
            _isMenuExpanded={false}
            _setIsMenuExpanded={() => undefined}
            closeMenu={undefined}
            isStacked={false}
          />
        </div>

        {/* Navigation Links & Important Items (Mobile Overlay) */}
        {isMenuExpanded && (
          <div
            className="fixed inset-0 z-40 flex flex-col bg-background dark:bg-black/90 lg:hidden"
            data-testid="mobile-menu-overlay"
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
