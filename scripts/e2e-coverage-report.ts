#!/usr/bin/env tsx
/**
 * @fileoverview Generates E2E coverage reports after Playwright runs.
 * Run with: pnpm test:e2e:coverage or tsx scripts/e2e-coverage-report.ts
 *
 * This script parses Playwright test results, calculates coverage against targets,
 * generates JSON and HTML reports, and provides actionable recommendations.
 */

/**
 * E2E Test Coverage Report Generator
 *
 * This script analyzes e2e test results and generates coverage reports
 * based on the coverage targets defined in tests/e2e/coverage.config.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  COVERAGE_TARGETS,
  TEST_CATEGORIES,
  generateCoverageReport,
  COVERAGE_REPORT_CONFIG,
} from '../tests/e2e/coverage.config';

interface TestResult {
  testFile: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface CoverageReport {
  overallScore: number;
  categories: Array<{
    category: string;
    target: number;
    actual: number;
    met: boolean;
    description: string;
    testCount: number;
  }>;
  summary: {
    totalCategories: number;
    metTargets: number;
    failedTargets: number;
  };
  recommendations: string[];
}

function parseTestResults(resultsPath: string): TestResult[] {
  if (!existsSync(resultsPath)) {
    console.warn(`Test results file not found: ${resultsPath}`);
    return [];
  }

  try {
    const content = readFileSync(resultsPath, 'utf-8');
    const results = JSON.parse(content);
    return (
      results.suites?.flatMap(
        (suite: any) =>
          suite.specs?.flatMap(
            (spec: any) =>
              spec.tests?.map((test: any) => ({
                testFile: spec.file || 'unknown',
                testName: test.title,
                status: test.outcome,
                duration: test.duration || 0,
                error: test.error?.message,
              })) || []
          ) || []
      ) || []
    );
  } catch (error) {
    console.error('Error parsing test results:', error);
    return [];
  }
}

function generateRecommendations(report: CoverageReport): string[] {
  const recommendations: string[] = [];

  // Overall score recommendations
  if (report.overallScore < 80) {
    recommendations.push(
      'Overall coverage is below 80%. Focus on improving test coverage across all categories.'
    );
  }

  // Category-specific recommendations
  report.categories.forEach(category => {
    if (!category.met) {
      recommendations.push(
        `Improve ${category.category} coverage: Currently ${category.actual.toFixed(1)}%, target ${category.target}%`
      );
    }

    if (category.testCount === 0) {
      recommendations.push(
        `No tests found for ${category.category}. Consider adding tests for this category.`
      );
    }
  });

  // Priority recommendations
  const criticalCategories = TEST_CATEGORIES.filter(cat => cat.priority === 'critical');
  const failedCritical = report.categories.filter(
    cat => !cat.met && criticalCategories.some(cc => cc.name === cat.category)
  );

  if (failedCritical.length > 0) {
    recommendations.push('Critical categories need immediate attention. Focus on these first:');
    failedCritical.forEach(cat => {
      recommendations.push(
        `  - ${cat.category}: ${cat.actual.toFixed(1)}% (target: ${cat.target}%)`
      );
    });
  }

  return recommendations;
}

function generateHTMLReport(report: CoverageReport): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Coverage Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .overall-score {
            font-size: 3em;
            font-weight: bold;
            margin: 20px 0;
        }
        .content {
            padding: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .summary-card .number {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .categories {
            margin-bottom: 30px;
        }
        .category {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        .category-header {
            padding: 15px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .category-name {
            font-weight: 600;
            color: #495057;
        }
        .category-score {
            font-weight: bold;
            font-size: 1.2em;
        }
        .category-score.met {
            color: #28a745;
        }
        .category-score.failed {
            color: #dc3545;
        }
        .category-body {
            padding: 20px;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        .progress-fill.failed {
            background: linear-gradient(90deg, #dc3545, #fd7e14);
        }
        .recommendations {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .recommendations h3 {
            color: #856404;
            margin-top: 0;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 8px;
            color: #856404;
        }
        .timestamp {
            text-align: center;
            color: #6c757d;
            margin-top: 30px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>E2E Test Coverage Report</h1>
            <div class="overall-score">${report.overallScore.toFixed(1)}%</div>
            <p>Overall Test Coverage Score</p>
        </div>

        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Categories</h3>
                    <div class="number">${report.summary.totalCategories}</div>
                </div>
                <div class="summary-card">
                    <h3>Targets Met</h3>
                    <div class="number" style="color: #28a745;">${report.summary.metTargets}</div>
                </div>
                <div class="summary-card">
                    <h3>Targets Failed</h3>
                    <div class="number" style="color: #dc3545;">${report.summary.failedTargets}</div>
                </div>
            </div>

            <div class="categories">
                <h2>Coverage by Category</h2>
                ${report.categories
                  .map(
                    category => `
                    <div class="category">
                        <div class="category-header">
                            <div class="category-name">${category.category}</div>
                            <div class="category-score ${category.met ? 'met' : 'failed'}">
                                ${category.actual.toFixed(1)}% / ${category.target}%
                            </div>
                        </div>
                        <div class="category-body">
                            <p>${category.description}</p>
                            <div class="progress-bar">
                                <div class="progress-fill ${category.met ? '' : 'failed'}"
                                     style="width: ${Math.min(category.actual, 100)}%"></div>
                            </div>
                            <p><strong>Tests:</strong> ${category.testCount}</p>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>

            ${
              report.recommendations.length > 0
                ? `
                <div class="recommendations">
                    <h3>Recommendations</h3>
                    <ul>
                        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `
                : ''
            }

            <div class="timestamp">
                Generated on ${new Date().toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>`;

  return html;
}

function main() {
  const args = process.argv.slice(2);
  const resultsPath = args[0] || 'test-results-e2e/results.json';
  const outputDir = args[1] || COVERAGE_REPORT_CONFIG.outputDir;

  console.log('🔍 Analyzing E2E test coverage...');

  // Parse test results
  const testResults = parseTestResults(resultsPath);
  console.log(`📊 Found ${testResults.length} test results`);

  // Generate coverage report
  const report = generateCoverageReport(testResults);
  report.recommendations = generateRecommendations(report);

  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Generate JSON report
  const jsonReportPath = join(outputDir, 'coverage-report.json');
  writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report saved to: ${jsonReportPath}`);

  // Generate HTML report
  const htmlReportPath = join(outputDir, 'coverage-report.html');
  const html = generateHTMLReport(report);
  writeFileSync(htmlReportPath, html);
  console.log(`🌐 HTML report saved to: ${htmlReportPath}`);

  // Print summary
  console.log('\n📈 Coverage Summary:');
  console.log(`Overall Score: ${report.overallScore.toFixed(1)}%`);
  console.log(`Targets Met: ${report.summary.metTargets}/${report.summary.totalCategories}`);
  console.log(`Targets Failed: ${report.summary.failedTargets}/${report.summary.totalCategories}`);

  // Print category details
  console.log('\n📋 Category Details:');
  report.categories.forEach((category: any) => {
    const status = category.met ? '✅' : '❌';
    console.log(
      `${status} ${category.category}: ${category.actual.toFixed(1)}% (target: ${category.target}%)`
    );
  });

  // Print recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec: string) => {
      console.log(`  • ${rec}`);
    });
  }

  // Exit with appropriate code
  const exitCode = report.summary.failedTargets > 0 ? 1 : 0;
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}
