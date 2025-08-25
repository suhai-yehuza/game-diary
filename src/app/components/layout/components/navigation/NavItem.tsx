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
    min-h-[56px] px-6 py-4
    flex items-center justify-center
    text-base font-medium
    rounded-xl
    transition-all duration-200 ease-out
    active:scale-98
    focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
    shadow-sm
    ${
      isActive
        ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary border-2 border-brand-primary/30 dark:border-brand-primary/40 shadow-md'
        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
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
