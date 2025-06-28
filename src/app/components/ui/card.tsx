import type {
  ICardProps,
  ICardHeaderProps,
  ICardTitleProps,
  ICardDescriptionProps,
  ICardContentProps,
  ICardFooterProps,
} from '@src/lib/types/ui.types';
import { cn } from '@src/lib/utils';

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

export function CardHeader({ className, children, ...props }: Readonly<ICardHeaderProps>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: Readonly<ICardTitleProps>) {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
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

export function CardContent({ className, children, ...props }: Readonly<ICardContentProps>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: Readonly<ICardFooterProps>) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
