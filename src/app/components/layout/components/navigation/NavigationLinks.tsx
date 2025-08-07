'use client';

import React from 'react';

import { AdminNavWithAuth } from '@/app/components/layout/components/navigation/AdminNav';
import { NavItem } from '@/app/components/layout/components/navigation/NavItem';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import { useMounted } from '@/hooks/use-mounted';
import type { INavigationLinksProps } from '@/lib/types';

export function NavigationLinks({
  isActive,
  _isMenuExpanded,
  _setIsMenuExpanded,
  closeMenu,
  isStacked = false,
}: INavigationLinksProps) {
  const mounted = useMounted();
  const isMobile = useMobileDetection();
  if (!mounted) return null;

  // Only close menu on mobile
  const handleNavClick = () => {
    if (isMobile && closeMenu) closeMenu();
  };

  const navItems = [
    {
      href: '/',
      label: 'Home',
    },
    ...Object.values(SPORTS_CONFIG).map(sport => ({
      href: sport.href,
      label: sport.name,
    })),
    {
      href: '/sports/all-sports',
      label: 'All Sports',
    },
  ];

  const navClass = isStacked
    ? 'flex flex-col gap-3 h-full text-xs sm:text-sm font-medium m-0 p-0'
    : 'flex flex-col lg:flex-row items-start lg:items-center h-full lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0';

  return (
    <nav className={navClass}>
      {navItems.map(({ href, label }) => (
        <NavItem
          key={href}
          href={href}
          isActive={isActive(href)}
          onClick={handleNavClick}
          isStacked={isStacked}
          closeMenu={closeMenu}
          aria-current={isActive(href) ? 'page' : undefined}
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
