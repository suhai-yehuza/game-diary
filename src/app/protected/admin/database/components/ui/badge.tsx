import type { IBadgeProps } from '@src/lib/types';

export const Badge = ({ children, variant = 'default', className = '' }: IBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === 'default'
        ? 'bg-brand-primary text-white'
        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
    } ${className}`}
  >
    {children}
  </span>
);
