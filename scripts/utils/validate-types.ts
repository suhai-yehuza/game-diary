#!/usr/bin/env tsx

import { execSync } from 'child_process';

import { logger } from '@lib/core/logger';
import { parseScriptArgs } from '../shared/script-utils';

const TYPES_DIR = 'src/lib/types';
const EXCLUDED_DIRS = ['node_modules', '.next', 'dist', 'build', 'scripts'];

function findTypeDefinitions(): string[] {
  try {
    // Search for type and interface definitions, excluding irrelevant directories and Zod types
    const grepCommand = `grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=build --exclude-dir=scripts --include="*.ts" --include="*.tsx" -E "^(export )?(type|interface) " . | grep -v "z.infer<"`;
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
    if (error instanceof Error) {
      logger.error('Error searching for type definitions:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error searching for type definitions:', String(error));
    }
    return [];
  }
}

function validateTypeLocations(typeDefinitions: string[]): {
  valid: boolean;
  errors: string[];
  fileCount: number;
  lineNumbers: { [filePath: string]: number[] };
} {
  const errors: string[] = [];
  const lineNumbers: { [filePath: string]: number[] } = {};
  const filesWithIssues = new Set<string>();

  for (const line of typeDefinitions) {
    const parts = line.split(':');
    if (parts.length < 2) {
      logger.warn(`Invalid line format: ${line}`);
      continue;
    }

    const filePath = parts[0];
    const lineNumberStr = parts[1];
    const lineNumber = parseInt(lineNumberStr, 10);

    if (isNaN(lineNumber)) {
      logger.warn(`Invalid line number in ${filePath}: ${lineNumberStr}`);
      continue;
    }

    // Skip if file is in excluded directories
    if (EXCLUDED_DIRS.some(dir => filePath.startsWith(dir))) {
      continue;
    }

    // Remove ./ from the start of the path if present
    const normalizedPath = filePath.startsWith('./') ? filePath.slice(2) : filePath;

    // Check if file is in types directory
    if (!normalizedPath.startsWith(TYPES_DIR)) {
      errors.push(`Type definition found outside types directory: ${filePath}`);
      filesWithIssues.add(normalizedPath);
      if (!lineNumbers[normalizedPath]) {
        lineNumbers[normalizedPath] = [];
      }
      lineNumbers[normalizedPath].push(lineNumber);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    fileCount: filesWithIssues.size,
    lineNumbers,
  };
}

function main() {
  try {
    const options = parseScriptArgs();
    logger.info(`🔍 Validating type definitions in ${options.environment} environment...`);

    const typeDefinitions = findTypeDefinitions();
    const { valid, errors, fileCount, lineNumbers } = validateTypeLocations(typeDefinitions);

    if (valid) {
      logger.info('✅ All type definitions are in the correct location!');
      process.exit(0);
    } else {
      logger.error(`❌ Found type definitions outside of src/lib/types/ in ${fileCount} files:`);
      errors.forEach(error => logger.error(`  - ${error}`));
      logger.error('Line numbers of violating types/interfaces:');
      Object.entries(lineNumbers).forEach(([filePath, lines]) => {
        logger.error(`  ${filePath}: ${lines.join(', ')}`);
      });
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error validating types:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error validating types:', String(error));
    }
    process.exit(1);
  }
}

main();
