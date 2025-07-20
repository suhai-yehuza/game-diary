/// <reference types="node" />
'use client';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Search, X, Menu, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';

import { ThemeToggle } from '@/app/components/common';
import { ClerkWrapper } from '@/app/components/common/clerk-error-boundary';
import { LiveGamesBanner } from '@/app/components/live-games-banner';
import { useMenuContext } from '@/app/components/providers';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/dropdown-menu';
import { isUnitTestEnvironment, isE2ETestEnvironment } from '@/lib/config/api.config';
import type { NavItemProps } from '@/lib/types/componentTypes';

// Utility function to check if Clerk is configured
function isClerkConfigured(): boolean {
  // In E2E test environments, always return true to ensure consistent behavior
  if (
    process.env.E2E_MOCK_MODE === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.PLAYWRIGHT_CI === 'true'
  ) {
    return true;
  }

  // Check for Clerk environment variable
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

function SearchBarContent({ autoFocus = false }: { autoFocus?: boolean } = {}) {
  const [search_query, setSearchQuery] = useState('');
  const [debounced_query, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(autoFocus);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SEARCH_DEBOUNCE_MS = 500;

  // Set isFocused to true whenever autoFocus changes to true
  useEffect(() => {
    if (autoFocus) {
      setIsFocused(true);
    }
  }, [autoFocus]);

  // Set mobile state on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      setDebouncedQuery(query);
    }
  }, [searchParams]);

  // Update previous path when pathname changes
  useEffect(() => {
    if (pathname && !pathname.includes('search')) {
      previousPathRef.current = pathname;
      // Clear search when navigating away from search page
      setSearchQuery('');
      setDebouncedQuery('');
    }
  }, [pathname]);

  // Handle URL updates when debounced query changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const trimmedQuery = debounced_query.trim();

      // Only navigate if we have a valid pathname and query
      if (trimmedQuery && pathname && pathname !== '/_not-found' && !pathname.includes('404')) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        if (pathname.startsWith('/protected/admin')) {
          router.push(`/protected/admin/users?q=${encodedQuery}`);
        } else {
          router.push(`/search?q=${encodedQuery}`);
        }
      } else if (
        !trimmedQuery &&
        pathname &&
        pathname !== '/_not-found' &&
        !pathname.includes('404')
      ) {
        // Return to the previous page when search is cleared, but only if it's a valid path
        const previousPath = previousPathRef.current;
        if (
          previousPath &&
          previousPath !== '/_not-found' &&
          !previousPath.includes('404') &&
          previousPath !== pathname
        ) {
          router.push(previousPath);
        }
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [debounced_query, router, pathname]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setDebouncedQuery(search_query);
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsFocused(false);
      }
    },
    [search_query]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDebouncedQuery(query);
  }, []);

  // For detaching effect
  const baseFormClass =
    'relative max-w-[180px] md:max-w-[220px] h-11 bg-background border border-[#27272a] shadow flex items-center px-2 transition-all duration-200 text-sm';
  if (isFocused) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] animate-fadeIn">
        {/* Overlay for mobile search */}
        {isMobile && (
          <div
            className="fixed inset-0 z-0 bg-white/90 dark:bg-black/80 transition-colors"
            onClick={() => setIsFocused(false)}
            aria-label="Close search overlay"
            role="button"
            tabIndex={0}
          />
        )}
        <form
          onSubmit={handleSearch}
          className="w-[300px] md:w-[400px] h-12 bg-background border border-[#27272a] shadow-2xl flex items-center px-4 py-2 rounded-md relative z-10"
          tabIndex={-1}
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={
                pathname.startsWith('/protected/admin') ? 'Search users...' : 'Search games...'
              }
              className="pl-8 w-full h-11 md:h-11 text-base bg-transparent border-none focus:ring-0 outline-none transition-all duration-200"
              value={search_query}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                if (isMobile) {
                  setIsFocused(false);
                } else {
                  setIsFocused(false);
                }
              }}
              autoComplete="off"
              spellCheck={false}
              ref={(input: HTMLInputElement | null) => {
                input?.focus();
              }}
            />
          </div>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close search"
            onMouseDown={e => {
              e.preventDefault();
              setIsFocused(false);
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      </div>
    );
  }
  return (
    <form onSubmit={handleSearch} className={baseFormClass} tabIndex={-1}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder={
            pathname.startsWith('/protected/admin') ? 'Search users...' : 'Search games...'
          }
          className="pl-8 w-full h-11 text-sm bg-transparent border-none focus:ring-0 outline-none transition-all duration-200"
          value={search_query}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          spellCheck={false}
        />
        {search_query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
            onClick={() => {
              setSearchQuery('');
              setDebouncedQuery('');
            }}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}

function SearchBar(props: { autoFocus?: boolean }) {
  return (
    <Suspense fallback={<div className="w-[200px] h-10 bg-gray-200 animate-pulse rounded-md" />}>
      <SearchBarContent {...props} />
    </Suspense>
  );
}

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
function AdminNavE2E({ isActive }: { isActive: (path: string) => boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavItem href="/protected/admin" isActive={isActive('/protected/admin')}>
          Admin
          <ChevronDown className="h-3 w-3 ml-1" />
        </NavItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="w-full">
            External API
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="w-full">
            Database
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="w-full">
            Audit Logs
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Production version of admin nav (with hooks)
function AdminNavContent({ isActive }: { isActive: (path: string) => boolean }) {
  const { user, isLoaded } = useUser();

  // Check if user is admin based on Clerk roles/metadata
  const userRoles = user?.publicMetadata?.role ?? [];
  const isAdmin =
    isLoaded &&
    Array.isArray(userRoles) &&
    (userRoles.includes('admin') || userRoles.includes('Admin'));

  if (!isLoaded || !isAdmin) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NavItem href="/protected/admin" isActive={isActive('/protected/admin')}>
          Admin
          <ChevronDown className="h-3 w-3 ml-1" />
        </NavItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/experimental" className="w-full">
            External API
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/database" className="w-full">
            Database
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/protected/admin/audit-logs" className="w-full">
            Audit Logs
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminNav({ isActive }: { isActive: (path: string) => boolean }) {
  if (!isClerkConfigured()) {
    return null; // Don't render admin nav if Clerk is not configured
  }

  return (
    <Suspense fallback={<div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />}>
      {/* For E2E tests, use the E2E version without hooks */}
      {isE2ETestEnvironment ? (
        <AdminNavE2E isActive={isActive} />
      ) : (
        <ClerkWrapper>
          <SignedIn>
            <AdminNavContent isActive={isActive} />
          </SignedIn>
        </ClerkWrapper>
      )}
    </Suspense>
  );
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

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

function ClientOnlyNavigationLinks(
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

function AuthControlsContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial client render, render a consistent placeholder
  if (!mounted) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
          <span className="text-xs text-gray-500">Auth</span>
        </div>
      </div>
    );
  }

  // Always render the test sign-in button for unit tests only, not for E2E tests
  if (isUnitTestEnvironment) {
    return (
      <div className="flex items-center">
        <span className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 shadow-sm transition-all border border-blue-700 min-w-[44px] min-h-[32px] flex-shrink-0 whitespace-nowrap">
          <button data-testid="sign-in-button" disabled>
            Sign In
          </button>
        </span>
      </div>
    );
  }

  // For E2E tests, ensure we have a sign-in button that tests can find
  if (isE2ETestEnvironment) {
    return (
      <div className="flex items-center">
        <span className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 shadow-sm transition-all border border-blue-700 min-w-[44px] min-h-[32px] flex-shrink-0 whitespace-nowrap">
          {/* Always render a consistent button for E2E tests across all browsers */}
          <button
            data-testid="sign-in-button"
            className="w-full h-full flex items-center justify-center text-white font-medium"
            disabled={false}
            onClick={e => {
              // Prevent default to avoid navigation issues in tests
              e.preventDefault();
              console.log('Sign-in button clicked in E2E test environment');
            }}
          >
            Sign In
          </button>
        </span>
      </div>
    );
  }

  // If Clerk is not configured, show a placeholder
  if (!isClerkConfigured()) {
    return (
      <div className="flex items-center">
        <span className="bg-gray-400 text-white font-medium rounded-lg text-sm px-5 py-1 shadow-sm transition-all border border-gray-500 min-w-[44px] min-h-[32px] flex-shrink-0 whitespace-nowrap">
          <button disabled className="cursor-not-allowed">
            Auth Unavailable
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <ClerkWrapper>
        <SignedOut>
          <span className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 shadow-sm transition-all border border-blue-700 min-w-[44px] min-h-[32px] flex-shrink-0 whitespace-nowrap">
            <SignInButton mode="modal" data-testid="sign-in-button">
              Sign In
            </SignInButton>
          </span>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </ClerkWrapper>
    </div>
  );
}

function ClientOnlyAuthControls() {
  return (
    <Suspense
      fallback={<div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}
    >
      <AuthControlsContent />
    </Suspense>
  );
}

export function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const {
    isMenuExpanded,
    setIsMenuExpanded,
  }: { isMenuExpanded: boolean; setIsMenuExpanded: (v: boolean) => void } = useMenuContext();
  const pathname = usePathname() || '/';
  const [isMobile, setIsMobile] = useState(false);

  // Memoize mobile state check to prevent unnecessary re-renders
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Menu is stacked only if expanded and in mobile/overlay mode
  const isStacked = isMenuExpanded && isMobile;

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') {
        return pathname === '/';
      }
      if (path === '/sports/nba') {
        return pathname === path || pathname.startsWith(`${path}/`);
      }
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname]
  );

  const handleMenuToggle = useCallback(() => {
    setIsMenuExpanded(!isMenuExpanded);
    setIsSearchVisible(false);
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible(true);
    if (isMenuExpanded) setIsMenuExpanded(false);
  }, [isMenuExpanded, setIsMenuExpanded]);

  const handleCloseMenu = useCallback(() => setIsMenuExpanded(false), [setIsMenuExpanded]);
  const handleCloseSearch = useCallback(() => setIsSearchVisible(false), []);

  return (
    <>
      {/* Live Games Banner */}
      <LiveGamesBanner />

      <header className="w-full border-b-2 border-neutral-200 dark:border-neutral-600 shadow-md dark:shadow-lg bg-background">
        {/* Overlay for mobile menu */}
        {isMenuExpanded && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={handleCloseMenu}
            aria-label="Close menu overlay"
            role="button"
            tabIndex={0}
          />
        )}
        <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full relative z-50">
          {/* Logo - Left (hide when menu is open as overlay, and only show on large screens) */}
          {!isMenuExpanded && (
            <div className="pl-10 hidden lg:flex items-center">
              <Link href="/" className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Image
                  src="/logos/gamelog-large.svg"
                  alt="Game Diary Logo"
                  width={44}
                  height={44}
                  sizes="(max-width: 600px) 36px, 44px"
                  loading="eager"
                  priority
                  className="w-11 h-11 cursor-pointer"
                />
              </Link>
            </div>
          )}

          {/* Navigation - Center */}
          <nav className="flex justify-center">
            <div className="flex h-16 items-center">
              {/* Mobile Menu Button */}
              <button
                aria-label="Toggle menu"
                onClick={handleMenuToggle}
                className="lg:hidden mr-4 relative z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Navigation Links & Important Items (Mobile Overlay) */}
              <div
                className={`${isMenuExpanded ? 'flex' : 'hidden'} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent z-50 shadow-lg lg:shadow-none border-b lg:border-b-0 min-h-[calc(100vh-4rem)] lg:min-h-0 items-center justify-center`}
              >
                {/* Nav links area, scrollable, no extra top padding */}
                <div className="flex-1 flex flex-col items-center justify-start gap-2 px-4 sm:px-0 mt-0">
                  <ClientOnlyNavigationLinks
                    isActive={isActive}
                    _isMenuExpanded={isMenuExpanded}
                    _setIsMenuExpanded={setIsMenuExpanded}
                    closeMenu={handleCloseMenu}
                    isStacked={isStacked}
                  />
                </div>
              </div>
            </div>
          </nav>

          {/* Right Section - Search, Theme, Auth (hide on mobile when menu is open) */}
          <div
            className={`pr-10 flex items-center gap-2 sm:gap-4 justify-end ${isMenuExpanded ? 'hidden sm:flex' : ''}`}
          >
            {/* Mobile Search Button */}
            <button aria-label="Toggle search" onClick={handleSearchToggle} className="sm:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* Desktop Search Bar */}
            <div className="hidden sm:flex items-center">
              <SearchBar />
            </div>

            {/* Vertical Divider */}
            <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-4" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Controls */}
            <ClientOnlyAuthControls />
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchVisible && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 sm:hidden min-w-[44px] min-h-[44px]"
            onClick={handleCloseSearch}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                handleCloseSearch();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close search overlay"
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="mt-8 w-full max-w-md bg-background rounded-full border border-[#27272a] shadow-lg flex items-center px-4 py-2 relative min-w-[44px] min-h-[44px]"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  handleCloseSearch();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Search container"
            >
              <SearchBar autoFocus />
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={handleCloseSearch}
                aria-label="Close search"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
