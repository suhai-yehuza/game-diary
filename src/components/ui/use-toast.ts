import * as React from 'react';

import { Toast } from '@/components/ui/toast';
import { State, Action, ToasterToast } from '@/lib/types';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 5000;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: action.toast ? [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) : state.toasts,
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t: ToasterToast) =>
          action.toast && t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;
      const toastsToRemove = toastId
        ? [toastId]
        : state.toasts.map((toast: ToasterToast) => toast.id);

      toastsToRemove.forEach((id: string) => addToRemoveQueue(id));

      return {
        ...state,
        toasts: state.toasts.map((t: ToasterToast) => ({
          ...t,
          open: !toastId || t.id === toastId ? false : t.open,
        })),
      };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts:
          action.toastId === undefined
            ? []
            : state.toasts.filter((t: ToasterToast) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = Math.random().toString(36).substring(2);

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
