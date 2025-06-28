import type {
  ICardProps,
  ICardHeaderProps,
  ICardTitleProps,
  ICardDescriptionProps,
  ICardContentProps,
  ICardFooterProps,
} from '@src/lib/types/ui.types';
import { cn } from '@src/lib/utils';

export function Card(props: Readonly<ICardProps>) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader(props: Readonly<ICardHeaderProps>) {
  const { className, children, ...rest } = props;
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle(props: Readonly<ICardTitleProps>) {
  const { className, children, ...rest } = props;
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription(props: Readonly<ICardDescriptionProps>) {
  const { className, children, ...rest } = props;
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...rest}>
      {children}
    </p>
  );
}

export function CardContent(props: Readonly<ICardContentProps>) {
  const { className, children, ...rest } = props;
  return (
    <div className={cn('p-6 pt-0', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter(props: Readonly<ICardFooterProps>) {
  const { className, children, ...rest } = props;
  return (
    <div className={cn('flex items-center p-6 pt-0', className)} {...rest}>
      {children}
    </div>
  );
}
