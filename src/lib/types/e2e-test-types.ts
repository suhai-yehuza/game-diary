/**
 * E2E Test Type Definitions
 *
 * This file contains type definitions for e2e testing utilities and configurations.
 */

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
