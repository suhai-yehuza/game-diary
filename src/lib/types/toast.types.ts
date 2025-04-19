import type { ReactElement } from 'react';

export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ReactElement;
  open?: boolean;
};

export type ToastActionElement = ReactElement;

export type ToasterToast = ToastProps & { id: string; open?: boolean };

export type State = { toasts: ToasterToast[] };

export type Action = {
  type: 'ADD_TOAST' | 'REMOVE_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST';
  toast?: ToasterToast;
  toastId?: string;
};
