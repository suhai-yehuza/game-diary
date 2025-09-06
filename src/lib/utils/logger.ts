/**
 * Logger utility for consistent logging across the application
 */

import { LogLevel, type ILogContext } from '@/types';

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private readonly isDevelopment: boolean = process.env.NODE_ENV === 'development';

  constructor() {
    // Set log level from environment variable
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
    if (envLogLevel && envLogLevel in LogLevel) {
      this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel];
    }

    // In development, default to DEBUG level
    if (this.isDevelopment && this.logLevel > LogLevel.DEBUG) {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private formatMessage(level: string, message: string, context?: ILogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  debug(message: string, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  error(message: string, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, context));
    }
  }

  // Specialized logging methods
  performance(operation: string, duration: number, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const message = `Performance: ${operation} took ${duration}ms`;
      console.info(this.formatMessage('PERF', message, context));
    }
  }

  cache(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const message = `Cache ${operation}: ${key}`;
      console.debug(this.formatMessage('CACHE', message, context));
    }
  }

  database(operation: string, query: string, duration?: number, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const message = `Database ${operation}: ${query}${duration ? ` (${duration}ms)` : ''}`;
      console.debug(this.formatMessage('DB', message, context));
    }
  }

  api(operation: string, endpoint: string, duration?: number, context?: ILogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const message = `API ${operation}: ${endpoint}${duration ? ` (${duration}ms)` : ''}`;
      console.info(this.formatMessage('API', message, context));
    }
  }

  graphql(
    operation: 'query' | 'mutation' | 'subscription',
    name: string,
    duration?: number,
    context?: ILogContext
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const message = `GraphQL ${operation}: ${name}${duration ? ` (${duration}ms)` : ''}`;
      console.info(this.formatMessage('GRAPHQL', message, context));
    }
  }

  // Set log level dynamically
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  // Check if a log level is enabled
  isEnabled(level: LogLevel): boolean {
    return this.shouldLog(level);
  }

  // Add missing methods that tests expect
  apiRequest(endpoint: string, method: string, context?: ILogContext): void {
    this.api('REQUEST', `${method} ${endpoint}`, undefined, context);
  }

  apiResponse(endpoint: string, status: number, context?: ILogContext): void {
    this.api('RESPONSE', `${endpoint} - ${status}`, undefined, context);
  }

  componentRender(
    componentName: string,
    props?: Record<string, unknown>,
    context?: ILogContext
  ): void {
    const message = `Component rendered: ${componentName}${props ? ` with props: ${JSON.stringify(props)}` : ''}`;
    this.debug(message, context);
  }

  hookCall(hookName: string, context?: ILogContext): void {
    this.debug(`Hook called: ${hookName}`, context);
  }

  userAction(action: string, userId?: string, context?: ILogContext): void {
    const message = `User action: ${action}${userId ? ` by user: ${userId}` : ''}`;
    this.info(message, context);
  }

  createChild(prefix: string): Logger {
    const childLogger = new Logger();
    childLogger.setLogLevel(this.logLevel);
    // Add prefix to all messages
    const originalFormatMessage = childLogger['formatMessage'];
    childLogger['formatMessage'] = (level: string, message: string, context?: ILogContext) => {
      return `[${prefix}] ${originalFormatMessage(level, message, context)}`;
    };
    return childLogger;
  }

  updateConfig(config: { level?: LogLevel }): void {
    if (config.level !== undefined) {
      this.setLogLevel(config.level);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export the class for testing
export { Logger };

// Export convenience functions for backward compatibility
export const logError = (message: string, error?: Error | unknown, context?: ILogContext) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`, context);
  } else {
    logger.error(message, context);
  }
};
export const logInfo = (message: string, context?: ILogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: ILogContext) => logger.warn(message, context);
export const logDebug = (message: string, context?: ILogContext) => logger.debug(message, context);

// Export specialized loggers
export const webhookLogger = {
  info: (message: string, context?: ILogContext) => logger.info(`[WEBHOOK] ${message}`, context),
  error: (message: string, error?: Error | unknown, context?: ILogContext) => {
    if (error instanceof Error) {
      logger.error(`[WEBHOOK] ${message}: ${error.message}`, context);
    } else {
      logger.error(`[WEBHOOK] ${message}`, context);
    }
  },
  warn: (message: string, context?: ILogContext) => logger.warn(`[WEBHOOK] ${message}`, context),
};

export const logE2E = (message: string, context?: ILogContext) => {
  logger.info(`[E2E] ${message}`, context);
};

// Add missing functions that tests expect
export const logPerformance = (operation: string, duration: number, context?: ILogContext) => {
  logger.performance(operation, duration, context);
};

export const setLogLevel = (level: LogLevel): void => {
  logger.setLogLevel(level);
};

export const createPerformanceLogger = (operation: string) => {
  const startTime = Date.now();
  return {
    end: (context?: ILogContext) => {
      const duration = Date.now() - startTime;
      logger.performance(operation, duration, context);
      return duration;
    },
    log: (message: string, context?: ILogContext) => {
      logger.info(`[PERF] ${operation}: ${message}`, context);
    },
  };
};
