import { cn } from '@/lib/utils';

/**
 * Common CSS class patterns used throughout the application
 * Reduces duplication and ensures consistency
 */

// Button variants
export const buttonVariants = {
  primary:
    'px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary:
    'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  danger:
    'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  success:
    'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  outline:
    'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  ghost:
    'px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  small:
    'px-3 py-1 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  large:
    'px-6 py-3 text-lg bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
} as const;

// Input variants
export const inputVariants = {
  default:
    'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  search:
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  large:
    'flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
} as const;

// Card variants
export const cardVariants = {
  default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  elevated: 'rounded-lg border bg-card text-card-foreground shadow-lg',
  interactive:
    'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer',
} as const;

// Loading states
export const loadingStates = {
  skeleton: 'animate-pulse bg-gray-200 dark:bg-gray-700',
  spinner: 'animate-spin',
  pulse: 'animate-pulse',
} as const;

// Navigation styles
export const navStyles = {
  link: 'block py-2 text-base transition-colors whitespace-nowrap flex items-center w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:rounded-md focus-visible:ring-offset-gray-900',
  activeLink: 'text-blue-600 font-semibold',
  inactiveLink: 'hover:text-blue-600',
  mobileLink:
    'w-[90vw] sm:w-[70vw] md:w-[400px] max-w-xs h-10 flex items-center justify-center text-sm whitespace-nowrap rounded font-medium transition-all duration-150 bg-opacity-90 shadow-sm mb-3 mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:rounded-md focus-visible:ring-offset-gray-900',
} as const;

// Table styles
export const tableStyles = {
  container: 'w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800',
  header:
    'bg-gray-50 dark:bg-gray-800 px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100',
  cell: 'px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800 last:border-r-0',
  row: 'transition-all duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 last:border-r-0',
  indexCell:
    'px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800',
} as const;

// Form styles
export const formStyles = {
  label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
  error: 'text-sm text-red-600 dark:text-red-400 mt-1',
  help: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
  group: 'space-y-4',
  field: 'space-y-2',
} as const;

// Layout styles
export const layoutStyles = {
  container: 'container mx-auto px-4 py-8',
  section: 'mb-6',
  title: 'text-3xl font-bold mb-2',
  subtitle: 'text-gray-600 dark:text-gray-400 mb-4',
  divider: 'h-px bg-gray-200 dark:bg-gray-700 my-4',
} as const;

// Status indicators
export const statusStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
} as const;

// Animation classes
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  hoverLift: 'hover-lift',
  hoverScale: 'hover-scale',
  tapScale: 'tap-scale',
} as const;

// Utility functions for combining classes
export function getButtonClass(variant: keyof typeof buttonVariants, className?: string): string {
  return cn(buttonVariants[variant], className);
}

export function getInputClass(variant: keyof typeof inputVariants, className?: string): string {
  return cn(inputVariants[variant], className);
}

export function getCardClass(variant: keyof typeof cardVariants, className?: string): string {
  return cn(cardVariants[variant], className);
}

export function getNavLinkClass(isActive: boolean, isMobile = false, className?: string): string {
  const baseClass = isMobile ? navStyles.mobileLink : navStyles.link;
  const stateClass = isActive ? navStyles.activeLink : navStyles.inactiveLink;
  return cn(baseClass, stateClass, className);
}

export function getTableRowClass(className?: string): string {
  return cn(tableStyles.row, className);
}

export function getTableCellClass(className?: string): string {
  return cn(tableStyles.cell, className);
}

export function getStatusClass(status: keyof typeof statusStyles, className?: string): string {
  return cn('px-2 py-1 rounded text-xs font-medium', statusStyles[status], className);
}

// Responsive utilities
export const responsiveClasses = {
  mobileOnly: 'block lg:hidden',
  desktopOnly: 'hidden lg:block',
  tabletUp: 'hidden md:block',
  mobileUp: 'block md:hidden',
} as const;

// Focus and accessibility utilities
export const focusClasses = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  ringOffset: 'focus:ring-offset-gray-900',
  visible:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
} as const;
