/**
 * Centralized Color System for Game Diary
 *
 * This file contains all color definitions used throughout the application.
 * Colors are organized by category and include both Tailwind classes and hex values.
 */

// ========================================
// BRAND COLORS
// ========================================

export const BRAND_COLORS = {
  // Primary brand colors
  primary: {
    blue: '#3B82F6', // bg-blue-500
    blueHover: '#2563EB', // bg-blue-600
    blueDark: '#1D4ED8', // bg-blue-700
  },

  // Next.js cyan (used for Games buttons)
  nextjs: {
    cyan: '#00d4ff',
    cyanHover: '#00b8e6',
    cyanLight: '#00d4ff20', // 20% opacity
    cyanDark: '#00d4ff30', // 30% opacity
  },

  // Secondary brand colors
  secondary: {
    green: '#10B981', // bg-green-500
    greenHover: '#059669', // bg-green-600
    orange: '#F59E0B', // bg-orange-500
    orangeHover: '#D97706', // bg-orange-600
    red: '#EF4444', // bg-red-500
    redHover: '#DC2626', // bg-red-600
  },
} as const;

// ========================================
// SPORTS COLORS
// ========================================

export const SPORTS_COLORS = {
  nba: {
    primary: BRAND_COLORS.nextjs.cyan,
    hover: BRAND_COLORS.nextjs.cyanHover,
    background: BRAND_COLORS.nextjs.cyanLight,
    dark: BRAND_COLORS.nextjs.cyanDark,
  },
  nfl: {
    primary: BRAND_COLORS.primary.blue,
    hover: BRAND_COLORS.primary.blueHover,
    background: '#3B82F620',
    dark: '#3B82F630',
  },
  mlb: {
    primary: BRAND_COLORS.secondary.red,
    hover: BRAND_COLORS.secondary.redHover,
    background: '#EF444420',
    dark: '#EF444430',
  },
  nhl: {
    primary: '#4F46E5', // bg-indigo-600
    hover: '#4338CA', // bg-indigo-700
    background: '#4F46E520',
    dark: '#4F46E530',
  },
  mls: {
    primary: BRAND_COLORS.secondary.green,
    hover: BRAND_COLORS.secondary.greenHover,
    background: '#10B98120',
    dark: '#10B98130',
  },
} as const;

// Sports configuration for navigation and routing
export const SPORTS_CONFIG = {
  nba: {
    name: 'NBA',
    fullName: 'National Basketball Association',
    href: '/sports/nba',
    color: SPORTS_COLORS.nba.primary,
    icon: '🏀',
  },
  nfl: {
    name: 'NFL',
    fullName: 'National Football League',
    href: '/sports/nfl',
    color: SPORTS_COLORS.nfl.primary,
    icon: '🏈',
  },
  mlb: {
    name: 'MLB',
    fullName: 'Major League Baseball',
    href: '/sports/mlb',
    color: SPORTS_COLORS.mlb.primary,
    icon: '⚾',
  },
  nhl: {
    name: 'NHL',
    fullName: 'National Hockey League',
    href: '/sports/nhl',
    color: SPORTS_COLORS.nhl.primary,
    icon: '🏒',
  },
  mls: {
    name: 'MLS',
    fullName: 'Major League Soccer',
    href: '/sports/mls',
    color: SPORTS_COLORS.mls.primary,
    icon: '⚽',
  },
} as const;

// ========================================
// UI COLORS
// ========================================

export const UI_COLORS = {
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC', // bg-slate-50
    dark: '#1E293B', // bg-slate-800
    darkSecondary: '#334155', // bg-slate-700
  },

  // Text colors
  text: {
    primary: '#1E293B', // text-slate-800
    secondary: '#64748B', // text-slate-500
    muted: '#94A3B8', // text-slate-400
    dark: '#FFFFFF',
    darkSecondary: '#E2E8F0', // text-slate-200
  },

  // Border colors
  border: {
    light: '#E2E8F0', // border-slate-200
    medium: '#CBD5E1', // border-slate-300
    dark: '#475569', // border-slate-600
  },

  // Status colors
  status: {
    success: {
      light: '#DCFCE7', // bg-green-100
      dark: '#166534', // bg-green-800
      text: '#166534', // text-green-800
      textDark: '#86EFAC', // text-green-400
    },
    error: {
      light: '#FEE2E2', // bg-red-100
      dark: '#991B1B', // bg-red-800
      text: '#991B1B', // text-red-800
      textDark: '#FCA5A5', // text-red-400
    },
    warning: {
      light: '#FEF3C7', // bg-yellow-100
      dark: '#92400E', // bg-yellow-800
      text: '#92400E', // text-yellow-800
      textDark: '#FCD34D', // text-yellow-400
    },
    info: {
      light: '#DBEAFE', // bg-blue-100
      dark: '#1E40AF', // bg-blue-800
      text: '#1E40AF', // text-blue-800
      textDark: '#93C5FD', // text-blue-400
    },
  },
} as const;

// ========================================
// TAILWIND CLASS MAPPINGS
// ========================================

export const TAILWIND_CLASSES = {
  // Brand colors
  brand: {
    primary: 'bg-blue-500 hover:bg-blue-600',
    nextjs: 'bg-[#00d4ff] hover:bg-[#00b8e6]',
    secondary: 'bg-green-500 hover:bg-green-600',
  },

  // Sports colors
  sports: {
    nba: 'bg-[#00d4ff] hover:bg-[#00b8e6]',
    nfl: 'bg-blue-600 hover:bg-blue-700',
    mlb: 'bg-red-600 hover:bg-red-700',
    nhl: 'bg-indigo-800 hover:bg-indigo-900',
    mls: 'bg-green-600 hover:bg-green-700',
  },

  // Background colors
  background: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  },

  // Text colors
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
  },

  // Status colors
  status: {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  },
} as const;

// ========================================
// GRADIENT DEFINITIONS
// ========================================

export const GRADIENTS = {
  // Next.js cyan gradient
  nextjs: {
    background: 'bg-gradient-to-br from-[#00d4ff]/20 to-transparent dark:from-[#00d4ff]/10',
    avatar: 'bg-[#00d4ff]',
    badge: 'bg-[#00d4ff]/20 dark:bg-[#00d4ff]/30',
  },

  // Sports gradients
  sports: {
    nba: {
      background: 'bg-gradient-to-br from-[#00d4ff]/20 to-transparent dark:from-[#00d4ff]/10',
      avatar: 'bg-[#00d4ff]',
      badge: 'bg-[#00d4ff]/20 dark:bg-[#00d4ff]/30',
    },
    nfl: {
      background: 'bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-900/10',
      avatar: 'bg-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-900/30',
    },
    mlb: {
      background: 'bg-gradient-to-br from-red-50/30 to-transparent dark:from-red-900/10',
      avatar: 'bg-red-500',
      badge: 'bg-red-100 dark:bg-red-900/30',
    },
    nhl: {
      background: 'bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-indigo-900/10',
      avatar: 'bg-indigo-500',
      badge: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
    mls: {
      background: 'bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-900/10',
      avatar: 'bg-green-500',
      badge: 'bg-green-100 dark:bg-green-900/30',
    },
  },
} as const;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get sports color by sport key
 */
export function getSportsColor(sport: keyof typeof SPORTS_COLORS) {
  return SPORTS_COLORS[sport];
}

/**
 * Get Tailwind class for sports button
 */
export function getSportsButtonClass(sport: keyof typeof SPORTS_COLORS) {
  return TAILWIND_CLASSES.sports[sport];
}

/**
 * Get gradient classes for sports components
 */
export function getSportsGradient(sport: keyof typeof SPORTS_COLORS) {
  return GRADIENTS.sports[sport] || GRADIENTS.sports.nba; // Default to NBA
}

/**
 * Get status color classes
 */
export function getStatusClass(status: keyof typeof TAILWIND_CLASSES.status) {
  return TAILWIND_CLASSES.status[status];
}

/**
 * Get theme color by theme and type
 */
export function getThemeColor(theme: 'light' | 'dark', type: keyof typeof THEME_COLORS.light) {
  return THEME_COLORS[theme][type];
}

/**
 * Get CSS custom property color
 */
export function getCssColor(category: keyof typeof CSS_COLORS, color: string) {
  return CSS_COLORS[category][color as keyof (typeof CSS_COLORS)[typeof category]];
}

/**
 * Get theme-aware color class
 */
export function getThemeAwareColor(lightColor: string, darkColor: string) {
  return `${lightColor} dark:${darkColor}`;
}

// ========================================
// TYPE DEFINITIONS
// ========================================

// ========================================
// THEME COLORS
// ========================================

export const THEME_COLORS = {
  // Dark theme colors
  dark: {
    background: '#18181b',
    surface: '#232329',
    border: '#27272a',
    text: {
      primary: '#ffffff',
      secondary: '#71717a',
      muted: '#a1a1aa',
    },
  },

  // Light theme colors
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
    },
  },
} as const;

// ========================================
// CSS CUSTOM PROPERTIES
// ========================================

export const CSS_COLORS = {
  // Brand colors
  brand: {
    primary: 'hsl(221 83% 53%)', // Blue-600
    primaryHover: 'hsl(221 83% 43%)', // Blue-700
    primaryLight: 'hsl(221 83% 63%)', // Blue-500
    secondary: 'hsl(142 76% 36%)', // Green-600
    secondaryHover: 'hsl(142 76% 26%)', // Green-700
    secondaryLight: 'hsl(142 76% 46%)', // Green-500
  },

  // Semantic colors
  semantic: {
    success: 'hsl(142 76% 36%)', // Green-600
    warning: 'hsl(38 92% 50%)', // Amber-500
    error: 'hsl(0 84% 60%)', // Red-500
    info: 'hsl(221 83% 53%)', // Blue-600
  },

  // Accent colors
  accent: {
    orange: 'hsl(25 95% 53%)', // Live indicators
    purple: 'hsl(262 83% 58%)', // Premium features
  },

  // Neutral colors
  neutral: {
    50: 'hsl(0 0% 98%)', // Lightest bg
    100: 'hsl(0 0% 96%)', // Light bg
    200: 'hsl(0 0% 90%)', // Borders
    300: 'hsl(0 0% 83%)', // Disabled
    400: 'hsl(0 0% 64%)', // Placeholder
    500: 'hsl(0 0% 45%)', // Secondary text
    600: 'hsl(0 0% 32%)', // Primary text
    700: 'hsl(0 0% 25%)', // Strong text
    800: 'hsl(0 0% 15%)', // Headings
    900: 'hsl(0 0% 9%)', // Strongest text
  },
} as const;

// ========================================
// TYPE DEFINITIONS
// ========================================
// All type definitions have been moved to @/lib/types
