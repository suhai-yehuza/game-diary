// Types file: utils.types.ts
// Utility-related type definitions

// Error handling types
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  API = 'api',
  UI = 'ui',
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  component?: string;
  action?: string;
  userId?: string;
  requestId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface IErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  showUserFriendlyMessages: boolean;
}

// Analytics types
export interface IAnalyticsProperties {
  [key: string]: string | number | boolean | undefined | null;
}
