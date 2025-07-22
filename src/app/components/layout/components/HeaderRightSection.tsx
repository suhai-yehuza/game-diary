import React, { useState } from 'react';

import { ThemeToggle } from '@/app/components/common';
import { ClientOnlyAuthControls } from '@/app/components/layout/components/AuthControls';
import { SearchBar, useMobileDetection } from '@/app/components/layout/components/SearchBar';

interface IHeaderRightSectionProps {
  isMenuExpanded: boolean;
}

export function HeaderRightSection({ isMenuExpanded }: IHeaderRightSectionProps) {
  const isMobile = useMobileDetection();
  const [isFocused, setIsFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // On mobile, show only the search icon unless focused
  if (isMobile && !isFocused && !showSearch) {
    return (
      <div className={`pr-4 flex items-center gap-2 justify-end`}>
        <button
          aria-label="Open search"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            setShowSearch(true);
            setIsFocused(true);
          }}
        >
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {/* Always show auth controls on mobile, even when space is limited */}
        <ClientOnlyAuthControls />
      </div>
    );
  }

  return (
    <div
      className={`pr-10 flex items-center gap-2 sm:gap-4 justify-end ${isMenuExpanded ? 'hidden md:flex' : ''}`}
    >
      {/* Universal Search Bar */}
      <div className="flex items-center">
        <SearchBar
          isFocused={isFocused}
          setIsFocused={v => {
            setIsFocused(v);
            if (!v) setShowSearch(false);
          }}
        />
      </div>

      {/* Vertical Divider */}
      <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-4" />

      {/* Theme Toggle - hide on mobile when searchbar is focused or when space is limited */}
      {(!isMobile || (showSearch && !isFocused)) && <ThemeToggle />}

      {/* Auth Controls - always visible */}
      <ClientOnlyAuthControls />
    </div>
  );
}
