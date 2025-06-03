import type { ToastProps, ToasterToast, ToastAction } from '@/lib/types/notification.types';

export const TOAST_LIMIT = 1;

export const createToast = (props: ToastProps, dispatch: React.Dispatch<ToastAction>) => {
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
