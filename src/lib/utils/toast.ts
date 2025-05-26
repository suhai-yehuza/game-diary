import { type ToastProps } from '@/lib/types';
import { Action, ToasterToast } from '@/lib/types';

export const TOAST_LIMIT = 1;
export const TOAST_REMOVE_DELAY = 5000;

export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export const addToRemoveQueue = (toastId: string, dispatch: React.Dispatch<Action>) => {
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

export const createToast = (props: ToastProps, dispatch: React.Dispatch<Action>) => {
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
    id,
    dismiss,
    update,
  };
};
