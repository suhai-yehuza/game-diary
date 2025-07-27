'use client';

import { Search, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface IGameLogsSearchProps {
  onSearchChange: (searchTerm: string, searchField: string) => void;
  onClear: () => void;
  searchTerm: string;
  searchField: string;
}

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
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search game logs..."
          value={localSearchTerm}
          onChange={e => setLocalSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <select
        value={localSearchField}
        onChange={e => setLocalSearchField(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
