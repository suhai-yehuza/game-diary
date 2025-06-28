#!/usr/bin/env tsx

import path from 'path';
import { execSync } from 'child_process';

import { analyzeTsConfig } from 'ts-unused-exports';

import { logger } from '@lib/core/logger';

import { parseScriptArgs } from '@shared/script-utils';

// Types
type ArgType = string;
type ExportNameAndLocation = {
  exportName: string;
  location?: {
    line: number;
  };
};

// Configuration
const CONFIG = {
  tsConfigPath: path.resolve(process.cwd(), 'tsconfig.json'),
  defaultArgs: ['--allowUnusedTypes', '--ignoreLocallyUsed', '--showLineNumber'] as const,
  ignoreFiles: [
    // Configuration files
    'codegen.ts',
    'vitest.config.ts',
    'drizzle.config.ts',
    'playwright.config.ts',
    'tailwind.config.ts',
  ],
} as const;

// Utility functions
const utils = {
  escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  buildArgs(): ArgType[] {
    const args = [...CONFIG.defaultArgs] as ArgType[];
    if (CONFIG.ignoreFiles.length > 0) {
      CONFIG.ignoreFiles.forEach(file => {
        args.push(`--ignoreFiles=${utils.escapeRegex(file)}` as ArgType);
      });
    }
    return args;
  },
};

// Output formatting
const formatter = {
  formatExportInfo(exportInfo: ExportNameAndLocation): string {
    const { exportName, location } = exportInfo;
    return location ? `   - ${exportName} (line ${location.line})` : `   - ${exportName}`;
  },

  printUnusedExports(result: unknown): number {
    if (!result || typeof result !== 'object') {
      logger.info('✅ No unused exports found!');
      return 0;
    }

    let totalUnusedFiles = 0;

    for (const [filePath, exports] of Object.entries(result)) {
      if (Array.isArray(exports) && exports.length > 0) {
        totalUnusedFiles++;
        logger.info(`📁 ${filePath}`);
        exports.forEach(exportInfo => {
          if (typeof exportInfo === 'object' && exportInfo !== null && 'exportName' in exportInfo) {
            logger.info(formatter.formatExportInfo(exportInfo as ExportNameAndLocation));
          }
        });
        logger.info(''); // Add empty line between files
      }
    }

    logger.info(`Total files with unused exports: ${totalUnusedFiles}`);
    return totalUnusedFiles;
  },
};

// Main functionality
async function checkUnusedExports(): Promise<void> {
  try {
    const options = parseScriptArgs();
    logger.info(`🔍 Checking unused exports in ${options.environment} environment...`);

    const args = utils.buildArgs();
    logger.info('Arguments:', args);

    const result = await analyzeTsConfig(CONFIG.tsConfigPath, args);
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid result from analyzeTsConfig');
    }

    logger.info('Raw result from analyzeTsConfig:', JSON.stringify(result, null, 2));

    if (Object.keys(result).length === 0) {
      logger.info('✅ No unused exports found!');
      process.exit(0);
    }

    logger.info('\n🔍 Unused exports found:\n');
    const totalUnusedFiles = formatter.printUnusedExports(result);
    process.exit(totalUnusedFiles > 0 ? 1 : 0);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Error checking unused exports:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('❌ Error checking unused exports:', String(error));
    }
    process.exit(1);
  }
}

// Execute the script
checkUnusedExports();
