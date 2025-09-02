/**
 * Consolidated Infrastructure Types
 * Infrastructure, middleware, and system-related type definitions
 */

// Infrastructure types (cache-related types removed)

// ========================================
// MIDDLEWARE TYPES
// ========================================

// Admin Auth Types
export interface IAdminAuthContext {
  userId: string;
  isAdmin: boolean;
  userEmail?: string;
}

// ========================================
// AUDIT LOG TYPES
// ========================================

export interface IAuditLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  severity: string;
  user_id?: string;
  description?: string;
  success: boolean;
  error_message?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, unknown>;
}

export interface IFilters {
  category?: string;
  action?: string;
  severity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export type AuditLogSearchField =
  | 'all'
  | 'category'
  | 'action'
  | 'severity'
  | 'user_id'
  | 'description';

// ========================================
// TEST TYPES
// ========================================

export interface TestConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

export interface CoverageTarget {
  category: string;
  target: number; // percentage
  description: string;
  testFiles: string[];
}

export interface TestCategory {
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userJourneys: string[];
  testFiles: string[];
}

// ========================================
// UTILITY TYPES
// ========================================

export type AsyncFunction<T = unknown> = () => Promise<T>;
export type SyncFunction<T = unknown> = () => T;
export type SomeOtherType = (arg: string) => void;
