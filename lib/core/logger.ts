import { LogLevel, type ILoggerConfig } from '@src/lib/types';

const defaultConfig: ILoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableTimestamp: true,
  enableColors: process.env.NODE_ENV !== 'production',
  enableFileInfo: process.env.NODE_ENV === 'development',
  prefix: undefined,
};

class Logger {
  private config: ILoggerConfig;

  constructor(config: ILoggerConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
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

    return colors[level] || '';
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
        const fileName = filePath.split('/').pop() || filePath;
        return `[${fileName}:${line}]`;
      }
    } catch {
      // Silently fail if we can't get file info
    }

    return '';
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = this.formatTimestamp();
    const levelStr = this.getLevelString(level);
    const colorCode = this.getColorCode(level);
    const resetCode = this.getResetCode();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    const fileInfo = this.getFileInfo();

    const parts = [timestamp, prefix, fileInfo, `${colorCode}${levelStr}${resetCode}`, message]
      .filter(Boolean)
      .join(' ');

    return args.length > 0 ? `${parts}` : parts;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private writeLog(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const formattedMessage = this.formatMessage(level, message, ...args);

    // Add detailed error information for GraphQL errors
    if (message.includes('GraphQL error')) {
      try {
        let errorDetails: {
          message?: string;
          location?: unknown;
          path?: string | string[];
          extensions?: Record<string, unknown>;
        };

        // Handle both string and object error formats
        if (typeof args[0] === 'string') {
          // Parse error details from string format
          const errorMatch = args[0].match(/Message: (.*?), Location: (.*?), Path: (.*)/);
          errorDetails = {
            message: errorMatch?.[1] || 'Unknown error message',
            location: errorMatch?.[2] || 'Unknown location',
            path: errorMatch?.[3] || 'Unknown path',
          };
        } else {
          // Handle object format
          errorDetails = args[0] as {
            message?: string;
            location?: unknown;
            path?: string | string[];
            extensions?: Record<string, unknown>;
          };
        }

        const formattedErrorDetails = {
          message: errorDetails?.message || 'Unknown error message',
          location: errorDetails?.location || 'Unknown location',
          path: errorDetails?.path || 'Unknown path',
          rawMessage: message,
          timestamp,
        };

        console.error(`[${timestamp}] [${level}] GraphQL Error Details:`, {
          ...formattedErrorDetails,
          rawArgs: args,
          stack: new Error().stack,
        });

        // If we have a path, try to extract the specific field causing the error
        if (formattedErrorDetails.path) {
          const pathParts = Array.isArray(formattedErrorDetails.path)
            ? formattedErrorDetails.path
            : formattedErrorDetails.path.split('.');
          console.error(`[${timestamp}] [${level}] Error Context:`, {
            field: pathParts[pathParts.length - 1],
            fullPath: pathParts,
            likelyCause: 'Empty or invalid value in required field',
          });
        }
      } catch (error) {
        // If anything goes wrong while processing the error details, log the raw error
        console.error(`[${timestamp}] [${level}] Failed to process GraphQL error details:`, {
          originalMessage: message,
          args,
          processingError: error,
          stack: new Error().stack,
        });
      }
    }

    switch (level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.writeLog(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.writeLog(LogLevel.INFO, message, ...args);
  }

  log(message: string, ...args: unknown[]): void {
    this.writeLog(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.writeLog(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.writeLog(LogLevel.ERROR, message, ...args);
  }

  // Create specialized loggers for different modules
  createChild(prefix: string, config?: Partial<ILoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      prefix,
      ...(config || {}),
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
