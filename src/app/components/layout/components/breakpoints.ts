// Modern responsive breakpoints following industry standards
export const MOBILE_BREAKPOINT = 768; // Mobile: < 768px
export const TABLET_BREAKPOINT = 1024; // Tablet: 768px - 1024px
export const DESKTOP_BREAKPOINT = 1280; // Desktop: > 1024px

// Additional breakpoints for better responsiveness
export const SMALL_MOBILE_BREAKPOINT = 480; // Small mobile: < 480px
export const LARGE_MOBILE_BREAKPOINT = 640; // Large mobile: 480px - 640px
export const SMALL_TABLET_BREAKPOINT = 768; // Small tablet: 640px - 768px
export const LARGE_TABLET_BREAKPOINT = 1024; // Large tablet: 768px - 1024px

// Touch-friendly minimum sizes
export const MIN_TOUCH_TARGET = 44; // 44px minimum for touch targets
export const MIN_BUTTON_HEIGHT = 48; // 48px minimum for buttons
export const MIN_TOUCH_TARGET_LARGE = 56; // 56px for larger touch targets

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
