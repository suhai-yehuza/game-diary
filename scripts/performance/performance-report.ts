#!/usr/bin/env tsx

/**
 * Performance Report Generator
 * Analyzes performance metrics and generates comprehensive reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from 'lib/core/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface PerformanceMetrics {
  timestamp: string;
  buildTime: number;
  bundleSize: {
    total: number;
    pages: Record<string, number>;
    chunks: Record<string, number>;
  };
  dependencies: {
    production: number;
    development: number;
    total: number;
  };
  typecheck: {
    time: number;
    errors: number;
  };
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

interface PerformanceTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'improving' | 'degrading' | 'stable';
}

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
): PerformanceTrend['trend'] {
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

function analyzeTrends(history: PerformanceMetrics[]): PerformanceTrend[] {
  if (history.length < 2) {
    return [];
  }

  const current = history[history.length - 1];
  const previous = history[history.length - 2];

  if (!current || !previous) {
    return [];
  }

  const trends: PerformanceTrend[] = [
    {
      metric: 'Build Time',
      current: current.buildTime,
      previous: previous.buildTime,
      change: current.buildTime - previous.buildTime,
      changePercent:
        previous.buildTime === 0
          ? 0
          : ((current.buildTime - previous.buildTime) / previous.buildTime) * 100,
      trend: calculateTrend(current.buildTime, previous.buildTime, true),
    },
    {
      metric: 'Bundle Size',
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

function generateTrendIcon(trend: PerformanceTrend['trend']): string {
  switch (trend) {
    case 'improving':
      return '📈 ';
    case 'degrading':
      return '📉 ';
    case 'stable':
      return '➡️  ';
  }
}

function generateMarkdownReport(metrics: PerformanceMetrics, trends: PerformanceTrend[]): string {
  const report = `# Performance Report

Generated: ${new Date(metrics.timestamp).toLocaleString()}

## 📊 Current Metrics

### Build Performance
- **Build Time**: ${formatDuration(metrics.buildTime)}
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
### ${generateTrendIcon(trend.trend)} ${trend.metric}
- **Current**: ${trend.metric === 'Bundle Size' ? formatBytes(trend.current) : trend.metric.includes('Time') ? formatDuration(trend.current) : trend.current}
- **Previous**: ${trend.metric === 'Bundle Size' ? formatBytes(trend.previous) : trend.metric.includes('Time') ? formatDuration(trend.previous) : trend.previous}
- **Change**: ${trend.change > 0 ? '+' : ''}${trend.metric === 'Bundle Size' ? formatBytes(Math.abs(trend.change)) : trend.metric.includes('Time') ? formatDuration(Math.abs(trend.change)) : Math.abs(trend.change)} (${trend.changePercent > 0 ? '+' : ''}${trend.changePercent.toFixed(1)}%)
`
        )
        .join('\n')
    : 'No trend data available (need at least 2 measurements)'
}

## 🎯 Recommendations

${generateRecommendations(metrics, trends)}

## 📋 Largest Bundle Chunks

${Object.entries(metrics.bundleSize.chunks)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .map(([name, size]) => `- **${name}**: ${formatBytes(size)}`)
  .join('\n')}

---
*Report generated by Game Diary Performance Monitor*
`;

  return report;
}

function generateRecommendations(metrics: PerformanceMetrics, trends: PerformanceTrend[]): string {
  const recommendations: string[] = [];

  // Build time recommendations
  if (metrics.buildTime > 180000) {
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
    if (trend.trend === 'degrading' && Math.abs(trend.changePercent) > 10) {
      recommendations.push(
        `📉 **${trend.metric} is degrading** - Investigate recent changes that may have impacted performance`
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

  const metricsDir = path.join(rootDir, 'coverage', 'performance');
  const latestFile = path.join(metricsDir, 'latest.json');
  const historyFile = path.join(metricsDir, 'history.json');

  if (!fs.existsSync(latestFile)) {
    throw new Error('No performance metrics found. Run "pnpm perf:measure" first.');
  }

  const metrics: PerformanceMetrics = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));

  let history: PerformanceMetrics[] = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  }

  const trends = analyzeTrends(history);
  const report = generateMarkdownReport(metrics, trends);

  // Save report
  const reportFile = path.join(metricsDir, 'report.md');
  fs.writeFileSync(reportFile, report);

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
