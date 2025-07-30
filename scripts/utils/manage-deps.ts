#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { logger } from '@/lib/utils/logger';
import type { IOutdatedPackage } from '@/lib/types';

import { parseScriptArgs } from './script-utils';

function getOutdatedPackages(): IOutdatedPackage[] {
  try {
    // First try with --json flag
    try {
      const output = execSync('pnpm outdated --json', { encoding: 'utf-8' });

      // Extract only JSON lines (starting with { or [)
      const jsonLines = output
        .split('\n')
        .filter(line => line.trim().match(/^[{\[]/))
        .join('\n');

      if (jsonLines) {
        return JSON.parse(jsonLines) as IOutdatedPackage[];
      }
    } catch (jsonError) {
      logger.debug('JSON format failed, trying fallback approach');
    }

    // Fallback: try without --json flag and parse manually
    const rawOutput = execSync('pnpm outdated', { encoding: 'utf-8' });

    if (rawOutput.includes('No outdated packages found')) {
      return [];
    }

    // Parse the table format output
    const lines = rawOutput.split('\n').filter(line => line.trim());
    const packages: IOutdatedPackage[] = [];

    for (const line of lines) {
      // Skip header lines and empty lines
      if (
        line.includes('Package') ||
        line.includes('Current') ||
        line.includes('Wanted') ||
        line.includes('Latest')
      ) {
        continue;
      }

      // Parse package line (format: package current wanted latest)
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        packages.push({
          name: parts[0],
          current: parts[1],
          wanted: parts[2],
          latest: parts[3],
          type: 'dependencies', // Will be determined later
        });
      }
    }

    return packages;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error getting outdated packages:', error);
      if (error.stack) {
        logger.error('Stack trace:', error);
      }
    } else {
      logger.error('Error getting outdated packages:', new Error(String(error)));
    }
    return [];
  }
}

function getPackageJson() {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const content = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error reading package.json:', error);
      if (error.stack) {
        logger.error('Stack trace:', error);
      }
    } else {
      logger.error('Error reading package.json:', new Error(String(error)));
    }
    throw error;
  }
}

function updatePackageJson(
  dependencies: Record<string, string>,
  type: 'dependencies' | 'devDependencies'
) {
  try {
    const packageJson = getPackageJson();
    packageJson[type] = {
      ...packageJson[type],
      ...dependencies,
    };
    writeFileSync(join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error updating package.json:', error);
      if (error.stack) {
        logger.error('Stack trace:', error);
      }
    } else {
      logger.error('Error updating package.json:', new Error(String(error)));
    }
    throw error;
  }
}

function groupPackagesByType(packages: IOutdatedPackage[]) {
  const packageJson = getPackageJson();
  const deps = packageJson.dependencies || {};

  return packages.reduce(
    (acc, pkg) => {
      const type = pkg.name in deps ? 'dependencies' : 'devDependencies';
      if (!acc[type]) acc[type] = [];
      acc[type].push(pkg);
      return acc;
    },
    {} as Record<string, IOutdatedPackage[]>
  );
}

function formatPackageList(packages: IOutdatedPackage[]) {
  return packages.map(pkg => `${pkg.name}: ${pkg.current} -> ${pkg.latest}`).join('\n');
}

function main() {
  try {
    const options = parseScriptArgs();
    logger.info(`🔍 Checking outdated packages in ${options.environment} environment...`);

    const outdated = getOutdatedPackages();
    if (outdated.length === 0) {
      logger.info('No outdated packages found.');
      return;
    }

    const grouped = groupPackagesByType(outdated);

    logger.info('Outdated packages:');
    logger.info('\nDependencies:');
    logger.info(formatPackageList(grouped.dependencies || []));
    logger.info('\nDevDependencies:');
    logger.info(formatPackageList(grouped.devDependencies || []));

    const updates: Record<string, Record<string, string>> = {
      dependencies: {},
      devDependencies: {},
    };

    outdated.forEach(pkg => {
      const type =
        pkg.name in (getPackageJson().dependencies || {}) ? 'dependencies' : 'devDependencies';
      updates[type][pkg.name] = pkg.latest;
    });

    // Update package.json
    Object.entries(updates).forEach(([type, deps]) => {
      if (Object.keys(deps).length > 0) {
        updatePackageJson(deps, type as 'dependencies' | 'devDependencies');
      }
    });

    logger.info('\nUpdated package.json with latest versions.');
    logger.info('\nRun the following commands to complete the update:');
    logger.info('pnpm install');
    logger.info('pnpm test');
    logger.info('pnpm test:e2e');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error managing dependencies:', error);
      if (error.stack) {
        logger.error('Stack trace:', error);
      }
    } else {
      logger.error('Error managing dependencies:', new Error(String(error)));
    }
    process.exit(1);
  }
}

main();
