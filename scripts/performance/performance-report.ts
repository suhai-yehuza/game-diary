#!/usr/bin/env tsx

/**
 * Performance Report Generator
 * Analyzes performance metrics and generates comprehensive reports
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { logger } from '@src/lib/utils/logger';
import type { IPerformanceMetrics, IPerformanceTrend } from '@src/lib/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function calculateTrend(
  current: number,
  previous: number,
  lowerIsBetter = true
): IPerformanceTrend['trend'] {
  const changePercent = previous === 0 ? 0 : ((current - previous) / previous) * 100;
  const threshold = 5; // 5% threshold for significant change

  if (Math.abs(changePercent) < threshold) {
    return 'stable';
  }

  if (lowerIsBetter) {
    return current < previous ? 'improving' : 'degrading';
  } else {
    return current > previous ? 'improving' : 'degrading';
  }
}

function analyzeTrends(history: IPerformanceMetrics[]): IPerformanceTrend[] {
  if (history.length < 2) {
    return [];
  }

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  if (!current || !previous) {
    return [];
  }

  const trends: IPerformanceTrend[] = [
    {
      metric: 'Build Time',
      period: 'latest',
      current: current.buildTime as number,
      previous: previous.buildTime as number,
      change: (current.buildTime as number) - (previous.buildTime as number),
      changePercent:
        (previous.buildTime as number) === 0
          ? 0
          : (((current.buildTime as number) - (previous.buildTime as number)) /
              (previous.buildTime as number)) *
            100,
      trend: calculateTrend(current.buildTime as number, previous.buildTime as number, true),
    },
    {
      metric: 'Bundle Size',
      period: 'latest',
      current: current.bundleSize.total,
      previous: previous.bundleSize.total,
      change: current.bundleSize.total - previous.bundleSize.total,
      changePercent:
        previous.bundleSize.total === 0
          ? 0
          : ((current.bundleSize.total - previous.bundleSize.total) / previous.bundleSize.total) *
            100,
      trend: calculateTrend(current.bundleSize.total, previous.bundleSize.total, true),
    },
    {
      metric: 'TypeScript Errors',
      period: 'latest',
      current: current.typecheck.errors,
      previous: previous.typecheck.errors,
      change: current.typecheck.errors - previous.typecheck.errors,
      changePercent:
        previous.typecheck.errors === 0
          ? 0
          : ((current.typecheck.errors - previous.typecheck.errors) / previous.typecheck.errors) *
            100,
      trend: calculateTrend(current.typecheck.errors, previous.typecheck.errors, true),
    },
    {
      metric: 'Dependencies',
      period: 'latest',
      current: current.dependencies.total,
      previous: previous.dependencies.total,
      change: current.dependencies.total - previous.dependencies.total,
      changePercent:
        previous.dependencies.total === 0
          ? 0
          : ((current.dependencies.total - previous.dependencies.total) /
              previous.dependencies.total) *
            100,
      trend: calculateTrend(current.dependencies.total, previous.dependencies.total, true),
    },
  ];

  return trends;
}

function generateTrendIcon(trend: IPerformanceTrend['trend']): string {
  switch (trend) {
    case 'improving':
      return '📈 ';
    case 'degrading':
      return '📉 ';
    case 'stable':
      return '➡️  ';
    case 'up':
      return '📈 ';
    case 'down':
      return '📉 ';
    default:
      return '➡️  ';
  }
}

function generateMarkdownReport(metrics: IPerformanceMetrics, trends: IPerformanceTrend[]): string {
  const report = `# Performance Report

Generated: ${new Date(metrics.timestamp || new Date().toISOString()).toLocaleString()}

## 📊 Current Metrics

### Build Performance
- **Build Time**: ${formatDuration(metrics.buildTime as number)}
- **TypeScript Check**: ${formatDuration(metrics.typecheck.time)} (${metrics.typecheck.errors} errors)

### Bundle Analysis
- **Total Bundle Size**: ${formatBytes(metrics.bundleSize.total)}
- **Page Chunks**: ${Object.keys(metrics.bundleSize.pages).length}
- **App Chunks**: ${Object.keys(metrics.bundleSize.chunks).length}

### Dependencies
- **Production**: ${metrics.dependencies.production}
- **Development**: ${metrics.dependencies.development}
- **Total**: ${metrics.dependencies.total}

## 📈 Trends

${
  trends.length > 0
    ? trends
        .map(
          trend => `
### ${generateTrendIcon(trend.trend)} ${trend.metric || 'Unknown'}
- **Current**: ${trend.metric === 'Bundle Size' ? formatBytes(trend.current || 0) : trend.metric?.includes('Time') ? formatDuration(trend.current || 0) : trend.current || 0}
- **Previous**: ${trend.metric === 'Bundle Size' ? formatBytes(trend.previous || 0) : trend.metric?.includes('Time') ? formatDuration(trend.previous || 0) : trend.previous || 0}
- **Change**: ${(trend.change || 0) > 0 ? '+' : ''}${trend.metric === 'Bundle Size' ? formatBytes(Math.abs(trend.change || 0)) : trend.metric?.includes('Time') ? formatDuration(Math.abs(trend.change || 0)) : Math.abs(trend.change || 0)} (${(trend.changePercent || 0) > 0 ? '+' : ''}${(trend.changePercent || 0).toFixed(1)}%)
`
        )
        .join('\n')
    : 'No trend data available (need at least 2 measurements)'
}

## 🎯 Recommendations

${generateRecommendations(metrics, trends)}

## 📋 Largest Bundle Chunks

${Object.entries(metrics.bundleSize.chunks)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .slice(0, 10)
  .map(([name, size]) => `- **${name}**: ${formatBytes(size as number)}`)
  .join('\n')}

---
*Report generated by Placeholder Performance Monitor*
`;

  return report;
}

function generateRecommendations(
  metrics: IPerformanceMetrics,
  trends: IPerformanceTrend[]
): string {
  const recommendations: string[] = [];

  // Build time recommendations
  if ((metrics.buildTime as number) > 180000) {
    // 3 minutes
    recommendations.push(
      '⏰ **Build time is high** - Consider optimizing webpack configuration or reducing bundle size'
    );
  }

  // Bundle size recommendations
  if (metrics.bundleSize.total > 5 * 1024 * 1024) {
    // 5MB
    recommendations.push(
      '📦 **Bundle size is large** - Consider code splitting, tree shaking, or removing unused dependencies'
    );
  }

  // TypeScript error recommendations
  if (metrics.typecheck.errors > 0) {
    recommendations.push(
      '🔍 **TypeScript errors detected** - Fix type errors to improve code quality and catch bugs early'
    );
  }

  // Dependency recommendations
  if (metrics.dependencies.total > 200) {
    recommendations.push(
      '📚 **High dependency count** - Audit dependencies and remove unused packages'
    );
  }

  // Trend-based recommendations
  trends.forEach(trend => {
    if (trend.trend === 'degrading' && Math.abs(trend.changePercent || 0) > 10) {
      recommendations.push(
        `📉 **${trend.metric || 'Unknown'} is degrading** - Investigate recent changes that may have impacted performance`
      );
    }
  });

  if (recommendations.length === 0) {
    recommendations.push(
      '✅ **Performance looks good!** - All metrics are within acceptable ranges'
    );
  }

  return recommendations.join('\n');
}

async function generateReport(): Promise<void> {
  logger.info('📊 Generating performance report...');

  const metricsDir = join(rootDir, 'coverage', 'performance');
  const latestFile = join(metricsDir, 'latest.json');
  const historyFile = join(metricsDir, 'history.json');

  if (!existsSync(latestFile)) {
    throw new Error('No performance metrics found. Run "pnpm perf:measure" first.');
  }

  const metrics: IPerformanceMetrics = JSON.parse(readFileSync(latestFile, 'utf-8'));

  let history: IPerformanceMetrics[] = [];
  if (existsSync(historyFile)) {
    history = JSON.parse(readFileSync(historyFile, 'utf-8'));
  }

  const trends = analyzeTrends(history);
  const report = generateMarkdownReport(metrics, trends);

  // Save report
  const reportFile = join(metricsDir, 'report.md');
  writeFileSync(reportFile, report);

  logger.info(`📋 Performance report generated: ${reportFile}`);
  logger.info('\n' + report);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport().catch(error => {
    logger.error('Performance report generation failed:', error);
    process.exit(1);
  });
}
