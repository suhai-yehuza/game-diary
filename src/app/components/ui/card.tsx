import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@src/lib/utils';

interface ICardProps extends Readonly<ComponentProps<'div'>> {
  children: Readonly<ReactNode>;
}

export function Card({ className, children, ...props }: Readonly<ICardProps>) {
  return (
    <div
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface ICardHeaderProps extends Readonly<ComponentProps<'div'>> {
  children: Readonly<ReactNode>;
}

export function CardHeader({ className, children, ...props }: Readonly<ICardHeaderProps>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  );
}

interface ICardTitleProps extends Readonly<ComponentProps<'h3'>> {
  children: Readonly<ReactNode>;
}

export function CardTitle({ className, children, ...props }: Readonly<ICardTitleProps>) {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

interface ICardDescriptionProps extends Readonly<ComponentProps<'p'>> {
  children: Readonly<ReactNode>;
}

export function CardDescription({
  className,
  children,
  ...props
}: Readonly<ICardDescriptionProps>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

interface ICardContentProps extends Readonly<ComponentProps<'div'>> {
  children: Readonly<ReactNode>;
}

export function CardContent({ className, children, ...props }: Readonly<ICardContentProps>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

interface ICardFooterProps extends Readonly<ComponentProps<'div'>> {
  children: Readonly<ReactNode>;
}

export function CardFooter({ className, children, ...props }: Readonly<ICardFooterProps>) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
