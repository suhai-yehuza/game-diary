'use client';

import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import type { ICustomSelectProps } from '@/types';

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  size = 'md',
  variant = 'default',
}: ICustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const handleMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  // Variant classes
  const variantClasses = {
    default:
      'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:border-blue-500 shadow-sm',
    outline:
      'bg-white border-gray-400 text-gray-800 hover:bg-gray-50 focus:border-blue-500 shadow-sm',
    ghost: 'bg-white border-transparent text-gray-800 hover:bg-gray-100 focus:border-blue-500',
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between rounded-lg border transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="select-label"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-gray-600">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-auto ring-1 ring-gray-200">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`
                w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-150
                ${
                  index === highlightedIndex
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                    : 'text-gray-800 hover:bg-gray-100 border-l-4 border-transparent'
                }
                ${option.value === value ? 'font-semibold bg-gray-50' : 'font-medium'}
              `}
              role="option"
              aria-selected={option.value === value}
            >
              {option.icon && (
                <span
                  className={`flex-shrink-0 ${
                    index === highlightedIndex
                      ? 'text-blue-700'
                      : option.value === value
                        ? 'text-gray-700'
                        : 'text-gray-600'
                  }`}
                >
                  {option.icon}
                </span>
              )}
              <span className="flex-1 truncate">{option.label}</span>
              {option.value === value && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0 font-bold" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
