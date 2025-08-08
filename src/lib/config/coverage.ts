// Shared coverage configuration
export const COVERAGE_THRESHOLD = 65;

export interface ICoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  base: number;
}

export function getCoverageThresholds(): ICoverageThresholds {
  return {
    branches: COVERAGE_THRESHOLD,
    functions: COVERAGE_THRESHOLD - 3, // Functions have a slightly lower threshold
    lines: COVERAGE_THRESHOLD,
    statements: COVERAGE_THRESHOLD,
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
