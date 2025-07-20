import { MobileMenuButton } from '@/app/components/layout/components/mobile-menu-button';
import { ClientOnlyNavigationLinks } from '@/app/components/layout/components/navigation';
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
      <div className="flex h-16 items-center">
        {/* Mobile Menu Button */}
        <MobileMenuButton onToggle={onMenuToggle} />

        {/* Navigation Links & Important Items (Mobile Overlay) */}
        <div
          className={`${isMenuExpanded ? 'flex' : 'hidden'} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent z-50 shadow-lg lg:shadow-none border-b lg:border-b-0 min-h-[calc(100vh-4rem)] lg:min-h-0 items-center justify-center`}
        >
          {/* Nav links area, scrollable, no extra top padding */}
          <div className="flex-1 flex flex-col items-center justify-start gap-2 px-4 sm:px-0 mt-0">
            <ClientOnlyNavigationLinks
              isActive={isActive}
              _isMenuExpanded={isMenuExpanded}
              _setIsMenuExpanded={setIsMenuExpanded}
              closeMenu={closeMenu}
              isStacked={isStacked}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
