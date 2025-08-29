import { useCallback, useState } from 'react';

import type { IErrorState, IUseErrorHandlerReturn } from '@/lib/types';
import { useErrorHandler as useCentralizedErrorHandler } from '@/lib/utils/error-handler';

// This file intentionally uses try-catch blocks for error handling
// as it is a specialized error handler component that needs to capture
// and preserve original error messages for the UI state.

export function useErrorHandler(): IUseErrorHandlerReturn {
  const [error, setErrorState] = useState<IErrorState>({ hasError: false });
  const { handleAsync, handleSync } = useCentralizedErrorHandler();

  const setError = useCallback((errorInput: Error | string) => {
    const errorObj = typeof errorInput === 'string' ? new Error(errorInput) : errorInput;

    setErrorState({
      hasError: true,
      error: errorObj,
      message: errorObj.message,
    });

    // Log error for debugging
    console.error('Error caught by useErrorHandler:', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ hasError: false });
  }, []);

  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await asyncFn();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setErrorState({
          hasError: true,
          error: errorObj,
          message: errorObj.message,
        });

        // Also log through centralized error handler
        void handleAsync(asyncFn, {
          component: 'useErrorHandler',
          action: 'Handle async error',
        });

        return undefined;
      }
    },
    [handleAsync]
  );

  const handleSyncError = useCallback(
    <T>(syncFn: () => T): T | undefined => {
      try {
        return syncFn();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setErrorState({
          hasError: true,
          error: errorObj,
          message: errorObj.message,
        });

        // Also log through centralized error handler
        void handleSync(syncFn, {
          component: 'useErrorHandler',
          action: 'Handle sync error',
        });

        return undefined;
      }
    },
    [handleSync]
  );

  return {
    error,
    setError,
    clearError,
    handleAsyncError,
    handleSyncError,
  };
}
