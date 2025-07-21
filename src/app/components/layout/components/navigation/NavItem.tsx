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
      className={`block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full
        ${isActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}
        ${className}
        ${isStacked ? `w-1/2 mx-auto my-2 rounded-lg text-white font-bold text-lg text-center shadow transition-colors px-8 py-2 ${colorClass}` : ''}
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
