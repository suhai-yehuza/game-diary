#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';

import {
  getCoverageConfig,
  type ICoverageThresholds,
  type IFileThresholds,
} from '@/lib/config/coverage';

const COVERAGE_REPORT_PATH = './coverage/coverage-final.json';

interface ICoverageSummary {
  total: {
    branches: { pct: number };
    functions: { pct: number };
    lines: { pct: number };
    statements: { pct: number };
  };
}

interface IFileCoverage {
  [filePath: string]: {
    s: { [key: string]: number }; // statements
    f: { [key: string]: number }; // functions
    b: { [key: string]: number[] }; // branches
    l: { [key: string]: number }; // lines
  };
}

interface IFileCoverageResult {
  filePath: string;
  statements: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  lines: { total: number; covered: number; percentage: number };
  thresholds: ICoverageThresholds;
  meetsThresholds: boolean;
}

// Enhanced logging functions
function logInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

function logSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

function logError(message: string): void {
  console.error(`❌ ${message}`);
}

function logWarning(message: string): void {
  console.log(`⚠️  ${message}`);
}

function parseCoverageReport(): { summary: ICoverageSummary | null; files: IFileCoverage | null } {
  try {
    if (!fs.existsSync(COVERAGE_REPORT_PATH)) {
      logWarning('Coverage report not found at: ' + COVERAGE_REPORT_PATH);
      logInfo('Make sure to run tests with coverage first: pnpm test:unit --coverage');
      return { summary: null, files: null };
    }

    const coverageData: IFileCoverage = JSON.parse(fs.readFileSync(COVERAGE_REPORT_PATH, 'utf8'));

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

    const summary: ICoverageSummary = {
      total: {
        statements: {
          pct: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100,
        },
        functions: { pct: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 100 },
        branches: { pct: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100 },
        lines: { pct: totalLines > 0 ? (coveredLines / totalLines) * 100 : 100 },
      },
    };

    return { summary, files: coverageData };
  } catch (error) {
    logError('Error parsing coverage report: ' + (error as Error).message);
    return { summary: null, files: null };
  }
}

function calculateFileCoverage(filePath: string, fileData: any): IFileCoverageResult {
  // Count statements
  const statements = Object.values(fileData.s || {});
  const totalStatements = statements.length;
  const coveredStatements = statements.filter((count: any) => count > 0).length;

  // Count functions
  const functions = Object.values(fileData.f || {});
  const totalFunctions = functions.length;
  const coveredFunctions = functions.filter((count: any) => count > 0).length;

  // Count branches
  const branches = Object.values(fileData.b || {}).flat();
  const totalBranches = branches.length;
  const coveredBranches = branches.filter((count: any) => count > 0).length;

  // Count lines (same as statements for v8)
  const totalLines = totalStatements;
  const coveredLines = coveredStatements;

  return {
    filePath,
    statements: {
      total: totalStatements,
      covered: coveredStatements,
      percentage: totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100,
    },
    functions: {
      total: totalFunctions,
      covered: coveredFunctions,
      percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 100,
    },
    branches: {
      total: totalBranches,
      covered: coveredBranches,
      percentage: totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 100,
    },
    lines: {
      total: totalLines,
      covered: coveredLines,
      percentage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 100,
    },
    thresholds: { lines: 0, statements: 0, branches: 0, functions: 0, base: 0 },
    meetsThresholds: true,
  };
}

function getFileThresholds(filePath: string, fileThresholds: IFileThresholds): ICoverageThresholds {
  // Find the matching pattern for this file
  for (const pattern in fileThresholds) {
    if (filePath.includes(pattern.replace('**/*.{ts,tsx}', ''))) {
      return fileThresholds[pattern];
    }
  }

  // Default thresholds if no pattern matches
  return {
    lines: 80,
    statements: 80,
    branches: 79,
    functions: 71,
    base: 80,
  };
}

function validateFileCoverage(
  files: IFileCoverage,
  fileThresholds: IFileThresholds
): IFileCoverageResult[] {
  const results: IFileCoverageResult[] = [];

  for (const filePath in files) {
    // Only include files from the src directory
    if (!filePath.includes('/src/') && !filePath.includes('\\src\\')) {
      continue;
    }

    const fileData = files[filePath];
    if (!fileData) continue;

    const fileCoverage = calculateFileCoverage(filePath, fileData);
    const thresholds = getFileThresholds(filePath, fileThresholds);

    fileCoverage.thresholds = thresholds;

    // Check if file meets all thresholds
    const meetsThresholds =
      fileCoverage.statements.percentage >= thresholds.statements &&
      fileCoverage.functions.percentage >= thresholds.functions &&
      fileCoverage.branches.percentage >= thresholds.branches &&
      fileCoverage.lines.percentage >= thresholds.lines;

    fileCoverage.meetsThresholds = meetsThresholds;
    results.push(fileCoverage);
  }

  return results;
}

function runVitestWithCoverage(): void {
  logInfo('Running tests with coverage using Vitest...');

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
  logInfo('Validating overall coverage thresholds...');

  const { summary } = parseCoverageReport();
  if (!summary) {
    logError('Could not parse coverage report');
    return false;
  }

  const { total } = summary;
  let allThresholdsMet = true;

  console.log('\n📊 Overall Coverage Results:');
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
    logSuccess('All overall coverage thresholds met!');
  } else {
    logError('Overall coverage thresholds not met!');
  }

  return allThresholdsMet;
}

function validateIndividualFileCoverage(fileThresholds: IFileThresholds): boolean {
  logInfo('Validating individual file coverage thresholds...');

  const { files } = parseCoverageReport();
  if (!files) {
    logError('Could not parse coverage report');
    return false;
  }

  const fileResults = validateFileCoverage(files, fileThresholds);
  const failedFiles = fileResults.filter(result => !result.meetsThresholds);

  console.log(`\n📁 File Coverage Results (${fileResults.length} files analyzed):`);

  if (failedFiles.length === 0) {
    logSuccess('All files meet their coverage thresholds!');
    return true;
  }

  logError(`${failedFiles.length} files do not meet their coverage thresholds:`);

  failedFiles.forEach(file => {
    logInfo(`\n   📄 ${file.filePath}:`);
    logInfo(
      `      Statements: ${file.statements.percentage.toFixed(2)}% (threshold: ${file.thresholds.statements}%)`
    );
    logInfo(
      `      Functions:  ${file.functions.percentage.toFixed(2)}% (threshold: ${file.thresholds.functions}%)`
    );
    logInfo(
      `      Branches:   ${file.branches.percentage.toFixed(2)}% (threshold: ${file.thresholds.branches}%)`
    );
    logInfo(
      `      Lines:      ${file.lines.percentage.toFixed(2)}% (threshold: ${file.thresholds.lines}%)`
    );
  });

  return false;
}

function displayThresholds(thresholds: ICoverageThresholds): void {
  logInfo('Overall Coverage Thresholds:');

  logInfo(`   Base Threshold: ${thresholds.base}%`);
  logInfo(`   Statements: ${thresholds.statements}%`);
  logInfo(`   Functions:  ${thresholds.functions}%`);
  logInfo(`   Branches:   ${thresholds.branches}%`);
  logInfo(`   Lines:      ${thresholds.lines}%`);
  logInfo('');
}

function displayFileThresholds(fileThresholds: IFileThresholds): void {
  logInfo('File-Specific Coverage Thresholds:');

  for (const pattern in fileThresholds) {
    const thresholds = fileThresholds[pattern];
    console.log(`   ${pattern}:`);
    console.log(`     Statements: ${thresholds.statements}%, Functions: ${thresholds.functions}%`);
    console.log(`     Branches: ${thresholds.branches}%, Lines: ${thresholds.lines}%`);
  }
  console.log('');
}

function main(): void {
  logInfo('Validating test coverage using single source of truth...');

  // Get coverage configuration
  const config = getCoverageConfig();
  displayThresholds(config.global);
  displayFileThresholds(config.files);

  // Run vitest with coverage
  runVitestWithCoverage();

  // Validate overall coverage thresholds
  const overallThresholdsMet = validateCoverageThresholds(config.global);

  // Validate individual file coverage thresholds
  const fileThresholdsMet = validateIndividualFileCoverage(config.files);

  if (!overallThresholdsMet || !fileThresholdsMet) {
    logError('Coverage validation failed!');
    if (!overallThresholdsMet) {
      logError('Overall coverage thresholds were not met');
    }
    if (!fileThresholdsMet) {
      logError('Individual file coverage thresholds were not met');
    }
    process.exit(1);
  }

  logSuccess('Coverage validation passed!');
  logInfo('All overall and individual file thresholds were met');
}

main();
