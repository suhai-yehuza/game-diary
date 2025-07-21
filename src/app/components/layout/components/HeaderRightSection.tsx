import { Search } from 'lucide-react';

import { ThemeToggle } from '@/app/components/common';
import { ClientOnlyAuthControls } from '@/app/components/layout/components/AuthControls';
import { SearchBar } from '@/app/components/layout/components/SearchBar';

interface IHeaderRightSectionProps {
  isMenuExpanded: boolean;
  onSearchToggle: () => void;
}

export function HeaderRightSection({ isMenuExpanded, onSearchToggle }: IHeaderRightSectionProps) {
  return (
    <div
      className={`pr-10 flex items-center gap-2 sm:gap-4 justify-end ${isMenuExpanded ? 'hidden sm:flex' : ''}`}
    >
      {/* Mobile Search Button */}
      <button aria-label="Toggle search" onClick={onSearchToggle} className="sm:hidden">
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
  );
}
