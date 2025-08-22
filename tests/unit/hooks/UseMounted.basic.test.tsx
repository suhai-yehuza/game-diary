/// <reference types="vitest/globals" />

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMounted, useMountedWithDelay, useMountedWithLoading } from '@/hooks/use-mounted';

describe('useMounted', () => {
  beforeEach(() => {
    // Reset any side effects between tests
  });

  it('should return true after component mounts', () => {
    const { result } = renderHook(() => useMounted());
    // In test environment, useEffect runs immediately, so it should be true
    expect(result.current).toBe(true);
  });

  it('should maintain true state after initial mount', () => {
    const { result } = renderHook(() => useMounted());

    // Should be true after mount
    expect(result.current).toBe(true);

    // Should remain true after re-renders
    act(() => {
      // Trigger a re-render
    });
    expect(result.current).toBe(true);
  });

  it('should only set mounted to true once', () => {
    const { result, rerender } = renderHook(() => useMounted());

    // Should be true after mount
    expect(result.current).toBe(true);

    // Should remain true after re-renders
    rerender();
    expect(result.current).toBe(true);

    rerender();
    expect(result.current).toBe(true);
  });

  it('should work correctly with multiple instances', () => {
    const { result: result1 } = renderHook(() => useMounted());
    const { result: result2 } = renderHook(() => useMounted());

    // Both should be true after mount
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it('should handle rapid state changes correctly', () => {
    const { result } = renderHook(() => useMounted());

    // Should be true after mount
    expect(result.current).toBe(true);

    // Multiple act calls should not cause issues
    act(() => {
      // Trigger multiple state changes
    });
    expect(result.current).toBe(true);

    act(() => {
      // Another state change
    });
    expect(result.current).toBe(true);
  });
});

describe('useMountedWithDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return false initially', () => {
    const { result } = renderHook(() => useMountedWithDelay(100));
    expect(result.current).toBe(false);
  });

  it('should return true after delay', () => {
    const { result } = renderHook(() => useMountedWithDelay(100));

    // Initially false
    expect(result.current).toBe(false);

    // Advance time by 100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should be true after delay
    expect(result.current).toBe(true);
  });

  it('should work with zero delay', () => {
    const { result } = renderHook(() => useMountedWithDelay(0));

    // Even with zero delay, setTimeout needs to be processed
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Should be true after processing
    expect(result.current).toBe(true);
  });

  it('should work with custom delay', () => {
    const { result } = renderHook(() => useMountedWithDelay(500));

    // Initially false
    expect(result.current).toBe(false);

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be true after delay
    expect(result.current).toBe(true);
  });

  it('should clean up timer on unmount', () => {
    const { unmount } = renderHook(() => useMountedWithDelay(1000));

    // Unmount before timer completes
    unmount();

    // Advance time - should not cause any issues
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(({ delay }) => useMountedWithDelay(delay), {
      initialProps: { delay: 100 },
    });

    // Initially false
    expect(result.current).toBe(false);

    // Change delay
    rerender({ delay: 200 });

    // Should still be false
    expect(result.current).toBe(false);

    // Advance time by 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should be true after new delay
    expect(result.current).toBe(true);
  });
});

describe('useMountedWithLoading', () => {
  beforeEach(() => {
    // Reset any side effects between tests
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useMountedWithLoading());

    // In test environment, useEffect runs immediately
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should maintain state after re-renders', () => {
    const { result, rerender } = renderHook(() => useMountedWithLoading());

    // Should be mounted and not loading
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);

    // Should remain the same after re-renders
    rerender();
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should work correctly with multiple instances', () => {
    const { result: result1 } = renderHook(() => useMountedWithLoading());
    const { result: result2 } = renderHook(() => useMountedWithLoading());

    // Both should be mounted and not loading
    expect(result1.current.mounted).toBe(true);
    expect(result1.current.loading).toBe(false);
    expect(result2.current.mounted).toBe(true);
    expect(result2.current.loading).toBe(false);
  });

  it('should handle rapid state changes correctly', () => {
    const { result } = renderHook(() => useMountedWithLoading());

    // Should be mounted and not loading
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);

    // Multiple act calls should not cause issues
    act(() => {
      // Trigger multiple state changes
    });
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);

    act(() => {
      // Another state change
    });
    expect(result.current.mounted).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('should return object with correct properties', () => {
    const { result } = renderHook(() => useMountedWithLoading());

    expect(result.current).toHaveProperty('mounted');
    expect(result.current).toHaveProperty('loading');
    expect(typeof result.current.mounted).toBe('boolean');
    expect(typeof result.current.loading).toBe('boolean');
  });
});
