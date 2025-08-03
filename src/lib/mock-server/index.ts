// Mock Server Barrel Export
// Centralized exports for the mock server module

import { mockDataProvider } from '@src/lib/mock';
import type {
  MockServerConfig,
  MockServerResponse,
  HealthCheckResponse,
  StatsResponse,
  ExternalAPIResponse,
} from '@src/lib/types';

import { DEFAULT_MOCK_SERVER_CONFIG } from './config';
import { createMockDatabase } from './database';
import { createMockExternalAPI } from './external-api';

class MockServer {
  private config: MockServerConfig;
  private readonly mockDB: ReturnType<typeof createMockDatabase>;
  private readonly mockExternalAPI: ReturnType<typeof createMockExternalAPI>;
  private startTime: number;
  private requestCount: number;
  private errorCount: number;

  constructor(config: Partial<MockServerConfig> = {}) {
    this.config = { ...DEFAULT_MOCK_SERVER_CONFIG, ...config };
    this.mockDB = createMockDatabase();
    this.mockExternalAPI = createMockExternalAPI();
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
  }

  // Simulate artificial latency
  private simulateLatency(): number {
    const latency =
      Math.random() * (this.config.latency.max - this.config.latency.min) + this.config.latency.min;
    return Math.round(latency);
  }

  // Simulate occasional errors
  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate;
  }

  // Log messages if logging is enabled
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[Mock Server] ${message}`);
    }
  }

  // Health check endpoint
  healthCheck(): Promise<HealthCheckResponse> {
    return Promise.resolve({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config: this.config,
      uptime: Date.now() - this.startTime,
    });
  }

  // Get server statistics
  getStats(): Promise<StatsResponse> {
    return Promise.resolve({
      uptime: Date.now() - this.startTime,
      memory: process.memoryUsage(),
      config: this.config,
      requests: {
        total: this.requestCount,
        successful: this.requestCount - this.errorCount,
        failed: this.errorCount,
        averageLatency:
          this.config.latency.min + (this.config.latency.max - this.config.latency.min) / 2,
      },
    });
  }

  // Handle database operations
  handleDatabaseOperation(
    operation: string,
    table: string,
    data?: Record<string, unknown>
  ): MockServerResponse {
    this.requestCount++;

    try {
      let result;
      switch (operation.toUpperCase()) {
        case 'SELECT':
          result = this.mockDB.select(table, data);
          break;
        case 'INSERT':
          result = this.mockDB.insert(table, data || {});
          break;
        case 'UPDATE':
          if (!data?.id) {
            throw new Error('ID is required for UPDATE operation');
          }
          result = this.mockDB.update(table, data.id as string, data);
          break;
        case 'DELETE':
          if (!data?.id) {
            throw new Error('ID is required for DELETE operation');
          }
          result = this.mockDB.delete(table, data.id as string);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        latency: this.simulateLatency(),
        mock: true,
      };
    } catch (error) {
      this.errorCount++;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        latency: this.simulateLatency(),
        mock: true,
      };
    }
  }

  // Handle external API calls
  async handleExternalAPI(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<MockServerResponse> {
    this.requestCount++;

    try {
      const result: ExternalAPIResponse = await this.mockExternalAPI.call(endpoint, params);

      return {
        success: result.success ?? false,
        data: result.data as unknown,
        error: result.error,
        timestamp: new Date().toISOString(),
        latency: this.simulateLatency(),
        mock: true,
      };
    } catch (error) {
      this.errorCount++;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        latency: this.simulateLatency(),
        mock: true,
      };
    }
  }

  // Get mock data
  async getMockData(type: string) {
    await new Promise(resolve => setTimeout(resolve, this.simulateLatency()));

    this.log(`Getting mock data for: ${type}`);

    switch (type) {
      case 'live-games':
        return mockDataProvider.getLiveGamesMock();
      case 'nba-games':
        return mockDataProvider.getNbaGamesMock();
      case 'nba-teams':
        return mockDataProvider.getNbaTeamsMock();
      case 'nba-players':
        return mockDataProvider.getNbaPlayersMock();
      case 'nba-standings':
        return mockDataProvider.getNbaStandingsMock();
      case 'nba-statistics':
        return mockDataProvider.getNbaGameStatisticsMock();
      default:
        throw new Error(`Unknown mock data type: ${type}`);
    }
  }

  // Reset server state
  reset(): void {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.mockDB.reset();
    this.mockExternalAPI.reset();
  }

  // Get current configuration
  getConfig(): MockServerConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<MockServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global mock server instance
let mockServerInstance: MockServer | null = null;

export function getMockServer(config?: Partial<MockServerConfig>): MockServer {
  if (!mockServerInstance) {
    mockServerInstance = new MockServer(config);
  }
  return mockServerInstance;
}

export function resetMockServer(): void {
  mockServerInstance = null;
}

export function createMockServer(config?: Partial<MockServerConfig>): MockServer {
  return new MockServer(config);
}

// Export configuration utilities
export { DEFAULT_MOCK_SERVER_CONFIG } from './config';

// Export database and external API functions
export { createMockDatabase } from './database';
export { createMockExternalAPI } from './external-api';
