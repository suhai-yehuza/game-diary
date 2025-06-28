#!/usr/bin/env tsx

/**
 * Performance Measurement Script
 * Measures build performance, bundle sizes, and runtime metrics
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from '../../lib/core/logger';
import type { IPerformanceMetrics } from '../../src/lib/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function measureBuildTime(): Promise<number> {
  logger.info('📏 Measuring build time...');
  const startTime = Date.now();

  try {
    execSync('pnpm build', {
      cwd: rootDir,
      stdio: 'pipe',
      timeout: 300000, // 5 minutes timeout
    });
    const endTime = Date.now();
    const buildTime = endTime - startTime;

    logger.info(`✅ Build completed in ${buildTime}ms (${(buildTime / 1000).toFixed(2)}s)`);
    return buildTime;
  } catch (error) {
    logger.error('❌ Build failed:', error);
    throw error;
  }
}

async function analyzeBundleSize(): Promise<IPerformanceMetrics['bundleSize']> {
  logger.info('📦 Analyzing bundle size...');

  const buildDir = path.join(rootDir, '.next');
  const staticDir = path.join(buildDir, 'static');

  if (!fs.existsSync(staticDir)) {
    throw new Error('Build directory not found. Run build first.');
  }

  const bundleSize: IPerformanceMetrics['bundleSize'] = {
    total: 0,
    pages: {},
    chunks: {},
  };

  // Analyze pages
  const pagesDir = path.join(staticDir, 'chunks', 'pages');
  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir);
    for (const file of pageFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(pagesDir, file);
        const stats = fs.statSync(filePath);
        bundleSize.pages[file] = stats.size;
        bundleSize.total += stats.size;
      }
    }
  }

  // Analyze app chunks
  const appDir = path.join(staticDir, 'chunks', 'app');
  if (fs.existsSync(appDir)) {
    const chunkFiles = fs.readdirSync(appDir);
    for (const file of chunkFiles) {
      if (file.endsWith('.js')) {
        const filePath = path.join(appDir, file);
        const stats = fs.statSync(filePath);
        bundleSize.chunks[file] = stats.size;
        bundleSize.total += stats.size;
      }
    }
  }

  logger.info(`📊 Total bundle size: ${(bundleSize.total / 1024 / 1024).toFixed(2)} MB`);
  return bundleSize;
}

async function analyzeDependencies(): Promise<IPerformanceMetrics['dependencies']> {
  logger.info('📋 Analyzing dependencies...');

  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const production = Object.keys(packageJson.dependencies || {}).length;
  const development = Object.keys(packageJson.devDependencies || {}).length;
  const total = production + development;

  logger.info(
    `📦 Dependencies: ${production} production, ${development} development (${total} total)`
  );

  return { production, development, total };
}

async function measureTypecheck(): Promise<IPerformanceMetrics['typecheck']> {
  logger.info('�� Running TypeScript type check...');

  const startTime = Date.now();
  let errors = 0;

  try {
    const output = execSync('pnpm typecheck', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    // Count errors in output
    const errorLines = output
      .split('\n')
      .filter(
        line => line.includes('error TS') || (line.includes('Found ') && line.includes('error'))
      );
    errors = errorLines.length;
  } catch (error: unknown) {
    // TypeScript errors will cause execSync to throw
    let output = '';
    if (error && typeof error === 'object' && ('stdout' in error || 'stderr' in error)) {
      output =
        (error as { stdout?: string; stderr?: string }).stdout ||
        (error as { stdout?: string; stderr?: string }).stderr ||
        '';
    }
    const errorLines = output
      .split('\n')
      .filter(
        (line: string) =>
          line.includes('error TS') || (line.includes('Found ') && line.includes('error'))
      );
    errors = errorLines.length;
  }

  const endTime = Date.now();
  const time = endTime - startTime;

  logger.info(`✅ TypeScript check completed in ${time}ms with ${errors} errors`);

  return { time, errors };
}

async function saveMetrics(metrics: IPerformanceMetrics): Promise<void> {
  const metricsDir = path.join(rootDir, 'coverage', 'performance');
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const metricsFile = path.join(metricsDir, 'latest.json');
  const historyFile = path.join(metricsDir, 'history.json');

  // Save latest metrics
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

  // Append to history
  let history: IPerformanceMetrics[] = [];
  if (fs.existsSync(historyFile)) {
    try {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    } catch {
      logger.warn('Could not read performance history, starting fresh');
    }
  }

  history.push(metrics);

  // Keep only last 50 measurements
  if (history.length > 50) {
    history = history.slice(-50);
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  logger.info(`💾 Performance metrics saved to ${metricsFile}`);
}

export async function measurePerformance(): Promise<IPerformanceMetrics> {
  logger.info('🚀 Starting performance measurement...\n');

  const startTime = Date.now();

  try {
    const [buildTime, bundleSize, dependencies, typecheck] = await Promise.all([
      measureBuildTime(),
      analyzeBundleSize(),
      analyzeDependencies(),
      measureTypecheck(),
    ]);

    const metrics: IPerformanceMetrics = {
      timestamp: new Date().toISOString(),
      loadTime: 0, // Placeholder - would need actual load time measurement
      renderTime: 0, // Placeholder - would need actual render time measurement
      memoryUsage: 0, // Placeholder - would need actual memory measurement
      buildTime,
      bundleSize,
      dependencies,
      typecheck,
    };

    await saveMetrics(metrics);

    const totalTime = Date.now() - startTime;
    logger.info(`\n🎉 Performance measurement completed in ${(totalTime / 1000).toFixed(2)}s`);

    return metrics;
  } catch (error) {
    logger.error('❌ Performance measurement failed:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  measurePerformance().catch(error => {
    logger.error('Performance measurement failed:', error);
    process.exit(1);
  });
}
