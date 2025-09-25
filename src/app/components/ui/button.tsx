import * as React from 'react';

import { cn } from '@/lib/utils';
import type { IButtonProps } from '@/types';

const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-brand-primary text-theme-inverse hover:bg-brand-primary-hover':
              variant === 'default',
            'bg-bg-theme-secondary hover:bg-bg-theme-tertiary text-theme-primary':
              variant === 'outline',
            'hover:bg-bg-theme-secondary text-theme-primary': variant === 'ghost',
            'bg-semantic-error text-theme-inverse hover:bg-semantic-error/90':
              variant === 'destructive',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 px-3': size === 'sm',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
