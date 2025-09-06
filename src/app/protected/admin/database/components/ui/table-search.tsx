import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import type { ITableSearchProps } from '@/types';
import { Button } from '@src/app/protected/admin/database/components/ui/button';

export function TableSearch({
  searchTerm,
  searchField,
  searchFields,
  onSearchChange,
  onClear,
  placeholder = 'Search...',
}: ITableSearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(value, searchField);
    }, 300);
  };

  const handleFieldChange = (field: string) => {
    onSearchChange(localSearchTerm, field);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    onClear?.();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <input
          type="text"
          value={localSearchTerm}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-7 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
        />
        {localSearchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        )}
      </div>

      {/* Search Field Dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={searchField}
          onChange={e => handleFieldChange(e.target.value)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-6 sm:pr-8 text-sm min-w-0"
        >
          {searchFields.map(field => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Clear Button */}
      {localSearchTerm && (
        <Button onClick={handleClear} variant="outline" size="sm" className="text-xs flex-shrink-0">
          Clear
        </Button>
      )}
    </div>
  );
}
