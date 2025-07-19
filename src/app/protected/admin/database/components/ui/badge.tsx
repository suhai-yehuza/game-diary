import type { IBadgeProps } from '@src/lib/types';

export const Badge = ({ children, variant = 'default', className = '' }: IBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      variant === 'default'
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground'
    } ${className}`}
  >
    {children}
  </span>
);
