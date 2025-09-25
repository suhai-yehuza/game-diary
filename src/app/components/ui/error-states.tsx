import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';

// Enhanced error display component
export const ErrorDisplay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    message?: string;
    onRetry?: () => void;
    onGoHome?: () => void;
    onGoBack?: () => void;
    variant?: 'default' | 'minimal' | 'full';
    showActions?: boolean;
  }
>(
  (
    {
      className,
      title = 'Something went wrong',
      message = 'An unexpected error occurred. Please try again.',
      onRetry,
      onGoHome,
      onGoBack,
      variant = 'default',
      showActions = true,
      ...props
    },
    ref
  ) => {
    const isMinimal = variant === 'minimal';
    const isFull = variant === 'full';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          {
            'py-8 px-4': isMinimal,
            'py-16 px-4': isFull,
            'py-12 px-4': !isMinimal && !isFull,
          },
          className
        )}
        {...props}
      >
        <div className="mb-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

        <p className="text-muted-foreground mb-6 max-w-md">{message}</p>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}

            {onGoBack && (
              <Button
                onClick={onGoBack}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}

            {onGoHome && (
              <Button
                onClick={onGoHome}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
ErrorDisplay.displayName = 'ErrorDisplay';

// Network error component
export const NetworkError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onRetry?: () => void;
  }
>(({ className, onRetry, ...props }, ref) => (
  <ErrorDisplay
    ref={ref}
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry}
    variant="default"
    className={className}
    {...props}
  />
));
NetworkError.displayName = 'NetworkError';

// Not found error component
export const NotFoundError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onGoHome?: () => void;
    onGoBack?: () => void;
  }
>(({ className, onGoHome, onGoBack, ...props }, ref) => (
  <ErrorDisplay
    ref={ref}
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    onGoHome={onGoHome}
    onGoBack={onGoBack}
    variant="full"
    className={className}
    {...props}
  />
));
NotFoundError.displayName = 'NotFoundError';

// Permission error component
export const PermissionError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onGoHome?: () => void;
  }
>(({ className, onGoHome, ...props }, ref) => (
  <ErrorDisplay
    ref={ref}
    title="Access Denied"
    message="You don't have permission to access this resource."
    onGoHome={onGoHome}
    variant="default"
    className={className}
    {...props}
  />
));
PermissionError.displayName = 'PermissionError';

// Inline error component for forms
export const InlineError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    message: string;
  }
>(({ className, message, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2 text-sm text-destructive', className)}
    {...props}
  >
    <AlertCircle className="h-4 w-4" />
    <span>{message}</span>
  </div>
));
InlineError.displayName = 'InlineError';

// Error boundary fallback
export const ErrorBoundaryFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    error?: Error;
    resetError?: () => void;
  }
>(({ className, error, resetError, ...props }, ref) => (
  <ErrorDisplay
    ref={ref}
    title="Something went wrong"
    message={error?.message || 'An unexpected error occurred.'}
    onRetry={resetError}
    variant="full"
    className={className}
    {...props}
  />
));
ErrorBoundaryFallback.displayName = 'ErrorBoundaryFallback';
