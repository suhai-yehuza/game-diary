import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCentralizedErrorHandler } from '@/hooks/use-centralized-error-handler';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock error handlers
vi.mock('@/lib/utils/error-handler', () => ({
  errorHandlers: {
    api: vi.fn(),
  },
}));

describe('useCentralizedErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAsync', () => {
    it('should execute async function successfully', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockResolvedValue('success');

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(mockAsyncFn).toHaveBeenCalled();
      expect(output).toBe('success');
    });

    it('should handle async function errors with default options', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Test error'));

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalledWith('An error occurred. Please try again.');
    });

    it('should handle async function errors with custom toast message', async () => {
      const { result } = renderHook(() =>
        useCentralizedErrorHandler({ toastMessage: 'Custom error message' })
      );
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Test error'));

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalledWith('Custom error message');
    });

    it('should handle async function errors without toast', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler({ showToast: false }));
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Test error'));

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle async function errors with operation context', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Test error'));

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn, {
          action: 'Test action',
          component: 'TestComponent',
        });
      });

      expect(output).toBeUndefined();
    });

    it('should handle non-Error objects', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue('String error');

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('handleSync', () => {
    it('should execute sync function successfully', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockSyncFn = vi.fn().mockReturnValue('success');

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn);
      });

      expect(mockSyncFn).toHaveBeenCalled();
      expect(output).toBe('success');
    });

    it('should handle sync function errors with default options', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockSyncFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalledWith('An error occurred. Please try again.');
    });

    it('should handle sync function errors with custom toast message', () => {
      const { result } = renderHook(() =>
        useCentralizedErrorHandler({ toastMessage: 'Custom sync error' })
      );
      const mockSyncFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalledWith('Custom sync error');
    });

    it('should handle sync function errors without toast', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler({ showToast: false }));
      const mockSyncFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should handle sync function errors with operation context', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockSyncFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn, {
          action: 'Test sync action',
          component: 'TestComponent',
        });
      });

      expect(output).toBeUndefined();
    });

    it('should handle non-Error objects in sync function', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockSyncFn = vi.fn().mockImplementation(() => {
        throw 'String error';
      });

      let output: string | undefined;
      act(() => {
        output = result.current.handleSync(mockSyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('handleClerkUser', () => {
    it('should return fallback user data', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());

      let userData: any;
      act(() => {
        userData = result.current.handleClerkUser();
      });

      expect(userData).toEqual({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });
    });

    it('should handle Clerk errors gracefully', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      let userData: any;
      act(() => {
        userData = result.current.handleClerkUser();
      });

      expect(userData).toEqual({
        user: null,
        isLoaded: false,
        isSignedIn: false,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('handleParamsResolution', () => {
    it('should resolve parameters successfully', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockParams = Promise.resolve('resolved params');

      let output: any;
      await act(async () => {
        output = await result.current.handleParamsResolution(mockParams);
      });

      expect(output).toBe('resolved params');
    });

    it('should handle parameter resolution failure', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockParams = Promise.resolve(null);

      let output: any;
      await act(async () => {
        output = await result.current.handleParamsResolution(mockParams);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle parameter resolution with operation context', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockParams = Promise.resolve('resolved params');

      let output: any;
      await act(async () => {
        output = await result.current.handleParamsResolution(mockParams, {
          action: 'Custom params action',
          component: 'TestComponent',
        });
      });

      expect(output).toBe('resolved params');
    });

    it('should handle parameter resolution rejection', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockParams = Promise.reject(new Error('Params error'));

      let output: any;
      await act(async () => {
        output = await result.current.handleParamsResolution(mockParams);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('handleDataFetch', () => {
    it('should fetch data successfully', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockFetchFn = vi.fn().mockResolvedValue('fetched data');

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleDataFetch(mockFetchFn);
      });

      expect(output).toBe('fetched data');
    });

    it('should handle data fetch failure', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockFetchFn = vi.fn().mockResolvedValue(null);

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleDataFetch(mockFetchFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle data fetch with operation context', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockFetchFn = vi.fn().mockResolvedValue('fetched data');

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleDataFetch(mockFetchFn, {
          action: 'Custom fetch action',
          component: 'TestComponent',
        });
      });

      expect(output).toBe('fetched data');
    });

    it('should handle data fetch rejection', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockFetchFn = vi.fn().mockRejectedValue(new Error('Fetch error'));

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleDataFetch(mockFetchFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('hook options', () => {
    it('should use default options when none provided', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());

      expect(result.current).toHaveProperty('handleAsync');
      expect(result.current).toHaveProperty('handleSync');
      expect(result.current).toHaveProperty('handleClerkUser');
      expect(result.current).toHaveProperty('handleParamsResolution');
      expect(result.current).toHaveProperty('handleDataFetch');
    });

    it('should use custom options when provided', () => {
      const customOptions = {
        showToast: false,
        toastMessage: 'Custom message',
        context: { component: 'TestComponent' },
      };

      const { result } = renderHook(() => useCentralizedErrorHandler(customOptions));

      expect(result.current).toHaveProperty('handleAsync');
      expect(result.current).toHaveProperty('handleSync');
      expect(result.current).toHaveProperty('handleClerkUser');
      expect(result.current).toHaveProperty('handleParamsResolution');
      expect(result.current).toHaveProperty('handleDataFetch');
    });

    it('should handle empty context object', () => {
      const { result } = renderHook(() => useCentralizedErrorHandler({ context: {} }));

      expect(result.current).toHaveProperty('handleAsync');
      expect(result.current).toHaveProperty('handleSync');
      expect(result.current).toHaveProperty('handleClerkUser');
      expect(result.current).toHaveProperty('handleParamsResolution');
      expect(result.current).toHaveProperty('handleDataFetch');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined errors', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(undefined);

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle null errors', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(null);

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle number errors', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(404);

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });

    it('should handle boolean errors', async () => {
      const { result } = renderHook(() => useCentralizedErrorHandler());
      const mockAsyncFn = vi.fn().mockRejectedValue(false);

      let output: string | undefined;
      await act(async () => {
        output = await result.current.handleAsync(mockAsyncFn);
      });

      expect(output).toBeUndefined();
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
