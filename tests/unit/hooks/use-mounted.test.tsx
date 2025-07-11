import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMounted } from '@/hooks/use-mounted';

describe('useMounted', () => {
  it('returns true in test environment (useEffect runs synchronously)', () => {
    const { result } = renderHook(() => useMounted());

    // In test environment, useEffect runs synchronously
    expect(result.current).toBe(true);
  });

  it('maintains true state after additional renders', () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current).toBe(true);

    // Should still be true after additional renders
    act(() => {
      // Trigger a re-render
    });

    expect(result.current).toBe(true);
  });

  it('works with multiple instances', () => {
    const { result: result1 } = renderHook(() => useMounted());
    const { result: result2 } = renderHook(() => useMounted());

    // Both should be true in test environment
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it('handles unmounting and remounting', () => {
    const { result, unmount } = renderHook(() => useMounted());

    expect(result.current).toBe(true);

    unmount();

    const { result: newResult } = renderHook(() => useMounted());
    // New instance should also be true in test environment
    expect(newResult.current).toBe(true);
  });
});
