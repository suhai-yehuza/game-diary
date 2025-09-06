#!/usr/bin/env tsx

import { db } from '@/lib/db';

interface QueryStats {
  query: string;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
  callCount: number;
}

async function monitorQueryPerformance() {
  console.log('📊 Monitoring GraphQL query performance...');

  try {
    // Query to get slow query statistics from PostgreSQL
    const slowQueriesQuery = `
      SELECT
        query,
        mean_exec_time as avg_duration,
        max_exec_time as max_duration,
        min_exec_time as min_duration,
        calls as call_count
      FROM pg_stat_statements
      WHERE query LIKE '%game_logs%'
         OR query LIKE '%comments%'
         OR query LIKE '%reactions%'
         OR query LIKE '%users%'
         OR query LIKE '%friendships%'
      ORDER BY mean_exec_time DESC
      LIMIT 20;
    `;

    const result = await db()?.execute(slowQueriesQuery);
    const rows = (result as { rows?: QueryStats[] })?.rows || [];

    if (rows.length === 0) {
      console.log('ℹ️  No query statistics available. Make sure pg_stat_statements is enabled.');
      return;
    }

    console.log('\n🐌 Slowest Queries:');
    console.log('='.repeat(80));

    rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.query.substring(0, 60)}...`);
      console.log(`   Avg: ${row.avg_duration.toFixed(2)}ms`);
      console.log(`   Max: ${row.max_duration.toFixed(2)}ms`);
      console.log(`   Min: ${row.min_duration.toFixed(2)}ms`);
      console.log(`   Calls: ${row.call_count}`);
    });

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    console.log('='.repeat(80));

    const slowQueries = rows.filter(row => row.avg_duration > 100);
    if (slowQueries.length > 0) {
      console.log(`⚠️  Found ${slowQueries.length} queries taking >100ms on average`);
      console.log('   Consider adding indexes or optimizing these queries');
    } else {
      console.log('✅ All queries are performing well (<100ms average)');
    }

    // Index usage statistics
    const indexUsageQuery = `
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND (tablename LIKE '%game_logs%'
             OR tablename LIKE '%comments%'
             OR tablename LIKE '%reactions%'
             OR tablename LIKE '%users%'
             OR tablename LIKE '%friendships%')
      ORDER BY idx_scan DESC
      LIMIT 15;
    `;

    const indexResult = await db()?.execute(indexUsageQuery);
    const indexRows = (indexResult as { rows?: any[] })?.rows || [];

    if (indexRows.length > 0) {
      console.log('\n📈 Index Usage Statistics:');
      console.log('='.repeat(80));

      indexRows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.tablename}.${row.indexname}`);
        console.log(`   Scans: ${row.index_scans}`);
        console.log(`   Tuples Read: ${row.tuples_read}`);
        console.log(`   Tuples Fetched: ${row.tuples_fetched}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to monitor query performance:', error);
    console.log('💡 Make sure pg_stat_statements extension is enabled:');
    console.log('   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
  }
}

// Run the monitoring script
monitorQueryPerformance()
  .then(() => {
    console.log('\n✨ Query performance monitoring complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Query performance monitoring failed:', error);
    process.exit(1);
  });
