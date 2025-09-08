#!/usr/bin/env tsx

/**
 * Type Location Validation Script
 *
 * This script validates that all interface and type definitions in the src/* directory
 * are only allowed inside the types/* directory to maintain clean separation
 * and enforce the established type organization pattern.
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface TypeViolation {
  file: string;
  line: number;
  type: 'interface' | 'type' | 'enum' | 'namespace';
  name: string;
  severity: 'error' | 'warning';
  suggestion: string;
  suggestedFile: string;
}

interface ImportViolation {
  file: string;
  line: number;
  importPath: string;
  severity: 'error' | 'warning';
  suggestion: string;
}

interface ValidationReport {
  summary: {
    totalViolations: number;
    importViolations: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    filesAnalyzed: number;
  };
  violations: TypeViolation[];
  importViolations: ImportViolation[];
  recommendations: string[];
  allowedFiles: string[];
  migrationPlan: MigrationPlan;
}

interface MigrationPlan {
  filesToCreate: string[];
  filesToUpdate: string[];
  typesToMove: Array<{
    from: string;
    to: string;
    type: string;
    name: string;
  }>;
}

class TypeLocationValidator {
  private violations: TypeViolation[] = [];
  private importViolations: ImportViolation[] = [];
  private filesAnalyzed = 0;
  private allowedFiles: string[] = [];

  async validateTypeLocations(): Promise<ValidationReport> {
    console.log('🔍 Starting type location validation...\n');

    // Get all TypeScript files in src directory and types directory
    const sourceFiles = await glob('src/**/*.{ts,tsx}');
    const typeFiles = await glob('types/**/*.{ts,tsx}');

    // Filter out allowed files (types/*)
    this.allowedFiles = typeFiles.filter(
      file => file.startsWith('types/') || file === 'types/index.ts'
    );

    // Analyze files for type violations
    await this.analyzeFiles(sourceFiles);

    return this.generateReport();
  }

  private async analyzeFiles(files: string[]): Promise<void> {
    console.log('📦 Analyzing source files for type definitions and imports...');

    for (const file of files) {
      // Skip allowed files
      if (this.allowedFiles.includes(file)) {
        continue;
      }

      try {
        const content = await fs.readFile(file, 'utf-8');
        this.filesAnalyzed++;

        this.checkForTypeViolations(content, file);
        this.checkForImportViolations(content, file);
      } catch (error) {
        console.warn(`⚠️  Could not read file ${file}:`, error);
      }
    }
  }

  private checkForTypeViolations(content: string, file: string): void {
    const lines = content.split('\n');

    // Patterns to match type definitions (not type usage)
    const patterns = [
      // Interface definitions
      {
        regex: /^\s*(export\s+)?interface\s+(\w+)/,
        type: 'interface' as const,
        severity: 'error' as const,
      },
      // Type definitions (but not type aliases that are just re-exports)
      {
        regex: /^\s*(export\s+)?type\s+(\w+)\s*=/,
        type: 'type' as const,
        severity: 'error' as const,
      },
      // Enum definitions
      {
        regex: /^\s*(export\s+)?enum\s+(\w+)/,
        type: 'enum' as const,
        severity: 'error' as const,
      },
      // Namespace declarations (often contain types)
      {
        regex: /^\s*(export\s+)?namespace\s+(\w+)/,
        type: 'namespace' as const,
        severity: 'warning' as const,
      },
    ];

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const typeName = match[2];
          const lineNumber = index + 1;

          // Skip if it's a type import or re-export
          if (this.isTypeImportOrReexport(line)) {
            continue;
          }

          // Skip if it's a type assertion or type parameter
          if (this.isTypeAssertionOrParameter(line)) {
            continue;
          }

          // Skip if it's a generic type constraint
          if (this.isGenericConstraint(line)) {
            continue;
          }

          // Skip if it's just a type usage in a type annotation
          if (this.isTypeUsageOnly(line, typeName)) {
            continue;
          }

          // Skip if it's a type alias that's just re-exporting from another file
          if (this.isTypeReexport(line, typeName)) {
            continue;
          }

          const suggestedFile = this.suggestTypeFile(typeName, file);

          this.violations.push({
            file,
            line: lineNumber,
            type: pattern.type,
            name: typeName,
            severity: pattern.severity,
            suggestion: `Move ${pattern.type} '${typeName}' to ${suggestedFile}`,
            suggestedFile,
          });
        }
      }
    });
  }

  private isTypeImportOrReexport(line: string): boolean {
    const importPatterns = [
      /import\s+.*\s+from\s+['"]/,
      /export\s+.*\s+from\s+['"]/,
      /import\s+type\s+/,
      /export\s+type\s+/,
      /import\s+{\s*type\s+/,
      /export\s+{\s*type\s+/,
    ];

    return importPatterns.some(pattern => pattern.test(line));
  }

  private isTypeAssertionOrParameter(line: string): boolean {
    const assertionPatterns = [
      /:\s*\w+(\[\])?(\s*[=,;>])/, // Type annotations
      /<\s*\w+\s*>/, // Generic type parameters
      /as\s+\w+/, // Type assertions
      /satisfies\s+\w+/, // Type satisfies
    ];

    return assertionPatterns.some(pattern => pattern.test(line));
  }

  private isGenericConstraint(line: string): boolean {
    const constraintPatterns = [
      /extends\s+\w+/, // Generic constraints
      /implements\s+\w+/, // Interface implementations
    ];

    return constraintPatterns.some(pattern => pattern.test(line));
  }

  private isTypeUsageOnly(line: string, typeName: string): boolean {
    // Check if the line only uses the type in annotations, not defines it
    const usagePatterns = [
      /:\s*\w+(\[\])?(\s*[=,;>])/, // Type annotations like: variable: TypeName
      /<\s*\w+\s*>/, // Generic type parameters
      /as\s+\w+/, // Type assertions
      /satisfies\s+\w+/, // Type satisfies
      /import\s+.*\s+from/, // Import statements
      /export\s+.*\s+from/, // Export statements
    ];

    return usagePatterns.some(pattern => pattern.test(line));
  }

  private isTypeReexport(line: string, typeName: string): boolean {
    // Check if this is just re-exporting a type from another file
    const reexportPatterns = [
      /export\s+type\s+\w+\s+from/, // export type TypeName from
      /export\s+\{\s*type\s+\w+\s*\}\s+from/, // export { type TypeName } from
      /export\s+\{\s*\w+\s*\}\s+from/, // export { TypeName } from
    ];

    return reexportPatterns.some(pattern => pattern.test(line));
  }

  private generateReport(): ValidationReport {
    // Group violations by type and severity
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const violation of this.violations) {
      byType[violation.type] = (byType[violation.type] || 0) + 1;
      bySeverity[violation.severity] = (bySeverity[violation.severity] || 0) + 1;
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Generate migration plan
    const migrationPlan = this.generateMigrationPlan();

    return {
      summary: {
        totalViolations: this.violations.length,
        importViolations: this.importViolations.length,
        byType,
        bySeverity,
        filesAnalyzed: this.filesAnalyzed,
      },
      violations: this.violations,
      importViolations: this.importViolations,
      recommendations,
      allowedFiles: this.allowedFiles,
      migrationPlan,
    };
  }

  private suggestTypeFile(typeName: string, currentFile: string): string {
    // Extract context from current file path
    const relativePath = currentFile.replace('src/', '');
    const pathParts = relativePath.split('/');

    // Determine appropriate type file based on context
    if (pathParts[0] === 'app') {
      if (pathParts[1] === 'components') {
        return `types/component.types.ts`;
      } else if (pathParts[1] === 'protected' && pathParts[2] === 'user') {
        return `types/hooks.types.ts`;
      } else {
        return `types/core.types.ts`;
      }
    } else if (pathParts[0] === 'components') {
      return `types/component.types.ts`;
    } else if (pathParts[0] === 'hooks') {
      return `types/hooks.types.ts`;
    } else if (pathParts[0] === 'lib') {
      if (pathParts[1] === 'utils') {
        return `types/utils.types.ts`;
      } else if (pathParts[1] === 'graphql') {
        return `types/graphql.types.ts`;
      } else if (pathParts[1] === 'db') {
        return `types/db.types.ts`;
      } else {
        return `types/core.types.ts`;
      }
    } else {
      return `types/${pathParts[0]}.types.ts`;
    }
  }

  private checkForImportViolations(content: string, file: string): void {
    const lines = content.split('\n');

    // Patterns to match type imports from individual type files
    const importPatterns = [
      // Import from specific type files (not from index.ts)
      {
        regex: /import\s+(?:type\s+)?{[^}]*}\s+from\s+['"]@\/types\/(?!index\.ts)([^'"]+)['"]/,
        severity: 'error' as const,
      },
      // Import from specific type files with default import
      {
        regex: /import\s+(?:type\s+)?\w+\s+from\s+['"]@\/types\/(?!index\.ts)([^'"]+)['"]/,
        severity: 'error' as const,
      },
      // Import from specific type files with namespace import
      {
        regex: /import\s+\*\s+as\s+\w+\s+from\s+['"]@\/types\/(?!index\.ts)([^'"]+)['"]/,
        severity: 'error' as const,
      },
    ];

    lines.forEach((line, index) => {
      for (const pattern of importPatterns) {
        const match = line.match(pattern.regex);
        if (match) {
          const importPath = match[1] || match[0];
          const lineNumber = index + 1;

          // Skip if it's importing from index.ts
          if (importPath.includes('index.ts')) {
            continue;
          }

          // Skip if it's importing from generated files
          if (importPath.includes('generated/')) {
            continue;
          }

          // Skip if it's importing from service files (like players.service.ts)
          if (importPath.includes('.service.')) {
            continue;
          }

          // Skip if it's importing from generated GraphQL types
          if (importPath.includes('generated/graphql')) {
            continue;
          }

          this.importViolations.push({
            file,
            line: lineNumber,
            importPath,
            severity: pattern.severity,
            suggestion: `Import types from '@/types' instead of '@/types/${importPath}'`,
          });
        }
      }
    });
  }

  private generateMigrationPlan(): MigrationPlan {
    const filesToCreate = new Set<string>();
    const filesToUpdate = new Set<string>();
    const typesToMove: Array<{
      from: string;
      to: string;
      type: string;
      name: string;
    }> = [];

    // Group violations by suggested file
    const violationsByFile = new Map<string, TypeViolation[]>();

    for (const violation of this.violations) {
      if (!violationsByFile.has(violation.suggestedFile)) {
        violationsByFile.set(violation.suggestedFile, []);
      }
      violationsByFile.get(violation.suggestedFile)!.push(violation);
    }

    // Generate migration plan
    for (const [suggestedFile, violations] of violationsByFile) {
      // Check if file exists
      const fileExists = this.allowedFiles.includes(suggestedFile);

      if (!fileExists) {
        filesToCreate.add(suggestedFile);
      } else {
        filesToUpdate.add(suggestedFile);
      }

      // Add types to move
      for (const violation of violations) {
        typesToMove.push({
          from: violation.file,
          to: suggestedFile,
          type: violation.type,
          name: violation.name,
        });
      }
    }

    return {
      filesToCreate: Array.from(filesToCreate),
      filesToUpdate: Array.from(filesToUpdate),
      typesToMove,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Count violations by type
    const typeCounts: Record<string, number> = {};
    for (const violation of this.violations) {
      typeCounts[violation.type] = (typeCounts[violation.type] || 0) + 1;
    }

    // Generate specific recommendations
    if (typeCounts.interface > 0) {
      recommendations.push(
        `🔧 ${typeCounts.interface} interface definitions found outside types/. Move them to appropriate type files.`
      );
    }

    if (typeCounts.type > 0) {
      recommendations.push(
        `🔧 ${typeCounts.type} type definitions found outside types/. Move them to appropriate type files.`
      );
    }

    if (typeCounts.enum > 0) {
      recommendations.push(
        `🔧 ${typeCounts.enum} enum definitions found outside types/. Move them to appropriate type files.`
      );
    }

    if (typeCounts.namespace > 0) {
      recommendations.push(
        `⚠️  ${typeCounts.namespace} namespace declarations found outside types/. Consider moving type-related namespaces.`
      );
    }

    // Import violation recommendations
    if (this.importViolations.length > 0) {
      recommendations.push(
        `🔧 ${this.importViolations.length} import violations found. Import types only from '@/types' (index.ts).`
      );
    }

    // General recommendations
    recommendations.push(
      '📋 Type organization guidelines:',
      '  • All interfaces should be in types/',
      '  • All type definitions should be in types/',
      '  • All enums should be in types/',
      '  • Import types only from @/types (index.ts)',
      '  • Use index.ts files to re-export types',
      '  • Group related types in separate files',
      '  • Use descriptive file names for type files'
    );

    return recommendations;
  }

  printReport(report: ValidationReport): void {
    console.log('\n📊 Type Location Validation Report');
    console.log('='.repeat(50));

    // Summary
    console.log('\n📈 Summary:');
    console.log(`  Files analyzed: ${report.summary.filesAnalyzed}`);
    console.log(`  Total violations: ${report.summary.totalViolations}`);
    console.log(`  Import violations: ${report.summary.importViolations}`);
    console.log(`  Allowed type files: ${report.allowedFiles.length}`);

    // Violations by type
    if (Object.keys(report.summary.byType).length > 0) {
      console.log('\n📋 Violations by Type:');
      Object.entries(report.summary.byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }

    // Violations by severity
    if (Object.keys(report.summary.bySeverity).length > 0) {
      console.log('\n⚠️  Violations by Severity:');
      Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`);
      });
    }

    // Allowed files
    console.log('\n✅ Allowed Type Files:');
    report.allowedFiles.forEach(file => {
      console.log(`  ${file}`);
    });

    // Error violations with suggestions
    const errorViolations = report.violations.filter(v => v.severity === 'error');
    if (errorViolations.length > 0) {
      console.log('\n🚨 Error Violations (Must Fix):');
      errorViolations.slice(0, 10).forEach(violation => {
        console.log(
          `  ${violation.file}:${violation.line} - ${violation.type} '${violation.name}'`
        );
        console.log(`    → Move to: ${violation.suggestedFile}`);
      });
      if (errorViolations.length > 10) {
        console.log(`  ... and ${errorViolations.length - 10} more`);
      }
    }

    // Warning violations
    const warningViolations = report.violations.filter(v => v.severity === 'warning');
    if (warningViolations.length > 0) {
      console.log('\n⚠️  Warning Violations (Consider Fixing):');
      warningViolations.slice(0, 5).forEach(violation => {
        console.log(
          `  ${violation.file}:${violation.line} - ${violation.type} '${violation.name}'`
        );
      });
      if (warningViolations.length > 5) {
        console.log(`  ... and ${warningViolations.length - 5} more`);
      }
    }

    // Import violations
    if (report.importViolations.length > 0) {
      console.log('\n🚨 Import Violations (Must Fix):');
      report.importViolations.slice(0, 10).forEach(violation => {
        console.log(
          `  ${violation.file}:${violation.line} - Import from '${violation.importPath}'`
        );
        console.log(`    → ${violation.suggestion}`);
      });
      if (report.importViolations.length > 10) {
        console.log(`  ... and ${report.importViolations.length - 10} more`);
      }
    }

    // Migration plan
    this.printMigrationPlan(report.migrationPlan);

    // Recommendations
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(recommendation => {
      console.log(`  ${recommendation}`);
    });

    console.log('\n' + '='.repeat(50));
  }

  private printMigrationPlan(plan: MigrationPlan): void {
    console.log('\n🚀 Migration Plan:');

    if (plan.filesToCreate.length > 0) {
      console.log('\n📁 Files to Create:');
      plan.filesToCreate.forEach(file => {
        console.log(`  ${file}`);
      });
    }

    if (plan.filesToUpdate.length > 0) {
      console.log('\n📝 Files to Update:');
      plan.filesToUpdate.forEach(file => {
        console.log(`  ${file}`);
      });
    }

    console.log('\n🔄 Types to Move:');
    plan.typesToMove.slice(0, 10).forEach(({ from, to, type, name }) => {
      console.log(`  ${type} '${name}' from ${from} → ${to}`);
    });
    if (plan.typesToMove.length > 10) {
      console.log(`  ... and ${plan.typesToMove.length - 10} more`);
    }

    console.log('\n📋 Migration Steps:');
    console.log("  1. Create the suggested type files (if they don't exist)");
    console.log('  2. Move type definitions to the appropriate files');
    console.log('  3. Update imports in affected files');
    console.log('  4. Update types/index.ts to re-export new types');
    console.log('  5. Run this validation script again to verify');
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const validator = new TypeLocationValidator();
    const report = await validator.validateTypeLocations();
    validator.printReport(report);

    // Exit with error code if there are error violations or import violations
    const errorViolations = report.violations.filter(v => v.severity === 'error');
    if (errorViolations.length > 0 || report.importViolations.length > 0) {
      console.log('\n❌ Type location or import violations found. Please fix the issues above.');
      process.exit(1);
    }

    console.log('\n✅ Type location validation completed successfully.');
  } catch (error) {
    console.error('❌ Error during type location validation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
