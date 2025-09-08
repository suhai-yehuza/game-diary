import { useCallback, useState } from 'react';

import { logError } from '@/lib/utils/logger';
import type { IErrorState, IUseErrorHandlerReturn } from '@/types';

/**
 * Reusable error handling hook
 * Provides consistent error handling across components
 */
export function useErrorHandler(): IUseErrorHandlerReturn {
  const [error, setErrorState] = useState<IErrorState>({ hasError: false });

  const setError = useCallback((errorInput: Error | string) => {
    const errorObj = typeof errorInput === 'string' ? new Error(errorInput) : errorInput;

    setErrorState({
      hasError: true,
      error: errorObj,
      message: errorObj.message,
    });

    // Log error for debugging
    logError('Error caught by useErrorHandler', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ hasError: false });
  }, []);

  const handleAsyncError = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await asyncFn();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return undefined;
      }
    },
    [setError]
  );

  const handleSyncError = useCallback(
    <T>(syncFn: () => T): T | undefined => {
      try {
        return syncFn();
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return undefined;
      }
    },
    [setError]
  );

  return {
    error,
    handleError: setError,
    setError,
    clearError,
    handleAsyncError,
    handleSyncError,
  };
}

/**
 * Hook for handling API errors specifically
 */
export function useApiErrorHandler() {
  const { error, setError, clearError } = useErrorHandler();

  const handleApiError = useCallback(
    (response: Response, context?: string) => {
      const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      setError(error);
      logError(`API Error in ${context ?? 'unknown context'}`, error, {
        status: response.status,
        statusText: response.statusText,
      });
    },
    [setError]
  );

  const handleNetworkError = useCallback(
    (error: Error, context?: string) => {
      setError(error);
      logError(`Network Error in ${context ?? 'unknown context'}`, error);
    },
    [setError]
  );

  return {
    error,
    setError,
    clearError,
    handleApiError,
    handleNetworkError,
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandler() {
  const { error, setError, clearError } = useErrorHandler();

  const handleValidationError = useCallback(
    (field: string, message: string) => {
      const error = new Error(`Validation error in ${field}: ${message}`);
      setError(error);
      logError('Form validation error', error, { field, message });
    },
    [setError]
  );

  const handleSubmitError = useCallback(
    (error: Error, formName?: string) => {
      setError(error);
      logError(`Form submit error in ${formName ?? 'unknown form'}`, error);
    },
    [setError]
  );

  return {
    error,
    setError,
    clearError,
    handleValidationError,
    handleSubmitError,
  };
}
