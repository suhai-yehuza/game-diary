import type { DataProcessor } from '../db/seed/data-processor';
import type { OptimizedAPIClient } from '../db/seed/utils/api-client';

export interface OptimizedSeederOptions {
  seasons: number[];
  apiClient: OptimizedAPIClient;
  processor: DataProcessor;
  batchSize: number;
}
