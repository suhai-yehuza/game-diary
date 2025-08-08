import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logE2E,
  logPerformance,
  setLogLevel,
  createPerformanceLogger,
} from '@/lib/utils/logger';

describe('Logger Utils Extended Tests', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('logger instance', () => {
    it('creates logger with default configuration', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('logs debug messages', () => {
      logger.debug('Test debug message');
      // In test environment, debug logs might not be shown due to log level
      // but the function should be callable
    });

    it('logs info messages', () => {
      logger.info('Test info message');
      // In test environment, info logs might not be shown due to log level
      // but the function should be callable
    });

    it('logs warn messages', () => {
      logger.warn('Test warning message');
      // In test environment, warn logs might not be shown due to log level
      // but the function should be callable
    });

    it('logs error messages', () => {
      logger.error('Test error message');
      // Error logs should be shown in test environment
    });

    it('logs error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      // Error logs should be shown in test environment
    });
  });

  describe('log functions', () => {
    it('logDebug function is callable', () => {
      expect(typeof logDebug).toBe('function');
      logDebug('Debug message');
    });

    it('logInfo function is callable', () => {
      expect(typeof logInfo).toBe('function');
      logInfo('Info message');
    });

    it('logWarn function is callable', () => {
      expect(typeof logWarn).toBe('function');
      logWarn('Warning message');
    });

    it('logError function is callable', () => {
      expect(typeof logError).toBe('function');
      logError('Error message');
    });

    it('logError function with error object is callable', () => {
      const error = new Error('Test error');
      logError('Error occurred', error);
    });

    it('logE2E function is callable', () => {
      expect(typeof logE2E).toBe('function');
      logE2E('E2E debug message');
    });

    it('logPerformance function is callable', () => {
      expect(typeof logPerformance).toBe('function');
      logPerformance('Test operation', 100);
    });
  });

  describe('logger methods', () => {
    it('apiRequest method is callable', () => {
      expect(typeof logger.apiRequest).toBe('function');
      logger.apiRequest('/api/test', 'GET');
    });

    it('apiResponse method is callable', () => {
      expect(typeof logger.apiResponse).toBe('function');
      logger.apiResponse('/api/test', 200);
    });

    it('componentRender method is callable', () => {
      expect(typeof logger.componentRender).toBe('function');
      logger.componentRender('TestComponent');
    });

    it('componentRender method with props is callable', () => {
      logger.componentRender('TestComponent', { prop1: 'value1' });
    });

    it('hookCall method is callable', () => {
      expect(typeof logger.hookCall).toBe('function');
      logger.hookCall('useTestHook');
    });

    it('userAction method is callable', () => {
      expect(typeof logger.userAction).toBe('function');
      logger.userAction('test_action');
    });

    it('userAction method with userId is callable', () => {
      logger.userAction('test_action', 'user123');
    });

    it('performance method is callable', () => {
      expect(typeof logger.performance).toBe('function');
      logger.performance('Test operation', 100);
    });
  });

  describe('logger configuration', () => {
    it('setLogLevel function is callable', () => {
      expect(typeof setLogLevel).toBe('function');
      setLogLevel(1); // Set to DEBUG level
    });

    it('createPerformanceLogger function is callable', () => {
      expect(typeof createPerformanceLogger).toBe('function');
      const perfLogger = createPerformanceLogger('Test Operation');
      expect(perfLogger).toBeDefined();
    });

    it('logger createChild method is callable', () => {
      expect(typeof logger.createChild).toBe('function');
      const childLogger = logger.createChild('ChildPrefix');
      expect(childLogger).toBeDefined();
    });

    it('logger updateConfig method is callable', () => {
      expect(typeof logger.updateConfig).toBe('function');
      logger.updateConfig({ level: 1 });
    });
  });

  describe('logger with context', () => {
    it('logs with context object', () => {
      const context = { userId: '123', action: 'test' };
      logger.info('Message with context', context);
    });

    it('logs error with context', () => {
      const context = { userId: '123', action: 'test' };
      const error = new Error('Test error');
      logger.error('Error with context', error, context);
    });
  });
});
