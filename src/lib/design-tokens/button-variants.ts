/**
 * Design token system for button variants
 * Eliminates duplication of common button styling patterns
 */

export const buttonVariants = {
  // Primary button variant
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',

  // Primary button with disabled state
  primaryWithDisabled:
    'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white',

  // Primary button with dark mode support
  primaryDark: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',

  // Primary button with full styling (including transitions, shadows, etc.)
  primaryFull:
    'bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md',

  // Primary button with focus states
  primaryWithFocus:
    'bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',

  // Primary button for inline elements
  primaryInline:
    'inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 text-xs sm:text-sm',

  // Primary button for cards
  primaryCard:
    'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-sm transition-all duration-200 font-medium px-3 sm:px-4 py-2 text-xs sm:text-sm',

  // Primary button for forms
  primaryForm: 'bg-blue-600 hover:bg-blue-700 text-white',
} as const;

import type { ButtonVariant } from '@/types';

/**
 * Get button variant class names
 */
export function getButtonVariant(variant: ButtonVariant): string {
  return buttonVariants[variant as keyof typeof buttonVariants] || buttonVariants.primary;
}

/**
 * Combine button variant with additional classes
 */
export function combineButtonClasses(variant: ButtonVariant, additionalClasses?: string): string {
  const baseClasses =
    buttonVariants[variant as keyof typeof buttonVariants] || buttonVariants.primary;
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;
}
