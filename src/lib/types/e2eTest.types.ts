export type CoverageTarget = 'unit' | 'integration' | 'e2e' | 'all';

export type TestCategory = 'functional' | 'performance' | 'security' | 'accessibility';

export interface ICoverageTarget {
  category: string;
  target: number;
  description: string;
  testFiles: string[];
}

export interface ITestCategory {
  name: string;
  description: string;
  priority: string;
  userJourneys: string[];
  testFiles: string[];
}

export interface ICoverageConfig {
  target: CoverageTarget;
  category: TestCategory;
  testFiles: string[];
  thresholds: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}
