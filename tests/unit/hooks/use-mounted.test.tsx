/// <reference types="vitest/globals" />

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useMounted } from '@/hooks/use-mounted';

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
