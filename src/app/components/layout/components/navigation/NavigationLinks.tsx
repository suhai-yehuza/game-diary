'use client';

import React from 'react';

import { AdminNavWithAuth } from '@/app/components/layout/components/navigation/AdminNav';
import { NavItem } from '@/app/components/layout/components/navigation/NavItem';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';

interface INavigationLinksProps {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
}

export function NavigationLinks({
  isActive,
  _isMenuExpanded,
  _setIsMenuExpanded,
  closeMenu,
  isStacked = false,
}: INavigationLinksProps) {
  const isMobile = useMobileDetection();

  // Only close menu on mobile
  const handleNavClick = () => {
    if (isMobile && closeMenu) closeMenu();
  };

  const navItems = [
    {
      href: '/',
      label: 'Home',
      colorClass: 'bg-green-500 hover:bg-green-600',
    },
    {
      href: '/sports/nba',
      label: 'NBA',
      colorClass: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      href: '/sports/nfl',
      label: 'NFL',
      colorClass: 'bg-red-500 hover:bg-red-600',
    },
    {
      href: '/sports/mlb',
      label: 'MLB',
      colorClass: 'bg-yellow-400 hover:bg-yellow-500 text-black',
    },
    {
      href: '/sports/nhl',
      label: 'NHL',
      colorClass: 'bg-cyan-500 hover:bg-cyan-600',
    },
    {
      href: '/sports/mls',
      label: 'MLS',
      colorClass: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      href: '/sports/all-sports',
      label: 'All Sports',
      colorClass: 'bg-pink-500 hover:bg-pink-600',
    },
  ];

  const navClass = isStacked
    ? 'flex flex-col gap-3 h-full text-xs sm:text-sm font-medium m-0 p-0'
    : 'flex flex-col lg:flex-row items-start lg:items-center h-full lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0';

  return (
    <nav className={navClass}>
      {navItems.map(({ href, label, colorClass }) => (
        <NavItem
          key={href}
          href={href}
          isActive={isActive(href)}
          onClick={handleNavClick}
          isStacked={isStacked}
          colorClass={colorClass}
          closeMenu={closeMenu}
        >
          {label}
        </NavItem>
      ))}
      {/* Divider */}
      <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3" />
      {/* User Dashboard + Admin */}
      <NavItem
        href="/protected/user"
        isActive={isActive('/protected/user')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-orange-500 hover:bg-orange-600"
        closeMenu={closeMenu}
      >
        Dashboard
      </NavItem>
      {/* Add spacing between Dashboard and Admin */}
      <div className="my-1 lg:my-0 lg:mx-2" />
      {/* Only show Admin nav link for authenticated users with admin role */}
      <AdminNavWithAuth isActive={isActive} isStacked={isStacked} />
    </nav>
  );
}
