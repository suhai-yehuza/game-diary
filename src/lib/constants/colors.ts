/**
 * Centralized Color System
 *
 * This file defines a comprehensive color system that ensures:
 * - Consistent colors across light and dark themes
 * - WCAG AA compliance for accessibility
 * - Semantic naming for better maintainability
 * - Proper contrast ratios for all text/background combinations
 */

// Base color palette - HSL values for better manipulation
export const BASE_COLORS = {
  // Neutral grays - optimized for both themes
  neutral: {
    50: 'hsl(0, 0%, 98%)', // Lightest background
    100: 'hsl(0, 0%, 96%)', // Light background
    200: 'hsl(0, 0%, 90%)', // Borders, dividers
    300: 'hsl(0, 0%, 83%)', // Disabled elements
    400: 'hsl(0, 0%, 64%)', // Placeholder text
    500: 'hsl(0, 0%, 45%)', // Secondary text
    600: 'hsl(0, 0%, 32%)', // Primary text (light theme)
    700: 'hsl(0, 0%, 25%)', // Strong text (light theme)
    800: 'hsl(0, 0%, 15%)', // Headings (light theme)
    900: 'hsl(0, 0%, 9%)', // Strongest text (light theme)
  },

  // Brand colors - consistent across themes
  brand: {
    primary: 'hsl(221, 83%, 53%)', // Blue-600
    primaryHover: 'hsl(221, 83%, 43%)', // Blue-700
    primaryLight: 'hsl(221, 83%, 63%)', // Blue-500
    secondary: 'hsl(142, 76%, 36%)', // Green-600
    secondaryHover: 'hsl(142, 76%, 26%)', // Green-700
    secondaryLight: 'hsl(142, 76%, 46%)', // Green-500
  },

  // Semantic colors
  semantic: {
    success: 'hsl(142, 76%, 36%)', // Green-600
    warning: 'hsl(38, 92%, 50%)', // Amber-500
    error: 'hsl(0, 84%, 60%)', // Red-500
    info: 'hsl(221, 83%, 53%)', // Blue-600
  },

  // Accent colors
  accent: {
    orange: 'hsl(25, 95%, 53%)', // Live indicators
    purple: 'hsl(262, 83%, 58%)', // Premium features
  },
} as const;

// Theme-specific color mappings
export const THEME_COLORS = {
  light: {
    // Background colors
    background: {
      primary: BASE_COLORS.neutral[50], // Main background
      secondary: BASE_COLORS.neutral[100], // Card backgrounds
      tertiary: BASE_COLORS.neutral[200], // Subtle backgrounds
      elevated: '#ffffff', // Elevated surfaces
    },

    // Text colors
    text: {
      primary: BASE_COLORS.neutral[900], // Main text
      secondary: BASE_COLORS.neutral[800], // Secondary text
      tertiary: BASE_COLORS.neutral[700], // Tertiary text
      muted: BASE_COLORS.neutral[600], // Muted text
      disabled: BASE_COLORS.neutral[400], // Disabled text
      inverse: '#ffffff', // Text on dark backgrounds
    },

    // Border colors
    border: {
      primary: BASE_COLORS.neutral[200], // Main borders
      secondary: BASE_COLORS.neutral[300], // Subtle borders
      focus: BASE_COLORS.brand.primary, // Focus borders
    },

    // Surface colors
    surface: {
      card: '#ffffff', // Card backgrounds
      modal: '#ffffff', // Modal backgrounds
      popover: '#ffffff', // Popover backgrounds
      tooltip: BASE_COLORS.neutral[800], // Tooltip backgrounds
    },
  },

  dark: {
    // Background colors - avoiding pure black
    background: {
      primary: 'hsl(0, 0%, 8%)', // Main background (not pure black)
      secondary: 'hsl(0, 0%, 12%)', // Card backgrounds
      tertiary: 'hsl(0, 0%, 16%)', // Subtle backgrounds
      elevated: 'hsl(0, 0%, 14%)', // Elevated surfaces
    },

    // Text colors - avoiding pure white
    text: {
      primary: 'hsl(0, 0%, 95%)', // Main text (not pure white)
      secondary: 'hsl(0, 0%, 85%)', // Secondary text
      tertiary: 'hsl(0, 0%, 75%)', // Tertiary text
      muted: 'hsl(0, 0%, 65%)', // Muted text
      disabled: 'hsl(0, 0%, 45%)', // Disabled text
      inverse: 'hsl(0, 0%, 9%)', // Text on light backgrounds
    },

    // Border colors
    border: {
      primary: 'hsl(0, 0%, 20%)', // Main borders
      secondary: 'hsl(0, 0%, 25%)', // Subtle borders
      focus: BASE_COLORS.brand.primary, // Focus borders
    },

    // Surface colors
    surface: {
      card: 'hsl(0, 0%, 10%)', // Card backgrounds
      modal: 'hsl(0, 0%, 12%)', // Modal backgrounds
      popover: 'hsl(0, 0%, 12%)', // Popover backgrounds
      tooltip: 'hsl(0, 0%, 85%)', // Tooltip backgrounds
    },
  },
} as const;

// CSS Custom Properties for theme switching
export const CSS_VARIABLES = {
  light: {
    '--color-background-primary': THEME_COLORS.light.background.primary,
    '--color-background-secondary': THEME_COLORS.light.background.secondary,
    '--color-background-tertiary': THEME_COLORS.light.background.tertiary,
    '--color-background-elevated': THEME_COLORS.light.background.elevated,

    '--color-text-primary': THEME_COLORS.light.text.primary,
    '--color-text-secondary': THEME_COLORS.light.text.secondary,
    '--color-text-tertiary': THEME_COLORS.light.text.tertiary,
    '--color-text-muted': THEME_COLORS.light.text.muted,
    '--color-text-disabled': THEME_COLORS.light.text.disabled,
    '--color-text-inverse': THEME_COLORS.light.text.inverse,

    '--color-border-primary': THEME_COLORS.light.border.primary,
    '--color-border-secondary': THEME_COLORS.light.border.secondary,
    '--color-border-focus': THEME_COLORS.light.border.focus,

    '--color-surface-card': THEME_COLORS.light.surface.card,
    '--color-surface-modal': THEME_COLORS.light.surface.modal,
    '--color-surface-popover': THEME_COLORS.light.surface.popover,
    '--color-surface-tooltip': THEME_COLORS.light.surface.tooltip,

    '--color-brand-primary': BASE_COLORS.brand.primary,
    '--color-brand-primary-hover': BASE_COLORS.brand.primaryHover,
    '--color-brand-secondary': BASE_COLORS.brand.secondary,
    '--color-brand-secondary-hover': BASE_COLORS.brand.secondaryHover,

    '--color-semantic-success': BASE_COLORS.semantic.success,
    '--color-semantic-warning': BASE_COLORS.semantic.warning,
    '--color-semantic-error': BASE_COLORS.semantic.error,
    '--color-semantic-info': BASE_COLORS.semantic.info,

    '--color-accent-orange': BASE_COLORS.accent.orange,
    '--color-accent-purple': BASE_COLORS.accent.purple,
  },

  dark: {
    '--color-background-primary': THEME_COLORS.dark.background.primary,
    '--color-background-secondary': THEME_COLORS.dark.background.secondary,
    '--color-background-tertiary': THEME_COLORS.dark.background.tertiary,
    '--color-background-elevated': THEME_COLORS.dark.background.elevated,

    '--color-text-primary': THEME_COLORS.dark.text.primary,
    '--color-text-secondary': THEME_COLORS.dark.text.secondary,
    '--color-text-tertiary': THEME_COLORS.dark.text.tertiary,
    '--color-text-muted': THEME_COLORS.dark.text.muted,
    '--color-text-disabled': THEME_COLORS.dark.text.disabled,
    '--color-text-inverse': THEME_COLORS.dark.text.inverse,

    '--color-border-primary': THEME_COLORS.dark.border.primary,
    '--color-border-secondary': THEME_COLORS.dark.border.secondary,
    '--color-border-focus': THEME_COLORS.dark.border.focus,

    '--color-surface-card': THEME_COLORS.dark.surface.card,
    '--color-surface-modal': THEME_COLORS.dark.surface.modal,
    '--color-surface-popover': THEME_COLORS.dark.surface.popover,
    '--color-surface-tooltip': THEME_COLORS.dark.surface.tooltip,

    '--color-brand-primary': BASE_COLORS.brand.primary,
    '--color-brand-primary-hover': BASE_COLORS.brand.primaryHover,
    '--color-brand-secondary': BASE_COLORS.brand.secondary,
    '--color-brand-secondary-hover': BASE_COLORS.brand.secondaryHover,

    '--color-semantic-success': BASE_COLORS.semantic.success,
    '--color-semantic-warning': BASE_COLORS.semantic.warning,
    '--color-semantic-error': BASE_COLORS.semantic.error,
    '--color-semantic-info': BASE_COLORS.semantic.info,

    '--color-accent-orange': BASE_COLORS.accent.orange,
    '--color-accent-purple': BASE_COLORS.accent.purple,
  },
} as const;

// Utility functions for getting theme colors
export const getThemeColor = (
  theme: 'light' | 'dark',
  category: keyof typeof THEME_COLORS.light,
  key: string
) => {
  return THEME_COLORS[theme][category][key as keyof (typeof THEME_COLORS.light)[typeof category]];
};

// Tailwind-compatible color classes
export const TAILWIND_COLORS = {
  // Background colors
  'bg-theme-primary': 'var(--color-background-primary)',
  'bg-theme-secondary': 'var(--color-background-secondary)',
  'bg-theme-tertiary': 'var(--color-background-tertiary)',
  'bg-theme-elevated': 'var(--color-background-elevated)',

  // Text colors
  'text-theme-primary': 'var(--color-text-primary)',
  'text-theme-secondary': 'var(--color-text-secondary)',
  'text-theme-tertiary': 'var(--color-text-tertiary)',
  'text-theme-muted': 'var(--color-text-muted)',
  'text-theme-disabled': 'var(--color-text-disabled)',
  'text-theme-inverse': 'var(--color-text-inverse)',

  // Border colors
  'border-theme-primary': 'var(--color-border-primary)',
  'border-theme-secondary': 'var(--color-border-secondary)',
  'border-theme-focus': 'var(--color-border-focus)',

  // Surface colors
  'bg-surface-card': 'var(--color-surface-card)',
  'bg-surface-modal': 'var(--color-surface-modal)',
  'bg-surface-popover': 'var(--color-surface-popover)',
  'bg-surface-tooltip': 'var(--color-surface-tooltip)',

  // Brand colors
  'bg-brand-primary': 'var(--color-brand-primary)',
  'bg-brand-primary-hover': 'var(--color-brand-primary-hover)',
  'bg-brand-secondary': 'var(--color-brand-secondary)',
  'bg-brand-secondary-hover': 'var(--color-brand-secondary-hover)',

  // Semantic colors
  'text-semantic-success': 'var(--color-semantic-success)',
  'text-semantic-warning': 'var(--color-semantic-warning)',
  'text-semantic-error': 'var(--color-semantic-error)',
  'text-semantic-info': 'var(--color-semantic-info)',
} as const;

// Legacy color constants for backward compatibility
export const LEGACY_COLORS = {
  // These maintain the old color system for gradual migration
  'clerk-primary': '#005d99',
  'clerk-accent': '#aa935a',
  'clerk-gray': '#d6d6d6',
  'clerk-bg': '#fafafa',
  'clerk-bg-secondary': '#efefef',
  'dark-bg': '#18181b',
  'dark-card': '#232326',
  'dark-border': '#27272a',
  'dark-text': '#a1a1aa',
  'dark-text-main': '#fafafa',
} as const;

// ========================================
// SPORTS CONFIGURATION
// ========================================

// Sports configuration with colors and navigation
export const SPORTS_CONFIG = {
  nba: {
    name: 'NBA',
    fullName: 'National Basketball Association',
    href: '/sports/nba',
    color: 'bg-brand-secondary hover:bg-brand-secondary-hover',
    icon: '🏀',
  },
  nfl: {
    name: 'NFL',
    fullName: 'National Football League',
    href: '/sports/nfl',
    color: 'bg-brand-pink hover:bg-brand-pink-hover',
    icon: '🏈',
  },
  mlb: {
    name: 'MLB',
    fullName: 'Major League Baseball',
    href: '/sports/mlb',
    color: 'bg-brand-cyan hover:bg-brand-cyan-hover',
    icon: '⚾',
  },
  nhl: {
    name: 'NHL',
    fullName: 'National Hockey League',
    href: '/sports/nhl',
    color: 'bg-brand-torquoise hover:bg-brand-torquoise-hover',
    icon: '🏒',
  },
  mls: {
    name: 'MLS',
    fullName: 'Major League Soccer',
    href: '/sports/mls',
    color: 'bg-brand-maroon hover:bg-brand-maroon-hover',
    icon: '⚽',
  },
} as const;

// Sports colors mapping
export const SPORTS_COLORS = {
  nba: 'blue',
  nfl: 'green',
  mlb: 'red',
  nhl: 'gray',
  mls: 'pink',
} as const;

// Helper function to get sports button class
export const getSportsButtonClass = (sport: keyof typeof SPORTS_CONFIG): string => {
  return SPORTS_CONFIG[sport]?.color || 'bg-theme-muted hover:bg-theme-secondary';
};

// Tailwind classes for backward compatibility
export const TAILWIND_CLASSES = {
  // Text colors
  'text-theme-primary': 'var(--color-text-primary)',
  'text-theme-secondary': 'var(--color-text-secondary)',
  'text-theme-tertiary': 'var(--color-text-tertiary)',
  'text-theme-muted': 'var(--color-text-muted)',
  'text-theme-disabled': 'var(--color-text-disabled)',
  'text-theme-inverse': 'var(--color-text-inverse)',

  // Background colors
  'bg-theme-primary': 'var(--color-background-primary)',
  'bg-theme-secondary': 'var(--color-background-secondary)',
  'bg-theme-tertiary': 'var(--color-background-tertiary)',
  'bg-theme-elevated': 'var(--color-background-elevated)',

  // Surface colors
  'bg-surface-card': 'var(--color-surface-card)',
  'bg-surface-modal': 'var(--color-surface-modal)',
  'bg-surface-popover': 'var(--color-surface-popover)',
  'bg-surface-tooltip': 'var(--color-surface-tooltip)',

  // Border colors
  'border-theme-primary': 'var(--color-border-primary)',
  'border-theme-secondary': 'var(--color-border-secondary)',
  'border-theme-focus': 'var(--color-border-focus)',

  // Brand colors
  'bg-brand-primary': 'var(--color-brand-primary)',
  'bg-brand-primary-hover': 'var(--color-brand-primary-hover)',
  'bg-brand-secondary': 'var(--color-brand-secondary)',
  'bg-brand-secondary-hover': 'var(--color-brand-secondary-hover)',

  // Semantic colors
  'text-semantic-success': 'var(--color-semantic-success)',
  'text-semantic-warning': 'var(--color-semantic-warning)',
  'text-semantic-error': 'var(--color-semantic-error)',
  'text-semantic-info': 'var(--color-semantic-info)',
} as const;
