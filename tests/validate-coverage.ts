#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';

import { getCoverageThresholds, type ICoverageThresholds } from '@/lib/config/coverage';

const COVERAGE_REPORT_PATH = './coverage/coverage-final.json';

interface ICoverageSummary {
  total: {
    branches: { pct: number };
    functions: { pct: number };
    lines: { pct: number };
    statements: { pct: number };
  };
}

// Enhanced logging functions
function log(message: string): void {
  console.log(`🔍 ${message}`);
}

function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logError(message: string): void {
  console.error(`❌ ${message}`);
}

function parseCoverageReport(): ICoverageSummary | null {
  try {
    if (!fs.existsSync(COVERAGE_REPORT_PATH)) {
      logError('Coverage report not found at: ' + COVERAGE_REPORT_PATH);
      logInfo('Make sure to run tests with coverage first: pnpm test:unit --coverage');
      return null;
    }

    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_REPORT_PATH, 'utf8'));

    // Calculate totals from only src directory files
    let totalStatements = 0;
    let totalBranches = 0;
    let totalFunctions = 0;
    let totalLines = 0;
    let coveredStatements = 0;
    let coveredBranches = 0;
    let coveredFunctions = 0;
    let coveredLines = 0;

    for (const filePath in coverageData) {
      // Only include files from the src directory
      if (!filePath.includes('/src/') && !filePath.includes('\\src\\')) {
        continue;
      }

      const fileData = coverageData[filePath];
      if (!fileData) continue;

      // Count statements
      const statements = Object.values(fileData.s || {});
      totalStatements += statements.length;
      coveredStatements += statements.filter((count: any) => count > 0).length;

      // Count functions
      const functions = Object.values(fileData.f || {});
      totalFunctions += functions.length;
      coveredFunctions += functions.filter((count: any) => count > 0).length;

      // Count branches
      const branches = Object.values(fileData.b || {}).flat();
      totalBranches += branches.length;
      coveredBranches += branches.filter((count: any) => count > 0).length;

      // Count lines (same as statements for v8)
      totalLines += statements.length;
      coveredLines += statements.filter((count: any) => count > 0).length;
    }

    return {
      total: {
        statements: {
          pct: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100,
        },
        functions: { pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 100 },
        branches: { pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100 },
        lines: { pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 100 },
      },
    };
  } catch (error) {
    logError('Error parsing coverage report: ' + (error as Error).message);
    return null;
  }
}

function runVitestWithCoverage(): void {
  log('Running tests with coverage using Vitest...');

  try {
    // Run vitest with coverage - only unit tests to avoid server dependencies
    execSync('pnpm exec vitest run tests/unit --coverage', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    logSuccess('Vitest coverage run completed successfully');
  } catch (_error) {
    logError('Vitest coverage run failed!');
    logError('Check the output above for test failures');
    process.exit(1);
  }
}

function validateCoverageThresholds(thresholds: ICoverageThresholds): boolean {
  log('Validating coverage thresholds...');

  const coverageSummary = parseCoverageReport();
  if (!coverageSummary) {
    logError('Could not parse coverage report');
    return false;
  }

  const { total } = coverageSummary;
  let allThresholdsMet = true;

  console.log('\n📊 Coverage Results:');
  console.log(
    `   Statements: ${total.statements.pct.toFixed(2)}% (threshold: ${thresholds.statements}%)`
  );
  console.log(
    `   Functions:  ${total.functions.pct.toFixed(2)}% (threshold: ${thresholds.functions}%)`
  );
  console.log(
    `   Branches:   ${total.branches.pct.toFixed(2)}% (threshold: ${thresholds.branches}%)`
  );
  console.log(`   Lines:      ${total.lines.pct.toFixed(2)}% (threshold: ${thresholds.lines}%)`);

  if (total.statements.pct < thresholds.statements) {
    logError(
      `Statements coverage ${total.statements.pct.toFixed(2)}% is below threshold ${thresholds.statements}%`
    );
    allThresholdsMet = false;
  }

  if (total.functions.pct < thresholds.functions) {
    logError(
      `Functions coverage ${total.functions.pct.toFixed(2)}% is below threshold ${thresholds.functions}%`
    );
    allThresholdsMet = false;
  }

  if (total.branches.pct < thresholds.branches) {
    logError(
      `Branches coverage ${total.branches.pct.toFixed(2)}% is below threshold ${thresholds.branches}%`
    );
    allThresholdsMet = false;
  }

  if (total.lines.pct < thresholds.lines) {
    logError(
      `Lines coverage ${total.lines.pct.toFixed(2)}% is below threshold ${thresholds.lines}%`
    );
    allThresholdsMet = false;
  }

  if (allThresholdsMet) {
    logSuccess('All coverage thresholds met!');
  } else {
    logError('Coverage thresholds not met!');
  }

  return allThresholdsMet;
}

function displayThresholds(thresholds: ICoverageThresholds): void {
  log('Coverage Thresholds (from vitest.config.ts):');

  console.log(`   Base Threshold: ${thresholds.base}%`);
  console.log(`   Statements: ${thresholds.statements}%`);
  console.log(`   Functions:  ${thresholds.functions}%`);
  console.log(`   Branches:   ${thresholds.branches}%`);
  console.log(`   Lines:      ${thresholds.lines}%`);
  console.log('');
}

function main(): void {
  log('Validating test coverage using single source of truth...');

  // Get thresholds from shared configuration
  const thresholds = getCoverageThresholds();
  displayThresholds(thresholds);

  // Run vitest with coverage
  runVitestWithCoverage();

  // Validate coverage thresholds
  const thresholdsMet = validateCoverageThresholds(thresholds);

  if (!thresholdsMet) {
    logError('Coverage validation failed!');
    logError('Some coverage thresholds were not met');
    process.exit(1);
  }

  logSuccess('Coverage validation passed!');
  logInfo('All thresholds from shared configuration were met');
}

main();
