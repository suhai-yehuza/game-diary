'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import Header to avoid Clerk provider issues during static generation
const Header = dynamic(() => import('./header').then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => (
    <header className="w-full border-b-2 border-neutral-200 dark:border-neutral-600 shadow-md dark:shadow-lg bg-background">
      <div className="grid grid-cols-[auto_1fr_auto] h-16 items-center w-full relative z-50">
        <div className="pl-10 hidden lg:flex items-center">
          <div className="w-11 h-11 bg-gray-200 rounded animate-pulse" />
        </div>
        <nav className="flex justify-center">
          <div className="flex h-16 items-center">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mr-4 lg:hidden" />
            <div className="hidden lg:block">
              <div className="flex space-x-6">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </nav>
        <div className="pr-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </header>
  ),
});

export function HeaderWrapper() {
  return <Header />;
}
