// Types file: hooks.types.ts
import type { IGamesApiResponse } from '@/lib/types/externalApi.types';

// Types for use-live-games hook
export interface IUseLiveGamesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialData?: IGamesApiResponse;
}

// Types for use-search hook
export interface IUseSearchOptions {
  debounceMs?: number;
  searchPath?: string;
  adminSearchPath?: string;
}
