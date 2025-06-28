import * as React from 'react';

import { cn } from '@/lib/utils';

type ICardProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;

const Card = React.forwardRef<HTMLDivElement, ICardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
    {...props}
  />
));
Card.displayName = 'Card';

type ICardHeaderProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;

const CardHeader = React.forwardRef<HTMLDivElement, ICardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

type ICardTitleProps = Readonly<React.HTMLAttributes<HTMLHeadingElement>>;

const CardTitle = React.forwardRef<HTMLParagraphElement, ICardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

type ICardDescriptionProps = Readonly<React.HTMLAttributes<HTMLParagraphElement>>;

const CardDescription = React.forwardRef<HTMLParagraphElement, ICardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

type ICardContentProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;

const CardContent = React.forwardRef<HTMLDivElement, ICardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

type ICardFooterProps = Readonly<React.HTMLAttributes<HTMLDivElement>>;

const CardFooter = React.forwardRef<HTMLDivElement, ICardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
