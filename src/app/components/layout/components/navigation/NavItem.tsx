'use client';

import Link from 'next/link';

import { getSportsButtonClass } from '@/lib/constants/colors';
import type { INavItemExtendedProps, SportsConfigKey } from '@/types';

export function NavItem({
  href,
  isActive,
  children,
  className = '',
  onClick,
  isStacked = false,
  closeMenu,
  sport,
  ...props
}: INavItemExtendedProps & { sport?: SportsConfigKey }) {
  const handleClick = () => {
    if (onClick) onClick();
    if (isStacked && closeMenu) closeMenu();
  };

  // Get sport-specific colors if sport is provided
  const getSportColors = () => {
    if (!sport) {
      return {
        active:
          'text-white dark:text-white bg-brand-primary border-2 border-brand-primary shadow-lg font-semibold',
        inactive:
          'text-theme-primary bg-theme-secondary rounded-full border-2 border-theme-secondary hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary shadow-md',
      };
    }

    const sportClass = getSportsButtonClass(sport);
    return {
      active: `text-white dark:text-white ${sportClass} border-2 border-opacity-30 shadow-lg font-semibold`,
      inactive: `text-theme-primary bg-theme-secondary rounded-full border-2 border-theme-secondary hover:${sportClass.replace('bg-', 'bg-').replace('hover:bg-', 'hover:bg-')} hover:text-text-inverse shadow-md`,
    };
  };

  const colors = getSportColors();

  // Modern mobile styling with proper touch targets - Google Search button style
  const mobileStackedClasses = `
    w-full max-w-sm mx-auto
    min-h-[56px] px-6 py-4
    flex items-center justify-center
    text-base font-medium
    rounded-lg
    transition-all duration-200 ease-out
    active:scale-98
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
    shadow-sm
    nav-item-google-style
    ${isActive ? colors.active : colors.inactive}
    ${className}
  `;

  // Desktop styling - Google Search button style
  const desktopClasses = `
    inline-block py-2.5 px-5
    text-base font-medium
    transition-all duration-200
    whitespace-nowrap
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
    nav-item-google-style
    ${isActive ? colors.active : colors.inactive}
    ${className}
  `;

  return (
    <Link
      href={href}
      className={isStacked ? mobileStackedClasses : desktopClasses}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
