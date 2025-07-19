import { useCallback, useState } from 'react';

interface IErrorState {
  hasError: boolean;
  error?: Error;
  message?: string;
}

interface IUseErrorHandlerReturn {
  error: IErrorState;
  setError: (error: Error | string) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | undefined>;
  handleSyncError: <T>(syncFn: () => T) => T | undefined;
}

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
    console.error('Error caught by useErrorHandler:', errorObj);
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
    setError,
    clearError,
    handleAsyncError,
    handleSyncError,
  };
}
