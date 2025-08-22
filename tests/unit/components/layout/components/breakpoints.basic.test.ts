import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMobileDetection } from '@/app/components/layout/components/SearchBar';

describe('breakpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useMobileDetection', () => {
    it('returns true for mobile screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375, // Mobile width
      });

      const { result } = renderHook(() => useMobileDetection());
      expect(result.current).toBe(true);
    });

    it('returns false for desktop screen size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024, // Desktop width
      });

      const { result } = renderHook(() => useMobileDetection());
      expect(result.current).toBe(false);
    });

    it('uses correct breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 768, // Exactly at breakpoint
      });

      const { result } = renderHook(() => useMobileDetection());
      expect(result.current).toBe(false); // Should be false at exactly 768px
    });

    it('handles multiple calls correctly', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375, // Mobile width
      });

      const { result: result1 } = renderHook(() => useMobileDetection());
      const { result: result2 } = renderHook(() => useMobileDetection());

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
    });

    it('handles different screen sizes', () => {
      // Mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375, // Mobile width
      });

      const { result: mobileResult } = renderHook(() => useMobileDetection());
      expect(mobileResult.current).toBe(true);

      // Desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024, // Desktop width
      });

      const { result: desktopResult } = renderHook(() => useMobileDetection());
      expect(desktopResult.current).toBe(false);
    });
  });
});
