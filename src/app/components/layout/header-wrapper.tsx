'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

// Simple loading component that matches the header structure
const HeaderSkeleton = () => (
  <>
    {/* Live Games Banner Skeleton */}
    <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 text-center">
      <div className="w-32 h-4 bg-white/20 rounded animate-pulse mx-auto" />
    </div>

    <header className="w-full border-b-2 border-neutral-200 dark:border-neutral-600 shadow-md dark:shadow-lg bg-background">
      <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full relative z-50">
        {/* Logo Skeleton */}
        <div className="pl-10 hidden lg:flex items-center">
          <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Navigation Skeleton */}
        <nav className="flex justify-center">
          <div className="flex h-16 items-center">
            {/* Mobile Menu Button Skeleton */}
            <div className="lg:hidden mr-4 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

            {/* Desktop Navigation Skeleton */}
            <div className="hidden lg:block">
              <div className="flex space-x-6">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Right Section Skeleton */}
        <div className="pr-10 flex items-center gap-4">
          {/* Search Bar Skeleton */}
          <div className="hidden sm:block w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Mobile Search Button Skeleton */}
          <div className="sm:hidden w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Theme Toggle Skeleton */}
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

          {/* Auth Controls Skeleton */}
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </header>
  </>
);

// Dynamically import Header with improved loading
const Header = dynamic(() => import('./header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: HeaderSkeleton,
});

export function HeaderWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return <HeaderSkeleton />;
  }

  return <Header />;
}
