'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/DropdownMenu';
import type { NavItemProps } from '@/lib/types/component.types';

function NavItem({
  href,
  isActive,
  children,
  className = '',
  onClick,
  isStacked = false,
  colorClass = '',
  closeMenu,
  ...props
}: NavItemProps & {
  onClick?: () => void;
  isStacked?: boolean;
  colorClass?: string;
  closeMenu?: () => void;
}) {
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

// E2E test version of admin nav (no hooks)
function AdminNavE2E({ isActive: _isActive }: { isActive: (path: string) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 text-base lg:text-sm transition-colors hover:text-blue-600">
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="cursor-pointer">
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="cursor-pointer">
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="cursor-pointer">
            Experimental
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminNavContent({ isActive: _isActive }: { isActive: (path: string) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-1 text-base lg:text-sm transition-colors hover:text-blue-600">
          <span>Admin</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="cursor-pointer">
            Database Management
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="cursor-pointer">
            Audit Logs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="cursor-pointer">
            Experimental
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminNav({ isActive }: { isActive: (path: string) => boolean }) {
  // Use E2E test version for test environments
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return <AdminNavE2E isActive={isActive} />;
  }
  return <AdminNavContent isActive={isActive} />;
}

function NavigationLinks({
  isActive,
  _isMenuExpanded,
  _setIsMenuExpanded,
  closeMenu,
  isStacked = false,
}: {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
  closeMenu?: () => void;
  isStacked?: boolean;
}) {
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
      {isStacked ? (
        <div className="mt-12 w-full flex justify-center">
          <AdminNav isActive={isActive} />
        </div>
      ) : (
        <AdminNav isActive={isActive} />
      )}
    </nav>
  );
}

export function ClientOnlyNavigationLinks(
  props: React.ComponentProps<typeof NavigationLinks> & {
    closeMenu?: () => void;
    isStacked?: boolean;
  }
) {
  return (
    <Suspense
      fallback={
        <nav className="flex flex-col lg:flex-row items-start lg:items-center h-full lg:space-x-6 lg:space-y-0 text-xs sm:text-sm font-medium m-0 p-0">
          <Link
            href="/"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/nba"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/nfl"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/mlb"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/nhl"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/mls"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <Link
            href="/sports/all-sports"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3" />
          <Link
            href="/protected/user"
            className="block py-2 lg:py-1.5 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center w-full lg:w-auto h-full"
          >
            <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
        </nav>
      }
    >
      <NavigationLinks {...props} />
    </Suspense>
  );
}
