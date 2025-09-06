import * as React from 'react';

import { cn } from '@/lib/utils';
import type { IBadgeProps } from '@/types';

const Badge = React.forwardRef<HTMLSpanElement, IBadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          {
            'bg-brand-primary text-white': variant === 'default',
            'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100':
              variant === 'secondary',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
