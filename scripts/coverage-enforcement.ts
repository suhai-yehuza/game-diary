#!/usr/bin/env tsx

/**
 * @fileoverview Coverage Enforcement Script
 *
 * This script enforces minimum test coverage thresholds for both unit and E2E tests.
 * It implements two coverage enforcement strategies:
 *
 * 1. Coverage Analysis: Analyzes test results and calculates coverage percentages
 * 2. Test Count Enforcement: Ensures minimum number of tests are executed
 *
 * Usage:
 * - pnpm coverage:enforce --unit-threshold=80 --e2e-threshold=70
 * - pnpm coverage:enforce --test-count --min-unit-tests=50 --min-e2e-tests=30
 * - pnpm coverage:enforce --both --unit-threshold=80 --e2e-threshold=70 --min-unit-tests=50 --min-e2e-tests=30
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

interface CoverageConfig {
  unit: {
    threshold: number;
    minTests: number;
    coverageFile: string;
    testResultsFile: string;
  };
  e2e: {
    threshold: number;
    minTests: number;
    coverageFile: string;
    testResultsFile: string;
  };
}

interface CoverageResult {
  type: 'unit' | 'e2e';
  coverage: number;
  testCount: number;
  passed: number;
  failed: number;
  skipped: number;
  metThreshold: boolean;
  metTestCount: boolean;
  details: {
    branches: number;
    functions: number;
    lines: number;
    statements: number;
  };
}

interface EnforcementResult {
  success: boolean;
  unit: CoverageResult;
  e2e: CoverageResult;
  summary: {
    overallPassed: boolean;
    unitPassed: boolean;
    e2ePassed: boolean;
    recommendations: string[];
  };
}

class CoverageEnforcer {
  private config: CoverageConfig;
  private results: EnforcementResult;

  constructor(config: Partial<CoverageConfig> = {}) {
    this.config = {
      unit: {
        threshold: config.unit?.threshold ?? 90,
        minTests: config.unit?.minTests ?? 50,
        coverageFile: './coverage/coverage-summary.json',
        testResultsFile: './coverage/unit-test-results.json',
      },
      e2e: {
        threshold: config.e2e?.threshold ?? 90,
        minTests: config.e2e?.minTests ?? 25,
        coverageFile: './coverage/e2e/coverage-report.json',
        testResultsFile: './coverage/e2e/test-results.json',
      },
    };

    this.results = {
      success: false,
      unit: this.createEmptyResult('unit'),
      e2e: this.createEmptyResult('e2e'),
      summary: {
        overallPassed: false,
        unitPassed: false,
        e2ePassed: false,
        recommendations: [],
      },
    };
  }

  private createEmptyResult(type: 'unit' | 'e2e'): CoverageResult {
    return {
      type,
      coverage: 0,
      testCount: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      metThreshold: false,
      metTestCount: false,
      details: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    };
  }

  /**
   * Analyze unit test coverage from Vitest results
   */
  private analyzeUnitCoverage(): CoverageResult {
    const result = this.createEmptyResult('unit');

    try {
      // Check if coverage file exists
      if (existsSync(this.config.unit.coverageFile)) {
        const coverageData = JSON.parse(readFileSync(this.config.unit.coverageFile, 'utf-8'));

        // Calculate overall coverage
        const total = coverageData.total;
        const covered = coverageData.covered;

        result.coverage = total > 0 ? (covered / total) * 100 : 0;
        result.details = {
          branches: coverageData.branches?.pct ?? 0,
          functions: coverageData.functions?.pct ?? 0,
          lines: coverageData.lines?.pct ?? 0,
          statements: coverageData.statements?.pct ?? 0,
        };
      }

      // Check test results
      if (existsSync(this.config.unit.testResultsFile)) {
        const testData = JSON.parse(readFileSync(this.config.unit.testResultsFile, 'utf-8'));
        result.testCount = testData.numTotalTests ?? 0;
        result.passed = testData.numPassedTests ?? 0;
        result.failed = testData.numFailedTests ?? 0;
        result.skipped = testData.numPendingTests ?? 0;
      } else {
        // Try to get test count from Vitest output
        try {
          const vitestOutput = execSync('pnpm test:unit --reporter=json', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          const testData = JSON.parse(vitestOutput);
          result.testCount = testData.numTotalTests ?? 0;
          result.passed = testData.numPassedTests ?? 0;
          result.failed = testData.numFailedTests ?? 0;
          result.skipped = testData.numPendingTests ?? 0;
        } catch (error) {
          console.warn('⚠️  Could not get unit test results, using defaults');
        }
      }

      result.metThreshold = result.coverage >= this.config.unit.threshold;
      result.metTestCount = result.testCount >= this.config.unit.minTests;
    } catch (error) {
      console.error('❌ Error analyzing unit coverage:', error);
    }

    return result;
  }

  /**
   * Analyze E2E test coverage from Playwright results
   */
  private analyzeE2ECoverage(): CoverageResult {
    const result = this.createEmptyResult('e2e');

    try {
      // Check if E2E coverage file exists
      if (existsSync(this.config.e2e.coverageFile)) {
        const coverageData = JSON.parse(readFileSync(this.config.e2e.coverageFile, 'utf-8'));

        // Calculate overall coverage from E2E coverage targets
        const categories = coverageData.categories ?? [];
        const totalTargets = categories.length;
        const metTargets = categories.filter((cat: any) => cat.met).length;

        result.coverage = totalTargets > 0 ? (metTargets / totalTargets) * 100 : 0;
      }

      // Check E2E test results
      if (existsSync(this.config.e2e.testResultsFile)) {
        const testData = JSON.parse(readFileSync(this.config.e2e.testResultsFile, 'utf-8'));
        result.testCount = testData.total ?? 0;
        result.passed = testData.passed ?? 0;
        result.failed = testData.failed ?? 0;
        result.skipped = testData.skipped ?? 0;
      } else {
        // Try to get test count from Playwright output
        try {
          const playwrightOutput = execSync('pnpm test:e2e:sanity --reporter=json', {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
          });
          const testData = JSON.parse(playwrightOutput);
          result.testCount = testData.total ?? 0;
          result.passed = testData.passed ?? 0;
          result.failed = testData.failed ?? 0;
          result.skipped = testData.skipped ?? 0;
        } catch (error) {
          console.warn('⚠️  Could not get E2E test results, using defaults');
        }
      }

      result.metThreshold = result.coverage >= this.config.e2e.threshold;
      result.metTestCount = result.testCount >= this.config.e2e.minTests;
    } catch (error) {
      console.error('❌ Error analyzing E2E coverage:', error);
    }

    return result;
  }

  /**
   * Generate recommendations based on coverage results
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Unit test recommendations
    if (!this.results.unit.metThreshold) {
      recommendations.push(
        `📊 Unit test coverage (${this.results.unit.coverage.toFixed(1)}%) is below threshold (${this.config.unit.threshold}%). ` +
          'Add more unit tests to improve coverage.'
      );
    }

    if (!this.results.unit.metTestCount) {
      recommendations.push(
        `🧪 Unit test count (${this.results.unit.testCount}) is below minimum (${this.config.unit.minTests}). ` +
          'Add more unit test cases.'
      );
    }

    // E2E test recommendations
    if (!this.results.e2e.metThreshold) {
      recommendations.push(
        `🌐 E2E test coverage (${this.results.e2e.coverage.toFixed(1)}%) is below threshold (${this.config.e2e.threshold}%). ` +
          'Add more E2E test scenarios.'
      );
    }

    if (!this.results.e2e.metTestCount) {
      recommendations.push(
        `🔍 E2E test count (${this.results.e2e.testCount}) is below minimum (${this.config.e2e.minTests}). ` +
          'Add more E2E test cases.'
      );
    }

    // General recommendations
    if (this.results.unit.failed > 0) {
      recommendations.push(
        `❌ ${this.results.unit.failed} unit tests are failing. Fix failing tests before proceeding.`
      );
    }

    if (this.results.e2e.failed > 0) {
      recommendations.push(
        `❌ ${this.results.e2e.failed} E2E tests are failing. Fix failing tests before proceeding.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All coverage thresholds and test count requirements are met!');
    }

    return recommendations;
  }

  /**
   * Run coverage enforcement
   */
  public enforce(): EnforcementResult {
    console.log('🔍 Running coverage enforcement...\n');

    // Analyze coverage for both test types
    this.results.unit = this.analyzeUnitCoverage();
    this.results.e2e = this.analyzeE2ECoverage();

    // Determine if requirements are met
    this.results.summary.unitPassed =
      this.results.unit.metThreshold && this.results.unit.metTestCount;
    this.results.summary.e2ePassed = this.results.e2e.metThreshold && this.results.e2e.metTestCount;
    this.results.summary.overallPassed =
      this.results.summary.unitPassed && this.results.summary.e2ePassed;

    // Generate recommendations
    this.results.summary.recommendations = this.generateRecommendations();

    // Set overall success
    this.results.success = this.results.summary.overallPassed;

    return this.results;
  }

  /**
   * Print coverage report
   */
  public printReport(): void {
    const { unit, e2e, summary } = this.results;

    console.log('📊 Coverage Enforcement Report');
    console.log('='.repeat(50));

    // Unit test results
    console.log('\n🧪 Unit Tests:');
    console.log(
      `  Coverage: ${unit.coverage.toFixed(1)}% (threshold: ${this.config.unit.threshold}%) ${unit.metThreshold ? '✅' : '❌'}`
    );
    console.log(
      `  Test Count: ${unit.testCount} (minimum: ${this.config.unit.minTests}) ${unit.metTestCount ? '✅' : '❌'}`
    );
    console.log(`  Passed: ${unit.passed}, Failed: ${unit.failed}, Skipped: ${unit.skipped}`);
    if (unit.details.branches > 0) {
      console.log(
        `  Details: Branches ${unit.details.branches.toFixed(1)}%, Functions ${unit.details.functions.toFixed(1)}%, Lines ${unit.details.lines.toFixed(1)}%, Statements ${unit.details.statements.toFixed(1)}%`
      );
    }

    // E2E test results
    console.log('\n🌐 E2E Tests:');
    console.log(
      `  Coverage: ${e2e.coverage.toFixed(1)}% (threshold: ${this.config.e2e.threshold}%) ${e2e.metThreshold ? '✅' : '❌'}`
    );
    console.log(
      `  Test Count: ${e2e.testCount} (minimum: ${this.config.e2e.minTests}) ${e2e.metTestCount ? '✅' : '❌'}`
    );
    console.log(`  Passed: ${e2e.passed}, Failed: ${e2e.failed}, Skipped: ${e2e.skipped}`);

    // Summary
    console.log('\n📋 Summary:');
    console.log(`  Unit Tests: ${summary.unitPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  E2E Tests: ${summary.e2ePassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Overall: ${summary.overallPassed ? '✅ PASSED' : '❌ FAILED'}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    summary.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });

    console.log('\n' + '='.repeat(50));
  }

  /**
   * Save coverage report to file
   */
  public saveReport(outputPath: string = './coverage/enforcement-report.json'): void {
    try {
      // Ensure directory exists
      const dir = dirname(outputPath);
      if (!existsSync(dir)) {
        execSync(`mkdir -p ${dir}`);
      }

      // Save report
      writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
      console.log(`📄 Coverage report saved to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Error saving coverage report:', error);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
  unitThreshold: number;
  e2eThreshold: number;
  minUnitTests: number;
  minE2ETests: number;
  mode: 'coverage' | 'test-count' | 'both';
  outputPath: string;
} {
  const args = process.argv.slice(2);

  let unitThreshold = 90;
  let e2eThreshold = 90;
  let minUnitTests = 50;
  let minE2ETests = 25;
  let mode: 'coverage' | 'test-count' | 'both' = 'both';
  let outputPath = './coverage/enforcement-report.json';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--coverage-only') {
      mode = 'coverage';
    } else if (arg === '--test-count-only') {
      mode = 'test-count';
    } else if (arg === '--both') {
      mode = 'both';
    } else if (arg.startsWith('--unit-threshold=')) {
      unitThreshold = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--e2e-threshold=')) {
      e2eThreshold = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--min-unit-tests=')) {
      minUnitTests = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--min-e2e-tests=')) {
      minE2ETests = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      outputPath = arg.split('=')[1];
    }
  }

  return {
    unitThreshold,
    e2eThreshold,
    minUnitTests,
    minE2ETests,
    mode,
    outputPath,
  };
}

/**
 * Main function
 */
function main(): void {
  const args = parseArgs();

  console.log('🚀 Coverage Enforcement Tool');
  console.log('Mode:', args.mode);
  console.log('Unit threshold:', args.unitThreshold + '%');
  console.log('E2E threshold:', args.e2eThreshold + '%');
  console.log('Min unit tests:', args.minUnitTests);
  console.log('Min E2E tests:', args.minE2ETests);
  console.log('');

  // Create enforcer with configuration
  const enforcer = new CoverageEnforcer({
    unit: {
      threshold: args.unitThreshold,
      minTests: args.minUnitTests,
      coverageFile: './coverage/coverage-summary.json',
      testResultsFile: './coverage/unit-test-results.json',
    },
    e2e: {
      threshold: args.e2eThreshold,
      minTests: args.minE2ETests,
      coverageFile: './coverage/e2e/coverage-report.json',
      testResultsFile: './coverage/e2e/test-results.json',
    },
  });

  // Run enforcement
  const results = enforcer.enforce();

  // Print report
  enforcer.printReport();

  // Save report
  enforcer.saveReport(args.outputPath);

  // Exit with appropriate code
  process.exit(results.success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CoverageEnforcer, type CoverageConfig, type EnforcementResult };
