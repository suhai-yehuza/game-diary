'use client';

import React from 'react';

import type { IErrorBoundaryState, IErrorBoundaryProps } from '@/types';

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-theme-secondary flex items-center justify-center">
          <div className="max-w-md w-full bg-surface-card shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-semantic-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-theme-primary">Something went wrong</h3>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-theme-secondary">
                The page encountered an unexpected error. This might be due to a network issue or a
                temporary problem.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-brand-primary text-text-inverse px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-theme-muted text-text-inverse px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-theme-muted cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs text-theme-secondary bg-bg-theme-secondary p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}
