#!/usr/bin/env tsx

/**
 * @fileoverview Comprehensive TypeScript type validation system.
 *
 * This script validates that all TypeScript interfaces and types are properly
 * located in the src/lib/types directory and imported from src/lib/types/index.ts
 * where possible. It combines file system scanning with grep-based detection
 * for comprehensive coverage.
 *
 * Run with: pnpm validate:types or tsx scripts/utils/validate-types.ts
 *
 * Options:
 *   --include-tests    Include test files in validation
 *   --help            Show this help message
 */

import { execSync } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';

import { logger } from '@/lib/utils/logger';

interface ITypeLocation {
  file: string;
  line: number;
  name: string;
  type: 'interface' | 'type';
  content: string;
}

interface IImportViolation {
  file: string;
  line: number;
  importPath: string;
  suggestedPath: string;
  typeName: string;
}

interface IValidationResult {
  isValid: boolean;
  violations: ITypeLocation[];
  importViolations: IImportViolation[];
  summary: {
    totalViolations: number;
    interfaces: number;
    types: number;
    files: Set<string>;
    importViolations: number;
  };
}

class TypeValidator {
  private readonly allowedDirectories = [
    'src/lib/types',
    'src/lib/types/generated', // Allow generated types
  ];

  private readonly ignoredDirectories = [
    'node_modules',
    '.next',
    'dist',
    'coverage',
    'tests-results',
    'playwright-report',
    '.nyc_output',
    'drizzle',
    'logs',
    'keys',
    'build',
    'scripts',
  ];

  private readonly ignoredFiles = [
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
    '*.spec.tsx',
    '*.d.ts',
    '*.config.ts',
    '*.config.js',
    'next.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'eslint.config.js',
    'vitest.config.ts',
    'playwright.config.ts',
    'drizzle.config.ts',
    'codegen.ts',
  ];

  private readonly interfaceRegex = /^(export\s+)?interface\s+([A-Z][a-zA-Z0-9_]*)/gm;
  private readonly typeRegex = /^(export\s+)?type\s+([A-Z][a-zA-Z0-9_]*)/gm;
  private readonly importRegex = /import\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g;
  private readonly singleImportRegex =
    /import\s+(?:type\s+)?([A-Z][a-zA-Z0-9_]*)\s+from\s+['"]([^'"]+)['"]/g;

  constructor(private includeTests: boolean = false) {}

  /**
   * Check if a directory should be ignored
   */
  private shouldIgnoreDirectory(dirName: string): boolean {
    return this.ignoredDirectories.some(ignored => dirName.includes(ignored));
  }

  /**
   * Check if a file should be ignored
   */
  private shouldIgnoreFile(fileName: string): boolean {
    // Check for TypeScript files
    if (!['.ts', '.tsx'].includes(extname(fileName))) {
      return true;
    }

    // Check for ignored file patterns
    return this.ignoredFiles.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(fileName);
      }
      return fileName === pattern;
    });
  }

  /**
   * Check if a file is in an allowed directory
   */
  private isInAllowedDirectory(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return this.allowedDirectories.some(allowed =>
      normalizedPath.includes(allowed.replace(/\\/g, '/'))
    );
  }

  /**
   * Extract interfaces and types from a file using regex
   */
  private extractTypesFromFile(filePath: string, content: string): ITypeLocation[] {
    const violations: ITypeLocation[] = [];
    const lines = content.split('\n');

    // Find interfaces
    let match;
    this.interfaceRegex.lastIndex = 0; // Reset regex state
    while ((match = this.interfaceRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const interfaceName = match[2];

      violations.push({
        file: filePath,
        line: lineNumber,
        name: interfaceName,
        type: 'interface',
        content: lines[lineNumber - 1]?.trim() || '',
      });
    }

    // Find types
    this.typeRegex.lastIndex = 0; // Reset regex state
    while ((match = this.typeRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const typeName = match[2];

      violations.push({
        file: filePath,
        line: lineNumber,
        name: typeName,
        type: 'type',
        content: lines[lineNumber - 1]?.trim() || '',
      });
    }

    return violations;
  }

  /**
   * Extract import violations from a file
   */
  private extractImportViolations(filePath: string, content: string): IImportViolation[] {
    const violations: IImportViolation[] = [];
    const lines = content.split('\n');

    // Check for imports from specific type files that should use the index
    const typeFileImports = [
      /from\s+['"]@\/lib\/types\/([^'"]+)['"]/g,
      /from\s+['"]\.\.?\/lib\/types\/([^'"]+)['"]/g,
      /from\s+['"]\.\.?\/\.\.?\/lib\/types\/([^'"]+)['"]/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip if this is a re-export from index.ts
      if (line.includes("from '@/lib/types'") || line.includes("from '@/lib/types/index'")) {
        continue;
      }

      // Check for imports from specific type files
      for (const regex of typeFileImports) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line)) !== null) {
          const importPath = match[0];
          const typeFileName = match[1];

          // Skip if it's already importing from index or if it's a generated file
          if (typeFileName === 'index' || typeFileName.startsWith('generated/')) {
            continue;
          }

          // Extract type names from the import
          const typeNamesMatch = line.match(/\{([^}]+)\}/);
          if (typeNamesMatch) {
            const typeNames = typeNamesMatch[1].split(',').map(t => t.trim());

            for (const typeName of typeNames) {
              violations.push({
                file: filePath,
                line: i + 1,
                importPath: importPath,
                suggestedPath: "from '@/lib/types'",
                typeName: typeName,
              });
            }
          }
        }
      }
    }

    return violations;
  }

  /**
   * Find type definitions using grep (faster for large codebases)
   */
  private findTypeDefinitionsWithGrep(): string[] {
    try {
      // Build exclude directories for grep
      const excludeDirs = [
        'node_modules',
        '.next',
        'dist',
        'build',
        'scripts',
        'coverage',
        'tests-results',
        'playwright-report',
        '.nyc_output',
        'drizzle',
        'logs',
        'keys',
      ];

      // Add test directories if not including tests
      if (!this.includeTests) {
        excludeDirs.push('tests');
      }

      const excludeArgs = excludeDirs.map(dir => `--exclude-dir=${dir}`).join(' ');

      // Search for type and interface definitions, excluding irrelevant directories and Zod types
      const grepCommand = `grep -rn ${excludeArgs} --include="*.ts" --include="*.tsx" -E "^(export )?(type|interface) " . | grep -v "z.infer<"`;
      const output = execSync(grepCommand, { encoding: 'utf-8' });

      return output
        .split('\n')
        .filter(Boolean)
        .filter(line => {
          // Filter out re-exports (export type { ... } from './...')
          const parts = line.split(':');
          if (parts.length >= 3) {
            const typeDefinition = parts.slice(2).join(':').trim();
            // Handle both single-line and multi-line re-exports
            const isReExport =
              (typeDefinition.includes('from ') && typeDefinition.includes('{')) ||
              typeDefinition.match(/^export\s+type\s+\{\s*$/) ||
              typeDefinition.match(/^export\s+type\s+\{[^}]*$/);
            return !isReExport;
          }
          return true;
        });
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 1) {
        // grep returns 1 when no matches are found, which is fine
        return [];
      }
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.warn('Error searching for type definitions with grep:', errorObj);
      return [];
    }
  }

  /**
   * Find import violations using grep
   */
  private findImportViolationsWithGrep(): string[] {
    try {
      const excludeDirs = [
        'node_modules',
        '.next',
        'dist',
        'build',
        'scripts',
        'coverage',
        'tests-results',
        'playwright-report',
        '.nyc_output',
        'drizzle',
        'logs',
        'keys',
        'src/lib/types', // Exclude the types directory itself
      ];

      if (!this.includeTests) {
        excludeDirs.push('tests');
      }

      const excludeArgs = excludeDirs.map(dir => `--exclude-dir=${dir}`).join(' ');

      // Search for imports from specific type files using a simpler pattern
      const grepCommand = `grep -rn ${excludeArgs} --include="*.ts" --include="*.tsx" "from.*@/lib/types/" .`;
      const output = execSync(grepCommand, { encoding: 'utf-8' });

      return output
        .split('\n')
        .filter(Boolean)
        .filter(line => {
          // Exclude imports from index.ts
          return (
            !line.includes("from '@/lib/types'") &&
            !line.includes("from '@/lib/types/index'") &&
            !line.includes('from "@/lib/types"') &&
            !line.includes('from "@/lib/types/index"')
          );
        });
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 1) {
        return [];
      }
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.warn('Error searching for import violations with grep:', errorObj);
      return [];
    }
  }

  /**
   * Convert grep output to TypeLocation objects
   */
  private parseGrepOutput(grepLines: string[]): ITypeLocation[] {
    const violations: ITypeLocation[] = [];

    for (const line of grepLines) {
      const parts = line.split(':');
      if (parts.length < 3) continue;

      const filePath = parts[0];
      const lineNumberStr = parts[1];
      const lineNumber = parseInt(lineNumberStr, 10);
      const content = parts.slice(2).join(':').trim();

      if (isNaN(lineNumber)) continue;

      // Skip if file is in excluded directories
      if (this.ignoredDirectories.some(dir => filePath.startsWith(dir))) {
        continue;
      }

      // Skip test files if not including tests
      if (!this.includeTests && (filePath.includes('/tests/') || filePath.includes('tests/'))) {
        continue;
      }

      // Remove ./ from the start of the path if present
      const normalizedPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;

      // Check if file is in allowed directories
      if (!this.isInAllowedDirectory(normalizedPath)) {
        // Determine if it's an interface or type
        const isInterface = content.includes('interface ');
        const isType = content.includes('type ');

        if (isInterface || isType) {
          const nameMatch = content.match(
            /(?:export\s+)?(?:interface|type)\s+([A-Z][a-zA-Z0-9_]*)/
          );
          const name = nameMatch ? nameMatch[1] : 'Unknown';

          violations.push({
            file: normalizedPath,
            line: lineNumber,
            name,
            type: isInterface ? 'interface' : 'type',
            content: content.trim(),
          });
        }
      }
    }

    return violations;
  }

  /**
   * Parse import violations from grep output
   */
  private parseImportViolations(grepLines: string[]): IImportViolation[] {
    const violations: IImportViolation[] = [];

    for (const line of grepLines) {
      const parts = line.split(':');
      if (parts.length < 3) continue;

      const filePath = parts[0];
      const lineNumberStr = parts[1];
      const lineNumber = parseInt(lineNumberStr, 10);
      const content = parts.slice(2).join(':').trim();

      if (isNaN(lineNumber)) continue;

      // Skip if file is in excluded directories
      if (this.ignoredDirectories.some(dir => filePath.startsWith(dir))) {
        continue;
      }

      // Skip test files if not including tests
      if (!this.includeTests && (filePath.includes('/tests/') || filePath.includes('tests/'))) {
        continue;
      }

      // Remove ./ from the start of the path if present
      const normalizedPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;

      // Extract the import path and type names
      const importMatch = content.match(/from\s+['"]([^'"]+)['"]/);
      const typeNamesMatch = content.match(/\{([^}]+)\}/);

      if (importMatch && typeNamesMatch) {
        const importPath = importMatch[1];
        const typeNames = typeNamesMatch[1].split(',').map(t => t.trim());

        for (const typeName of typeNames) {
          violations.push({
            file: normalizedPath,
            line: lineNumber,
            importPath: `from '${importPath}'`,
            suggestedPath: "from '@/lib/types'",
            typeName: typeName,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  private async scanDirectory(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!this.shouldIgnoreDirectory(entry.name)) {
            files.push(...(await this.scanDirectory(fullPath)));
          }
        } else if (entry.isFile() && !this.shouldIgnoreFile(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.warn(`Could not read directory ${dirPath}:`, errorObj);
    }

    return files;
  }

  /**
   * Validate types using file system scanning
   */
  async validateWithFileScan(): Promise<IValidationResult> {
    logger.info('🔍 Starting TypeScript type/interface location validation (file scan)...');

    const violations: ITypeLocation[] = [];
    const importViolations: IImportViolation[] = [];
    const files = await this.scanDirectory('src');

    logger.info(`📁 Scanning ${files.length} TypeScript files...`);

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const fileViolations = this.extractTypesFromFile(file, content);
        const fileImportViolations = this.extractImportViolations(file, content);

        // Filter out violations that are in allowed directories
        const actualViolations = fileViolations.filter(
          violation => !this.isInAllowedDirectory(violation.file)
        );

        violations.push(...actualViolations);
        importViolations.push(...fileImportViolations);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        console.warn(`Could not read file ${file}:`, errorObj);
      }
    }

    return this.createValidationResult(violations, importViolations);
  }

  /**
   * Validate types using grep (faster for large codebases)
   */
  validateWithGrep(): IValidationResult {
    logger.info('🔍 Starting TypeScript type/interface location validation (grep scan)...');

    const grepLines = this.findTypeDefinitionsWithGrep();
    const violations = this.parseGrepOutput(grepLines);

    const importGrepLines = this.findImportViolationsWithGrep();
    const importViolations = this.parseImportViolations(importGrepLines);

    logger.info(
      `📁 Found ${grepLines.length} type definitions, ${violations.length} violations, ${importViolations.length} import violations`
    );

    return this.createValidationResult(violations, importViolations);
  }

  /**
   * Create validation result object
   */
  private createValidationResult(
    violations: ITypeLocation[],
    importViolations: IImportViolation[]
  ): IValidationResult {
    const summary = {
      totalViolations: violations.length,
      interfaces: violations.filter(v => v.type === 'interface').length,
      types: violations.filter(v => v.type === 'type').length,
      files: new Set(violations.map(v => v.file)),
      importViolations: importViolations.length,
    };

    return {
      isValid: violations.length === 0 && importViolations.length === 0,
      violations,
      importViolations,
      summary,
    };
  }

  /**
   * Print validation results
   */
  printResults(result: IValidationResult, method: string): void {
    if (result.isValid) {
      logger.info(
        `✅ All TypeScript interfaces and types are properly located and imported from src/lib/types/index.ts! (${method})`
      );
      return;
    }

    // Print type location violations
    if (result.violations.length > 0) {
      logger.error(
        `❌ TypeScript interfaces and types found outside of src/lib/types directory (${method}):`
      );
      logger.error('');

      // Group violations by file
      const violationsByFile = result.violations.reduce(
        (acc, violation) => {
          if (!acc[violation.file]) {
            acc[violation.file] = [];
          }
          acc[violation.file].push(violation);
          return acc;
        },
        {} as Record<string, ITypeLocation[]>
      );

      for (const [file, fileViolations] of Object.entries(violationsByFile)) {
        logger.error(`📄 ${file}:`);

        for (const violation of fileViolations) {
          logger.error(`   Line ${violation.line}: ${violation.type} ${violation.name}`);
          logger.error(`   Content: ${violation.content}`);
          logger.error('');
        }
      }
    }

    // Print import violations
    if (result.importViolations.length > 0) {
      logger.error(
        `❌ TypeScript types imported from specific files instead of src/lib/types/index.ts (${method}):`
      );
      logger.error('');

      // Group import violations by file
      const importViolationsByFile = result.importViolations.reduce(
        (acc, violation) => {
          if (!acc[violation.file]) {
            acc[violation.file] = [];
          }
          acc[violation.file].push(violation);
          return acc;
        },
        {} as Record<string, IImportViolation[]>
      );

      for (const [file, fileViolations] of Object.entries(importViolationsByFile)) {
        logger.error(`📄 ${file}:`);

        for (const violation of fileViolations) {
          logger.error(`   Line ${violation.line}: Importing ${violation.typeName}`);
          logger.error(`   Current: ${violation.importPath}`);
          logger.error(`   Suggested: ${violation.suggestedPath}`);
          logger.error('');
        }
      }
    }

    logger.error('📊 Summary:');
    logger.error(`   Total violations: ${result.summary.totalViolations}`);
    logger.error(`   Interfaces: ${result.summary.interfaces}`);
    logger.error(`   Types: ${result.summary.types}`);
    logger.error(`   Files affected: ${result.summary.files.size}`);
    logger.error(`   Import violations: ${result.summary.importViolations}`);
    logger.error('');

    logger.error('💡 To fix these violations:');
    logger.error('   1. Move the interfaces/types to src/lib/types directory');
    logger.error('   2. Create appropriate type files (e.g., component.types.ts)');
    logger.error('   3. Export them from src/lib/types/index.ts');
    logger.error('   4. Update imports to use @/lib/types instead of specific type files');
    logger.error("   5. Use: import type { TypeName } from '@/lib/types'");
    logger.error('');

    logger.error('🎯 Allowed directories:');
    this.allowedDirectories.forEach(dir => logger.error(`   - ${dir}`));

    logger.error('📦 Centralized import pattern:');
    logger.error("   import type { TypeName1, TypeName2 } from '@/lib/types'");
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): { includeTests: boolean; help: boolean } {
  const args = process.argv.slice(2);
  const includeTests = args.includes('--include-tests');
  const help = args.includes('--help');

  return { includeTests, help };
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
🔍 TypeScript Type/Interface Location Validator

Usage:
  pnpm validate:types [options]

Options:
  --include-tests    Include test files in validation (default: false)
  --help            Show this help message

Examples:
  pnpm validate:types                    # Validate excluding test files
  pnpm validate:types --include-tests   # Validate including test files
  pnpm validate:types --help            # Show this help message

Description:
  This script validates that all TypeScript interfaces and types are properly
  located in the src/lib/types directory and imported from src/lib/types/index.ts
  where possible. It will fail the build if any interfaces or types are found
  outside of the designated type directories or imported from specific type files
  instead of the centralized index.
`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const { includeTests, help } = parseArgs();

    if (help) {
      showHelp();
      return;
    }

    logger.info('🔍 Validating type definitions and imports...');
    if (includeTests) {
      logger.info('📝 Including test files in validation');
    }

    const validator = new TypeValidator(includeTests);

    // Try grep method first (faster)
    const grepResult = validator.validateWithGrep();
    validator.printResults(grepResult, 'grep');

    if (!grepResult.isValid) {
      logger.error(
        '🚨 Build failed: TypeScript interfaces/types found in wrong location or imported incorrectly!'
      );
      process.exit(1);
    }

    logger.info('🎉 Type location and import validation passed!');
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('💥 Validation script failed', errorObj);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TypeValidator };
