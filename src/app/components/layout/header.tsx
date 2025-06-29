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
    'relative max-w-[180px] md:max-w-[220px] h-8 bg-background border border-[#27272a] shadow flex items-center px-2 transition-all duration-200 text-sm';
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
              className="pl-8 w-full h-8 md:h-10 text-base bg-transparent border-none focus:ring-0 outline-none transition-all duration-200"
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
          className="pl-8 w-full h-8 text-sm bg-transparent border-none focus:ring-0 outline-none transition-all duration-200"
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

function NavigationLinks({
  isActive,
  _isMenuExpanded,
  setIsMenuExpanded,
  isLoaded,
  isAdmin,
}: {
  isActive: (path: string) => boolean;
  _isMenuExpanded: boolean;
  setIsMenuExpanded: (expanded: boolean) => void;
  isLoaded: boolean;
  isAdmin: boolean;
}) {
  return (
    <ul className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-20 2xl:space-x-24 p-4 lg:p-0 text-sm font-medium">
      {/* Brand & Dashboard Group */}
      <li className="lg:relative">
        <Link
          href="/dashboard"
          className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
            isActive('/dashboard') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
          }`}
          onClick={() => setIsMenuExpanded(false)}
        >
          Dashboard
        </Link>
        <div className="hidden lg:block absolute -right-10 2xl:-right-12 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 dark:bg-gray-700" />
      </li>

      {/* Sports Group */}
      <li className="lg:relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 2xl:space-x-6">
          <Link
            href="/sports/nba"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/nba') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            NBA
          </Link>
          <Link
            href="/sports/nfl"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/nfl') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            NFL
          </Link>
          <Link
            href="/sports/mlb"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/mlb') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            MLB
          </Link>
          <Link
            href="/sports/nhl"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/nhl') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            NHL
          </Link>
          <Link
            href="/sports/mls"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/mls') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            MLS
          </Link>
          <Link
            href="/sports/all-sports"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/sports/all-sports') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            All Sports
          </Link>
        </div>
        <div className="hidden lg:block absolute -right-10 2xl:-right-12 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 dark:bg-gray-700" />
      </li>

      {/* User & Admin Group */}
      <li>
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 2xl:space-x-6">
          <Link
            href="/protected/user"
            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
              isActive('/protected/user') ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'
            }`}
            onClick={() => setIsMenuExpanded(false)}
          >
            Profile
          </Link>
          <SignedIn>
            {isLoaded && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                      isActive('/protected/admin')
                        ? 'text-blue-600 font-semibold'
                        : 'hover:text-blue-600'
                    }`}
                  >
                    Admin
                    <ChevronDown className="h-3 w-3" />
                  </button>
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
            )}
          </SignedIn>
        </div>
      </li>
    </ul>
  );
}

export function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const pathname = usePathname() || '/';
  const { user, isLoaded } = useUser();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path || pathname.startsWith('/protected/user');
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const emailAddress = user?.emailAddresses[0].emailAddress;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',')
    : [];
  const isAdmin = Boolean(isLoaded && emailAddress && adminEmails.includes(emailAddress));

  return (
    <>
      {/* Live Games Banner */}
      <LiveGamesBanner />

      <header className="w-full border-b lg:border-b">
        <div className="flex h-16 items-center justify-between w-full">
          {/* Logo - Left */}
          <div className="pl-10">
            <Link href="/">
              <Image
                src="/logos/gamelog-large.svg"
                alt="Game Diary Logo"
                width={32}
                height={32}
                className="w-8 h-8 cursor-pointer"
                style={{ height: 'auto' }}
              />
            </Link>
          </div>

          {/* Navigation - Center */}
          <nav className="flex-1 flex justify-center">
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
                className={`${!isMenuExpanded ? 'hidden' : 'block'} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent z-50 shadow-lg lg:shadow-none`}
              >
                <NavigationLinks
                  isActive={isActive}
                  _isMenuExpanded={isMenuExpanded}
                  setIsMenuExpanded={setIsMenuExpanded}
                  isLoaded={isLoaded}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          </nav>

          {/* Right Section - Search, Theme, Auth */}
          <div className="flex items-center gap-2 sm:gap-4 pr-10">
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
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="bg-[#757575] text-white hover:bg-[#616161] focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 text-center border border-gray-600 dark:bg-[#e5e5e5] dark:text-gray-800 dark:hover:bg-[#d4d4d4] dark:focus:ring-gray-300"
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchVisible && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 sm:hidden"
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
              className="mt-8 w-full max-w-md bg-background rounded-full border border-[#27272a] shadow-lg flex items-center px-4 py-2 relative"
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
