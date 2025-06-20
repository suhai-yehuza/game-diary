/**
 * UI-related type definitions
 */

export interface IToastProps {
  title?: string;
  description?: string;
  action?: IToastActionElement;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export interface IToastActionElement {
  altText: string;
  onClick: () => void;
}

export interface IToastState {
  toasts: IToasterToast[];
}

export interface IToastAction {
  type: 'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';
  toast?: IToasterToast;
  toastId?: string;
}

export interface IToasterToast extends IToastProps {
  id: string;
  open: boolean;
}
