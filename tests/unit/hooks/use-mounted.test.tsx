import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMounted } from '@/hooks/use-mounted';

describe('useMounted', () => {
  it('returns false initially', () => {
    const { result } = renderHook(() => useMounted());

    expect(result.current).toBe(false);
  });

  it('returns true after component mounts', () => {
    const { result } = renderHook(() => useMounted());

    act(() => {
      // Simulate component mounting
      vi.runAllTimers();
    });

    expect(result.current).toBe(true);
  });

  it('maintains true state after mounting', () => {
    const { result } = renderHook(() => useMounted());

    act(() => {
      vi.runAllTimers();
    });

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

    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false);

    act(() => {
      vi.runAllTimers();
    });

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it('handles unmounting and remounting', () => {
    const { result, unmount } = renderHook(() => useMounted());

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current).toBe(true);

    unmount();

    const { result: newResult } = renderHook(() => useMounted());
    expect(newResult.current).toBe(false);

    act(() => {
      vi.runAllTimers();
    });

    expect(newResult.current).toBe(true);
  });
});
