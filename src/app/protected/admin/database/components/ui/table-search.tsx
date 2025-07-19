import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@src/app/protected/admin/database/components/ui/button';

interface ITableSearchProps {
  searchTerm: string;
  searchField: string;
  searchFields: { value: string; label: string }[];
  onSearchChange: (term: string, field: string) => void;
  onClear: () => void;
  placeholder?: string;
}

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
    onClear();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={localSearchTerm}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Field Dropdown */}
      <div className="relative">
        <select
          value={searchField}
          onChange={e => handleFieldChange(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none pr-8"
        >
          {searchFields.map(field => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className="h-4 w-4 text-muted-foreground"
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
        <Button onClick={handleClear} variant="outline" size="sm">
          Clear
        </Button>
      )}
    </div>
  );
}
