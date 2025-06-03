import { import { logger } from '@/lib/logger';export enum LogLevel { } from '@/lib/logger';
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  prefix?: string;
  enableFileInfo: boolean;
}

const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableTimestamp: true,
  enableColors: process.env.NODE_ENV !== 'production',
  enableFileInfo: process.env.NODE_ENV === 'development',
};

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  private formatTimestamp(): string {
    if (!this.config.enableTimestamp) return '';
    const now = new Date();
    return `[${now.toISOString()}]`;
  }

  private getColorCode(level: LogLevel): string {
    if (!this.config.enableColors) return '';
    
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    
    return colors[level] || '';
  }

  private getResetCode(): string {
    return this.config.enableColors ? '\x1b[0m' : '';
  }

  private getLevelString(level: LogLevel): string {
    const levels = {
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

    const formattedMessage = this.formatMessage(level, message, ...args);
    
    switch (level) {
      case LogLevel.DEBUG:
        logger.debug(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        logger.info(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        logger.warn(formattedMessage, ...args);
        break;
      case LogLevel.ERROR:
        logger.error(formattedMessage, ...args);
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
  createChild(prefix: string, config?: Partial<LoggerConfig>): Logger {
    return new Logger({
      ...this.config,
      ...config,
      prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
    });
  }

  // Update logger configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
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
      logger.info(`${operation} completed in ${duration}ms${additionalInfo ? ` - ${additionalInfo}` : ''}`);
    },
    error: (error: Error) => {
      const duration = Date.now() - start;
      logger.error(`${operation} failed after ${duration}ms:`, error);
    },
  };
}; 
