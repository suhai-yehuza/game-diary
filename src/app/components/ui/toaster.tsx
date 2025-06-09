'use client';

import * as React from 'react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@src/app/components/ui/toast';
import { useToast } from '@src/app/components/ui/use-toast';
import { type ToasterToast } from '@src/lib/types/notification.types';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function (toast: ToasterToast) {
        const { id, title, description, action, open, variant, ...rest } = toast;

        return (
          <Toast key={id} open={open} variant={variant} {...rest}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
