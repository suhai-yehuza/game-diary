'use client';

import Link from 'next/link';

import type { NavItemProps } from '@/lib/types/component.types';

interface INavItemExtendedProps extends NavItemProps {
  onClick?: () => void;
  isStacked?: boolean;
  colorClass?: string;
  closeMenu?: () => void;
}

export function NavItem({
  href,
  isActive,
  children,
  className = '',
  onClick,
  isStacked = false,
  colorClass = '',
  closeMenu,
  ...props
}: INavItemExtendedProps) {
  const handleClick = () => {
    if (onClick) onClick();
    if (isStacked && closeMenu) closeMenu();
  };

  return (
    <Link
      href={href}
      className={
        isStacked
          ? `w-[90vw] sm:w-[70vw] md:w-[400px] max-w-xs h-10 flex items-center justify-center text-sm whitespace-nowrap rounded font-medium transition-all duration-150 bg-opacity-90 shadow-sm mb-3 mx-auto ${isActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'} ${colorClass} ${className}`
          : `block py-2 text-base transition-colors whitespace-nowrap flex items-center w-full h-full ${isActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'} ${className}`
      }
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
