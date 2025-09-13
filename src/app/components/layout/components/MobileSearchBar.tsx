'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';

export function MobileSearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const isMobile = useMobileDetection();

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Handle search submission
  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const params = new URLSearchParams(searchParams);
      params.set('q', query.trim());
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
    setIsExpanded(false);
  };

  // Handle clear button
  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  if (!isMobile) return null;

  return (
    <>
      {/* Search Button (when collapsed) */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full bg-bg-theme-secondary hover:bg-theme-muted transition-colors touch-manipulation"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-theme-muted" />
        </button>
      )}

      {/* Expanded Search Bar */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-2 xs:px-3 sm:px-4 md:px-6">
            <div className="w-full max-w-[calc(100vw-1rem)] xs:max-w-md sm:max-w-lg md:max-w-xl">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-surface-card rounded-2xl shadow-2xl">
                  {/* Search Input */}
                  <div className="flex items-center px-3 xs:px-4 sm:px-5 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4">
                    {!searchQuery && (
                      <Search className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 search-icon-enhanced mr-2 xs:mr-3 sm:mr-3 md:mr-4" />
                    )}
                    <input
                      ref={inputRef}
                      type="search"
                      value={searchQuery}
                      onChange={handleInputChange}
                      placeholder="Search games, teams, players..."
                      className={`flex-1 border-none outline-none text-sm xs:text-base sm:text-lg md:text-xl search-input-fixed search-text-dark search-input-force-dark ${searchQuery ? 'pl-0' : 'pl-0'}`}
                      data-theme="light"
                      style={{
                        color: 'var(--color-text-primary)', // Pure black text for maximum visibility
                        WebkitTextFillColor: 'var(--color-text-primary)', // For webkit browsers
                      }}
                      autoComplete="off"
                      spellCheck="false"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="ml-2 p-1 rounded-full hover:bg-bg-theme-secondary transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-theme-primary" />
                      </button>
                    )}
                  </div>

                  {/* Search Actions */}
                  <div className="flex items-center justify-between px-3 xs:px-4 sm:px-5 md:px-6 py-2.5 xs:py-3 sm:py-3.5 md:py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setSearchQuery('');
                      }}
                      className="text-sm xs:text-base sm:text-lg md:text-xl text-theme-muted hover:text-theme-secondary transition-colors touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 md:py-3.5 bg-brand-primary text-text-inverse rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary-hover transition-colors text-sm xs:text-base sm:text-lg md:text-xl touch-manipulation"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
