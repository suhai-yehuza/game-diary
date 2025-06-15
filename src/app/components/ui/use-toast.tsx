'use client';

import * as React from 'react';

import type {
  IToastProps,
  IToastState,
  IToastAction,
  IToasterToast,
} from '@src/lib/types/notification.types';
import { TOAST_LIMIT, createToast } from '@src/lib/utils/toast';

// Create context for shared toast state
const ToastContext = React.createContext<{
  state: IToastState;
  dispatch: React.Dispatch<IToastAction>;
} | null>(null);

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<IToastState>({
    toasts: [],
  });

  const dispatch = React.useCallback((action: IToastAction) => {
    setState((currentState: IToastState) => {
      const { toastId } = action;

      switch (action.type) {
        case 'ADD_TOAST': {
          if (!action.toast) return currentState;

          const newState = {
            ...currentState,
            toasts: [...currentState.toasts, action.toast].slice(-TOAST_LIMIT),
          };
          return newState;
        }

        case 'UPDATE_TOAST': {
          if (!action.toast) return currentState;
          return {
            ...currentState,
            toasts: currentState.toasts.map((t: IToasterToast) =>
              t.id === action.toast?.id ? { ...t, ...action.toast } : t
            ),
          };
        }

        case 'DISMISS_TOAST': {
          if (toastId) {
            return {
              ...currentState,
              toasts: currentState.toasts.map((t: IToasterToast) =>
                t.id === toastId ? { ...t, open: false } : t
              ),
            };
          }
          return {
            ...currentState,
            toasts: currentState.toasts.map((t: IToasterToast) => ({ ...t, open: false })),
          };
        }

        case 'REMOVE_TOAST': {
          if (action.toastId === undefined) {
            return { ...currentState, toasts: [] };
          }
          return {
            ...currentState,
            toasts: currentState.toasts.filter((t: IToasterToast) => t.id !== action.toastId),
          };
        }

        default:
          return currentState;
      }
    });
  }, []);

  return <ToastContext.Provider value={{ state, dispatch }}>{children}</ToastContext.Provider>;
}

// Hook to use toast functionality
export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { state, dispatch } = context;

  const toast = React.useCallback(
    (props: IToastProps) => {
      return createToast(props, dispatch);
    },
    [dispatch]
  );

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}
