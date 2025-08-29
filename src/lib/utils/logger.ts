import { LogLevel } from '@/lib/types';
import type { ILogContext, ILoggerConfig } from '@/lib/types';

const defaultConfig: ILoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableTimestamp: true,
  enableColors: process.env.NODE_ENV !== 'production',
  enableFileInfo: process.env.NODE_ENV === 'development',
  prefix: undefined,
};

class Logger {
  private config: ILoggerConfig;
  private readonly isDevelopment: boolean;
  private readonly isTest: boolean;

  constructor(config: ILoggerConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test' || process.env.CI === 'true';

    // Set log level based on environment
    if (this.isTest) {
      this.config.level = LogLevel.ERROR; // Only show errors in tests
    } else if (this.isDevelopment) {
      this.config.level = LogLevel.DEBUG; // Show all logs in development
    } else {
      this.config.level = LogLevel.INFO; // Show info and above in production
    }
  }

  private formatTimestamp(): string {
    if (!this.config.enableTimestamp) return '';
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  private getColorCode(level: LogLevel): string {
    if (!this.config.enableColors) return '';

    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    return colors[level] ?? '';
  }

  private getResetCode(): string {
    return this.config.enableColors ? '\x1b[0m' : '';
  }

  private getLevelString(level: LogLevel): string {
    const levels: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
    };

    return levels[level];
  }

  private getFileInfo(): string {
    if (!this.config.enableFileInfo) return '';

    try {
      const stack = new Error().stack;
      if (!stack) return '';

      const lines = stack.split('\n');
      // Skip the first 4 lines to get to the actual caller
      const callerLine = lines[4];
      if (!callerLine) return '';

      // Extract file info from stack trace
      const match = callerLine.match(/at .* \((.+):(\d+):(\d+)\)/);
      if (match) {
        const [, filePath, line] = match;
        const fileName = filePath.split('/').pop() ?? filePath;
        return `[${fileName}:${line}]`;
      }
    } catch {
      // Silently fail if we can't get file info
    }

    return '';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: ILogContext): string {
    const timestamp = this.formatTimestamp();
    const levelStr = this.getLevelString(level);
    const colorCode = this.getColorCode(level);
    const resetCode = this.getResetCode();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const fileInfo = this.getFileInfo();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';

    const parts = [
      timestamp,
      prefix,
      fileInfo,
      `${colorCode}${levelStr}${resetCode}`,
      message,
      contextStr,
    ]
      .filter(Boolean)
      .join(' ');

    return parts;
  }

  private writeLog(level: LogLevel, message: string, error?: Error, context?: ILogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const errorDetails = error ? `\nError: ${error.message}\nStack: ${error.stack}` : '';

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage + errorDetails);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage + errorDetails);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage + errorDetails);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage + errorDetails);
        break;
    }
  }

  debug(message: string, context?: ILogContext): void {
    this.writeLog(LogLevel.DEBUG, message, undefined, context);
  }

  info(message: string, context?: ILogContext): void {
    this.writeLog(LogLevel.INFO, message, undefined, context);
  }

  log(message: string, context?: ILogContext): void {
    this.writeLog(LogLevel.INFO, message, undefined, context);
  }

  warn(message: string, context?: ILogContext): void {
    this.writeLog(LogLevel.WARN, message, undefined, context);
  }

  error(message: string, error?: Error, context?: ILogContext): void {
    this.writeLog(LogLevel.ERROR, message, error, context);
  }

  // Specialized logging methods for common patterns
  apiRequest(endpoint: string, method: string, context?: ILogContext): void {
    this.info(`API ${method} request to ${endpoint}`, context);
  }

  apiResponse(endpoint: string, status: number, context?: ILogContext): void {
    this.info(`API response from ${endpoint}: ${status}`, context);
  }

  componentRender(componentName: string, props?: Record<string, unknown>): void {
    this.debug(`Rendering ${componentName}`, { component: componentName, props });
  }

  hookCall(hookName: string, context?: ILogContext): void {
    this.debug(`Hook called: ${hookName}`, { ...context, hook: hookName });
  }

  userAction(action: string, userId?: string, context?: ILogContext): void {
    this.info(`User action: ${action}`, { ...context, userId, action });
  }

  // E2E test specific logging
  e2eDebug(message: string, context?: ILogContext): void {
    if (this.isTest && process.env.MOCK_MODE === 'true') {
      console.log(`[E2E DEBUG] ${message}`, context);
    }
  }

  // Performance logging
  performance(operation: string, duration: number, context?: ILogContext): void {
    this.info(`Performance: ${operation} took ${duration}ms`, { ...context, operation, duration });
  }

  // Create specialized loggers for different modules
  createChild(prefix: string, config?: Partial<ILoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      prefix,
      ...(config ?? {}),
    });
  }

  // Update logger configuration
  updateConfig(newConfig: Partial<ILoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create default logger instance
export const logger = new Logger();

// Create specialized loggers for different modules
export const dbLogger = logger.createChild('DB');
export const apiLogger = logger.createChild('API');
export const cacheLogger = logger.createChild('CACHE');
export const seedLogger = logger.createChild('SEED');
export const webhookLogger = logger.createChild('WEBHOOK');

// Export the Logger class for custom instances
export { Logger };

// Export convenience functions
export const logDebug = (message: string, context?: ILogContext) => logger.debug(message, context);
export const logInfo = (message: string, context?: ILogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: ILogContext) => logger.warn(message, context);
export const logError = (message: string, error?: Error, context?: ILogContext) =>
  logger.error(message, error, context);
export const logE2E = (message: string, context?: ILogContext) => logger.e2eDebug(message, context);
export const logPerformance = (operation: string, duration: number, context?: ILogContext) =>
  logger.performance(operation, duration, context);

// Utility function to set global log level
export const setLogLevel = (level: LogLevel): void => {
  logger.updateConfig({ level });
};

// Utility to create performance loggers
export const createPerformanceLogger = (operation: string) => {
  const start = Date.now();
  return {
    end: (additionalInfo?: string) => {
      const duration = Date.now() - start;
      logger.info(
        `${operation} completed in ${duration}ms${additionalInfo ? ` - ${additionalInfo}` : ''}`
      );
    },
    error: (error: Error) => {
      const duration = Date.now() - start;
      logger.error(`${operation} failed after ${duration}ms:`, error);
    },
  };
};
