'use client';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { Search, X, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from 'react';

import { ThemeToggle } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function SearchBarContent() {
  const [search_query, setSearchQuery] = useState('');
  const [debounced_query, setDebouncedQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previousPathRef = useRef(pathname || '/');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams?.get('q');
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
        if (pathname?.startsWith('/protected/admin')) {
          router.push(`/protected/admin/users?q=${encodedQuery}`);
        } else {
          router.push(`/search?q=${encodedQuery}`);
        }
      } else {
        // Return to the previous page when search is cleared
        router.push(previousPathRef.current);
      }
    }, 500);
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

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={
            pathname?.startsWith('/protected/admin') ? 'Search users...' : 'Search games...'
          }
          className="pl-8 w-[180px] sm:w-[200px] md:w-[250px] lg:w-[300px] transition-all duration-200"
          value={search_query}
          onChange={handleSearchChange}
          autoComplete="off"
          spellCheck={false}
        />
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

export default function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const pathname = usePathname() || '/';
  const { user, isLoaded } = useUser();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path || pathname?.startsWith('/protected/user');
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const emailAddress = user?.emailAddresses?.[0]?.emailAddress;
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
    ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',')
    : [];
  const isAdmin = isLoaded && emailAddress && adminEmails.includes(emailAddress);

  return (
    <header className="w-full border-b lg:border-b">
      <div className="flex h-16 items-center">
        <div className="pl-10">
          <Link href="/">
            <Image
              src="/gamelog-large.svg"
              alt="Game Diary Logo"
              width={32}
              height={32}
              className="w-8 h-8 cursor-pointer"
            />
          </Link>
        </div>
        <nav className="container mx-auto px-2 sm:px-4 lg:px-6">
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
              >
                <ul className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-20 2xl:space-x-24 p-4 lg:p-0 text-sm font-medium">
                  {/* Brand & Community Group */}
                  <li className="lg:relative">
                    <Link
                      href="/community"
                      className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                        isActive('/community')
                          ? 'text-blue-600 font-semibold'
                          : 'hover:text-blue-600'
                      }`}
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      Community
                    </Link>
                    <div className="hidden lg:block absolute -right-10 2xl:-right-12 top-1/2 -translate-y-1/2 h-4 w-px bg-gray-200 dark:bg-gray-700" />
                  </li>

                  {/* Sports Group */}
                  <li className="lg:relative">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 2xl:space-x-6">
                      <Link
                        href="/sports/nba"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/nba')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        NBA
                      </Link>
                      <Link
                        href="/sports/nfl"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/nfl')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        NFL
                      </Link>
                      <Link
                        href="/sports/mlb"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/mlb')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        MLB
                      </Link>
                      <Link
                        href="/sports/nhl"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/nhl')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        NHL
                      </Link>
                      <Link
                        href="/sports/mls"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/mls')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        MLS
                      </Link>
                      <Link
                        href="/sports/all-sports"
                        className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                          isActive('/sports/all-sports')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
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
                          isActive('/protected/user')
                            ? 'text-blue-600 font-semibold'
                            : 'hover:text-blue-600'
                        }`}
                        onClick={() => setIsMenuExpanded(false)}
                      >
                        Home
                      </Link>
                      <SignedIn>
                        {isLoaded && isAdmin && (
                          <Link
                            href="/protected/admin/users"
                            className={`block py-1.5 lg:py-0 text-base lg:text-sm transition-colors whitespace-nowrap ${
                              isActive('/protected/admin')
                                ? 'text-blue-600 font-semibold'
                                : 'hover:text-blue-600'
                            }`}
                            onClick={() => setIsMenuExpanded(false)}
                          >
                            Admin
                          </Link>
                        )}
                      </SignedIn>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Toggle search"
                onClick={() => {
                  setIsSearchVisible(!isSearchVisible);
                  // Close menu if open when toggling search
                  if (isMenuExpanded) setIsMenuExpanded(false);
                }}
              >
                {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </Button>

              {/* Search Bar */}
              <div
                className={`${isSearchVisible ? 'block' : 'hidden'} sm:block absolute sm:relative top-16 sm:top-0 left-0 right-0 sm:left-auto sm:right-auto bg-background sm:bg-transparent p-4 sm:p-0 border-b sm:border-0`}
              >
                <SearchBar />
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />

                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      type="button"
                      className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 text-center"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
