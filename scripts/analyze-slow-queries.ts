#!/usr/bin/env tsx

/**
 * Slow Query Analysis Script
 *
 * This script analyzes slow queries identified by the performance monitoring system
 * and provides specific optimization recommendations.
 */

import { queryPerformanceMonitor } from '../src/lib/utils/query-performance-monitor';

interface ISlowQueryAnalysis {
  queryName: string;
  frequency: number;
  averageDuration: number;
  maxDuration: number;
  commonVariables: Record<string, any>;
  optimizationRecommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

class SlowQueryAnalyzer {
  private slowQueries: any[] = [];
  private analysis: ISlowQueryAnalysis[] = [];

  constructor() {
    this.slowQueries = queryPerformanceMonitor.getSlowQueries();
  }

  analyzeSlowQueries(): ISlowQueryAnalysis[] {
    if (this.slowQueries.length === 0) {
      console.log('✅ No slow queries detected. Performance is good!');
      return [];
    }

    console.log(`🔍 Analyzing ${this.slowQueries.length} slow queries...\n`);

    // Group slow queries by name
    const queryGroups = new Map<string, any[]>();

    this.slowQueries.forEach(query => {
      if (!queryGroups.has(query.queryName)) {
        queryGroups.set(query.queryName, []);
      }
      queryGroups.get(query.queryName)!.push(query);
    });

    // Analyze each query group
    queryGroups.forEach((queries, queryName) => {
      const analysis = this.analyzeQueryGroup(queryName, queries);
      this.analysis.push(analysis);
    });

    // Sort by severity and frequency
    this.analysis.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.frequency - a.frequency;
    });

    return this.analysis;
  }

  private analyzeQueryGroup(queryName: string, queries: any[]): ISlowQueryAnalysis {
    const frequency = queries.length;
    const durations = queries.map(q => q.duration);
    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    // Analyze common variables
    const commonVariables = this.analyzeCommonVariables(queries);

    // Generate optimization recommendations
    const optimizationRecommendations = this.generateOptimizationRecommendations(
      queryName,
      frequency,
      averageDuration,
      commonVariables
    );

    // Determine severity
    const severity = this.determineSeverity(frequency, averageDuration, maxDuration);

    return {
      queryName,
      frequency,
      averageDuration,
      maxDuration,
      commonVariables,
      optimizationRecommendations,
      severity,
    };
  }

  private analyzeCommonVariables(queries: any[]): Record<string, any> {
    const variableCounts = new Map<string, Map<any, number>>();

    queries.forEach(query => {
      if (query.variables) {
        Object.entries(query.variables).forEach(([key, value]) => {
          if (!variableCounts.has(key)) {
            variableCounts.set(key, new Map());
          }
          const valueCounts = variableCounts.get(key)!;
          const count = valueCounts.get(value) || 0;
          valueCounts.set(value, count + 1);
        });
      }
    });

    const commonVariables: Record<string, any> = {};
    variableCounts.forEach((valueCounts, key) => {
      let mostCommonValue = null;
      let maxCount = 0;
      valueCounts.forEach((count, value) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonValue = value;
        }
      });
      if (mostCommonValue !== null && maxCount > queries.length * 0.3) {
        commonVariables[key] = mostCommonValue;
      }
    });

    return commonVariables;
  }

  private generateOptimizationRecommendations(
    queryName: string,
    frequency: number,
    averageDuration: number,
    commonVariables: Record<string, any>
  ): string[] {
    const recommendations: string[] = [];

    // High frequency recommendations
    if (frequency > 10) {
      recommendations.push(
        'Consider implementing query deduplication to prevent duplicate requests'
      );
      recommendations.push('Implement aggressive caching for frequently requested data');
    }

    // Duration-based recommendations
    if (averageDuration > 3000) {
      recommendations.push('Query is very slow - consider database query optimization');
      recommendations.push('Review database indexes for this query');
      recommendations.push('Consider implementing data pagination if not already present');
    } else if (averageDuration > 2000) {
      recommendations.push('Query is moderately slow - review for optimization opportunities');
      recommendations.push('Consider adding database indexes for commonly filtered fields');
    }

    // Variable-based recommendations
    if (Object.keys(commonVariables).length > 0) {
      recommendations.push(
        'Common variables detected - consider implementing parameterized caching'
      );
      if (commonVariables.pagination) {
        recommendations.push(
          'Pagination detected - ensure proper cursor-based pagination is implemented'
        );
      }
      if (commonVariables.filters) {
        recommendations.push('Filters detected - review filter complexity and database indexes');
      }
    }

    // Query-specific recommendations
    if (queryName.includes('GameLogs')) {
      recommendations.push('Game logs query - consider implementing data archiving for old logs');
      recommendations.push('Review game logs table partitioning strategy');
    }
    if (queryName.includes('Comments')) {
      recommendations.push('Comments query - consider implementing comment threading optimization');
      recommendations.push('Review comment table indexing strategy');
    }
    if (queryName.includes('Reactions')) {
      recommendations.push('Reactions query - consider implementing reaction aggregation');
      recommendations.push('Review reaction table structure for performance');
    }

    return recommendations;
  }

  private determineSeverity(
    frequency: number,
    averageDuration: number,
    maxDuration: number
  ): 'low' | 'medium' | 'high' {
    if (frequency > 20 || averageDuration > 5000 || maxDuration > 10000) {
      return 'high';
    }
    if (frequency > 10 || averageDuration > 3000 || maxDuration > 5000) {
      return 'medium';
    }
    return 'low';
  }

  generateReport(): void {
    if (this.analysis.length === 0) {
      return;
    }

    console.log('📊 Slow Query Analysis Report');
    console.log('=============================\n');

    this.analysis.forEach((analysis, index) => {
      const severityColor = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }[analysis.severity];

      console.log(`${severityColor} ${index + 1}. ${analysis.queryName}`);
      console.log(`   Frequency: ${analysis.frequency} occurrences`);
      console.log(`   Average Duration: ${analysis.averageDuration.toFixed(2)}ms`);
      console.log(`   Max Duration: ${analysis.maxDuration}ms`);
      console.log(`   Severity: ${analysis.severity.toUpperCase()}`);

      if (Object.keys(analysis.commonVariables).length > 0) {
        console.log(`   Common Variables: ${JSON.stringify(analysis.commonVariables)}`);
      }

      console.log(`   Recommendations:`);
      analysis.optimizationRecommendations.forEach((rec, recIndex) => {
        console.log(`     ${recIndex + 1}. ${rec}`);
      });
      console.log('');
    });

    // Summary statistics
    const totalSlowQueries = this.analysis.reduce((sum, a) => sum + a.frequency, 0);
    const highSeverity = this.analysis.filter(a => a.severity === 'high').length;
    const mediumSeverity = this.analysis.filter(a => a.severity === 'medium').length;
    const lowSeverity = this.analysis.filter(a => a.severity === 'low').length;

    console.log('📈 Summary Statistics');
    console.log('=====================');
    console.log(`Total Slow Queries: ${totalSlowQueries}`);
    console.log(`High Severity Issues: ${highSeverity}`);
    console.log(`Medium Severity Issues: ${mediumSeverity}`);
    console.log(`Low Severity Issues: ${lowSeverity}`);
    console.log('');

    // Priority recommendations
    console.log('🎯 Priority Actions');
    console.log('==================');

    if (highSeverity > 0) {
      console.log('🔴 IMMEDIATE ACTION REQUIRED:');
      this.analysis
        .filter(a => a.severity === 'high')
        .forEach(a => {
          console.log(
            `   - Optimize ${a.queryName} (${a.frequency} occurrences, ${a.averageDuration.toFixed(0)}ms avg)`
          );
        });
      console.log('');
    }

    if (mediumSeverity > 0) {
      console.log('🟡 SCHEDULE FOR OPTIMIZATION:');
      this.analysis
        .filter(a => a.severity === 'medium')
        .forEach(a => {
          console.log(
            `   - Review ${a.queryName} (${a.frequency} occurrences, ${a.averageDuration.toFixed(0)}ms avg)`
          );
        });
      console.log('');
    }

    if (lowSeverity > 0) {
      console.log('🟢 MONITOR AND OPTIMIZE LATER:');
      this.analysis
        .filter(a => a.severity === 'low')
        .forEach(a => {
          console.log(
            `   - Monitor ${a.queryName} (${a.frequency} occurrences, ${a.averageDuration.toFixed(0)}ms avg)`
          );
        });
    }
  }

  exportAnalysis(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalSlowQueries: this.slowQueries.length,
        analysis: this.analysis,
      },
      null,
      2
    );
  }
}

async function main() {
  try {
    console.log('🚀 Starting Slow Query Analysis...\n');

    const analyzer = new SlowQueryAnalyzer();
    const analysis = analyzer.analyzeSlowQueries();

    if (analysis.length > 0) {
      analyzer.generateReport();

      // Export analysis for further review
      const exportData = analyzer.exportAnalysis();
      console.log('💾 Analysis exported for further review');
      console.log('   Use this data to prioritize optimization efforts');
    }

    console.log('\n🎯 Analysis Complete!');
  } catch (error) {
    console.error('❌ Slow query analysis failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SlowQueryAnalyzer };
