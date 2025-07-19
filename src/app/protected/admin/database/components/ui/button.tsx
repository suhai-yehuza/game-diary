import type { IAdminButtonProps } from '@src/lib/types';

export const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: IAdminButtonProps) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${
      variant === 'default'
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
    } ${size === 'default' ? 'h-10 py-2 px-4' : 'h-9 px-3'} ${className}`}
    {...props}
  >
    {children}
  </button>
);
