'use client';

import * as React from 'react';

import type {
  ToastProps,
  ToastState as State,
  ToastAction as Action,
} from '@/lib/types/notification.types';
import { TOAST_LIMIT, createToast } from '@/lib/utils/toast';

// Create context for shared toast state
const ToastContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>({
    toasts: [],
  });

  const dispatch = React.useCallback((action: Action) => {
    setState(currentState => {
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
            toasts: currentState.toasts.map(t =>
              t.id === action.toast?.id ? { ...t, ...action.toast } : t
            ),
          };
        }

        case 'DISMISS_TOAST': {
          if (toastId) {
            return {
              ...currentState,
              toasts: currentState.toasts.map(t => (t.id === toastId ? { ...t, open: false } : t)),
            };
          }
          return {
            ...currentState,
            toasts: currentState.toasts.map(t => ({ ...t, open: false })),
          };
        }

        case 'REMOVE_TOAST': {
          if (action.toastId === undefined) {
            return { ...currentState, toasts: [] };
          }
          return {
            ...currentState,
            toasts: currentState.toasts.filter(t => t.id !== action.toastId),
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
    (props: ToastProps) => {
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
