/**
 * Enhanced component variant system
 * Eliminates duplication of styling patterns across components and provides consistent design tokens
 */

import { cn } from '@/lib/utils';

// Design token constants
export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: 'hsl(var(--color-brand-primary))',
      primaryHover: 'hsl(var(--color-brand-primary-hover))',
      primaryLight: 'hsl(var(--color-brand-primary-light))',
      secondary: 'hsl(var(--color-brand-secondary))',
      secondaryHover: 'hsl(var(--color-brand-secondary-hover))',
      secondaryLight: 'hsl(var(--color-brand-secondary-light))',
    },
    semantic: {
      success: 'hsl(var(--color-success))',
      warning: 'hsl(var(--color-warning))',
      error: 'hsl(var(--color-error))',
      info: 'hsl(var(--color-info))',
    },
    accent: {
      orange: 'hsl(var(--color-accent-orange))',
      purple: 'hsl(var(--color-accent-purple))',
    },
    neutral: {
      50: 'hsl(var(--color-neutral-50))',
      100: 'hsl(var(--color-neutral-100))',
      200: 'hsl(var(--color-neutral-200))',
      300: 'hsl(var(--color-neutral-300))',
      400: 'hsl(var(--color-neutral-400))',
      500: 'hsl(var(--color-neutral-500))',
      600: 'hsl(var(--color-neutral-600))',
      700: 'hsl(var(--color-neutral-700))',
      800: 'hsl(var(--color-neutral-800))',
      900: 'hsl(var(--color-neutral-900))',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
} as const;

// Button variant system
export const buttonVariants = {
  // Size variants
  size: {
    xs: 'px-2 py-1 text-xs font-medium',
    sm: 'px-3 py-1.5 text-sm font-medium',
    md: 'px-4 py-2 text-sm font-medium',
    lg: 'px-6 py-3 text-base font-medium',
    xl: 'px-8 py-4 text-lg font-medium',
  },
  // Style variants
  variant: {
    primary: cn(
      'bg-brand-primary text-white',
      'hover:bg-brand-primary-hover',
      'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
      'transition-colors duration-200',
      'shadow-md hover:shadow-lg'
    ),
    secondary: cn(
      'bg-brand-secondary text-white',
      'hover:bg-brand-secondary-hover',
      'focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2',
      'transition-colors duration-200',
      'shadow-md hover:shadow-lg'
    ),
    outline: cn(
      'border-2 border-brand-primary text-brand-primary',
      'hover:bg-brand-primary hover:text-white',
      'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
      'transition-all duration-200'
    ),
    ghost: cn(
      'text-brand-primary hover:bg-brand-primary/10',
      'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
      'transition-colors duration-200'
    ),
    danger: cn(
      'bg-semantic-error text-white',
      'hover:bg-red-700',
      'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
      'transition-colors duration-200',
      'shadow-md hover:shadow-lg'
    ),
    success: cn(
      'bg-semantic-success text-white',
      'hover:bg-green-700',
      'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
      'transition-colors duration-200',
      'shadow-md hover:shadow-lg'
    ),
  },
  // State variants
  state: {
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    loading: 'opacity-75 cursor-wait pointer-events-none',
    active: 'ring-2 ring-brand-primary ring-offset-2',
  },
} as const;

// Input variant system
export const inputVariants = {
  // Size variants
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
  // Style variants
  variant: {
    default: cn(
      'border border-neutral-300 bg-white text-neutral-900',
      'focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
      'placeholder:text-neutral-400',
      'transition-colors duration-200',
      'rounded-md'
    ),
    error: cn(
      'border-semantic-error bg-white text-neutral-900',
      'focus:border-semantic-error focus:ring-2 focus:ring-semantic-error focus:ring-offset-2',
      'placeholder:text-neutral-400',
      'transition-colors duration-200',
      'rounded-md'
    ),
    success: cn(
      'border-semantic-success bg-white text-neutral-900',
      'focus:border-semantic-success focus:ring-2 focus:ring-semantic-success focus:ring-offset-2',
      'placeholder:text-neutral-400',
      'transition-colors duration-200',
      'rounded-md'
    ),
  },
  // State variants
  state: {
    disabled: 'opacity-50 cursor-not-allowed bg-neutral-100',
    readonly: 'bg-neutral-50 cursor-default',
  },
} as const;

// Card variant system
export const cardVariants = {
  // Style variants
  variant: {
    default: cn(
      'bg-white border border-neutral-200',
      'rounded-lg shadow-sm',
      'transition-shadow duration-200'
    ),
    elevated: cn(
      'bg-white border border-neutral-200',
      'rounded-lg shadow-md',
      'hover:shadow-lg',
      'transition-shadow duration-200'
    ),
    interactive: cn(
      'bg-white border border-neutral-200',
      'rounded-lg shadow-sm',
      'hover:shadow-md hover:border-neutral-300',
      'cursor-pointer',
      'transition-all duration-200'
    ),
    ghost: cn(
      'bg-transparent border border-transparent',
      'rounded-lg',
      'transition-colors duration-200'
    ),
  },
  // Size variants
  size: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
} as const;

// Badge variant system
export const badgeVariants = {
  // Style variants
  variant: {
    default: cn('bg-neutral-100 text-neutral-800', 'border border-neutral-200'),
    primary: cn('bg-brand-primary text-white', 'border border-brand-primary'),
    secondary: cn('bg-brand-secondary text-white', 'border border-brand-secondary'),
    success: cn('bg-semantic-success text-white', 'border border-semantic-success'),
    warning: cn('bg-semantic-warning text-white', 'border border-semantic-warning'),
    error: cn('bg-semantic-error text-white', 'border border-semantic-error'),
    info: cn('bg-semantic-info text-white', 'border border-semantic-info'),
  },
  // Size variants
  size: {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-0.5 text-sm font-medium',
    lg: 'px-3 py-1 text-sm font-medium',
  },
} as const;

// Alert variant system
export const alertVariants = {
  // Style variants
  variant: {
    default: cn('bg-neutral-50 border border-neutral-200 text-neutral-800', 'rounded-lg p-4'),
    success: cn('bg-green-50 border border-green-200 text-green-800', 'rounded-lg p-4'),
    warning: cn('bg-yellow-50 border border-yellow-200 text-yellow-800', 'rounded-lg p-4'),
    error: cn('bg-red-50 border border-red-200 text-red-800', 'rounded-lg p-4'),
    info: cn('bg-blue-50 border border-blue-200 text-blue-800', 'rounded-lg p-4'),
  },
} as const;

// Utility function to combine variants
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function combineVariants<T extends Record<string, any>>(
  variantSystem: T,
  variant: keyof T,
  size?: keyof T['size'],
  state?: keyof T['state']
): string {
  const baseVariant = variantSystem.variant?.[variant as keyof T['variant']] || '';
  const sizeVariant = size && variantSystem.size?.[size] ? variantSystem.size[size] : '';
  const stateVariant = state && variantSystem.state?.[state] ? variantSystem.state[state] : '';

  return cn(baseVariant, sizeVariant, stateVariant);
}

// Component factory functions
export const componentFactories = {
  button: (
    _variant: keyof typeof buttonVariants.variant = 'primary',
    size: keyof typeof buttonVariants.size = 'md',
    state?: keyof typeof buttonVariants.state
  ) => combineVariants(buttonVariants, 'variant', size, state),

  input: (
    _variant: keyof typeof inputVariants.variant = 'default',
    size: keyof typeof inputVariants.size = 'md',
    state?: keyof typeof inputVariants.state
  ) => combineVariants(inputVariants, 'variant', size, state),

  card: (
    _variant: keyof typeof cardVariants.variant = 'default',
    size: keyof typeof cardVariants.size = 'md'
  ) => combineVariants(cardVariants, 'variant', size),

  badge: (
    _variant: keyof typeof badgeVariants.variant = 'default',
    size: keyof typeof badgeVariants.size = 'md'
  ) => combineVariants(badgeVariants, 'variant', size),

  alert: (_variant: keyof typeof alertVariants.variant = 'default') =>
    combineVariants(alertVariants, 'variant'),
};

// Theme-aware utility classes
export const themeUtils = {
  text: {
    primary: 'text-neutral-900 dark:text-neutral-100',
    secondary: 'text-neutral-700 dark:text-neutral-300',
    tertiary: 'text-neutral-500 dark:text-neutral-500',
    muted: 'text-neutral-400 dark:text-neutral-400',
  },
  bg: {
    primary: 'bg-neutral-50 dark:bg-neutral-900',
    secondary: 'bg-neutral-100 dark:bg-neutral-800',
    card: 'bg-white dark:bg-neutral-800',
  },
  border: {
    primary: 'border-neutral-200 dark:border-neutral-700',
    secondary: 'border-neutral-300 dark:border-neutral-600',
  },
};

// Animation utilities
export const animationUtils = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-2 duration-200',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideOut: 'animate-out slide-out-to-bottom-2 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
};

// Responsive utilities
export const responsiveUtils = {
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  flex: {
    row: 'flex flex-row',
    col: 'flex flex-col',
    wrap: 'flex flex-wrap',
    nowrap: 'flex flex-nowrap',
  },
};
