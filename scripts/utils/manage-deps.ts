#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { logger } from '@lib/core/logger';
import type { IOutdatedPackage } from '@src/lib/types';

import { parseScriptArgs } from '@shared/script-utils';

function getOutdatedPackages(): IOutdatedPackage[] {
  try {
    const output = execSync('pnpm outdated --json', { encoding: 'utf-8' });
    return JSON.parse(output) as IOutdatedPackage[];
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Error getting outdated packages:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error getting outdated packages:', String(error));
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
      logger.error('Error reading package.json:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error reading package.json:', String(error));
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
      logger.error('Error updating package.json:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error updating package.json:', String(error));
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
      logger.error('Error managing dependencies:', error.message);
      if (error.stack) {
        logger.error(error.stack);
      }
    } else {
      logger.error('Error managing dependencies:', String(error));
    }
    process.exit(1);
  }
}

main();
