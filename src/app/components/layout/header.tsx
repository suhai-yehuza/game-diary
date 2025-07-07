/// <reference types="node" />
'use client';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Search, X, Menu, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { ThemeToggle } from '@/app/components/common';
import { LiveGamesBanner } from '@/app/components/live-games-banner';
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
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}

function SearchBarContent() {
  const [search_query, setSearchQuery] = useState('');
  const [debounced_query, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const SEARCH_DEBOUNCE_MS = 500;

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(search_query);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDebouncedQuery(query);
  };

  // For detaching effect
  const baseFormClass =
    'relative max-w-[180px] md:max-w-[220px] h-11 bg-background border border-[#27272a] shadow flex items-center px-2 transition-all duration-200 text-sm';
  if (isFocused) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-[12vh] animate-fadeIn">
        <form
          onSubmit={handleSearch}
          className="w-[300px] md:w-[400px] h-12 bg-background border border-[#27272a] shadow-2xl flex items-center px-4 py-2 rounded-md relative"
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
              onBlur={() => setIsFocused(false)}
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

function SearchBar() {
  return (
    <Suspense fallback={<div className="w-[200px] h-10 bg-gray-200 animate-pulse rounded-md" />}>
      <SearchBarContent />
    </Suspense>
  );
}

function NavItem({ href, isActive, children, className = '', ...props }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap flex items-center h-full ${isActive ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

function AdminNavContent({ isActive }: { isActive: (path: string) => boolean }) {
  const { user, isLoaded } = useUser();

  // Check if user is admin based on email
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',')
    : [];
  const isAdmin = Boolean(
    isLoaded &&
      user?.emailAddresses?.[0]?.emailAddress &&
      adminEmails.includes(user.emailAddresses[0].emailAddress)
  );

  if (!isLoaded || !isAdmin) {
    return null;
  }

  return (
    <Suspense fallback={<div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />}>
      <SignedIn>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SignedIn>
    </Suspense>
  );
}

function AdminNav({ isActive }: { isActive: (path: string) => boolean }) {
  if (!isClerkConfigured()) {
    return null; // Don't render admin nav if Clerk is not configured
  }

  return (
    <Suspense fallback={<div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />}>
      <SignedIn>
        <AdminNavContent isActive={isActive} />
      </SignedIn>
    </Suspense>
  );
}

function NavigationLinks({
  isActive,
  _isMenuExpanded,
  _setIsMenuExpanded,
}: {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  _setIsMenuExpanded: (expanded: boolean) => void;
}) {
  return (
    <nav className="flex items-center h-full space-x-6 text-sm font-medium">
      {/* Dashboard + Sports */}
      <NavItem href="/dashboard" isActive={isActive('/dashboard')}>
        Dashboard
      </NavItem>
      <NavItem href="/sports/nba" isActive={isActive('/sports/nba')}>
        NBA
      </NavItem>
      <NavItem href="/sports/nfl" isActive={isActive('/sports/nfl')}>
        NFL
      </NavItem>
      <NavItem href="/sports/mlb" isActive={isActive('/sports/mlb')}>
        MLB
      </NavItem>
      <NavItem href="/sports/nhl" isActive={isActive('/sports/nhl')}>
        NHL
      </NavItem>
      <NavItem href="/sports/mls" isActive={isActive('/sports/mls')}>
        MLS
      </NavItem>
      <NavItem href="/sports/all" isActive={isActive('/sports/all')}>
        All Sports
      </NavItem>
      {/* Divider */}
      <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-3" />
      {/* Profile + Admin */}
      <NavItem href="/protected/user" isActive={isActive('/protected/user')}>
        Profile
      </NavItem>
      <AdminNav isActive={isActive} />
    </nav>
  );
}

function ClientOnlyNavigationLinks(props: React.ComponentProps<typeof NavigationLinks>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <NavigationLinks {...props} />;
}

function AuthControlsContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded animate-pulse flex items-center justify-center">
        <span className="text-xs text-gray-500">Auth</span>
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
          <SignInButton mode="modal" data-testid="sign-in-button">
            Sign In
          </SignInButton>
        </span>
      </div>
    );
  }

  // If Clerk is not configured, show a placeholder
  if (!isClerkConfigured()) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded animate-pulse flex items-center justify-center">
        <span className="text-xs text-gray-500">Auth</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
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
    </div>
  );
}

function ClientOnlyAuthControls() {
  return (
    <Suspense fallback={<div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />}>
      <AuthControlsContent />
    </Suspense>
  );
}

export function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const pathname = usePathname() || '/';

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path || pathname.startsWith('/protected/user');
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Don't show live games banner on authentication pages
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <>
      {/* Live Games Banner */}
      {!isAuthPage && <LiveGamesBanner />}

      <header className="w-full border-b lg:border-b">
        <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full">
          {/* Logo - Left */}
          <div className="pl-10 flex items-center">
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
                style={{ height: 'auto' }}
              />
            </Link>
          </div>

          {/* Navigation - Center */}
          <nav className="flex justify-center">
            <div className="flex h-16 items-center">
              {/* Mobile Menu Button */}
              <button
                aria-label="Toggle menu"
                onClick={() => {
                  setIsMenuExpanded(!isMenuExpanded);
                  setIsSearchVisible(false);
                }}
                className="lg:hidden mr-4"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Navigation Links */}
              <div
                className={`${!isMenuExpanded ? 'hidden' : 'block'} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent z-50 shadow-lg lg:shadow-none border-b lg:border-b-0`}
              >
                <ClientOnlyNavigationLinks
                  isActive={isActive}
                  _isMenuExpanded={isMenuExpanded}
                  _setIsMenuExpanded={setIsMenuExpanded}
                />
              </div>
            </div>
          </nav>

          {/* Right Section - Search, Theme, Auth */}
          <div className="pr-10 flex items-center gap-2 sm:gap-4 justify-end">
            {/* Mobile Search Button */}
            <button
              aria-label="Toggle search"
              onClick={() => {
                setIsSearchVisible(true);
                if (isMenuExpanded) setIsMenuExpanded(false);
              }}
              className="sm:hidden"
            >
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
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 sm:hidden min-w-[44px] min-h-[44px]"
            onClick={() => setIsSearchVisible(false)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setIsSearchVisible(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close search overlay"
          >
            <div
              className="mt-8 w-full max-w-md bg-background rounded-full border border-[#27272a] shadow-lg flex items-center px-4 py-2 relative min-w-[44px] min-h-[44px]"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setIsSearchVisible(false);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Search container"
            >
              <SearchBar />
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() => setIsSearchVisible(false)}
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
