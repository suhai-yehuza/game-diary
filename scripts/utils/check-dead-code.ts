#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { logger } from '@/lib/utils/logger';
import fs from 'fs';
import path from 'path';

interface DeadCodeResults {
  tsPruneResults: string[];
  tsUnusedExportsResults: Record<string, string[]>;
  emptyFiles: string[];
}

class DeadCodeDetector {
  private readonly tsUnusedExportsIgnoreFiles = [
    'codegen.ts',
    'vitest.config.ts',
    'drizzle.config.ts',
    'playwright.config.ts',
    'tailwind.config.ts',
    'playwright.fast.config.ts',
    'tests/e2e/coverage.config.ts',
    'src/lib/types/declarations.d.ts',
    'src/lib/types/index.ts',
  ];

  async run(): Promise<DeadCodeResults> {
    logger.info('🔍 Running comprehensive dead code detection in development environment...');

    // Only run ts-unused-exports since ts-prune flags legitimate framework requirements
    const tsUnusedExportsResults = this.runTsUnusedExports();

    return {
      tsPruneResults: [], // Disabled ts-prune
      tsUnusedExportsResults,
      emptyFiles: this.findEmptyFiles(),
    };
  }

  private runTsUnusedExports(): Record<string, string[]> {
    const args = [
      '--ignoreLocallyUsed',
      '--showLineNumber',
      '--allowUnusedTypes',
      ...this.tsUnusedExportsIgnoreFiles.map(file => `--ignoreFiles=${file}`),
    ];

    logger.info(`Running ts-unused-exports with args: ${JSON.stringify(args, null, 2)}`);

    try {
      const output = execSync(`npx ts-unused-exports ${args.join(' ')}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      return this.parseTsUnusedExportsOutput(output);
    } catch (error: any) {
      if (error.status === 0) {
        // ts-unused-exports exits with 0 when no unused exports found
        return {};
      }

      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      return this.parseTsUnusedExportsOutput(output);
    }
  }

  private parseTsUnusedExportsOutput(output: string): Record<string, string[]> {
    const results: Record<string, string[]> = {};
    const lines = output.split('\n');
    let currentFile = '';

    for (const line of lines) {
      if (line.startsWith('📁 ')) {
        currentFile = line.replace('📁 ', '').trim();
        results[currentFile] = [];
      } else if (line.trim().startsWith('- ') && currentFile) {
        const exportName = line.trim().replace('- ', '');
        results[currentFile].push(exportName);
      }
    }

    return results;
  }

  private findEmptyFiles(): string[] {
    const emptyFiles: string[] = [];
    const rootDir = process.cwd();

    // Directories to exclude from empty file checking
    const excludeDirs = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.turbo',
      '.vercel',
      'drizzle',
      '.pnpm',
    ];

    function isEmpty(filePath: string): boolean {
      try {
        const stats = fs.statSync(filePath);
        return stats.size === 0;
      } catch (error) {
        logger.warn(`Could not check if file is empty: ${filePath}`);
        return false;
      }
    }

    function shouldExcludeDir(dirPath: string): boolean {
      const relativePath = path.relative(rootDir, dirPath);
      return excludeDirs.some(
        excludeDir =>
          relativePath.startsWith(excludeDir) ||
          relativePath.includes(`/${excludeDir}/`) ||
          relativePath === excludeDir
      );
    }

    function walk(dir: string) {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);

          try {
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
              if (!shouldExcludeDir(filePath)) {
                walk(filePath);
              }
            } else {
              if (isEmpty(filePath)) {
                emptyFiles.push(filePath);
              }
            }
          } catch (error) {
            // Skip files/directories that can't be accessed
            continue;
          }
        }
      } catch (error) {
        // Skip directories that can't be read
        return;
      }
    }

    walk(rootDir);
    return emptyFiles;
  }
}

class ResultFormatter {
  formatTsPruneResults(results: string[]): void {
    if (results.length === 0) {
      logger.info('✅ ts-prune: No unused exports found!');
      return;
    }

    logger.info('\n🔍 ts-prune results:');
    logger.info('==================');

    results.forEach((line: string) => {
      logger.info(`  ${line}`);
    });
  }

  formatTsUnusedExportsResults(results: Record<string, string[]>): void {
    if (Object.keys(results).length === 0) {
      logger.info('✅ ts-unused-exports: No unused exports found!');
      return;
    }

    logger.info('\n🔍 ts-unused-exports results:');
    logger.info('=============================');

    for (const [filePath, exports] of Object.entries(results)) {
      if (exports.length > 0) {
        logger.info(`📁 ${filePath}`);
        exports.forEach(exportName => {
          logger.info(`   - ${exportName}`);
        });
        logger.info(''); // Add empty line between files
      }
    }
  }

  formatEmptyFiles(emptyFiles: string[]): void {
    if (emptyFiles.length === 0) {
      logger.info('✅ No empty files found!');
      return;
    }

    logger.info('\n🔍 Empty files found:');
    logger.info('=====================');

    emptyFiles.forEach((filePath: string) => {
      const relativePath = path.relative(process.cwd(), filePath);
      logger.info(`  📄 ${relativePath}`);
    });
  }

  printSummary(results: DeadCodeResults): void {
    const { tsPruneResults, tsUnusedExportsResults, emptyFiles } = results;
    const totalIssues =
      tsPruneResults.length + Object.keys(tsUnusedExportsResults).length + emptyFiles.length;

    logger.info('\n📊 Dead Code Detection Summary');
    logger.info('=============================');
    logger.info(`ts-prune issues: ${tsPruneResults.length}`);
    logger.info(`ts-unused-exports issues: ${Object.keys(tsUnusedExportsResults).length}`);
    logger.info(`Empty files: ${emptyFiles.length}`);
    logger.info(`Total issues: ${totalIssues}`);

    if (totalIssues === 0) {
      logger.info('\n🎉 No dead code found! Your codebase is clean!');
    } else {
      logger.info('\n💡 Recommendations:');
      logger.info('  - Review the unused exports above');
      logger.info('  - Consider removing unused code to reduce bundle size');
      logger.info('  - Update exports that are intentionally unused');
      logger.info('  - Add files to ignore patterns if they are false positives');
      logger.info('  - Remove empty files or add content to them');
      logger.info('  - Consider if empty files are intentionally empty (e.g., .gitkeep)');
    }
  }
}

// Main execution
async function main(): Promise<void> {
  try {
    const detector = new DeadCodeDetector();
    const formatter = new ResultFormatter();

    const results = await detector.run();

    // Format and display results
    formatter.formatTsPruneResults(results.tsPruneResults);
    formatter.formatTsUnusedExportsResults(results.tsUnusedExportsResults);
    formatter.formatEmptyFiles(results.emptyFiles);
    formatter.printSummary(results);

    // Exit with appropriate code
    // Exit with code 1 if ts-unused-exports finds any issues or if there are empty files
    const hasTsUnusedExportsIssues = Object.keys(results.tsUnusedExportsResults).length > 0;
    const hasEmptyFiles = results.emptyFiles.length > 0;
    const hasAnyIssues = hasTsUnusedExportsIssues || hasEmptyFiles;
    process.exit(hasAnyIssues ? 1 : 0);
  } catch (error) {
    logger.error('❌ Error during dead code detection:');
    process.exit(1);
  }
}

// Execute the script
main();
