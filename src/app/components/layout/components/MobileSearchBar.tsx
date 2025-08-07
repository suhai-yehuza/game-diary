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
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open search"
        >
          <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      )}

      {/* Expanded Search Bar */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                  {/* Search Input */}
                  <div className="flex items-center px-4 py-3">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      ref={inputRef}
                      type="search"
                      value={searchQuery}
                      onChange={handleInputChange}
                      placeholder="Search games, teams, players..."
                      className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-500 dark:placeholder-gray-400"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Search Actions */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        setSearchQuery('');
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!searchQuery.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
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
