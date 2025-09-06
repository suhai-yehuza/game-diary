'use client';

import Link from 'next/link';

import type { INavItemExtendedProps } from '@/types';

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

  // Modern mobile styling with proper touch targets - Google Search button style
  const mobileStackedClasses = `
    w-full max-w-sm mx-auto
    min-h-[56px] px-6 py-4
    flex items-center justify-center
    text-base font-medium
    rounded-lg
    transition-all duration-200 ease-out
    active:scale-98
    focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1
    shadow-sm
    nav-item-google-style
    ${
      isActive
        ? 'text-white bg-blue-600 border border-blue-700 shadow-md font-semibold'
        : 'text-white bg-gray-600 border-0 hover:border hover:border-gray-500 hover:bg-gray-500'
    }
    ${className}
  `;

  // Desktop styling - Google Search button style
  const desktopClasses = `
    inline-block py-2.5 px-5
    text-base font-medium
    transition-all duration-200
    whitespace-nowrap
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1
    nav-item-google-style
    ${
      isActive
        ? 'text-white bg-blue-600 border border-blue-700 shadow-md font-semibold'
        : 'text-white bg-gray-600 border-0 hover:border hover:border-gray-500 hover:bg-gray-500 shadow-sm'
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
