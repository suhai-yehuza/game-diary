'use client';

import Link from 'next/link';

import {
  TOUCH_TARGET_LARGE,
  FLUID_TYPOGRAPHY,
} from '@/app/components/layout/components/breakpoints';
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
        active: 'text-white bg-brand-primary border-2 border-brand-primary shadow-lg font-semibold',
        inactive:
          'text-foreground bg-muted rounded-full border-2 border-border hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary shadow-md',
      };
    }

    const sportClass = getSportsButtonClass(sport);
    return {
      active: `text-white ${sportClass} border-2 border-opacity-30 shadow-lg font-semibold`,
      inactive: `text-foreground bg-muted rounded-full border-2 border-border hover:${sportClass.replace('bg-', 'bg-').replace('hover:bg-', 'hover:bg-')} hover:text-white shadow-md`,
    };
  };

  const colors = getSportColors();

  // Enhanced mobile styling with fluid typography and proper touch targets
  const mobileStackedClasses = `
    w-full max-w-sm mx-auto
    flex items-center justify-center
    rounded-lg
    transition-all duration-200 ease-out
    active:scale-98
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
    shadow-sm
    nav-item-google-style
    ${isActive ? colors.active : colors.inactive}
    ${className}
  `;

  // Enhanced desktop styling with fluid typography
  const desktopClasses = `
    inline-block py-2.5 px-5
    transition-all duration-200
    whitespace-nowrap
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
    nav-item-google-style
    ${isActive ? colors.active : colors.inactive}
    ${className}
  `;

  // Apply fluid typography and touch target styles
  const getInlineStyles = () => {
    if (isStacked) {
      return {
        minHeight: TOUCH_TARGET_LARGE.minHeight,
        minWidth: TOUCH_TARGET_LARGE.minWidth,
        padding: TOUCH_TARGET_LARGE.padding,
        fontSize: FLUID_TYPOGRAPHY.headerNav,
        lineHeight: TOUCH_TARGET_LARGE.lineHeight,
        fontWeight: '500',
      };
    }
    return {
      fontSize: FLUID_TYPOGRAPHY.headerNav,
      fontWeight: '500',
    };
  };

  return (
    <Link
      href={href}
      className={isStacked ? mobileStackedClasses : desktopClasses}
      style={getInlineStyles()}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
