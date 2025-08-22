import { useUser } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import { ThemeToggle } from '@/app/components/common';
import { ClientOnlyAuthControls } from '@/app/components/layout/components/AuthControls';
import { SearchBar, useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { IHeaderRightSectionProps } from '@/lib/types';

// Dynamically import NotificationBell with SSR disabled to prevent context errors
const NotificationBell = dynamic(
  () =>
    import('@/app/components/common/NotificationBell').then(mod => ({
      default: mod.NotificationBell,
    })),
  {
    ssr: false,
    loading: () => <div className="w-10 h-10" />, // Placeholder to prevent layout shift
  }
);

export function HeaderRightSection({ isMenuExpanded }: IHeaderRightSectionProps) {
  // Handle case where Clerk is not configured (e.g., during SSR or in test environment)
  let user = null;

  try {
    const userData = useUser();
    user = userData.user;
  } catch {
    // Clerk is not configured (e.g., during SSR or in test environment)
    console.log('Clerk not configured, using fallback user data');
    user = null;
  }

  const isMobile = useMobileDetection();
  const [isFocused, setIsFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // On mobile, show only essential controls (no search or menu - handled by bottom nav)
  if (isMobile) {
    return (
      <div className="pr-4 flex items-center gap-2 justify-end">
        {/* Theme Toggle - only essential control on mobile */}
        <ThemeToggle />

        {/* Notification Bell - only show for authenticated users */}
        {user?.id && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            <NotificationBell />
          </div>
        )}

        {/* Auth Controls - always show on mobile */}
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
      <div className="hidden lg:block h-8 w-px bg-neutral-200 dark:bg-neutral-700 mx-4" />

      {/* Theme Toggle - hide on mobile when searchbar is focused or when space is limited */}
      {(!isMobile || (showSearch && !isFocused)) && <ThemeToggle />}

      {/* Notification Bell - only show for authenticated users */}
      {user?.id && <NotificationBell />}

      {/* Auth Controls - always visible */}
      <ClientOnlyAuthControls />
    </div>
  );
}
