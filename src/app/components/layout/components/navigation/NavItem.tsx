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
    rounded-xl
    transition-all duration-200 ease-out
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
    }
    ${className}
  `;

  // Desktop styling
  const desktopClasses = `
    block py-3 px-4
    text-base font-medium
    transition-all duration-200
    whitespace-nowrap
    flex items-center w-full h-full
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${
      isActive
        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
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
