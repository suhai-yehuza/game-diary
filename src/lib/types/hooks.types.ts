// Types file: hooks.types.ts
import type { IGamesApiResponse } from './externalApiTypes';

// Types moved from src/hooks/use-api-cache.ts
export interface ICacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

export interface IApiCacheOptions {
  ttl?: number;
  enableDeduplication?: boolean;
}

// Types moved from src/hooks/use-performance.ts
export interface IPerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderTime: number;
  memoryUsage?: number;
  timestamp: string;
}

export interface IUsePerformanceOptions {
  componentName: string;
  enableMemoryTracking?: boolean;
  enableRenderTracking?: boolean;
  onMetrics?: (metrics: IPerformanceMetrics) => void;
}

// Types moved from src/hooks/use-live-games.ts
export interface IUseLiveGamesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialData?: IGamesApiResponse;
}

// Types moved from src/hooks/use-search.ts
export interface IUseSearchOptions {
  debounceMs?: number;
  searchPath?: string;
  adminSearchPath?: string;
}
