import React, { Component, type ReactNode } from 'react';

import { Button } from '@src/app/protected/admin/database/components/ui/button';

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add error reporting service integration
      console.error('Production error:', {
        component: this.props.componentName ?? 'Unknown',
        error: error.message,
        stack: error.stack,
        errorInfo,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="text-destructive">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {this.props.componentName
                  ? `${this.props.componentName} encountered an error`
                  : 'An unexpected error occurred'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="w-full text-left">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto">
                  <div className="text-destructive font-semibold mb-1">
                    {this.state.error.message}
                  </div>
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
