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
  const isMobile = useMobileDetection(1024);

  // Only close menu on mobile
  const handleNavClick = () => {
    if (isMobile && closeMenu) closeMenu();
  };

  return (
    <nav className="flex flex-col lg:flex-row items-start lg:items-center h-full lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0">
      {/* Dashboard + Sports */}
      <NavItem
        href="/"
        isActive={isActive('/')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-green-500 hover:bg-green-600"
        closeMenu={closeMenu}
      >
        Home
      </NavItem>
      <NavItem
        href="/sports/nba"
        isActive={isActive('/sports/nba')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-blue-500 hover:bg-blue-600"
        closeMenu={closeMenu}
      >
        NBA
      </NavItem>
      <NavItem
        href="/sports/nfl"
        isActive={isActive('/sports/nfl')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-red-500 hover:bg-red-600"
        closeMenu={closeMenu}
      >
        NFL
      </NavItem>
      <NavItem
        href="/sports/mlb"
        isActive={isActive('/sports/mlb')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-yellow-400 hover:bg-yellow-500 text-black"
        closeMenu={closeMenu}
      >
        MLB
      </NavItem>
      <NavItem
        href="/sports/nhl"
        isActive={isActive('/sports/nhl')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-cyan-500 hover:bg-cyan-600"
        closeMenu={closeMenu}
      >
        NHL
      </NavItem>
      <NavItem
        href="/sports/mls"
        isActive={isActive('/sports/mls')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-purple-500 hover:bg-purple-600"
        closeMenu={closeMenu}
      >
        MLS
      </NavItem>
      <NavItem
        href="/sports/all-sports"
        isActive={isActive('/sports/all-sports')}
        onClick={handleNavClick}
        isStacked={isStacked}
        colorClass="bg-pink-500 hover:bg-pink-600"
        closeMenu={closeMenu}
      >
        All Sports
      </NavItem>
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
      {/* Only show Admin nav link for authenticated users with admin role */}
      <AdminNavWithAuth isActive={isActive} isStacked={isStacked} />
    </nav>
  );
}
