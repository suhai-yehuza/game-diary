'use client';

import { Search, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';
import type { IGameLogsSearchProps } from '@/lib/types';

const searchFields = [
  { value: 'all', label: 'All Fields' },
  { value: 'classification', label: 'Privacy' },
  { value: 'watched_setting', label: 'Setting' },
  { value: 'watched_scope', label: 'Scope' },
  { value: 'notes', label: 'Notes' },
  { value: 'tags', label: 'Tags' },
  { value: 'team', label: 'Team' },
];

export function GameLogsSearch({
  onSearchChange,
  onClear,
  searchTerm,
  searchField,
}: IGameLogsSearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localSearchField, setLocalSearchField] = useState(searchField);
  const isMobile = useMobileDetection();

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm] = useDebounce(localSearchTerm, 300);

  const handleClear = useCallback(() => {
    setLocalSearchTerm('');
    setLocalSearchField('all');
    onClear();
  }, [onClear]);

  // Update parent when debounced search term changes
  React.useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm, localSearchField);
    }
  }, [debouncedSearchTerm, localSearchField, onSearchChange, searchTerm]);

  return (
    <div
      className={`flex flex-col gap-3 mb-4 sm:mb-6 ${isMobile ? 'space-y-3' : 'sm:flex-row sm:gap-3'}`}
      data-testid="game-logs-search"
    >
      <div className="flex-1 relative">
        {!localSearchTerm && (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        )}
        <input
          type="text"
          placeholder="Search game logs..."
          value={localSearchTerm}
          onChange={e => setLocalSearchTerm(e.target.value)}
          className={`w-full border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 ${localSearchTerm ? 'pl-3 pr-10' : 'pl-10 pr-10'} ${
            isMobile ? 'py-3 text-base' : 'py-2.5 text-sm'
          }`}
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors duration-200 ${
              isMobile ? 'p-2' : 'p-1'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <select
        value={localSearchField}
        onChange={e => setLocalSearchField(e.target.value)}
        className={`border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 ${
          isMobile ? 'px-4 py-3 text-base' : 'px-3 py-2.5 text-sm'
        }`}
      >
        {searchFields.map(field => (
          <option key={field.value} value={field.value}>
            {field.label}
          </option>
        ))}
      </select>
    </div>
  );
}
