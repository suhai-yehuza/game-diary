'use client';

import * as React from 'react';

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from '@src/app/components/ui/toast';
import { useToast } from '@src/app/components/ui/use-toast';
import type { IToasterToast } from '@src/lib/types';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(function (toast: IToasterToast) {
        const { id, title, description, action, open, variant, ...rest } = toast;

        return (
          <Toast key={id} open={open} variant={variant} {...rest}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action && (
              <ToastAction altText={action.altText} onClick={action.onClick}>
                {action.altText}
              </ToastAction>
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </>
  );
}
