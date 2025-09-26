import { Search } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';
import type { SearchInputProps } from '@/types';

/**
 * Reusable search input component with proper styling and accessibility
 * Follows industry best practices for form inputs
 */
export function SearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  className = '',
  autoFocus = false,
  autoComplete = 'off',
  spellCheck = false,
  id,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: SearchInputProps) {
  return (
    <div className="relative flex-1">
      {/* Search Icon */}
      {!value && (
        <Search className="absolute left-1.5 xs:left-2 sm:left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 md:h-4 md:w-4 text-white/70 pointer-events-none" />
      )}

      {/* Custom Placeholder */}
      {!value && (
        <div
          className="absolute left-6 xs:left-7 sm:left-8 md:left-9 top-1/2 -translate-y-1/2 pointer-events-none text-sm xs:text-base sm:text-base md:text-lg"
          style={{
            color: 'white',
            opacity: 0.7,
            userSelect: 'none',
            fontFamily: 'inherit',
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Input Field */}
      <input
        type="search"
        id={id}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder="" // Empty to avoid browser placeholder styling conflicts
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        data-testid={dataTestId || 'search-input'}
        className={cn(
          // Base styles
          'w-full border-none focus:ring-0 outline-none transition-all duration-200',
          // Text styling - force white text
          'text-white placeholder:text-transparent',
          // Positioning
          value ? 'pl-1.5 xs:pl-2 sm:pl-2.5 md:pl-3' : 'pl-6 xs:pl-7 sm:pl-8 md:pl-9',
          // Responsive text sizing
          'text-sm xs:text-base sm:text-base md:text-lg',
          className
        )}
        style={
          {
            backgroundColor: 'transparent',
            color: 'white !important',
            WebkitTextFillColor: 'white !important',
            caretColor: 'white !important',
            textShadow: 'none',
            fontFamily: 'inherit',
            '--tw-text-opacity': '1',
            '--tw-placeholder-opacity': '1',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
