import React, { useState } from 'react';

import { ThemeToggle } from '@/app/components/common';
import { ClientOnlyAuthControls } from '@/app/components/layout/components/AuthControls';
import { SearchBar, useMobileDetection } from '@/app/components/layout/components/SearchBar';

interface IHeaderRightSectionProps {
  isMenuExpanded: boolean;
}

export function HeaderRightSection({ isMenuExpanded }: IHeaderRightSectionProps) {
  const isMobile = useMobileDetection(640);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`pr-10 flex items-center gap-2 sm:gap-4 justify-end ${isMenuExpanded ? 'hidden sm:flex' : ''}`}
    >
      {/* Universal Search Bar */}
      <div className="flex items-center">
        <SearchBar isFocused={isFocused} setIsFocused={setIsFocused} />
      </div>

      {/* Vertical Divider */}
      <div className="hidden lg:block h-8 w-px bg-gray-200 dark:bg-gray-700 mx-4" />

      {/* Theme Toggle - hide on mobile when searchbar is focused */}
      {!(isMobile && isFocused) && <ThemeToggle />}

      {/* Auth Controls */}
      <ClientOnlyAuthControls />
    </div>
  );
}
