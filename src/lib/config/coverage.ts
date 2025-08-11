// Shared coverage configuration
export const COVERAGE_THRESHOLD = 60; // adjusted to current coverage level

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
    functions: COVERAGE_THRESHOLD,
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
