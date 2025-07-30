#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

// Import the vitest config to get the actual thresholds
const VITEST_CONFIG_PATH = './vitest.config.ts';

interface ICoverageThresholds {
  branches: number;
  functions: number;
  lines: number;
  statements: number;
  base: number;
}

function getVitestThresholds(): ICoverageThresholds {
  try {
    // Read the vitest config file
    const configContent = fs.readFileSync(VITEST_CONFIG_PATH, 'utf8');

    // Extract the COVERAGE_THRESHOLD value
    const thresholdMatch = configContent.match(/const COVERAGE_THRESHOLD = (\d+);/);
    if (!thresholdMatch) {
      throw new Error('Could not find COVERAGE_THRESHOLD in vitest.config.ts');
    }

    const baseThreshold = parseInt(thresholdMatch[1], 10);
    const branchesThreshold = baseThreshold - 24;
    const functionsThreshold = baseThreshold - 42;
    const linesThreshold = baseThreshold - 42;
    const statementsThreshold = baseThreshold - 42;

    // Calculate the actual thresholds used by Vitest (same logic as in vitest.config.ts)
    return {
      branches: branchesThreshold,
      functions: functionsThreshold,
      lines: linesThreshold,
      statements: statementsThreshold,
      base: baseThreshold,
    };
  } catch (_error) {
    console.error('❌ Error reading vitest.config.ts:', (_error as Error).message);

    console.error('Falling back to default thresholds...');

    // Default fallback values
    const baseThreshold = 80;
    const branchesThreshold = baseThreshold - 24;
    const functionsThreshold = baseThreshold - 42;
    const linesThreshold = baseThreshold - 42;
    const statementsThreshold = baseThreshold - 42;

    return {
      branches: branchesThreshold,
      functions: functionsThreshold,
      lines: linesThreshold,
      statements: statementsThreshold,
      base: baseThreshold,
    };
  }
}

function runVitestWithCoverage(): void {
  console.log('📝 Running tests with coverage using Vitest...');

  try {
    // Run vitest with coverage - only unit tests to avoid server dependencies
    execSync('pnpm exec vitest run tests/unit --coverage', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('✅ Coverage validation passed!');

    console.log("   Vitest's built-in coverage validation succeeded");

    console.log('   All thresholds from vitest.config.ts were met');
  } catch (_error) {
    console.error('❌ Coverage validation failed!');

    console.error("   Vitest's built-in coverage validation failed");

    console.error('   Check the output above for specific threshold failures');
    process.exit(1);
  }
}

function displayThresholds(thresholds: ICoverageThresholds): void {
  console.log('📊 Coverage Thresholds (from vitest.config.ts):');

  console.log(`   Base Threshold: ${thresholds.base}%`);

  console.log(`   Statements: ${thresholds.statements}%`);

  console.log(`   Functions:  ${thresholds.functions}%`);

  console.log(`   Branches:   ${thresholds.branches}%`);

  console.log(`   Lines:      ${thresholds.lines}%`);

  console.log('');
}

function main(): void {
  console.log('🔍 Validating test coverage using single source of truth...');

  // Get thresholds from vitest.config.ts
  const thresholds = getVitestThresholds();
  displayThresholds(thresholds);

  // Run vitest with coverage - this will use the thresholds from vitest.config.ts
  // and fail if any threshold is not met
  runVitestWithCoverage();
}

main();
