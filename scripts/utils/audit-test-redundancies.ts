#!/usr/bin/env tsx

/**
 * Test Redundancy Auditor
 *
 * This script analyzes test files to identify potential redundancies between
 * unit, integration, and E2E tests. It helps maintain clear test boundaries
 * and reduce duplication.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface TestFile {
  path: string;
  type: 'unit' | 'integration' | 'e2e';
  content: string;
  testCases: string[];
  imports: string[];
  mocks: string[];
}

interface RedundancyReport {
  duplicateTestCases: Array<{
    testCase: string;
    files: string[];
  }>;
  duplicateMocks: Array<{
    mock: string;
    files: string[];
  }>;
  boundaryViolations: Array<{
    file: string;
    type: 'unit' | 'integration' | 'e2e';
    violation: string;
  }>;
  recommendations: string[];
}

class TestRedundancyAuditor {
  private testFiles: TestFile[] = [];
  private report: RedundancyReport = {
    duplicateTestCases: [],
    duplicateMocks: [],
    boundaryViolations: [],
    recommendations: [],
  };

  async analyzeTests(): Promise<RedundancyReport> {
    console.log('🔍 Analyzing test files for redundancies...\n');

    // Find all test files
    await this.findTestFiles();

    // Analyze each test file
    await this.analyzeTestFiles();

    // Identify redundancies
    this.identifyDuplicateTestCases();
    this.identifyDuplicateMocks();

    // Generate recommendations
    this.generateRecommendations();

    return this.report;
  }

  private async findTestFiles(): Promise<void> {
    const testPatterns = [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx',
      'tests/integration/**/*.test.ts',
      'tests/e2e/**/*.spec.ts',
    ];

    for (const pattern of testPatterns) {
      const files = await glob(pattern);

      for (const file of files) {
        const type = this.getTestType(file);
        const content = fs.readFileSync(file, 'utf-8');

        this.testFiles.push({
          path: file,
          type,
          content,
          testCases: this.extractTestCases(content),
          imports: this.extractImports(content),
          mocks: this.extractMocks(content),
        });
      }
    }

    console.log(`📁 Found ${this.testFiles.length} test files:`);
    console.log(`   Unit: ${this.testFiles.filter(f => f.type === 'unit').length}`);
    console.log(`   Integration: ${this.testFiles.filter(f => f.type === 'integration').length}`);
    console.log(`   E2E: ${this.testFiles.filter(f => f.type === 'e2e').length}\n`);
  }

  private getTestType(filePath: string): 'unit' | 'integration' | 'e2e' {
    if (filePath.includes('/unit/')) return 'unit';
    if (filePath.includes('/integration/')) return 'integration';
    if (filePath.includes('/e2e/')) return 'e2e';
    return 'unit'; // Default fallback
  }

  private extractTestCases(content: string): string[] {
    const testCases: string[] = [];

    // Match various test patterns
    const patterns = [
      /(?:test|it|describe)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /(?:test|it|describe)\s*\(\s*`([^`]+)`/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        testCases.push(match[1].toLowerCase().trim());
      }
    }

    return testCases;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importPattern = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;

    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private extractMocks(content: string): string[] {
    const mocks: string[] = [];

    // Match mock patterns
    const patterns = [/const\s+(\w+)\s*=\s*\{[^}]*\}/g, /mock\w+/g, /createMock\w+/g];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        mocks.push(match[0]);
      }
    }

    return mocks;
  }

  private async analyzeTestFiles(): Promise<void> {
    console.log('🔍 Analyzing test content...');

    for (const file of this.testFiles) {
      // Check for boundary violations
      this.checkBoundaryViolations(file);
    }
  }

  private checkBoundaryViolations(file: TestFile): void {
    const violations: string[] = [];

    // Unit tests should not make real HTTP requests
    if (file.type === 'unit') {
      if (file.content.includes('fetch(') && !file.content.includes('vi.fn()')) {
        violations.push('Unit test making real HTTP requests');
      }
      if (file.content.includes('process.env.DATABASE_URL')) {
        violations.push('Unit test connecting to real database');
      }
    }

    // Integration tests should not test individual function logic
    if (file.type === 'integration') {
      if (file.content.includes('formatDuration(') || file.content.includes('createMockUser(')) {
        violations.push('Integration test testing utility functions');
      }
    }

    // E2E tests should not test API endpoints directly
    if (file.type === 'e2e') {
      if (
        file.content.includes('page.request.get(') ||
        file.content.includes('page.request.post(')
      ) {
        violations.push('E2E test testing API endpoints directly');
      }
    }

    if (violations.length > 0) {
      this.report.boundaryViolations.push({
        file: file.path,
        type: file.type,
        violation: violations.join(', '),
      });
    }
  }

  private identifyDuplicateTestCases(): void {
    const testCaseMap = new Map<string, string[]>();

    for (const file of this.testFiles) {
      for (const testCase of file.testCases) {
        if (!testCaseMap.has(testCase)) {
          testCaseMap.set(testCase, []);
        }
        testCaseMap.get(testCase)!.push(file.path);
      }
    }

    for (const [testCase, files] of testCaseMap.entries()) {
      if (files.length > 1) {
        this.report.duplicateTestCases.push({
          testCase,
          files,
        });
      }
    }
  }

  private identifyDuplicateMocks(): void {
    const mockMap = new Map<string, string[]>();

    for (const file of this.testFiles) {
      for (const mock of file.mocks) {
        if (!mockMap.has(mock)) {
          mockMap.set(mock, []);
        }
        mockMap.get(mock)!.push(file.path);
      }
    }

    for (const [mock, files] of mockMap.entries()) {
      if (files.length > 1) {
        this.report.duplicateMocks.push({
          mock,
          files,
        });
      }
    }
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];

    if (this.report.duplicateTestCases.length > 0) {
      recommendations.push(
        `Consider consolidating ${this.report.duplicateTestCases.length} duplicate test cases into shared utilities`
      );
    }

    if (this.report.duplicateMocks.length > 0) {
      recommendations.push(
        `Move ${this.report.duplicateMocks.length} duplicate mocks to tests/shared/mocks/`
      );
    }

    if (this.report.boundaryViolations.length > 0) {
      recommendations.push(`Fix ${this.report.boundaryViolations.length} test boundary violations`);
    }

    recommendations.push('Use shared utilities from tests/shared/ to reduce duplication');
    recommendations.push('Follow test boundaries defined in tests/TEST_BOUNDARIES.md');

    this.report.recommendations = recommendations;
  }

  printReport(): void {
    console.log('📊 Test Redundancy Analysis Report\n');
    console.log('='.repeat(50));

    // Boundary violations
    if (this.report.boundaryViolations.length > 0) {
      console.log('\n🚨 Test Boundary Violations:');
      for (const violation of this.report.boundaryViolations) {
        console.log(`   ${violation.file} (${violation.type}): ${violation.violation}`);
      }
    }

    // Duplicate test cases
    if (this.report.duplicateTestCases.length > 0) {
      console.log('\n🔄 Duplicate Test Cases:');
      for (const duplicate of this.report.duplicateTestCases.slice(0, 5)) {
        // Show first 5
        console.log(`   "${duplicate.testCase}" found in:`);
        for (const file of duplicate.files) {
          console.log(`     - ${file}`);
        }
      }
      if (this.report.duplicateTestCases.length > 5) {
        console.log(`   ... and ${this.report.duplicateTestCases.length - 5} more`);
      }
    }

    // Duplicate mocks
    if (this.report.duplicateMocks.length > 0) {
      console.log('\n🔄 Duplicate Mocks:');
      for (const duplicate of this.report.duplicateMocks.slice(0, 5)) {
        // Show first 5
        console.log(`   "${duplicate.mock}" found in:`);
        for (const file of duplicate.files) {
          console.log(`     - ${file}`);
        }
      }
      if (this.report.duplicateMocks.length > 5) {
        console.log(`   ... and ${this.report.duplicateMocks.length - 5} more`);
      }
    }

    // Recommendations
    if (this.report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const recommendation of this.report.recommendations) {
        console.log(`   • ${recommendation}`);
      }
    }

    // Summary
    console.log('\n📈 Summary:');
    console.log(`   Boundary violations: ${this.report.boundaryViolations.length}`);
    console.log(`   Duplicate test cases: ${this.report.duplicateTestCases.length}`);
    console.log(`   Duplicate mocks: ${this.report.duplicateMocks.length}`);
    console.log(`   Total recommendations: ${this.report.recommendations.length}`);

    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main() {
  const auditor = new TestRedundancyAuditor();
  const report = await auditor.analyzeTests();
  auditor.printReport();

  // Exit with error code if there are boundary violations
  if (report.boundaryViolations.length > 0) {
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
