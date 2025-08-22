'use client';

import Link from 'next/link';

import type { INavItemExtendedProps } from '@/lib/types';

export function NavItem({
  href,
  isActive,
  children,
  className = '',
  onClick,
  isStacked = false,
  closeMenu,
  ...props
}: INavItemExtendedProps) {
  const handleClick = () => {
    if (onClick) onClick();
    if (isStacked && closeMenu) closeMenu();
  };

  // Modern mobile styling with proper touch targets
  const mobileStackedClasses = `
    w-full max-w-sm mx-auto
    min-h-[56px] px-4 py-3
    flex items-center justify-center
    text-base font-medium
    rounded-lg
    transition-all duration-200 ease-out
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    ${
      isActive
        ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary border border-brand-primary/30 dark:border-brand-primary/40'
        : 'bg-neutral-50 text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 shadow-sm'
    }
    ${className}
  `;

  // Desktop styling
  const desktopClasses = `
    block py-2.5 px-4
    text-base font-medium
    transition-all duration-200
    whitespace-nowrap
    flex items-center w-full h-full
    rounded-md
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    ${
      isActive
        ? 'text-brand-primary dark:text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20'
        : 'hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
    }
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
