'use client';

import { useEffect, useState } from 'react';

import type { UseResponsiveOptions, ResponsiveState, Breakpoint } from '@/types';

// Breakpoint definitions matching Tailwind config
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  // Mobile-first breakpoints
  'mobile-sm': 320,
  'mobile-md': 375,
  'mobile-lg': 414,
  'tablet-sm': 768,
  'tablet-lg': 1024,
  'desktop-sm': 1280,
  'desktop-lg': 1536,
  'desktop-xl': 1920,
} as const;

export function useResponsive(options: UseResponsiveOptions = {}): ResponsiveState {
  const { defaultWidth = 1024 } = options;

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: defaultWidth,
        height: 768,
      };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Use ResizeObserver for better performance
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.body);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const { width, height } = dimensions;

  // Determine current breakpoint
  const getCurrentBreakpoint = (): Breakpoint => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    if (width >= BREAKPOINTS.xs) return 'xs';
    return 'mobile-sm';
  };

  const currentBreakpoint = getCurrentBreakpoint();

  // Device type checks
  const isMobile = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  // Specific mobile checks
  const isSmallMobile = width < BREAKPOINTS['mobile-md'];
  const isLargeMobile = width >= BREAKPOINTS['mobile-lg'] && width < BREAKPOINTS.md;

  // Specific tablet checks
  const isSmallTablet = width >= BREAKPOINTS['tablet-sm'] && width < BREAKPOINTS['tablet-lg'];
  const isLargeTablet = width >= BREAKPOINTS['tablet-lg'] && width < BREAKPOINTS.lg;

  // Specific desktop checks
  const isSmallDesktop = width >= BREAKPOINTS['desktop-sm'] && width < BREAKPOINTS['desktop-lg'];
  const isLargeDesktop = width >= BREAKPOINTS['desktop-lg'] && width < BREAKPOINTS['desktop-xl'];
  const isExtraLargeDesktop = width >= BREAKPOINTS['desktop-xl'];

  // Utility functions
  const isAbove = (breakpoint: Breakpoint): boolean => {
    return width >= BREAKPOINTS[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return width < BREAKPOINTS[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return width >= BREAKPOINTS[min] && width < BREAKPOINTS[max];
  };

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeMobile,
    isSmallTablet,
    isLargeTablet,
    isSmallDesktop,
    isLargeDesktop,
    isExtraLargeDesktop,
    currentBreakpoint,
    isAbove,
    isBelow,
    isBetween,
  };
}

// Hook for mobile detection (backward compatibility)
export function useMobileDetection(breakpoint: number = BREAKPOINTS.md): boolean {
  const { width } = useResponsive();
  return width < breakpoint;
}

// Hook for tablet detection
export function useTabletDetection(): boolean {
  const { isTablet } = useResponsive();
  return isTablet;
}

// Hook for desktop detection
export function useDesktopDetection(): boolean {
  const { isDesktop } = useResponsive();
  return isDesktop;
}

// Hook for touch device detection
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}

// Hook for reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Hook for high contrast preference
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// Hook for dark mode preference
export function useDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDarkMode;
}
