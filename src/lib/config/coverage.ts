// Shared coverage configuration
export const COVERAGE_THRESHOLD = 80; // 95% coverage is the goal

export interface ICoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  base: number;
}

export function getCoverageThresholds(): ICoverageThresholds {
  return {
    lines: COVERAGE_THRESHOLD,
    statements: COVERAGE_THRESHOLD,
    branches: COVERAGE_THRESHOLD - 1,
    functions: COVERAGE_THRESHOLD - 9,
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
