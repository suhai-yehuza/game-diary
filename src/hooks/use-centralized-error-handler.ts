/**
 * Centralized error handling hook
 * Eliminates duplication of error handling patterns across components
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

import type { IErrorContext, ICentralizedErrorHandlerOptions } from '@/lib/types';
import { errorHandlers } from '@/lib/utils/error-handler';

export function useCentralizedErrorHandler(options: ICentralizedErrorHandlerOptions = {}) {
  const { showToast = true, toastMessage, context = {} } = options;

  /**
   * Handle async operations with automatic error handling
   */
  const handleAsync = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      operationContext?: Partial<IErrorContext>
    ): Promise<T | undefined> => {
      try {
        return await asyncFn();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        // Use centralized error handling
        errorHandlers.api(errorObj, {
          ...context,
          ...operationContext,
        });

        // Show toast if enabled
        if (showToast) {
          const message = toastMessage || 'An error occurred. Please try again.';
          toast.error(message);
        }

        return undefined;
      }
    },
    [showToast, toastMessage, context]
  );

  /**
   * Handle sync operations with automatic error handling
   */
  const handleSync = useCallback(
    <T>(syncFn: () => T, operationContext?: Partial<IErrorContext>): T | undefined => {
      try {
        return syncFn();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));

        // Use centralized error handling
        errorHandlers.api(errorObj, {
          ...context,
          ...operationContext,
        });

        // Show toast if enabled
        if (showToast) {
          const message = toastMessage || 'An error occurred. Please try again.';
          toast.error(message);
        }

        return undefined;
      }
    },
    [showToast, toastMessage, context]
  );

  /**
   * Handle Clerk user initialization with error handling
   */
  const handleClerkUser = useCallback(() => {
    try {
      // This would typically be used with useUser() from Clerk
      // For now, we'll return a safe fallback
      return { user: null, isLoaded: false, isSignedIn: false };
    } catch (_error) {
      // Clerk is not configured (e.g., during SSR or in test environment)
      console.log('Clerk not configured, using fallback user data');
      return { user: null, isLoaded: false, isSignedIn: false };
    }
  }, []);

  /**
   * Handle params resolution with error handling
   */
  const handleParamsResolution = useCallback(
    async (params: Promise<unknown>, operationContext?: Partial<IErrorContext>) => {
      return handleAsync(
        async () => {
          const resolved = await params;
          if (!resolved) {
            throw new Error('Failed to resolve parameters');
          }
          return resolved;
        },
        {
          action: 'Resolve parameters',
          ...operationContext,
        }
      );
    },
    [handleAsync]
  );

  /**
   * Handle data fetching with error handling
   */
  const handleDataFetch = useCallback(
    async <T>(
      fetchFn: () => Promise<T>,
      operationContext?: Partial<IErrorContext>
    ): Promise<T | undefined> => {
      return handleAsync(
        async () => {
          const response = await fetchFn();
          if (!response) {
            throw new Error('Failed to fetch data');
          }
          return response;
        },
        {
          action: 'Fetch data',
          ...operationContext,
        }
      );
    },
    [handleAsync]
  );

  return {
    handleAsync,
    handleSync,
    handleClerkUser,
    handleParamsResolution,
    handleDataFetch,
  };
}
