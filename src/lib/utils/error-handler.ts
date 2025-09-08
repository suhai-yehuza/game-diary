/**
 * Enhanced error handling system
 * Eliminates duplication of error handling patterns and provides consistent error management
 */

import { logError, logWarn, logInfo } from '@/lib/utils/logger';
import {
  ErrorCategory,
  ErrorSeverity,
  type IErrorContext,
  type IErrorHandlerConfig,
} from '@/types';

// Default configuration
const DEFAULT_CONFIG: IErrorHandlerConfig = {
  enableLogging: true,
  enableReporting: true,
  enableRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  showUserFriendlyMessages: true,
  logLevel: 'error',
};

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: IErrorHandlerConfig;
  private readonly errorCounts: Map<string, number> = new Map();
  private readonly retryCounts: Map<string, number> = new Map();

  private constructor(config: Partial<IErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<IErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle errors with consistent logging and categorization
   */
  handleError(
    error: Error | string,
    context: Partial<IErrorContext> = {},
    options: {
      showUserMessage?: boolean;
      enableRetry?: boolean;
      customMessage?: string;
    } = {}
  ): IErrorContext {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const fullContext: IErrorContext = {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Categorize error based on message or type
    fullContext.category = this.categorizeError(errorObj);
    fullContext.severity = this.determineSeverity(errorObj, fullContext.category);

    // Log error
    if (this.config.enableLogging) {
      this.logError(errorObj, fullContext);
    }

    // Track error count
    this.trackError(fullContext);

    // Show user-friendly message if enabled
    if (options.showUserMessage ?? this.config.showUserFriendlyMessages) {
      this.showUserMessage(errorObj, fullContext, options.customMessage);
    }

    return fullContext;
  }

  /**
   * Handle async operations with automatic error handling
   */
  async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context: Partial<IErrorContext> = {},
    options: {
      enableRetry?: boolean;
      maxRetries?: number;
      retryDelay?: number;
      showUserMessage?: boolean;
    } = {}
  ): Promise<T | undefined> {
    const enableRetry = options.enableRetry ?? this.config.enableRetry;
    const maxRetries = options.maxRetries ?? this.config.maxRetries ?? 3;
    const retryDelay = options.retryDelay ?? this.config.retryDelay ?? 1000;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Handle error
        this.handleError(
          lastError,
          {
            ...context,
            metadata: { attempt, maxRetries },
          },
          options
        );

        // Retry logic
        if (enableRetry && attempt < maxRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          continue;
        }

        break;
      }
    }

    return undefined;
  }

  /**
   * Handle sync operations with automatic error handling
   */
  handleSync<T>(
    syncFn: () => T,
    context: Partial<IErrorContext> = {},
    options: {
      showUserMessage?: boolean;
      customMessage?: string;
    } = {}
  ): T | undefined {
    try {
      return syncFn();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)), context, options);
      return undefined;
    }
  }

  /**
   * Create user-friendly error messages
   */
  createUserMessage(error: Error, context: IErrorContext): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]:
        'Connection error. Please check your internet connection and try again.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication required. Please sign in to continue.',
      [ErrorCategory.AUTHORIZATION]:
        "Access denied. You don't have permission to perform this action.",
      [ErrorCategory.BUSINESS_LOGIC]:
        'Business rule violation. Please check your request and try again.',
      [ErrorCategory.SYSTEM]: 'System error. Please try again later.',
      [ErrorCategory.DATABASE]: 'Database error. Please try again later.',
      [ErrorCategory.API]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCategory.UI]: 'Something went wrong. Please refresh the page and try again.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[context.category] || messages[ErrorCategory.UNKNOWN];
  }

  /**
   * Categorize errors based on message content and type
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const _name = error.name.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }

    // Validation errors
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorCategory.VALIDATION;
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('login') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }

    // Authorization errors
    if (
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('access')
    ) {
      return ErrorCategory.AUTHORIZATION;
    }

    // Database errors
    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return ErrorCategory.DATABASE;
    }

    // API errors
    if (message.includes('api') || message.includes('server') || message.includes('500')) {
      return ErrorCategory.API;
    }

    // UI errors
    if (message.includes('dom') || message.includes('render') || message.includes('component')) {
      return ErrorCategory.UI;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // Critical errors
    if (category === ErrorCategory.AUTHENTICATION || category === ErrorCategory.AUTHORIZATION) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (category === ErrorCategory.DATABASE || category === ErrorCategory.API) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.VALIDATION) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors
    if (category === ErrorCategory.UI) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Log error with context
   */
  private logError(error: Error, context: IErrorContext): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      category: context.category,
      severity: context.severity,
      component: context.component,
      action: context.action,
      userId: context.userId,
      requestId: context.requestId,
      timestamp: context.timestamp,
      metadata: context.metadata,
    };

    switch (context.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logError('Error occurred', error, logData);
        break;
      case ErrorSeverity.MEDIUM:
        logWarn('Error occurred', { error, ...logData });
        break;
      case ErrorSeverity.LOW:
        logInfo('Error occurred', { error, ...logData });
        break;
    }
  }

  /**
   * Track error occurrences
   */
  private trackError(context: IErrorContext): void {
    const key = `${context.category}-${context.component || 'unknown'}`;
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);
  }

  /**
   * Show user-friendly error message
   */
  private showUserMessage(error: Error, context: IErrorContext, customMessage?: string): void {
    const message = customMessage || this.createUserMessage(error, context);

    // In a real application, this would dispatch to a toast notification system
    // or update global error state
    console.log(`User message: ${message}`);

    // Example: dispatch to global error state
    // store.dispatch(setError({ message, category: context.category }));
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Clear error statistics
   */
  clearErrorStats(): void {
    this.errorCounts.clear();
    this.retryCounts.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Convenience functions for common error handling patterns
export const errorHandlers = {
  // Network error handler
  network: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.NETWORK,
      ...context,
    }),

  // Validation error handler
  validation: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.VALIDATION,
      ...context,
    }),

  // Authentication error handler
  authentication: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.CRITICAL,
      ...context,
    }),

  // API error handler
  api: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.API,
      severity: ErrorSeverity.HIGH,
      ...context,
    }),

  // Database error handler
  database: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      ...context,
    }),

  // UI error handler
  ui: (error: Error | string, context?: Partial<IErrorContext>) =>
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.MEDIUM,
      ...context,
    }),
};

// React hook for error handling
export function useErrorHandler() {
  const handler = ErrorHandler.getInstance();

  return {
    handleError: handler.handleError.bind(handler),
    handleAsync: handler.handleAsync.bind(handler),
    handleSync: handler.handleSync.bind(handler),
    createUserMessage: handler.createUserMessage.bind(handler),
  };
}

// Error boundary utilities
export const errorBoundaryUtils = {
  // Create error boundary fallback component
  createFallback: (error: Error, retry: () => void) => ({
    error,
    retry,
    message: ErrorHandler.getInstance().createUserMessage(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.MEDIUM,
      timestamp: new Date().toISOString(),
    }),
  }),

  // Log error boundary errors
  logErrorBoundaryError: (error: Error, errorInfo: unknown) => {
    ErrorHandler.getInstance().handleError(error, {
      category: ErrorCategory.UI,
      severity: ErrorSeverity.MEDIUM,
      metadata: { errorInfo },
    });
  },
};
