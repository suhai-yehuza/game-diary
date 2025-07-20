import React from 'react';

interface IErrorDisplayProps {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
  variant?: 'default' | 'danger' | 'warning';
  className?: string;
  showRetry?: boolean;
}

const variantClasses = {
  default:
    'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  danger:
    'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
};

export function ErrorDisplay({
  error,
  title = 'An error occurred',
  onRetry,
  variant = 'default',
  className = '',
  showRetry = true,
}: IErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`p-4 border rounded-md ${variantClasses[variant]} ${className}`}>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4">{errorMessage}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function PageErrorDisplay({
  error,
  title = 'Something went wrong',
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} />
    </div>
  );
}

export function CardErrorDisplay({
  error,
  title = 'Error loading content',
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} />
    </div>
  );
}

export function InlineErrorDisplay({
  error,
  title,
  onRetry,
}: {
  error: string | Error;
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center p-4">
      <ErrorDisplay error={error} title={title} onRetry={onRetry} showRetry={false} />
    </div>
  );
}
