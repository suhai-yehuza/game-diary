// Modern responsive breakpoints aligned with Tailwind CSS
export const MOBILE_BREAKPOINT = 640; // Mobile: < 640px (sm)
export const TABLET_BREAKPOINT = 768; // Tablet: 640px - 768px (md)
export const DESKTOP_BREAKPOINT = 1024; // Desktop: 768px - 1024px (lg)
export const LARGE_DESKTOP_BREAKPOINT = 1280; // Large Desktop: > 1024px (xl)

// Additional breakpoints for better responsiveness
export const SMALL_MOBILE_BREAKPOINT = 320; // Small mobile: < 320px
export const LARGE_MOBILE_BREAKPOINT = 480; // Large mobile: 320px - 480px
export const SMALL_TABLET_BREAKPOINT = 640; // Small tablet: 480px - 640px
export const LARGE_TABLET_BREAKPOINT = 768; // Large tablet: 640px - 768px
export const SMALL_DESKTOP_BREAKPOINT = 1024; // Small desktop: 768px - 1024px
export const EXTRA_LARGE_DESKTOP_BREAKPOINT = 1536; // Extra large: > 1280px

// Navigation-specific breakpoints for better UX
export const NAVIGATION_MOBILE_BREAKPOINT = 640; // Use mobile nav below this
export const NAVIGATION_TABLET_BREAKPOINT = 768; // Use tablet nav between this and desktop
export const NAVIGATION_DESKTOP_BREAKPOINT = 1024; // Use desktop nav above this

// Touch-friendly minimum sizes - Enhanced for better accessibility
export const MIN_TOUCH_TARGET = 44; // 44px minimum for touch targets
export const MIN_BUTTON_HEIGHT = 48; // 48px minimum for buttons
export const MIN_TOUCH_TARGET_LARGE = 56; // 56px for larger touch targets
export const MIN_TOUCH_TARGET_EXTRA_LARGE = 64; // 64px for primary actions

// Enhanced touch target utilities
export const TOUCH_TARGET_BASE = {
  minHeight: '44px',
  minWidth: '44px',
  padding: '12px 16px',
  fontSize: '1rem',
  lineHeight: '1.5',
};

export const TOUCH_TARGET_LARGE = {
  minHeight: '56px',
  minWidth: '56px',
  padding: '16px 20px',
  fontSize: '1.125rem',
  lineHeight: '1.4',
};

export const TOUCH_TARGET_EXTRA_LARGE = {
  minHeight: '64px',
  minWidth: '64px',
  padding: '20px 24px',
  fontSize: '1.25rem',
  lineHeight: '1.3',
};

// Responsive spacing values
export const MOBILE_SPACING = {
  padding: '1rem',
  margin: '0.75rem',
  gap: '0.5rem',
};

export const TABLET_SPACING = {
  padding: '1.5rem',
  margin: '1rem',
  gap: '0.75rem',
};

export const DESKTOP_SPACING = {
  padding: '2rem',
  margin: '1.5rem',
  gap: '1rem',
};

// Enhanced responsive spacing for better mobile experience
export const RESPONSIVE_SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

// Mobile-optimized spacing
export const MOBILE_OPTIMIZED_SPACING = {
  padding: '0.75rem',
  margin: '0.5rem',
  gap: '0.375rem',
  borderRadius: '0.75rem',
};

// Touch-friendly sizing
export const TOUCH_SIZING = {
  minHeight: '44px',
  minWidth: '44px',
  minHeightLarge: '56px',
  minWidthLarge: '56px',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
};

// Responsive typography scale
export const RESPONSIVE_TYPOGRAPHY = {
  mobile: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  tablet: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.875rem',
    '3xl': '2.25rem',
  },
  desktop: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '2.5rem',
  },
};

// Fluid typography utilities using clamp()
export const FLUID_TYPOGRAPHY = {
  // Header typography
  headerTitle: 'clamp(1.125rem, 2.5vw, 1.5rem)', // 18px to 24px
  headerNav: 'clamp(0.875rem, 2vw, 1rem)', // 14px to 16px
  headerButton: 'clamp(0.875rem, 2vw, 1rem)', // 14px to 16px

  // Mobile navigation
  mobileNavLabel: 'clamp(0.75rem, 1.5vw, 0.875rem)', // 12px to 14px
  mobileNavIcon: 'clamp(1.25rem, 3vw, 1.5rem)', // 20px to 24px

  // Search bar
  searchPlaceholder: 'clamp(0.875rem, 2vw, 1rem)', // 14px to 16px
  searchInput: 'clamp(0.875rem, 2vw, 1.125rem)', // 14px to 18px

  // Touch targets with fluid sizing
  touchTarget: 'clamp(44px, 4vw, 56px)', // 44px to 56px
  touchTargetLarge: 'clamp(56px, 5vw, 64px)', // 56px to 64px
};
