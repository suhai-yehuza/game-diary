'use client';

import { cn } from '@/lib/utils';
import type {
  ResponsiveContainerProps,
  ResponsiveGridProps,
  ResponsiveTextProps,
  ResponsiveButtonProps,
} from '@/types';

export function ResponsiveContainer({
  children,
  className,
  as: Component = 'div',
  maxWidth = '2xl',
  padding = 'md',
  mobilePadding = 'md',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6 md:p-8',
    lg: 'p-6 sm:p-8 md:p-10',
    xl: 'p-8 sm:p-10 md:p-12',
  };

  const mobilePaddingClasses = {
    none: 'px-0 py-0',
    sm: 'px-2 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-6',
  };

  return (
    <Component
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        mobilePaddingClasses[mobilePadding],
        className
      )}
    >
      {children}
    </Component>
  );
}

export function ResponsiveGrid({
  children,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  as: Component = 'div',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const mobileCols = columns.mobile || 1;
  const tabletCols = columns.tablet || 2;
  const desktopCols = columns.desktop || 3;

  // Build responsive grid classes
  let gridClass = '';
  if (mobileCols === 1 && tabletCols === 2 && desktopCols === 3) {
    gridClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  } else if (mobileCols === 1 && tabletCols === 1 && desktopCols === 2) {
    gridClass = 'grid-cols-1 lg:grid-cols-2';
  } else if (mobileCols === 2 && tabletCols === 3 && desktopCols === 4) {
    gridClass = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  } else {
    // Fallback to individual column classes
    gridClass = `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols}`;
  }

  return (
    <Component className={cn('grid', gridClass, gapClasses[gap], className)}>{children}</Component>
  );
}

export function ResponsiveText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  as: Component = 'p',
  mobileSize,
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const mobileSizeClasses = mobileSize
    ? {
        xs: 'xs:text-xs',
        sm: 'xs:text-sm',
        base: 'xs:text-base',
        lg: 'xs:text-lg',
        xl: 'xs:text-xl',
        '2xl': 'xs:text-2xl',
        '3xl': 'xs:text-3xl',
      }
    : {};

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        mobileSize && mobileSizeClasses[mobileSize],
        className
      )}
    >
      {children}
    </Component>
  );
}

export function ResponsiveButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  mobileSize = 'md',
  fullWidth = false,
  fullWidthMobile = true,
  onClick,
  type = 'button',
  disabled = false,
}: ResponsiveButtonProps) {
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-dark',
    outline: 'border border-theme-primary bg-transparent hover:bg-bg-theme-secondary',
    ghost: 'bg-transparent hover:bg-bg-theme-secondary',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-touch',
    md: 'px-4 py-3 text-base min-h-touch-lg',
    lg: 'px-6 py-4 text-lg min-h-touch-xl',
  };

  const mobileSizeClasses = {
    sm: 'xs:px-3 xs:py-2 xs:text-sm',
    md: 'xs:px-4 xs:py-3 xs:text-base',
    lg: 'xs:px-6 xs:py-4 xs:text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        mobileSize && mobileSizeClasses[mobileSize],
        fullWidth && 'w-full',
        fullWidthMobile && 'w-full xs:w-auto',
        className
      )}
    >
      {children}
    </button>
  );
}
