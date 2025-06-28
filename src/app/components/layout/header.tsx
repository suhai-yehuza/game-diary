/// <reference types="node" />

'use client';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { ThemeToggle } from '@/app/components/common/theme-toggle';
import { LiveGamesBanner } from '@/app/components/live-games-banner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@src/app/components/ui/dropdown-menu';
import type { IButtonProps, IInputProps } from '@src/lib/types/ui.types';

const DEBOUNCE_DELAY = 500;

// Simple Button component
const Button = (props: Readonly<IButtonProps>) => {
  const { children, variant = 'default', size = 'default', className = '', ...rest } = props;

  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

// Simple Input component
const Input = (props: Readonly<IInputProps>) => {
  const { className = '', ...rest } = props;

  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    />
  );
};

function SearchBarContent() {
  const [search_query, setSearchQuery] = useState('');
  const [debounced_query, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (trimmedQuery) {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        if (pathname.startsWith('/protected/admin')) {
          router.push(`/protected/admin/users?q=${encodedQuery}`);
        } else {
          router.push(`/search?q=${encodedQuery}`);
        }
      } else {
        // Return to the previous page when search is cleared
        router.push(previousPathRef.current);
      }
    }, DEBOUNCE_DELAY);
  }, [debounced_query, router, pathname]);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(search_query);
  };

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDebouncedQuery(query);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };
  const handleCloseSearch = () => setIsFocused(false);
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const handleRefCallback = (input: HTMLInputElement | null) => {
    if (input) input.focus();
  };

  // For detaching effect
  const baseFormClass =
    'relative max-w-[180px] md:max-w-[220px] h-8 bg-background border border-[#27272a] shadow flex items-center px-2 transition-all duration-200 text-sm rounded-none';
  if (isFocused) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/70 flex items-start justify-center pt-[12vh] animate-fadeIn">
        <form
          onSubmit={handleSearch}
          className="w-[300px] md:w-[400px] h-12 flex items-center px-4 py-2 relative"
          tabIndex={-1}
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                pathname.startsWith('/protected/admin') ? 'Search users...' : 'Search games...'
              }
              className="pl-8 pr-8 w-full h-8 md:h-10 text-base bg-transparent border-none focus:ring-0 outline-none transition-all duration-200 rounded-none"
              value={search_query}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              spellCheck={false}
              ref={handleRefCallback}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close search"
              onClick={handleCloseSearch}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }
  return (
    <form onSubmit={handleSearch} className={baseFormClass} tabIndex={-1}>
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={
            pathname.startsWith('/protected/admin') ? 'Search users...' : 'Search games...'
          }
          className="pl-8 w-full h-8 text-sm bg-transparent border-none focus:ring-0 outline-none transition-all duration-200 rounded-none"
          value={search_query}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          spellCheck={false}
        />
        {search_query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
            onClick={handleClearSearch}
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

function Navigation(
  props: Readonly<{
    isMenuExpanded: boolean;
    setIsMenuExpanded: (v: boolean) => void;
    isSearchVisible: boolean;
    setIsSearchVisible: (v: boolean) => void;
    isActive: (path: Readonly<string>) => boolean;
    isAdmin: boolean;
    isLoaded: boolean;
    user: unknown;
  }>
) {
  const {
    isMenuExpanded,
    setIsMenuExpanded,
    isSearchVisible,
    setIsSearchVisible,
    isActive,
    isAdmin,
    isLoaded,
  } = props;
  return (
    <nav className="flex-1 container mx-auto px-2 sm:px-4 lg:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => {
              setIsMenuExpanded(!isMenuExpanded);
              // Close search if open when toggling menu
              if (isSearchVisible) setIsSearchVisible(false);
            }}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Navigation Links */}
          <div
            className={`${!isMenuExpanded ? 'hidden' : 'block'} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent z-50 shadow-lg lg:shadow-none`}
            role="menu"
            tabIndex={-1}
          >
            <ul className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-20 2xl:space-x-24 p-4 lg:p-0 text-sm font-medium">
              {/* Brand & Dashboard Group */}
              <li className="lg:relative">
                <Link
                  href="/dashboard"
                  className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                    isActive('/dashboard')
                      ? 'text-blue-600 font-semibold'
                      : 'text-muted-foreground hover:text-blue-600'
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
                  {['nba', 'nfl', 'mlb', 'nhl', 'mls', 'live', 'all-sports'].map(
                    (sport: Readonly<string>) => (
                      <Link
                        key={sport}
                        href={`/sports/${sport}`}
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive(`/sports/${sport}`)
                            ? 'text-blue-600 font-semibold'
                            : sport === 'all-sports'
                              ? 'hover:text-blue-600'
                              : 'text-muted-foreground hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        {sport === 'all-sports'
                          ? 'All Sports'
                          : sport === 'live'
                            ? 'Live Games'
                            : sport.toUpperCase()}
                      </Link>
                    )
                  )}
                </div>
                <div className="hidden lg:block absolute -right-10 2xl:-right-12 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 dark:bg-gray-700" />
              </li>
              {/* User & Admin Group */}
              <li>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 2xl:space-x-6">
                  <Link
                    href="/protected/user"
                    className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                      isActive('/protected/user')
                        ? 'text-blue-600 font-semibold'
                        : 'hover:text-blue-600'
                    }`}
                    onClick={() => setIsMenuExpanded(false)}
                  >
                    Profile
                  </Link>
                  <SignedIn>
                    {isLoaded && isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`flex items-center gap-1 py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                              isActive('/protected/admin')
                                ? 'text-blue-600 font-semibold'
                                : 'hover:text-blue-600'
                            }`}
                            onClick={() => setIsMenuExpanded(false)}
                          >
                            Admin
                            <ChevronDown className="h-3 w-3" />
                          </Button>
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
          </div>
        </div>
      </div>
    </nav>
  );
}

function getUserName(u: unknown): string {
  if (!u || typeof u !== 'object') return '';
  const userObj = u as Record<string, unknown>;
  const firstName = typeof userObj.firstName === 'string' ? userObj.firstName : '';
  const lastName = typeof userObj.lastName === 'string' ? userObj.lastName : '';
  return `${firstName} ${lastName}`.trim();
}

function getUserEmail(u: unknown): string {
  if (!u || typeof u !== 'object') return '';
  const userObj = u as Record<string, unknown>;
  if (Array.isArray(userObj.emailAddresses) && userObj.emailAddresses.length > 0) {
    const email = userObj.emailAddresses[0] as Record<string, unknown>;
    if (typeof email.emailAddress === 'string') {
      return email.emailAddress;
    }
  }
  return '';
}

function RightSection(
  props: Readonly<{
    isSearchVisible: boolean;
    setIsSearchVisible: (v: boolean) => void;
    isMenuExpanded: boolean;
    setIsMenuExpanded: (v: boolean) => void;
    user: unknown;
  }>
) {
  const { isSearchVisible, setIsSearchVisible, isMenuExpanded, setIsMenuExpanded, user } = props;
  return (
    <>
      <div className="flex items-center w-full justify-end gap-2 sm:gap-4 relative">
        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label="Toggle search"
          onClick={() => {
            setIsSearchVisible(true);
            if (isMenuExpanded) setIsMenuExpanded(false);
          }}
        >
          <Search className="h-5 w-5" />
        </Button>
        {/* Detachable Search Bar */}
        {/* Mobile overlay */}
        {isSearchVisible && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 sm:hidden"
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            onClick={() => setIsSearchVisible(false)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Escape') {
                setIsSearchVisible(false);
              }
            }}
          >
            <div
              className="mt-8 w-full max-w-md bg-background rounded-full border border-[#27272a] shadow-lg flex items-center px-4 py-2 relative"
              onClick={(e: React.MouseEvent) => {
                // Prevent event bubbling to parent
                e.stopPropagation();
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Escape') {
                  setIsSearchVisible(false);
                }
              }}
              role="dialog"
              tabIndex={0}
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
        {/* Desktop search bar, right-aligned */}
        <div className="hidden sm:flex items-center ml-auto mr-8 pr-4 relative">
          <SearchBar />
          {/* Optional vertical divider for extra separation */}
          <div className="hidden lg:block absolute -right-10 2xl:-right-12 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      {/* Theme and Auth controls, always far right, outside nav */}
      <div className="flex items-center gap-2 sm:gap-4 pr-10">
        <ThemeToggle />
        <SignedOut>
          <SignInButton mode="modal">
            <Button
              type="button"
              className="bg-[#757575] text-white hover:bg-[#616161] focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 text-center border border-gray-600 dark:bg-[#e5e5e5] dark:text-gray-800 dark:hover:bg-[#d4d4d4] dark:focus:ring-gray-300"
            >
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{getUserName(user)}</span>
              <span className="text-xs text-gray-500">({getUserEmail(user)})</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </>
  );
}

export function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const pathname = usePathname() || '/';
  const { user } = useUser();

  const isActive = (path: Readonly<string>) => {
    if (path === '/') {
      return pathname === path || pathname.startsWith('/protected/user');
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const emailAddress = user?.emailAddresses[0]?.emailAddress;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',')
    : [];
  const isAdmin = Boolean(emailAddress && adminEmails.includes(emailAddress));

  return (
    <>
      <LiveGamesBanner />
      <header className="w-full border-b lg:border-b">
        <div className="flex h-16 items-center justify-between w-full">
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
          <Navigation
            isMenuExpanded={isMenuExpanded}
            setIsMenuExpanded={setIsMenuExpanded}
            isSearchVisible={isSearchVisible}
            setIsSearchVisible={setIsSearchVisible}
            isActive={isActive}
            isAdmin={isAdmin}
            isLoaded={Boolean(user)}
            user={user}
          />
          <RightSection
            isSearchVisible={isSearchVisible}
            setIsSearchVisible={setIsSearchVisible}
            isMenuExpanded={isMenuExpanded}
            setIsMenuExpanded={setIsMenuExpanded}
            user={user}
          />
        </div>
      </header>
    </>
  );
}
