import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useErrorHandler } from '@src/app/protected/admin/database/components/ui/use-error-handler';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

describe('useErrorHandler', () => {
  it('initializes with no error state', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error.hasError).toBe(false);
    expect(result.current.error.error).toBeUndefined();
    expect(result.current.error.message).toBeUndefined();
  });

  it('sets error state when setError is called with string', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('Test error message');
    expect(result.current.error.message).toBe('Test error message');
  });

  it('sets error state when setError is called with Error object', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error message');

    act(() => {
      result.current.setError(testError);
    });

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error).toBe(testError);
    expect(result.current.error.message).toBe('Test error message');
  });

  it('clears error state when clearError is called', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error.hasError).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error.hasError).toBe(false);
    expect(result.current.error.error).toBeUndefined();
    expect(result.current.error.message).toBeUndefined();
  });

  it('handles async errors with handleAsyncError', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const asyncFunction = async () => {
      throw new Error('Async error message');
    };

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.handleAsyncError(asyncFunction);
    });

    expect(returnValue).toBeUndefined();
    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('Async error message');
  });

  it('returns value when async function succeeds', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const asyncFunction = async () => {
      return 'success';
    };

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.handleAsyncError(asyncFunction);
    });

    expect(returnValue).toBe('success');
    expect(result.current.error.hasError).toBe(false);
  });

  it('handles sync errors with handleSyncError', () => {
    const { result } = renderHook(() => useErrorHandler());

    const syncFunction = () => {
      throw new Error('Sync error message');
    };

    let returnValue: string | undefined;
    act(() => {
      returnValue = result.current.handleSyncError(syncFunction);
    });

    expect(returnValue).toBeUndefined();
    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('Sync error message');
  });

  it('returns value when sync function succeeds', () => {
    const { result } = renderHook(() => useErrorHandler());

    const syncFunction = () => {
      return 'success';
    };

    let returnValue: string | undefined;
    act(() => {
      returnValue = result.current.handleSyncError(syncFunction);
    });

    expect(returnValue).toBe('success');
    expect(result.current.error.hasError).toBe(false);
  });

  it('handles non-Error objects in async functions', async () => {
    const { result } = renderHook(() => useErrorHandler());

    const asyncFunction = async () => {
      throw 'String error';
    };

    await act(async () => {
      await result.current.handleAsyncError(asyncFunction);
    });

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('String error');
  });

  it('handles non-Error objects in sync functions', () => {
    const { result } = renderHook(() => useErrorHandler());

    const syncFunction = () => {
      throw 'String error';
    };

    act(() => {
      result.current.handleSyncError(syncFunction);
    });

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('String error');
  });

  it('logs errors to console', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error message');

    act(() => {
      result.current.setError(testError);
    });

    expect(console.error).toHaveBeenCalledWith('Error caught by useErrorHandler:', testError);
  });

  it('maintains error state across re-renders', () => {
    const { result, rerender } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.setError('Test error message');
    });

    expect(result.current.error.hasError).toBe(true);

    rerender();

    expect(result.current.error.hasError).toBe(true);
    expect(result.current.error.error?.message).toBe('Test error message');
  });
});
