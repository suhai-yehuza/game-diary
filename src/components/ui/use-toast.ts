import * as React from 'react';

import { type ToastProps } from '@/lib/types';
import { State, Action } from '@/lib/types';
import { TOAST_LIMIT, createToast } from '@/lib/utils/toast';

function useToast() {
  const [state, setState] = React.useState<State>({
    toasts: [],
  });

  const dispatch = React.useCallback((action: Action) => {
    setState(state => {
      let timeoutId: NodeJS.Timeout;
      const { toastId } = action;
      let updatedToasts;

      switch (action.type) {
        case 'ADD_TOAST': {
          if (!action.toast) return state;
          return {
            ...state,
            toasts: [...state.toasts, action.toast].slice(-TOAST_LIMIT),
          };
        }
        case 'UPDATE_TOAST': {
          if (!action.toast) return state;
          updatedToasts = state.toasts.map(t =>
            t.id === action.toast?.id ? { ...t, ...action.toast } : t
          );
          return {
            ...state,
            toasts: updatedToasts,
          };
        }
        case 'DISMISS_TOAST': {
          if (toastId) {
            timeoutId = setTimeout(() => {
              dispatch({ type: 'REMOVE_TOAST', toastId });
            }, 5000);

            return {
              ...state,
              toasts: state.toasts.map(t =>
                t.id === toastId ? { ...t, open: false, timeoutId } : t
              ),
            };
          }

          return {
            ...state,
            toasts: state.toasts.map(t => (t.id === toastId ? { ...t, open: false } : t)),
          };
        }
        case 'REMOVE_TOAST': {
          if (action.toastId === undefined) {
            return {
              ...state,
              toasts: [],
            };
          }
          return {
            ...state,
            toasts: state.toasts.filter(t => t.id !== action.toastId),
          };
        }
      }
    });
  }, []);

  return {
    ...state,
    toast: (props: ToastProps) => createToast(props, dispatch),
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast };
