// Shared coverage configuration
export const COVERAGE_THRESHOLD = 70; // eventual target is 95% coverage

export interface ICoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  base: number;
}

export function getCoverageThresholds(): ICoverageThresholds {
  return {
    branches: COVERAGE_THRESHOLD + 9,
    functions: COVERAGE_THRESHOLD,
    lines: COVERAGE_THRESHOLD + 14,
    statements: COVERAGE_THRESHOLD + 14,
    base: COVERAGE_THRESHOLD,
  };
}

export function getVitestThresholds() {
  const thresholds = getCoverageThresholds();
  return {
    lines: thresholds.lines,
    branches: thresholds.branches,
    functions: thresholds.functions,
    statements: thresholds.statements,
  };
}
