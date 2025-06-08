#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { logger } from 'lib/core/logger';

interface Package {
  name: string;
  version: string;
  latest?: string;
  type?: string;
  wanted?: string;
}

interface OutdatedPackage extends Package {
  current: string;
  latest: string;
  type: string;
  url: string;
}

function getOutdatedPackages(): OutdatedPackage[] {
  try {
    const output = execSync('pnpm outdated --json', { encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (error) {
    console.error('Error getting outdated packages:', error);
    return [];
  }
}

function getPackageJson() {
  const packageJsonPath = join(process.cwd(), 'package.json');
  const content = readFileSync(packageJsonPath, 'utf-8');
  return JSON.parse(content);
}

function updatePackageJson(
  dependencies: Record<string, string>,
  type: 'dependencies' | 'devDependencies'
) {
  const packageJson = getPackageJson();
  packageJson[type] = {
    ...packageJson[type],
    ...dependencies,
  };
  writeFileSync(join(process.cwd(), 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
}

function groupPackagesByType(packages: OutdatedPackage[]) {
  return packages.reduce(
    (acc, pkg) => {
      const type = pkg.type === 'dependencies' ? 'dependencies' : 'devDependencies';
      if (!acc[type]) acc[type] = [];
      acc[type].push(pkg);
      return acc;
    },
    {} as Record<string, OutdatedPackage[]>
  );
}

function formatPackageList(packages: OutdatedPackage[]) {
  return packages.map(pkg => `${pkg.name}: ${pkg.current} -> ${pkg.latest}`).join('\n');
}

function main() {
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
    const type = pkg.type === 'dependencies' ? 'dependencies' : 'devDependencies';
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
}

main();
