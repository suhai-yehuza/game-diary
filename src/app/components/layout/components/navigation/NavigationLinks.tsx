'use client';

import React from 'react';

import { AdminNavWithAuth } from '@/app/components/layout/components/navigation/AdminNav';
import { NavItem } from '@/app/components/layout/components/navigation/NavItem';
import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import { SPORTS_CONFIG } from '@/app/components/sports/SportsConfig';
import { useMounted } from '@/hooks/use-mounted';
import type { INavigationLinksProps } from '@/types';

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

  const navClass = isStacked
    ? 'flex flex-col gap-4 text-base font-medium m-0 p-0'
    : 'flex flex-col lg:flex-row items-start lg:items-center lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0';

  return (
    <nav className={navClass}>
      {/* Sports Section */}
      {isStacked && (
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-wide px-1">
            Sports
          </h3>
        </div>
      )}

      {/* Home */}
      <NavItem
        href="/"
        isActive={isActive('/')}
        onClick={handleNavClick}
        isStacked={isStacked}
        closeMenu={closeMenu}
        aria-current={isActive('/') ? 'page' : undefined}
      >
        Home
      </NavItem>

      {/* Sports Links */}
      {Object.entries(SPORTS_CONFIG).map(([sportKey, sport]) => (
        <NavItem
          key={sport.href}
          href={sport.href}
          isActive={isActive(sport.href)}
          onClick={handleNavClick}
          isStacked={isStacked}
          closeMenu={closeMenu}
          sport={sportKey as keyof typeof SPORTS_CONFIG}
          aria-current={isActive(sport.href) ? 'page' : undefined}
        >
          {sport.name}
        </NavItem>
      ))}

      <NavItem
        href="/sports/all-sports"
        isActive={isActive('/sports/all-sports')}
        onClick={handleNavClick}
        isStacked={isStacked}
        closeMenu={closeMenu}
        aria-current={isActive('/sports/all-sports') ? 'page' : undefined}
      >
        All Sports
      </NavItem>

      {/* Divider */}
      <div className="hidden lg:block h-6 w-px bg-theme-primary mx-3" />

      {/* Demos Section (Admin Only) */}
      {isStacked && (
        <div className="mt-6 mb-2">
          <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-wide px-1">
            Admin Tools
          </h3>
        </div>
      )}

      {/* Only show Admin nav link for authenticated users with admin role */}
      <AdminNavWithAuth isActive={isActive} isStacked={isStacked} closeMenu={closeMenu} />

      {/* Divider */}
      <div className="hidden lg:block h-6 w-px bg-theme-primary mx-3" />

      {/* Account Section */}
      {isStacked && (
        <div className="mt-6 mb-2">
          <h3 className="text-sm font-semibold text-theme-muted uppercase tracking-wide px-1">
            Account
          </h3>
        </div>
      )}

      {/* User Dashboard */}
      <NavItem
        href="/protected/dashboard"
        isActive={isActive('/protected/dashboard')}
        onClick={handleNavClick}
        isStacked={isStacked}
        closeMenu={closeMenu}
      >
        Dashboard
      </NavItem>
    </nav>
  );
}
