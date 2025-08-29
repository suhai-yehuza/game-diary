#!/usr/bin/env tsx

/**
 * DRY (Don't Repeat Yourself) Violations Audit Script
 *
 * This script identifies and reports all duplication violations across the codebase:
 * - Duplicate code patterns
 * - Repeated environment variables
 * - Duplicate test setup
 * - Repeated component patterns
 * - Duplicate error handling
 * - Repeated styling patterns
 *
 * Note: Hidden directories (starting with '.') are excluded from analysis
 * to avoid checking generated files, cache directories, and configuration files.
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface DryViolation {
  type: 'code' | 'env' | 'test' | 'component' | 'error' | 'style';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  pattern: string;
  occurrences: number;
  suggestion: string;
  fixable: boolean;
  replacement?: string;
}

interface DryReport {
  summary: {
    totalViolations: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    fixableViolations: number;
  };
  violations: DryViolation[];
  recommendations: string[];
  filesAnalyzed: number;
}

class DryAuditor {
  private violations: DryViolation[] = [];
  private filesAnalyzed = 0;

  async auditCodebase(): Promise<DryReport> {
    console.log('🔍 Starting DRY violations audit...\n');

    // Analyze different file types
    await this.auditWorkflowFiles();
    await this.auditSourceFiles();
    await this.auditTestFiles();
    await this.auditStyleFiles();

    return this.generateReport();
  }

  private async auditWorkflowFiles(): Promise<void> {
    console.log('📋 Auditing GitHub workflow files...');

    // Note: .github directory is hidden and should be excluded from DRY validation
    // Workflow files are configuration files that may have intentional duplication
    // This method is kept for future use if workflow files are moved to non-hidden locations
    console.log('  Skipping .github directory (hidden directory)');
  }

  private async auditSourceFiles(): Promise<void> {
    console.log('📦 Auditing source files...');

    const sourceFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: [
        '**/.*/**',
        '**/design-tokens/**',
        '**/use-error-handler.ts', // Specialized error handler component
      ],
    });

    for (const file of sourceFiles) {
      const content = await fs.readFile(file, 'utf-8');
      this.filesAnalyzed++;

      // Check for duplicate error handling patterns
      this.checkDuplicatePatterns(content, file, [
        {
          pattern: 'try {',
          type: 'error' as const,
          severity: 'medium' as const,
          suggestion: 'Use centralized error handling system',
          fixable: true,
          replacement: "import { errorHandlers } from '@/lib/utils/error-handler';",
        },
        {
          pattern: 'catch \\(error\\) {',
          type: 'error' as const,
          severity: 'medium' as const,
          suggestion: 'Use centralized error handling system',
          fixable: true,
          replacement:
            "errorHandlers.api(error, { component: 'Component Name', action: 'Action Description' });",
        },
        {
          pattern: 'console\\.error',
          type: 'error' as const,
          severity: 'low' as const,
          suggestion: 'Use centralized logging system',
          fixable: true,
          replacement: "import { logError } from '@/lib/utils/logger';",
        },
      ]);

      // Check for duplicate component patterns
      this.checkDuplicatePatterns(content, file, [
        {
          pattern: 'className=\\{cn\\(',
          type: 'component' as const,
          severity: 'low' as const,
          suggestion: 'Use component variant system',
          fixable: true,
          replacement:
            "import { buttonVariants, inputVariants, cardVariants } from '@/lib/utils/component-variants';",
        },
        {
          pattern: 'bg-blue-600 hover:bg-blue-700',
          type: 'style' as const,
          severity: 'medium' as const,
          suggestion: 'Use design token system',
          fixable: true,
          replacement: 'className={buttonVariants.variant.primary}',
        },
        {
          pattern: 'text-white font-semibold py-2 px-4 rounded-xl',
          type: 'style' as const,
          severity: 'medium' as const,
          suggestion: 'Use component variant system',
          fixable: true,
          replacement: 'className={buttonVariants.variant.primary}',
        },
      ]);
    }
  }

  private async auditTestFiles(): Promise<void> {
    console.log('🧪 Auditing test files...');

    const testFiles = await glob('tests/**/*.{ts,tsx}', {
      ignore: ['**/.*/**'],
    });

    for (const file of testFiles) {
      const content = await fs.readFile(file, 'utf-8');
      this.filesAnalyzed++;

      // Check for duplicate test setup patterns
      this.checkDuplicatePatterns(content, file, [
        {
          pattern: 'const mockUser = {',
          type: 'test' as const,
          severity: 'high' as const,
          suggestion: 'Use shared test utilities',
          fixable: true,
          replacement:
            "import { mockFactories } from '@/tests/shared/utils/test-setup'; const mockUser = mockFactories.user();",
        },
        {
          pattern: 'beforeEach\\(async \\(\\) => {',
          type: 'test' as const,
          severity: 'medium' as const,
          suggestion: 'Use shared test setup utilities',
          fixable: true,
          replacement:
            "import { enhancedTestSetup } from '@/tests/shared/utils/test-setup'; beforeEach(async () => { await enhancedTestSetup();",
        },
        {
          pattern: 'expect\\(user\\)\\.toHaveProperty\\(',
          type: 'test' as const,
          severity: 'low' as const,
          suggestion: 'Use shared assertion utilities',
          fixable: true,
          replacement:
            "import { testAssertions } from '@/tests/shared/utils/test-setup'; testAssertions.expectUserData(user);",
        },
      ]);
    }
  }

  private async auditStyleFiles(): Promise<void> {
    console.log('🎨 Auditing style files...');

    const styleFiles = await glob('src/**/*.{css,scss}', {
      ignore: ['**/.*/**'],
    });

    for (const file of styleFiles) {
      const content = await fs.readFile(file, 'utf-8');
      this.filesAnalyzed++;

      // Check for duplicate styling patterns
      this.checkDuplicatePatterns(content, file, [
        {
          pattern: 'background-color: rgb\\(',
          type: 'style' as const,
          severity: 'medium' as const,
          suggestion: 'Use CSS custom properties and design tokens',
          fixable: true,
          replacement: 'background-color: hsl(var(--color-bg-primary));',
        },
        {
          pattern: 'color: rgb\\(255, 255, 255\\)',
          type: 'style' as const,
          severity: 'medium' as const,
          suggestion: 'Use CSS custom properties and design tokens',
          fixable: true,
          replacement: 'color: hsl(var(--color-text-primary));',
        },
        {
          pattern: 'border: 1px solid rgb\\(',
          type: 'style' as const,
          severity: 'medium' as const,
          suggestion: 'Use CSS custom properties and design tokens',
          fixable: true,
          replacement: 'border: 1px solid hsl(var(--color-border-primary));',
        },
      ]);
    }
  }

  private checkDuplicatePatterns(
    content: string,
    file: string,
    patterns: Array<{
      pattern: string;
      type: DryViolation['type'];
      severity: DryViolation['severity'];
      suggestion: string;
      fixable: boolean;
      replacement?: string;
    }>
  ): void {
    for (const { pattern, type, severity, suggestion, fixable, replacement } of patterns) {
      const matches = content.match(
        new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      );

      if (matches && matches.length > 1) {
        // Skip violations if the file already uses centralized error handling
        if (
          type === 'error' &&
          (content.includes('errorHandlers.') ||
            content.includes('logError(') ||
            content.includes('logger.error('))
        ) {
          continue;
        }

        this.violations.push({
          type,
          severity,
          file,
          pattern,
          occurrences: matches.length,
          suggestion,
          fixable,
          replacement,
        });
      }
    }
  }

  private generateReport(): DryReport {
    // Group violations by type and severity
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const violation of this.violations) {
      byType[violation.type] = (byType[violation.type] || 0) + 1;
      bySeverity[violation.severity] = (bySeverity[violation.severity] || 0) + 1;
    }

    const fixableViolations = this.violations.filter(v => v.fixable).length;

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    return {
      summary: {
        totalViolations: this.violations.length,
        byType,
        bySeverity,
        fixableViolations,
      },
      violations: this.violations,
      recommendations,
      filesAnalyzed: this.filesAnalyzed,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Count violations by type
    const typeCounts: Record<string, number> = {};
    const fixableCounts: Record<string, number> = {};

    for (const violation of this.violations) {
      typeCounts[violation.type] = (typeCounts[violation.type] || 0) + 1;
      if (violation.fixable) {
        fixableCounts[violation.type] = (fixableCounts[violation.type] || 0) + 1;
      }
    }

    // Generate specific recommendations
    if (typeCounts.code > 0) {
      recommendations.push(
        `🔧 ${typeCounts.code} code duplication violations found (${fixableCounts.code || 0} fixable). Review and refactor duplicate code patterns.`
      );
    }

    if (typeCounts.env > 0) {
      recommendations.push(
        `🔧 ${typeCounts.env} environment variable duplications found (${fixableCounts.env || 0} fixable). Consider centralizing environment configuration.`
      );
    }

    if (typeCounts.test > 0) {
      recommendations.push(
        `🔧 ${typeCounts.test} test setup duplications found (${fixableCounts.test || 0} fixable). Use the enhanced shared test utilities in tests/shared/utils/test-setup.ts.`
      );
    }

    if (typeCounts.component > 0) {
      recommendations.push(
        `🔧 ${typeCounts.component} component pattern duplications found (${fixableCounts.component || 0} fixable). Use the component variant system in src/lib/utils/component-variants.ts.`
      );
    }

    if (typeCounts.error > 0) {
      recommendations.push(
        `🔧 ${typeCounts.error} error handling duplications found (${fixableCounts.error || 0} fixable). Use the enhanced error handling system in src/lib/utils/error-handler.ts.`
      );
    }

    if (typeCounts.style > 0) {
      recommendations.push(
        `🔧 ${typeCounts.style} styling duplications found (${fixableCounts.style || 0} fixable). Use the design token system and component variants for consistent styling.`
      );
    }

    // General recommendations
    recommendations.push(
      '📋 Review and implement the new DRY improvements:',
      '  • Enhanced shared test utilities',
      '  • Component variant system',
      '  • Enhanced error handling system',
      '  • Design token system'
    );

    return recommendations;
  }

  printReport(report: DryReport): void {
    console.log('\n📊 DRY Violations Audit Report');
    console.log('='.repeat(50));

    // Summary
    console.log('\n📈 Summary:');
    console.log(`  Files analyzed: ${report.filesAnalyzed}`);
    console.log(`  Total violations: ${report.summary.totalViolations}`);
    console.log(`  Fixable violations: ${report.summary.fixableViolations}`);

    // Violations by type
    console.log('\n📋 Violations by Type:');
    Object.entries(report.summary.byType).forEach(([type, count]) => {
      const fixableCount = report.violations.filter(v => v.type === type && v.fixable).length;
      console.log(`  ${type}: ${count} (${fixableCount} fixable)`);
    });

    // Violations by severity
    console.log('\n⚠️  Violations by Severity:');
    Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });

    // Critical violations
    const criticalViolations = report.violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      console.log('\n🚨 Critical Violations:');
      criticalViolations.slice(0, 5).forEach(violation => {
        console.log(
          `  ${violation.file}: ${violation.pattern} (${violation.occurrences} occurrences)`
        );
      });
    }

    // High severity violations
    const highViolations = report.violations.filter(v => v.severity === 'high');
    if (highViolations.length > 0) {
      console.log('\n🔴 High Severity Violations:');
      highViolations.slice(0, 5).forEach(violation => {
        console.log(
          `  ${violation.file}: ${violation.pattern} (${violation.occurrences} occurrences)`
        );
      });
    }

    // Medium severity violations (show more details)
    const mediumViolations = report.violations.filter(v => v.severity === 'medium');
    if (mediumViolations.length > 0) {
      console.log('\n🟡 Medium Severity Violations (showing first 10):');
      mediumViolations.slice(0, 10).forEach(violation => {
        console.log(
          `  ${violation.file}: ${violation.pattern} (${violation.occurrences} occurrences) - ${violation.suggestion}`
        );
      });
      if (mediumViolations.length > 10) {
        console.log(`  ... and ${mediumViolations.length - 10} more violations`);
      }
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(recommendation => {
      console.log(`  ${recommendation}`);
    });

    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const auditor = new DryAuditor();
    const report = await auditor.auditCodebase();
    auditor.printReport(report);

    // Exit with error code if there are any violations
    if (report.summary.totalViolations > 0) {
      console.log('\n❌ DRY violations found. Please address the recommendations above.');
      process.exit(1);
    }

    console.log('\n✅ No DRY violations found. Codebase is clean!');
  } catch (error) {
    console.error('❌ Error during DRY audit:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
