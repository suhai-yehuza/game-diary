import type * as React from 'react';

import type { IToastAction, IToastProps, IToasterToast } from '@src/lib/types/notification.types';

export const TOAST_LIMIT = 5;

export const createToast = (props: IToastProps, dispatch: React.Dispatch<IToastAction>) => {
  const id = Math.random().toString(36).substring(2);

  const update = (props: IToasterToast) =>
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

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    dismiss();
  }, 5000);

  return {
    id,
    dismiss,
    update,
  };
};
